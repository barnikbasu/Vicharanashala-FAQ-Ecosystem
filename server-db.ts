/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import { User, Query, Answer, FAQ, Notification, SystemPromptConfig, AuditLog, AnalyticsSummary } from "./src/types";

const DB_FILE_PATH = path.join(process.cwd(), "db.json");

// Bootstrapping Users
const MOCK_USERS: User[] = [
  {
    id: "user-1",
    name: "Barnik Basu",
    email: "barnikbasu@gmail.com",
    role: "intern",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    badges: ["Yaksha Contributor", "Rosetta Chronicler"],
    points: 340,
    spurthiPoints: 240,
    department: "Backend Engineering",
    joinedAt: "2026-05-01T00:00:00Z"
  },
  {
    id: "user-3",
    name: "Dr. Vinayak Sen",
    email: "vinayak.sen@vicharanashala.ai",
    role: "mentor",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150",
    badges: ["Sage Mentor", "System Architect"],
    points: 2500,
    spurthiPoints: 1550,
    department: "Vicharanashala Core Team",
    joinedAt: "2024-01-15T00:00:00Z"
  },
  {
    id: "user-4",
    name: "Sudarshan Iyengar",
    email: "sudarshan.iyengar@vicharanashala.ai",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
    badges: ["Root Administrator", "Vibe Architect"],
    points: 9999,
    spurthiPoints: 5000,
    department: "Program Leadership",
    joinedAt: "2024-01-01T00:00:00Z"
  }
];

// Bootstrapping FAQs containing actual Samagama and Visakha-MCP topics
const INITIAL_FAQS: FAQ[] = [
  {
    id: "faq-1",
    question: "What is the Rosetta journal, and how often must I update it?",
    answer: "Rosetta is your daily reflection internship journal. You must document your learnings, technical challenges, code snippets, and daily systems realizations. Weekly updates are formally graded, and keeping Rosetta updated is an absolute requirement to pass Phase 1 and receive your certificate.",
    category: "Rosetta Journal",
    tags: ["Rosetta", "Grading", "Coursework"],
    views: 450,
    helpfulCount: 42,
    unhelpfulCount: 1,
    createdAt: "2026-05-01T10:00:00Z"
  },
  {
    id: "faq-2",
    question: "How do I access ViBe LMS for internship coursework?",
    answer: "The ViBe Platform (LMS) is hosted at our dedicated learning domain. You can sign in using your registered internship email. Course assignments, session slides, and core curriculum trackers are fully synced there. Ensure you check it daily for announcements.",
    category: "ViBe Platform",
    tags: ["ViBe LMS", "Login", "Coursework"],
    views: 310,
    helpfulCount: 28,
    unhelpfulCount: 0,
    createdAt: "2026-05-02T11:00:00Z"
  },
  {
    id: "faq-3",
    question: "What is Yaksha Voice / Yaksha Mini, and what are their scopes?",
    answer: "Yaksha is our advanced contextual RAG-based AI assistant. Yaksha Mini is its quantized low-latency version. They are trained on Vicharanashala operations, technical schemas, and structural guidelines of the Visakha-MCP repo. You can ask Yaksha about setup issues, coding guidelines, or program rules.",
    category: "AI Chatbots",
    tags: ["Yaksha", "AI Agent", "Yaksha Mini"],
    views: 580,
    helpfulCount: 55,
    unhelpfulCount: 2,
    createdAt: "2026-05-02T12:00:00Z"
  },
  {
    id: "faq-4",
    question: "Can I request a No Objection Certificate (NOC) from the host team?",
    answer: "Absolutely. If your university requires a formal NOC, obtain the blank layout template from the Admin Panel, fill out your university specifics, and submit it. The Program Administration signs and emails it back within 3 working days.",
    category: "Onboarding & Documents",
    tags: ["NOC", "University", "Documentation"],
    views: 180,
    helpfulCount: 18,
    unhelpfulCount: 0,
    createdAt: "2026-05-03T09:00:00Z"
  },
  {
    id: "faq-5",
    question: "What is the team formation guideline for Phase 2 capstone projects?",
    answer: "During week 4 of the internship, team formation opens. Interns must self-organize into cross-functional teams of 3 to 4 members. Each team must coordinate a frontend designer, a backend architect, and an AI engineer. Unaffiliated interns are balanced by mentors.",
    category: "Team Formation",
    tags: ["Teams", "Phase 2", "Capstone Project"],
    views: 290,
    helpfulCount: 24,
    unhelpfulCount: 1,
    createdAt: "2026-05-04T15:30:00Z"
  },
  {
    id: "faq-6",
    question: "What details stand inside the Visakha-MCP repository?",
    answer: "The `visakha-mcp` repo is Vicharanashala's Model Context Protocol (MCP) server. It hosts structured custom tools connecting AI agents seamlessly to SQLite indices, local data buffers, and prompt templates, allowing developers to execute vibe coding over standard datasets.",
    category: "Technical Stack",
    tags: ["visakha-mcp", "Github", "MCP"],
    views: 410,
    helpfulCount: 39,
    unhelpfulCount: 0,
    createdAt: "2026-05-05T08:00:00Z"
  }
];

// Bootstrapping Queries
const INITIAL_QUERIES: Query[] = [
  {
    id: "q-1",
    title: "Docker container crashes when initializing SQLite tool in visakha-mcp",
    description: "I am trying to run `docker compose up` inside the visakha-mcp repository, but the SQLite service crashes on startup complaining about `mount path read-only`. Does anyone know if there's a specific mount setting or permissions error in the configuration file?",
    status: "open",
    difficulty: "medium",
    tags: ["visakha-mcp", "Docker", "Database"],
    author: MOCK_USERS[0],
    createdAt: "2026-05-22T14:30:00Z",
    answers: [
      {
        id: "ans-1",
        queryId: "q-1",
        content: "This is a common folder permission error. Ensure you run `chmod -R 777 ./sqlite-data` or change the root path mounting inside the `docker-compose.yml` block from `rw` constraints. Under Windows, WSL can occasionally block file mounts from host directory directories.",
        author: MOCK_USERS[0],
        isMentorVerified: false,
        isAiGenerated: false,
        createdAt: "2026-05-22T16:00:00Z",
        upvotes: ["user-1"]
      }
    ],
    upvotes: ["user-1"],
    views: 45
  },
  {
    id: "q-2",
    title: "Is it possible to submit Rosetta journal daily updates late without scoring penalty?",
    description: "I was having severe network bandwidth outages yesterday evening, meaning my Friday Rosetta reflection updates could not sync on time. Can I request an extension or submit now without affecting my weekly scorecard?",
    status: "assigned",
    difficulty: "easy",
    tags: ["Rosetta", "Administration"],
    author: MOCK_USERS[0],
    assignedMentor: MOCK_USERS[1],
    createdAt: "2026-05-22T09:12:00Z",
    answers: [],
    upvotes: [],
    views: 22
  },
  {
    id: "q-3",
    title: "How to mount multiple AI prompt templates inside Yaksha model configurations?",
    description: "We are developing custom system instructions inside the ecosystem, keeping Yaksha aware of specific engineering documents. Can we feed multiple text segments or do we have to combine them into one massive instruction block?",
    status: "resolved",
    difficulty: "hard",
    tags: ["Yaksha", "Prompt Engineering"],
    author: MOCK_USERS[0],
    assignedMentor: MOCK_USERS[1],
    createdAt: "2026-05-20T11:00:00Z",
    resolvedAt: "2026-05-21T18:00:00Z",
    answers: [
      {
        id: "ans-2",
        queryId: "q-3",
        content: "The best practice is combining them systematically inside a single instructions configuration. On our Admin panel, you can use structured section wrappers (e.g. `### Role Play` followed by `### Guidelines`). It makes retrieval context clean.",
        author: MOCK_USERS[1],
        isMentorVerified: true,
        isAiGenerated: false,
        createdAt: "2026-05-21T10:30:00Z",
        upvotes: ["user-1"]
      },
      {
        id: "ans-3",
        queryId: "q-3",
        content: "Here is an AI draft summary: Combining files programmatically or creating dynamic chunk loaders serves the Yaksha schema well. Keep context size under 8k tokens to lower inference costs.",
        author: MOCK_USERS[2], // Admin
        isMentorVerified: false,
        isAiGenerated: true,
        createdAt: "2026-05-21T11:00:00Z",
        upvotes: []
      }
    ],
    upvotes: ["user-1"],
    views: 74,
    aiSummary: "Resolves the method to merge system blueprints. Recommend combining them cleanly with labeled markdown blocks."
  }
];

const INITIAL_SYSTEM_PROMPTS: SystemPromptConfig = {
  id: "yaksha-prompt",
  systemInstruction: "You are Yaksha, the official AI-Powered Institutional Intelligence assistant for the Vicharanashala Internship Program.\n\nYour goal is to answer interns' questions about the internship curriculum, grading policies, technical setups, Rosetta logs, and ViBe platform rules. Use the relevant internship context provided in documents. Always provide high-fidelity, professional, structured, and friendly formatting.\n\nAlways cite the resource file or rule where appropriate, and supply a confidence score between 0.10 and 1.00 indicating the factual security of your explanation. Avoid making up details: if information is missing, admit that you don't fully know yet.",
  temperature: 0.2,
  model: "gemini-3.5-flash",
  updatedAt: "2026-05-23T00:00:00Z"
};

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    timestamp: "2026-05-23T06:00:00Z",
    action: "PROMPT_UPDATE",
    user: "Sudarshan Iyengar (Admin)",
    details: "Updated Yaksha core system instructions, reinforcing citation compliance."
  },
  {
    id: "log-2",
    timestamp: "2026-05-22T19:22:00Z",
    action: "QUERY_RESOLVE",
    user: "Dr. Vinayak Sen (Mentor)",
    details: "Marked query 'How to mount multiple AI prompt templates inside Yaksha' as resolved."
  },
  {
    id: "log-3",
    timestamp: "2026-05-21T14:10:00Z",
    action: "USER_PROMOTED",
    user: "Sudarshan Iyengar (Admin)",
    details: "Promoted Barnik Basu with badge 'Yaksha Contributor' for active forum support."
  }
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    userId: "user-1",
    title: "Query Resolved 🎉",
    content: "Your query regarding Yaksha Prompt Templates has been marked resolved by Dr. Vinayak Sen.",
    type: "query_solved",
    read: false,
    createdAt: "2026-05-22T18:00:00Z",
    linkUrl: "/query/q-3"
  },
  {
    id: "notif-2",
    userId: "user-1",
    title: "System Notification",
    content: "Coursework Module 4 on ViBe Platform is now live. Complete updates on your daily Rosetta log.",
    type: "system",
    read: true,
    createdAt: "2026-05-20T09:00:00Z"
  }
];

interface DBStructure {
  users: User[];
  faqs: FAQ[];
  queries: Query[];
  promptConfig: SystemPromptConfig;
  auditLogs: AuditLog[];
  notifications: Notification[];
}

export class ServerDB {
  private data: DBStructure;

  constructor() {
    this.data = {
      users: MOCK_USERS,
      faqs: INITIAL_FAQS,
      queries: INITIAL_QUERIES,
      promptConfig: INITIAL_SYSTEM_PROMPTS,
      auditLogs: INITIAL_AUDIT_LOGS,
      notifications: INITIAL_NOTIFICATIONS
    };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, "utf-8");
        const parsed = JSON.parse(fileContent);
        this.data = {
          users: parsed.users || MOCK_USERS,
          faqs: parsed.faqs || INITIAL_FAQS,
          queries: parsed.queries || INITIAL_QUERIES,
          promptConfig: parsed.promptConfig || INITIAL_SYSTEM_PROMPTS,
          auditLogs: parsed.auditLogs || INITIAL_AUDIT_LOGS,
          notifications: parsed.notifications || INITIAL_NOTIFICATIONS
        };
        console.log("Mock database successfully loaded from json filesystem!");
      } else {
        this.save();
      }
    } catch (e) {
      console.error("Failed to load local DB file, using fallback in-memory state.", e);
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write state into DB file.", e);
    }
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  updateUserPoints(id: string, delta: number, badgeToAdd?: string) {
    const user = this.data.users.find(u => u.id === id);
    if (user) {
      user.points = Math.max(0, user.points + delta);
      // Spurthi (SP) represents active engineering contributions & codebase replies
      user.spurthiPoints = Math.max(0, (user.spurthiPoints || 0) + delta);
      if (badgeToAdd && !user.badges.includes(badgeToAdd)) {
        user.badges.push(badgeToAdd);
      }
      this.save();
    }
  }

  // FAQs
  getFAQs(): FAQ[] {
    return this.data.faqs;
  }

  getFAQById(id: string): FAQ | undefined {
    return this.data.faqs.find(f => f.id === id);
  }

  createFAQ(faq: Omit<FAQ, "id" | "createdAt" | "views" | "helpfulCount" | "unhelpfulCount">): FAQ {
    const newFaq: FAQ = {
      ...faq,
      id: `faq-${Date.now()}`,
      views: 0,
      helpfulCount: 0,
      unhelpfulCount: 0,
      createdAt: new Date().toISOString()
    };
    this.data.faqs.push(newFaq);
    this.save();
    return newFaq;
  }

  voteFAQ(id: string, helpful: boolean) {
    const faq = this.data.faqs.find(f => f.id === id);
    if (faq) {
      if (helpful) faq.helpfulCount++;
      else faq.unhelpfulCount++;
      this.save();
    }
  }

  incrementFAQViews(id: string) {
    const faq = this.data.faqs.find(f => f.id === id);
    if (faq) {
      faq.views++;
      this.save();
    }
  }

  // Queries
  getQueries(): Query[] {
    return this.data.queries;
  }

  getQueryById(id: string): Query | undefined {
    return this.data.queries.find(q => q.id === id);
  }

  createQuery(title: string, description: string, authorId: string, tags: string[], difficulty: "easy" | "medium" | "hard" = "easy"): Query {
    const author = this.getUserById(authorId) || MOCK_USERS[0];
    const newQuery: Query = {
      id: `q-${Date.now()}`,
      title,
      description,
      status: "open",
      difficulty,
      tags,
      author,
      createdAt: new Date().toISOString(),
      answers: [],
      upvotes: [],
      views: 1
    };
    this.data.queries.unshift(newQuery);
    
    // Auto points for raising a query
    this.updateUserPoints(authorId, 10);
    this.save();
    return newQuery;
  }

  updateQueryStatus(id: string, status: Query["status"]) {
    const query = this.data.queries.find(q => q.id === id);
    if (query) {
      query.status = status;
      if (status === "resolved") {
        query.resolvedAt = new Date().toISOString();
        // award author points
        this.updateUserPoints(query.author.id, 20);
        
        // Push notification of success
        this.createNotification(
          query.author.id,
          "Query Resolved ✅",
          `Your query regarding '${query.title.substring(0, 40)}...' has been resolved!`,
          "query_solved",
          `/query/${query.id}`
        );
      }
      this.save();
    }
  }

  assignMentor(queryId: string, mentorId: string) {
    const query = this.data.queries.find(q => q.id === queryId);
    const mentor = this.getUserById(mentorId);
    if (query && mentor) {
      query.assignedMentor = mentor;
      query.status = "assigned";
      this.createNotification(
        query.author.id,
        "Mentor Assigned 🤝",
        `${mentor.name} has been assigned to help resolve your query.`,
        "assigned",
        `/query/${query.id}`
      );
      this.save();
    }
  }

  escalateQuery(queryId: string, mentorId: string = "user-3") {
    const query = this.data.queries.find(q => q.id === queryId);
    const mentor = this.getUserById(mentorId);
    if (query && mentor) {
      query.assignedMentor = mentor;
      query.status = "assigned";
      query.difficulty = "hard"; // elevate difficulty under escalation
      this.createNotification(
        query.author.id,
        "Query Escalated ⚡",
        `Your query has been escalated to Core Team Member ${mentor.name} for immediate manual review.`,
        "assigned",
        `/query/${query.id}`
      );
      this.createAuditLog(
        "QUERY_ESCALATE",
        query.author.name,
        `Escalated query '${query.title}' directly to Mentor: ${mentor.name}`
      );
      this.save();
    }
  }

  addAnswer(queryId: string, authorId: string, content: string, isAi: boolean = false): Answer {
    const author = this.getUserById(authorId) || MOCK_USERS[0];
    const query = this.data.queries.find(q => q.id === queryId);
    if (!query) throw new Error("Query not found");

    const answer: Answer = {
      id: `ans-${Date.now()}`,
      queryId,
      content,
      author,
      isMentorVerified: author.role === "mentor" || author.role === "admin",
      isAiGenerated: isAi,
      createdAt: new Date().toISOString(),
      upvotes: []
    };

    query.answers.push(answer);

    // If query has answers, notify author (if author isn't respondent)
    if (query.author.id !== authorId) {
      this.createNotification(
        query.author.id,
        "New Answer Received 💬",
        `${author.name} replied to your query '${query.title.substring(0, 30)}...'`,
        "new_answer",
        `/query/${query.id}`
      );
    }

    // Award answerer points
    this.updateUserPoints(authorId, isAi ? 0 : 25, "Master Solver");
    this.save();
    return answer;
  }

  verifyAnswer(queryId: string, answerId: string, mentorId: string) {
    const query = this.getQueryById(queryId);
    if (query) {
      const ans = query.answers.find(a => a.id === answerId);
      if (ans) {
        ans.isMentorVerified = true;
        // set query to resolved as well!
        this.updateQueryStatus(queryId, "resolved");
        this.save();

        const mentor = this.getUserById(mentorId);
        this.createAuditLog(
          "QUERY_RESOLVE",
          mentor ? mentor.name : "System",
          `Verified answer to query: "${query.title}"`
        );
      }
    }
  }

  voteQuery(queryId: string, userId: string) {
    const query = this.getQueryById(queryId);
    if (query) {
      const idx = query.upvotes.indexOf(userId);
      if (idx > -1) {
        query.upvotes.splice(idx, 1);
      } else {
        query.upvotes.push(userId);
      }
      this.save();
    }
  }

  voteAnswer(queryId: string, answerId: string, userId: string) {
    const query = this.getQueryById(queryId);
    if (query) {
      const ans = query.answers.find(a => a.id === answerId);
      if (ans) {
        const idx = ans.upvotes.indexOf(userId);
        if (idx > -1) {
          ans.upvotes.splice(idx, 1);
        } else {
          ans.upvotes.push(userId);
        }
        this.save();
      }
    }
  }

  incrementQueryViews(id: string) {
    const query = this.data.queries.find(q => q.id === id);
    if (query) {
      query.views++;
      this.save();
    }
  }

  setAiSummary(queryId: string, summary: string) {
    const query = this.getQueryById(queryId);
    if (query) {
      query.aiSummary = summary;
      this.save();
    }
  }

  // System Prompts
  getPromptConfig(): SystemPromptConfig {
    return this.data.promptConfig;
  }

  updatePromptConfig(systemInstruction: string, temperature: number, model: string, manager: string) {
    this.data.promptConfig = {
      id: "yaksha-prompt",
      systemInstruction,
      temperature,
      model,
      updatedAt: new Date().toISOString()
    };
    this.createAuditLog("PROMPT_UPDATE", manager, `System prompts and AI temperatures calibrated.`);
    this.save();
  }

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  createAuditLog(action: string, user: string, details: string) {
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      user,
      details
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 100) this.data.auditLogs.pop(); // keep log buffer manageable
    this.save();
  }

  // Notifications
  getNotificationsForUser(userId: string): Notification[] {
    return this.data.notifications.filter(n => n.userId === userId);
  }

  createNotification(userId: string, title: string, content: string, type: Notification["type"], linkUrl?: string) {
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      userId,
      title,
      content,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      linkUrl
    };
    this.data.notifications.unshift(notif);
    this.save();
  }

  markNotificationAsRead(id: string) {
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
    }
  }

  markAllNotificationsRead(userId: string) {
    this.data.notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    this.save();
  }

  // Diagnostics & Dashboard Analytics
  getAnalyticsSummary(): AnalyticsSummary {
    const totalQRef = this.data.queries;
    const resolvedQRef = totalQRef.filter(q => q.status === "resolved");

    // Static Tag counts
    const tagsMap: Record<string, number> = {};
    totalQRef.forEach(q => {
      q.tags.forEach(t => {
        tagsMap[t] = (tagsMap[t] || 0) + 1;
      });
    });
    const tagCloud = Object.entries(tagsMap).map(([text, value]) => ({ text, value }));

    // Mock peak activity heatmaps for academic review
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const heatmap = days.map(day => {
      const hours = Array.from({ length: 12 }, (_, i) => ({
        hour: i * 2,
        count: Math.floor(Math.random() * (day === "Friday" || day === "Monday" ? 8 : 4))
      }));
      return { day, hours };
    });

    // Leaderboards by contribution points
    const sortedUsers = [...this.data.users].sort((a, b) => b.points - a.points);
    const leaderboard = sortedUsers.map(u => ({
      user: u,
      count: this.data.queries.filter(q => q.answers.some(ans => ans.author.id === u.id && ans.isMentorVerified)).length
    }));

    return {
      totalQueries: totalQRef.length,
      resolvedQueries: resolvedQRef.length,
      unresolvedQueries: totalQRef.length - resolvedQRef.length,
      totalFAQs: this.data.faqs.length,
      averageResolutionTimeHours: 14.5,
      tagCloud,
      heatmap,
      leaderboard,
      tokenUsageCount: 425600, // Cumulative AI token consumption
      serverCpuPercent: 12.4,   // Server processing load %
      serverMemoryMb: 114.8     // Server heap allocation MB
    };
  }
}

export const dbInstance = new ServerDB();
