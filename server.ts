/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { dbInstance } from "./server-db";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini client lazily/gracefully
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

function getGeminiClient(): GoogleGenAI | null {
  if (!API_KEY) {
    return null;
  }
  if (!ai) {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// Helper to perform semantic similarity ranking using simple token TF-IDF or Jaccard
function findRelevantFAQContext(queryText: string, topN: number = 2): { text: string; source: string; score: number }[] {
  const faqs = dbInstance.getFAQs();
  const solvedQueries = dbInstance.getQueries().filter(q => q.status === "resolved");
  const candidates: { text: string; source: string; score: number }[] = [];

  const queryTerms = new Set(queryText.toLowerCase().split(/\W+/).filter(t => t.length > 3));

  // Score FAQs
  faqs.forEach(f => {
    const faqTerms = new Set(`${f.question} ${f.answer} ${f.category} ${f.tags.join(" ")}`.toLowerCase().split(/\W+/));
    let matchCount = 0;
    queryTerms.forEach(term => {
      if (faqTerms.has(term)) matchCount++;
    });
    const score = queryTerms.size > 0 ? matchCount / queryTerms.size : 0;
    if (score > 0 || matchCount > 0) {
      candidates.push({
        text: `Question: ${f.question}\nAnswer: ${f.answer}\nCategory: ${f.category}`,
        source: `FAQ-ID: ${f.id} (${f.question})`,
        score: score + 0.1 // slight boost for official FAQs
      });
    }
  });

  // Score Solved Queries
  solvedQueries.forEach(q => {
    const qTerms = new Set(`${q.title} ${q.description} ${q.answers.map(a => a.content).join(" ")}`.toLowerCase().split(/\W+/));
    let matchCount = 0;
    queryTerms.forEach(term => {
      if (qTerms.has(term)) matchCount++;
    });
    const score = queryTerms.size > 0 ? matchCount / queryTerms.size : 0;
    if (score > 0 || matchCount > 0) {
      candidates.push({
        text: `Solved Query: ${q.title}\nResolved Discussion: ${q.answers.filter(a => a.isMentorVerified).map(a => a.content).join(" ")}`,
        source: `SolvedQuery-ID: ${q.id} (${q.title})`,
        score
      });
    }
  });

  // Sort and select topN
  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, topN);
}

// ========================================================
// API ROUTES
// ========================================================

// 1. Authentication Sim Route
app.get("/api/auth/me", (req, res) => {
  // Simple check via query param for role switching / simulation ease
  const userId = (req.query.userId as string) || "user-1"; 
  const user = dbInstance.getUserById(userId);
  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(404).json({ success: false, message: "User not found" });
  }
});

app.get("/api/auth/users", (req, res) => {
  res.json({ success: true, users: dbInstance.getUsers() });
});

// 2. FAQs List, Search, Actions
app.get("/api/faqs", (req, res) => {
  const list = dbInstance.getFAQs();
  res.json({ success: true, faqs: list });
});

app.get("/api/faqs/:id", (req, res) => {
  const faq = dbInstance.getFAQById(req.params.id);
  if (faq) {
    dbInstance.incrementFAQViews(faq.id);
    res.json({ success: true, faq });
  } else {
    res.status(404).json({ success: false, message: "FAQ not found" });
  }
});

app.post("/api/faqs", (req, res) => {
  const { question, answer, category, tags } = req.body;
  if (!question || !answer || !category) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }
  const newFaq = dbInstance.createFAQ({
    question,
    answer,
    category,
    tags: tags || []
  });
  dbInstance.createAuditLog("FAQ_CREATE", "Administrator", `Created new public FAQ item: "${question}"`);
  res.json({ success: true, faq: newFaq });
});

app.post("/api/faqs/:id/vote", (req, res) => {
  const { helpful } = req.body;
  dbInstance.voteFAQ(req.params.id, !!helpful);
  res.json({ success: true });
});

// 3. Queries Forum
app.get("/api/queries", (req, res) => {
  res.json({ success: true, queries: dbInstance.getQueries() });
});

app.get("/api/queries/:id", (req, res) => {
  const query = dbInstance.getQueryById(req.params.id);
  if (query) {
    dbInstance.incrementQueryViews(query.id);
    res.json({ success: true, query });
  } else {
    res.status(404).json({ success: false, message: "Query not found" });
  }
});

app.post("/api/queries", (req, res) => {
  const { title, description, authorId, tags, difficulty } = req.body;
  if (!title || !description || !authorId) {
    return res.status(400).json({ success: false, message: "Missing title, description, or authorId" });
  }
  try {
    const q = dbInstance.createQuery(title, description, authorId, tags || [], difficulty || "easy");
    dbInstance.createAuditLog("QUERY_RAISE", q.author.name, `Raised a new community query: "${title}"`);
    res.json({ success: true, query: q });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/queries/:id/answer", (req, res) => {
  const { authorId, content, isAi } = req.body;
  if (!content || !authorId) {
    return res.status(400).json({ success: false, message: "Missing content or authorId" });
  }
  try {
    const ans = dbInstance.addAnswer(req.params.id, authorId, content, !!isAi);
    res.json({ success: true, answer: ans });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/queries/:id/vote", (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: "Missing userId" });
  dbInstance.voteQuery(req.params.id, userId);
  res.json({ success: true, query: dbInstance.getQueryById(req.params.id) });
});

app.post("/api/queries/:id/answer/:ansId/vote", (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: "Missing userId" });
  dbInstance.voteAnswer(req.params.id, req.params.ansId, userId);
  res.json({ success: true, query: dbInstance.getQueryById(req.params.id) });
});

app.post("/api/queries/:id/status", (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, message: "Missing status" });
  dbInstance.updateQueryStatus(req.params.id, status);
  res.json({ success: true, query: dbInstance.getQueryById(req.params.id) });
});

app.post("/api/queries/:id/verify-answer", (req, res) => {
  const { answerId, mentorId } = req.body;
  if (!answerId || !mentorId) {
    return res.status(400).json({ success: false, message: "Missing answerId or mentorId" });
  }
  dbInstance.verifyAnswer(req.params.id, answerId, mentorId);
  res.json({ success: true, query: dbInstance.getQueryById(req.params.id) });
});

app.post("/api/queries/:id/assign", (req, res) => {
  const { mentorId } = req.body;
  if (!mentorId) return res.status(400).json({ success: false, message: "Missing mentorId" });
  dbInstance.assignMentor(req.params.id, mentorId);
  res.json({ success: true, query: dbInstance.getQueryById(req.params.id) });
});

app.post("/api/queries/:id/escalate", (req, res) => {
  const { mentorId } = req.body; // optional specific mentor
  dbInstance.escalateQuery(req.params.id, mentorId || "user-3");
  res.json({ success: true, query: dbInstance.getQueryById(req.params.id) });
});

// 4. Notifications
app.get("/api/notifications/:userId", (req, res) => {
  res.json({ success: true, notifications: dbInstance.getNotificationsForUser(req.params.userId) });
});

app.post("/api/notifications/:id/read", (req, res) => {
  dbInstance.markNotificationAsRead(req.params.id);
  res.json({ success: true });
});

app.post("/api/notifications/read-all/:userId", (req, res) => {
  dbInstance.markAllNotificationsRead(req.params.userId);
  res.json({ success: true });
});

// 5. System prompt overrides
app.get("/api/prompt-config", (req, res) => {
  res.json({ success: true, config: dbInstance.getPromptConfig() });
});

app.post("/api/prompt-config", (req, res) => {
  const { systemInstruction, temperature, model, manager } = req.body;
  dbInstance.updatePromptConfig(
    systemInstruction,
    parseFloat(temperature || "0.2"),
    model || "gemini-3.5-flash",
    manager || "Barnik Basu (Admin)"
  );
  res.json({ success: true, config: dbInstance.getPromptConfig() });
});

// 6. Audit Logs & Dashboard Data
app.get("/api/audit-logs", (req, res) => {
  res.json({ success: true, logs: dbInstance.getAuditLogs() });
});

app.get("/api/analytics", (req, res) => {
  res.json({ success: true, analytics: dbInstance.getAnalyticsSummary() });
});

// ========================================================
// AI AGENT INTERACTION ENDPOINTS (Yaksha / Gemini Integration)
// ========================================================

// A. Real-time query analyzer (Ask before Asking / Auto Classification)
app.post("/api/ai/analyze-query", async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ success: false, message: "Missing title reference" });

  const textContext = `${title}\n${description || ""}`;

  // 1. Semantic similarities (local token-ranking)
  const localPreMatches = findRelevantFAQContext(textContext, 2);
  const duplicateCandidates = localPreMatches.map(m => m.source);

  const gemini = getGeminiClient();

  if (!gemini) {
    // Elegant fallback if Gemini Key is absent
    console.warn("GEMINI_API_KEY environment variable missing. Executing fallback analysis.");
    return res.json({
      success: true,
      hasKey: false,
      duplicateCandidates,
      difficulty: title.toLowerCase().includes("crash") || title.toLowerCase().includes("error") ? "medium" : "easy",
      suggestedTags: ["Vicharanashala", "General"],
      rewrittenTitle: title,
      aiSummary: "AI capabilities could not be initialized because the GEMINI_API_KEY is missing from the environment. Add it in 'Settings > Secrets' inside AI Studio for high-fidelity reasoning."
    });
  }

  try {
    const prompt = `Analyze this internship technical query and provide a structured JSON response.
Query Title: "${title}"
Query Description: "${description || "None"}"

Respond strictly with a JSON object holding:
{
  "difficulty": "easy" | "medium" | "hard",
  "suggestedTags": ["tag1", "tag2"],
  "rewrittenTitle": "a polished, clear version of the user query for better FAQ searchability",
  "aiSummary": "a 1-sentence analytical synthesis"
}`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are an AI-powered triage bot classifying internship queries. Ensure responses are valid JSON objects."
      }
    });

    const aiText = response.text || "{}";
    const data = JSON.parse(aiText);

    res.json({
      success: true,
      hasKey: true,
      difficulty: data.difficulty || "easy",
      suggestedTags: data.suggestedTags || ["Vicharanashala"],
      rewrittenTitle: data.rewrittenTitle || title,
      aiSummary: data.aiSummary || "Query processed successfully.",
      duplicateCandidates
    });
  } catch (error: any) {
    console.error("AI Query Analysis error:", error);
    res.json({
      success: true,
      hasKey: true,
      difficulty: "medium",
      suggestedTags: ["Bug"],
      rewrittenTitle: title,
      aiSummary: "Failed to query analytical models, fallback properties applied.",
      duplicateCandidates
    });
  }
});

// B. AI-Drafted Answers (Query resolver aid)
app.post("/api/ai/draft-answer", async (req, res) => {
  const { queryId } = req.body;
  if (!queryId) return res.status(400).json({ success: false, message: "Missing queryId" });

  const query = dbInstance.getQueryById(queryId);
  if (!query) return res.status(404).json({ success: false, message: "Query not found" });

  const gemini = getGeminiClient();

  // Find dynamic knowledge base info
  const relevantKnowledge = findRelevantFAQContext(`${query.title} ${query.description}`, 2);
  const knowledgeString = relevantKnowledge.map(k => `Origin: ${k.source}\nContent: ${k.text}`).join("\n\n");

  if (!gemini) {
    return res.json({
      success: true,
      hasKey: false,
      draft: `[AI Fallback Draft] Since no GEMINI_API_KEY is currently specified, here is a mock resolution framework:\n\nBased on your query: "${query.title}", we recommend referencing the main Vicharanashala documentation. Check if paths are correctly specified relative to the directory structure.`
    });
  }

  try {
    const prompt = `Draft a helpful, highly precise technical answer to help an intern resolve their question. Use Vicharanashala system guidelines below if relevant.

Intern Query:
Title: ${query.title}
Detail: ${query.description}

Vicharanashala FAQ Context Match:
${knowledgeString || "No matching FAQ items found. Use general top-tier engineering standards."}

Draft standard Markdown representation. Address them professionally as a mentor assistant.`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the Vicharanashala Mentor AI Draft Assistant. You synthesize highly accurate, formatted markdown resolutions for interns."
      }
    });

    const draft = response.text || "Failed to generate text response.";
    res.json({ success: true, hasKey: true, draft });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// C. Chatbot (Yaksha/Yaksha Mini) RAG pipeline with Context Injection
app.post("/api/ai/chatbot", async (req, res) => {
  const { messages, isMini } = req.body; 
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ success: false, message: "Invalid messages array" });
  }

  const latestMessage = messages[messages.length - 1]?.text || "";

  // 1. Context retrieval
  const matchingContext = findRelevantFAQContext(latestMessage, 3);
  const contextBlock = matchingContext.length > 0 
    ? `### RELEVANT VICHARANASHALA FAQ & RESOLVED TICKETS:
${matchingContext.map((c, i) => `[Source ${i + 1} - ${c.source}]:\n${c.text}`).join("\n\n--- \n")}`
    : "No highly matching systemic records found for this query. Provide a general friendly response about Vicharanashala and guide them to raise a query if it exceeds your knowledge.";

  const systemConfig = dbInstance.getPromptConfig();
  const instruction = `${systemConfig.systemInstruction}\n\nCURRENT RETRIEVED SYSTEM CONTEXT:\n${contextBlock}\n\nEnsure you cite any [Source X] context you use clearly.`;

  const gemini = getGeminiClient();

  if (!gemini) {
    // Friendly keyless fallback simulation
    console.warn("GEMINI_API_KEY environment variable missing. Launching chat simulation.");
    const simAnswer = `Hi! I'm Yaksha${isMini ? " Mini" : ""}, your AI copilot.

I currently run in **Offline Simulation Mode** because no \`GEMINI_API_KEY\` is detected in the workspace secrets.

Based on local database retrieval:
${matchingContext.length > 0 ? `I found a highly matching faq article regarding "${matchingContext[0].source.replace(/.*ID: \w+ \((.*)\)/, "$1")}": ${matchingContext[0].text}` : "I couldn't locate pre-matched details on this theme."}

How to activate full intelligence:
1. Open **Settings > Secrets** inside Google AI Studio.
2. In the variables section, add your \`GEMINI_API_KEY\`.
3. Re-run this transaction to unlock proper LLM synthesis!`;

    return res.json({
      success: true,
      hasKey: false,
      text: simAnswer,
      citations: matchingContext.map(c => c.source),
      confidence: matchingContext.length > 0 ? 0.95 : 0.40
    });
  }

  try {
    // Map existing history to Gemini contents form { role: 'user'|'model', parts: [{ text: ... }] }
    // Take last 6 messages to stay under limits and protect performance
    const historyBuffer = messages.slice(-6).map(m => ({
      role: m.sender === "user" ? "user" as const : "model" as const,
      parts: [{ text: m.text }]
    }));

    // Generate output with dynamic instructions
    const response = await gemini.models.generateContent({
      model: isMini ? "gemini-3.5-flash" : systemConfig.model,
      contents: historyBuffer,
      config: {
        systemInstruction: instruction,
        temperature: systemConfig.temperature,
      }
    });

    const text = response.text || "I was unable to synthesize a proper response text.";

    // Simple heuristic to extract tags or source citations or confidence limits
    const citations = matchingContext.map(c => c.source);
    const confidence = matchingContext.length > 0 
      ? Math.min(1.0, 0.75 + (matchingContext[0].score * 0.2)) 
      : 0.65;

    res.json({
      success: true,
      hasKey: true,
      text,
      citations,
      confidence
    });
  } catch (err: any) {
    console.error("Yaksha AI processing crash:", err);
    res.status(500).json({ success: false, message: `Yaksha Agent Processing Error: ${err.message}` });
  }
});


// ========================================================
// VITE AND PRODUCTION SERVING LAYER
// ========================================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built SPA from /dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`===============================================`);
    console.log(`Vicharanashala FAQ Ecosystem online on port ${PORT}`);
    console.log(`Running environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`GEMINI_API_KEY status: ${API_KEY ? "CONFIGURED (Keys found)" : "NOT CONFIGURED (Simulation fallback active)"}`);
    console.log(`===============================================`);
  });
}

startServer();
