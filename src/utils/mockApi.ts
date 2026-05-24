import { User, FAQ, Query, Answer, Notification, SystemPromptConfig, AuditLog } from "../types";

const BOOTSTRAP_USERS: User[] = [
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
    id: "user-2",
    name: "Ananya Iyer",
    email: "ananya.iyer@gmail.com",
    role: "intern",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    badges: ["Fast Responder", "Vibe LMS Champ"],
    points: 480,
    spurthiPoints: 300,
    department: "AI & Systems Reserch",
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

const BOOTSTRAP_FAQS: FAQ[] = [
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
    tags: ["visakha-mcp", "Github", "MCP", "SQLite", "AI Agents", "Prompt Templates", "Vibe Coding"],
    views: 410,
    helpfulCount: 39,
    unhelpfulCount: 0,
    createdAt: "2026-05-05T08:00:00Z"
  }
];

const BOOTSTRAP_QUERIES: Query[] = [
  {
    id: "q-1",
    title: "Docker container crashes when initializing SQLite tool in visakha-mcp",
    description: "I am trying to run `docker compose up` inside the visakha-mcp repository, but the SQLite service crashes on startup complaining about `mount path read-only`. Does anyone know if there's a specific mount setting or permissions error in the configuration file?",
    status: "open",
    difficulty: "medium",
    tags: ["visakha-mcp", "Docker", "Database"],
    author: BOOTSTRAP_USERS[0],
    createdAt: "2026-05-22T14:30:00Z",
    answers: [
      {
        id: "ans-1",
        queryId: "q-1",
        content: "This is a common folder permission error. Ensure you run `chmod -R 777 ./sqlite-data` or change the root path mounting inside the `docker-compose.yml` block from `rw` constraints. Under Windows, WSL can occasionally block file mounts from host directory directories.",
        author: BOOTSTRAP_USERS[1],
        isMentorVerified: false,
        isAiGenerated: false,
        createdAt: "2026-05-22T16:00:00Z",
        upvotes: ["user-1"]
      }
    ],
    upvotes: ["user-2"],
    views: 45
  },
  {
    id: "q-2",
    title: "Is it possible to submit Rosetta journal daily updates late without scoring penalty?",
    description: "I was having severe network bandwidth outages yesterday evening, meaning my Friday Rosetta reflection updates could not sync on time. Can I request an extension or submit now without affecting my weekly scorecard?",
    status: "assigned",
    difficulty: "easy",
    tags: ["Rosetta", "Administration"],
    author: BOOTSTRAP_USERS[1],
    assignedMentor: BOOTSTRAP_USERS[2],
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
    author: BOOTSTRAP_USERS[0],
    assignedMentor: BOOTSTRAP_USERS[2],
    createdAt: "2026-05-20T11:00:00Z",
    resolvedAt: "2026-05-21T18:00:00Z",
    answers: [
      {
        id: "ans-2",
        queryId: "q-3",
        content: "The best practice is combining them systematically inside a single instructions configuration. On our Admin panel, you can use structured section wrappers (e.g. `### Role Play` followed by `### Guidelines`). It makes retrieval context clean.",
        author: BOOTSTRAP_USERS[2],
        isMentorVerified: true,
        isAiGenerated: false,
        createdAt: "2026-05-21T10:30:00Z",
        upvotes: ["user-1", "user-2"]
      },
      {
        id: "ans-3",
        queryId: "q-3",
        content: "Here is an AI draft summary: Combining files programmatically or creating dynamic chunk loaders serves the Yaksha schema well. Keep context size under 8k tokens to lower inference costs.",
        author: BOOTSTRAP_USERS[3],
        isMentorVerified: false,
        isAiGenerated: true,
        createdAt: "2026-05-21T11:00:00Z",
        upvotes: []
      }
    ],
    upvotes: ["user-3"],
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
    userId: "user-2",
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

const STORAGE_KEY = "vichar_db_v3";

function getDB(): DBStructure {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error(e);
  }
  const initial: DBStructure = {
    users: BOOTSTRAP_USERS,
    faqs: BOOTSTRAP_FAQS,
    queries: BOOTSTRAP_QUERIES,
    promptConfig: INITIAL_SYSTEM_PROMPTS,
    auditLogs: INITIAL_AUDIT_LOGS,
    notifications: INITIAL_NOTIFICATIONS
  };
  saveDB(initial);
  return initial;
}

function saveDB(db: DBStructure) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error(e);
  }
}

// Function to setup the fetch intercepting
export function setupFetchIntercept() {
  if (typeof window === "undefined") return;
  
  const originalFetch = window.fetch;
  if (!originalFetch) return;
  
  const customFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlStr = typeof input === "string" ? input : (input instanceof URL ? input.href : input.url);
    
    // Only intercept /api routes
    if (!urlStr.includes("/api/")) {
      return originalFetch(input, init);
    }
    
    try {
      // First, try original fetch
      const response = await originalFetch(input, init);
      
      // If we got a 200 and it's JSON, pass it along.
      // If it returned HTML index.html (SPA redirection of 404 in static deploy), response.headers might indicate text/html, or body fails json.
      const contentType = response.headers.get("content-type") || "";
      if (response.ok && contentType.includes("json")) {
        return response;
      }
      
      // If it returned a static HTML document (which starts with <!doctype html> or has html content), throw to enter fallback
      if (contentType.includes("html")) {
        throw new Error("HTML response intercepted. Falling back to local state simulation.");
      }
      
      // If server returned 404/500, throw to enter local simulation fallback
      if (!response.ok) {
        throw new Error(`Server returned error code ${response.status}. Falling back to simulation.`);
      }
      
      return response;
    } catch (err) {
      // API failed or is not available (Static Vercel deploy, net outage, index.html redirection, etc.)
      // Run local simulated JSON responses
      return simulateApiCall(urlStr, init);
    }
  };

  try {
    Object.defineProperty(window, "fetch", {
      value: customFetch,
      configurable: true,
      writable: true,
      enumerable: true
    });
  } catch (e) {
    console.warn("Failed to redefine fetch via Object.defineProperty. Attempting direct assignment...", e);
    try {
      (window as any).fetch = customFetch;
    } catch (err2) {
      console.error("Critical: Cannot intercept window.fetch in this environment.", err2);
    }
  }
}

async function simulateApiCall(urlStr: string, init?: RequestInit): Promise<Response> {
  const db = getDB();
  const method = (init?.method || "GET").toUpperCase();
  const bodyData = init?.body ? JSON.parse(init.body as string) : null;
  
  let responseData: any = { success: false, message: "Route not found in client-side simulator" };
  let status = 404;

  // Matching router pathways
  if (urlStr.includes("/api/auth/me")) {
    const urlObj = new URL(urlStr, window.location.origin);
    const userId = urlObj.searchParams.get("userId") || "user-1";
    const user = db.users.find(u => u.id === userId);
    if (user) {
      responseData = { success: true, user };
      status = 200;
    } else {
      responseData = { success: false, message: "User not found" };
      status = 404;
    }
  } else if (urlStr.includes("/api/auth/users")) {
    responseData = { success: true, users: db.users };
    status = 200;
  } else if (urlStr.includes("/api/faqs")) {
    const faqIdMatch = urlStr.match(/\/api\/faqs\/([a-zA-Z0-9\-]+)$/);
    const voteMatch = urlStr.match(/\/api\/faqs\/([a-zA-Z0-9\-]+)\/vote/);
    
    if (voteMatch) {
      // POST faq vote
      const faqId = voteMatch[1];
      const faq = db.faqs.find(f => f.id === faqId);
      if (faq && bodyData) {
        if (bodyData.helpful) faq.helpfulCount++;
        else faq.unhelpfulCount++;
        saveDB(db);
        responseData = { success: true };
        status = 200;
      }
    } else if (faqIdMatch) {
      // GET faq detail
      const faqId = faqIdMatch[1];
      const faq = db.faqs.find(f => f.id === faqId);
      if (faq) {
        faq.views++;
        saveDB(db);
        responseData = { success: true, faq };
        status = 200;
      }
    } else if (method === "POST" && bodyData) {
      // Create new FAQ
      const newFaq: FAQ = {
        id: `faq-${Date.now()}`,
        question: bodyData.question,
        answer: bodyData.answer,
        category: bodyData.category,
        tags: bodyData.tags || [],
        views: 0,
        helpfulCount: 0,
        unhelpfulCount: 0,
        createdAt: new Date().toISOString()
      };
      db.faqs.unshift(newFaq);
      saveDB(db);
      responseData = { success: true, faq: newFaq };
      status = 200;
    } else {
      // GET standard FAQs list
      responseData = { success: true, faqs: db.faqs };
      status = 200;
    }
  } else if (urlStr.includes("/api/queries")) {
    const idMatch = urlStr.match(/\/api\/queries\/([a-zA-Z0-9\-]+)$/);
    const voteMatch = urlStr.match(/\/api\/queries\/([a-zA-Z0-9\-]+)\/vote/);
    const ansVoteMatch = urlStr.match(/\/api\/queries\/([a-zA-Z0-9\-]+)\/answer\/([a-zA-Z0-9\-]+)\/vote/);
    const answerMatch = urlStr.match(/\/api\/queries\/([a-zA-Z0-9\-]+)\/answer/);
    const assignMatch = urlStr.match(/\/api\/queries\/([a-zA-Z0-9\-]+)\/assign/);
    const verifyMatch = urlStr.match(/\/api\/queries\/([a-zA-Z0-9\-]+)\/verify-answer/);
    const escalateMatch = urlStr.match(/\/api\/queries\/([a-zA-Z0-9\-]+)\/escalate/);
    const statusMatch = urlStr.match(/\/api\/queries\/([a-zA-Z0-9\-]+)\/status/);

    if (voteMatch) {
      // POST upvote query
      const queryId = voteMatch[1];
      const query = db.queries.find(q => q.id === queryId);
      if (query && bodyData) {
        if (query.upvotes.includes(bodyData.userId)) {
          query.upvotes = query.upvotes.filter(id => id !== bodyData.userId);
        } else {
          query.upvotes.push(bodyData.userId);
        }
        saveDB(db);
        responseData = { success: true };
        status = 200;
      }
    } else if (ansVoteMatch) {
      // POST upvote answer
      const queryId = ansVoteMatch[1];
      const ansId = ansVoteMatch[2];
      const query = db.queries.find(q => q.id === queryId);
      if (query && bodyData) {
        const ans = query.answers.find(a => a.id === ansId);
        if (ans) {
          if (ans.upvotes.includes(bodyData.userId)) {
            ans.upvotes = ans.upvotes.filter(id => id !== bodyData.userId);
          } else {
            ans.upvotes.push(bodyData.userId);
          }
          saveDB(db);
          responseData = { success: true };
          status = 200;
        }
      }
    } else if (answerMatch) {
      // POST answer to query
      const queryId = answerMatch[1];
      const query = db.queries.find(q => q.id === queryId);
      if (query && bodyData) {
        const authorUser = db.users.find(u => u.id === bodyData.authorId) || BOOTSTRAP_USERS[0];
        const newAns: Answer = {
          id: `ans-${Date.now()}`,
          queryId,
          content: bodyData.content,
          author: authorUser,
          isMentorVerified: authorUser.role === 'mentor',
          isAiGenerated: !!bodyData.isAiGenerated,
          createdAt: new Date().toISOString(),
          upvotes: []
        };
        query.answers.push(newAns);
        query.status = "assigned";
        
        // Notify Author of Query
        if (query.author.id !== authorUser.id) {
          db.notifications.unshift({
            id: `notif-${Date.now()}`,
            userId: query.author.id,
            title: `New Reply Received 💬`,
            content: `${authorUser.name} responded to your query: "${query.title.substring(0, 30)}..."`,
            type: "new_answer",
            read: false,
            createdAt: new Date().toISOString(),
            linkUrl: `/query/${query.id}`
          });
        }
        
        saveDB(db);
        responseData = { success: true, answer: newAns };
        status = 200;
      }
    } else if (assignMatch) {
      // POST assign
      const queryId = assignMatch[1];
      const query = db.queries.find(q => q.id === queryId);
      if (query && bodyData) {
        const mentor = db.users.find(u => u.id === bodyData.mentorId);
        if (mentor) {
          query.assignedMentor = mentor;
          query.status = "assigned";
          
          db.notifications.unshift({
            id: `notif-${Date.now()}`,
            userId: query.author.id,
            title: `Mentor Assigned 👨‍🏫`,
            content: `${mentor.name} has been assigned to help with your query.`,
            type: "assigned",
            read: false,
            createdAt: new Date().toISOString(),
            linkUrl: `/query/${query.id}`
          });
          
          saveDB(db);
          responseData = { success: true };
          status = 200;
        }
      }
    } else if (verifyMatch) {
      // POST verify
      const queryId = verifyMatch[1];
      const query = db.queries.find(q => q.id === queryId);
      if (query && bodyData) {
        const ans = query.answers.find(a => a.id === bodyData.answerId);
        if (ans) {
          ans.isMentorVerified = true;
          query.status = "resolved";
          query.resolvedAt = new Date().toISOString();
          
          // Reward Answerer and Askers with SP Points
          const delta = query.difficulty === 'hard' ? 40 : query.difficulty === 'medium' ? 20 : 10;
          ans.author.points += delta;
          ans.author.spurthiPoints += delta;
          
          db.notifications.unshift({
            id: `notif-${Date.now()}`,
            userId: query.author.id,
            title: `Query Resolved 🎉`,
            content: `Your query has been resolved! An answer by ${ans.author.name} is verified.`,
            type: "query_solved",
            read: false,
            createdAt: new Date().toISOString(),
            linkUrl: `/query/${query.id}`
          });
          
          saveDB(db);
          responseData = { success: true };
          status = 200;
        }
      }
    } else if (escalateMatch) {
      // POST escalate
      const queryId = escalateMatch[1];
      const query = db.queries.find(q => q.id === queryId);
      if (query) {
        if (!query.tags.includes("ESCALATED")) {
          query.tags.push("ESCALATED");
        }
        saveDB(db);
        responseData = { success: true };
        status = 200;
      }
    } else if (statusMatch) {
      // POST status
      const queryId = statusMatch[1];
      const query = db.queries.find(q => q.id === queryId);
      if (query && bodyData) {
        query.status = bodyData.status;
        saveDB(db);
        responseData = { success: true };
        status = 200;
      }
    } else if (idMatch) {
      // GET query detail
      const queryId = idMatch[1];
      const query = db.queries.find(q => q.id === queryId);
      if (query) {
        query.views++;
        saveDB(db);
        responseData = { success: true, query };
        status = 200;
      }
    } else if (method === "POST" && bodyData) {
      // CREATE Query
      const authorUser = db.users.find(u => u.id === bodyData.authorId) || BOOTSTRAP_USERS[0];
      const newQuery: Query = {
        id: `q-${Date.now()}`,
        title: bodyData.title,
        description: bodyData.description,
        status: "open",
        difficulty: bodyData.difficulty || "easy",
        tags: bodyData.tags || ["General"],
        author: authorUser,
        createdAt: new Date().toISOString(),
        answers: [],
        upvotes: [],
        views: 0
      };
      db.queries.unshift(newQuery);
      saveDB(db);
      responseData = { success: true, query: newQuery };
      status = 200;
    } else {
      // GET Standard list
      responseData = { success: true, queries: db.queries };
      status = 200;
    }
  } else if (urlStr.includes("/api/notifications")) {
    const readMatch = urlStr.match(/\/api\/notifications\/([a-zA-Z0-9\-]+)\/read/);
    const readAllMatch = urlStr.match(/\/api\/notifications\/read-all\/([a-zA-Z0-9\-]+)/);
    const listMatch = urlStr.match(/\/api\/notifications\/([a-zA-Z0-9\-]+)$/);
    
    if (readMatch) {
      const id = readMatch[1];
      const notif = db.notifications.find(n => n.id === id);
      if (notif) {
        notif.read = true;
        saveDB(db);
        responseData = { success: true };
        status = 200;
      }
    } else if (readAllMatch) {
      const uid = readAllMatch[1];
      db.notifications.forEach(n => {
        if (n.userId === uid) n.read = true;
      });
      saveDB(db);
      responseData = { success: true };
      status = 200;
    } else if (listMatch) {
      const uid = listMatch[1];
      const userNotifs = db.notifications.filter(n => n.userId === uid);
      responseData = { success: true, notifications: userNotifs };
      status = 200;
    }
  } else if (urlStr.includes("/api/prompt-config")) {
    if (method === "POST" && bodyData) {
      db.promptConfig = {
        ...db.promptConfig,
        systemInstruction: bodyData.systemInstruction,
        temperature: bodyData.temperature,
        model: bodyData.model,
        updatedAt: new Date().toISOString()
      };
      db.auditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: "PROMPT_UPDATE",
        user: bodyData.manager || "Administrator",
        details: `Updated Yaksha system prompts via client settings`
      });
      saveDB(db);
      responseData = { success: true, config: db.promptConfig };
      status = 200;
    } else {
      responseData = { success: true, config: db.promptConfig };
      status = 200;
    }
  } else if (urlStr.includes("/api/audit-logs")) {
    responseData = { success: true, logs: db.auditLogs };
    status = 200;
  } else if (urlStr.includes("/api/analytics")) {
    responseData = {
      success: true,
      summary: {
        totalQueries: db.queries.length,
        resolvedQueries: db.queries.filter(q => q.status === "resolved").length,
        unresolvedQueries: db.queries.filter(q => q.status !== "resolved").length,
        totalFAQs: db.faqs.length,
        averageResolutionTimeHours: 1.5,
        tokenUsageCount: 412000,
        serverCpuPercent: 12,
        serverMemoryMb: 148,
        tagCloud: db.queries.flatMap(q => q.tags).reduce((acc: any[], tag: string) => {
          const slot = acc.find(x => x.text === tag);
          if (slot) slot.value++;
          else acc.push({ text: tag, value: 1 });
          return acc;
        }, []),
        leaderboard: db.users.map(user => ({ user, count: user.points }))
      }
    };
    status = 200;
  } else if (urlStr.includes("/api/ai/analyze-query")) {
    // Return mock query tags / difficulty
    responseData = {
      success: true,
      difficulty: bodyData?.title?.toLowerCase().includes("crash") ? "hard" : "easy",
      suggestedTags: ["wsb-mcp", "WSL", "Docker", "Vibe Coding"],
      rewrittenTitle: bodyData ? `Refined: ${bodyData.title}` : "",
      aiSummary: "Automated analysis completed. Categorization set to development environments."
    };
    status = 200;
  } else if (urlStr.includes("/api/ai/draft-answer")) {
    responseData = {
      success: true,
      draft: `### Yaksha Simulated Guidance\n\nTo resolve this setup barrier:\n1. Verify if your WSL folder uses directory mounting permissions (` + "`chmod -R 777`" + `).\n2. Sync port binding constraints internally inside ` + "`visakha-mcp`" + `.\n\n*Reference: Coursework standards section 3(b).*`
    };
    status = 200;
  } else if (urlStr.includes("/api/ai/chatbot")) {
    // AI Chatbot questions response matching
    const queryText = bodyData?.messages?.[bodyData.messages.length - 1]?.text || "";
    let aiText = "I see! That matches our systems guidelines. Ask me specifically about: **Rosetta Journal updates**, **ViBe LMS**, or **visakha-mcp configurations**.";
    let citations = ["Samagama standards #2"];
    
    if (queryText.toLowerCase().includes("roetta") || queryText.toLowerCase().includes("rosetta")) {
      aiText = "Based on our Rosetta logging standard:\n\n- **Rosetta Journal** is your regular reflection portfolio.\n- Updates must document code-snippets, realizations, and systems integrations formally.\n- **Deadline**: Sync your Rosetta log every Monday before 09:00 UTC.\n- Certificate qualification requires at least 8 Rosetta reflections completed.";
      citations = ["Rosetta_Journal_Guide.pdf"];
    } else if (queryText.toLowerCase().includes("vibe") || queryText.toLowerCase().includes("lms")) {
      aiText = "To access the **ViBe learning platform**:\n\n1. Launch the platform link from our onboarding dashboard.\n2. Sign in with your registered internship email account.\n3. Complete self-assessments in Module 1-3. Assignments and grading indices are automatically synced on the Dashboard tab.";
      citations = ["ViBe_LMS_Onboarding.md"];
    } else if (queryText.toLowerCase().includes("visakha") || queryText.toLowerCase().includes("mcp") || queryText.toLowerCase().includes("sqlite")) {
      aiText = "Regarding the **visakha-mcp** SQLite setup:\n\n- The visakha-mcp is a custom Model Context Protocol server exposing SQLite tooling index utilities to AI coding models.\n- Ensure WSL environment paths are mounted properly inside `docker-compose.yml` to prevent Mount Read-Only errors.\n- Run `npm run dev` to launch the SQLite link broker locally.";
      citations = ["visakha-mcp_Documentation.md", "SQLite_Docker_Faq.txt"];
    } else if (queryText.toLowerCase().includes("noc")) {
      aiText = "To retrieve your **No Objection Certificate (NOC)**:\n\n- Head over to the **Admin Panel** or document archives.\n- Fill in your university specifics on the layout and send to Administration.\n- Our team will sign and mail it back to you within 3 business days.";
      citations = ["Administration_Guidelines_AnnexB.pdf"];
    }
    
    responseData = {
      success: true,
      text: aiText,
      citations,
      confidence: 0.94
    };
    status = 200;
  }

  // Generate fetch response
  return new Response(JSON.stringify(responseData), {
    status: status,
    headers: { "Content-Type": "application/json" }
  });
}
