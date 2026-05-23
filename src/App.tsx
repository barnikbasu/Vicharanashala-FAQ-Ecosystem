/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Navigation from "./components/Navigation";
import Landing from "./components/Landing";
import FAQExplorer from "./components/FAQExplorer";
import QueryForum from "./components/QueryForum";
import YakshaChat from "./components/YakshaChat";
import Dashboard from "./components/Dashboard";
import AdminPanel from "./components/AdminPanel";
import { User, FAQ, Query, Notification } from "./types";
import { Sparkles, Terminal, BookOpen, Clock, Users } from "lucide-react";

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
        author: BOOTSTRAP_USERS[3], // Admin
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

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("admin");
  const [currentUser, setCurrentUser] = useState<User>(BOOTSTRAP_USERS[3]); // Sudarshan Iyengar
  const [allUsers, setAllUsers] = useState<User[]>(BOOTSTRAP_USERS);
  const [faqs, setFaqs] = useState<FAQ[]>(BOOTSTRAP_FAQS);
  const [queries, setQueries] = useState<Query[]>(BOOTSTRAP_QUERIES);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Initial Bootstrapping
  const fetchAllData = async (userIdToLoad?: string) => {
    // 1. FAQs
    try {
      const rFaqs = await fetch("/api/faqs");
      const jFaqs = await rFaqs.json();
      if (jFaqs.success) setFaqs(jFaqs.faqs);
    } catch (e) {
      console.log("Using static FAQs fallback.");
    }

    // 2. Forum Queries
    try {
      const rQueries = await fetch("/api/queries");
      const jQueries = await rQueries.json();
      if (jQueries.success) setQueries(jQueries.queries);
    } catch (e) {
      console.log("Using static Queries fallback.");
    }

    // 3. User lists
    try {
      const rUsers = await fetch("/api/auth/users");
      const jUsers = await rUsers.json();
      if (jUsers.success) {
        setAllUsers(jUsers.users);
        const activeId = userIdToLoad || activeUserIdRef.current || "user-4";
        
        // Load target current user context
        const rMe = await fetch(`/api/auth/me?userId=${activeId}`);
        const jMe = await rMe.json();
        if (jMe.success) {
          setCurrentUser(jMe.user);
          // Trigger notifications load
          const rNotif = await fetch(`/api/notifications/${activeId}`);
          const jNotif = await rNotif.json();
          if (jNotif.success) setNotifications(jNotif.notifications);
        }
      }
    } catch (e) {
      console.log("Using static Users / Notifications fallback.");
    } finally {
      setLoading(false);
    }
  };

  // Use a ref to always access the latest active user ID in the auto-refresh background interval
  const activeUserIdRef = React.useRef(currentUser.id);
  
  useEffect(() => {
    activeUserIdRef.current = currentUser.id;
  }, [currentUser.id]);

  useEffect(() => {
    fetchAllData();
    
    // Simple 10 second auto-refresh loops to implement real-time forum updates safely
    const interval = setInterval(() => {
      fetchAllData(activeUserIdRef.current);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleUserSwitch = async (userId: string) => {
    setLoading(true);
    const selectedUser = allUsers.find(u => u.id === userId);
    if (selectedUser) {
      setCurrentUser(selectedUser);
      if (selectedUser.role === "admin") {
        setActiveTab("admin");
      } else if (activeTab === "admin") {
        setActiveTab("landing");
      }
    }
    try {
      await fetchAllData(userId);
    } catch (e) {
      console.warn("API Server is down or unreachable. Using offline-simulated fallback.");
    } finally {
      setLoading(false);
    }
  };

  const handleFAQVote = async (faqId: string, helpful: boolean) => {
    try {
      const res = await fetch(`/api/faqs/${faqId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helpful })
      });
      if (res.ok) {
        // Increment count locally in state immediately
        setFaqs(prev => prev.map(f => {
          if (f.id === faqId) {
            return {
              ...f,
              helpfulCount: helpful ? f.helpfulCount + 1 : f.helpfulCount,
              unhelpfulCount: !helpful ? f.unhelpfulCount + 1 : f.unhelpfulCount
            };
          }
          return f;
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefreshQueriesOnly = async () => {
    try {
      const rQueries = await fetch("/api/queries");
      const jQueries = await rQueries.json();
      if (jQueries.success) setQueries(jQueries.queries);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle complex sub-tab states for New Query or Thread redirect URLs
  let renderedTab = activeTab;
  let preseededNewQueryText = "";
  let selectedThreadIdParam = "";

  if (activeTab.startsWith("query-new-")) {
    renderedTab = "query";
    preseededNewQueryText = decodeURIComponent(activeTab.substring(10));
  } else if (activeTab.startsWith("query-thread-")) {
    renderedTab = "query";
    selectedThreadIdParam = activeTab.substring(13);
  }

  return (
    <div id="root-viewport" className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500/10">
      
      {/* Top sticky navbar navigation element */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        allUsers={allUsers}
        onUserSwitch={handleUserSwitch}
        notifications={notifications}
        onNotificationRead={handleNotificationRead}
      />

      {/* Main container holding core modules */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:px-6">
        
        {renderedTab === "landing" && (
          <Landing
            onNavigate={setActiveTab}
            totalFAQsCount={faqs.length}
            totalUnresolvedCount={queries.filter(q => q.status !== "resolved").length}
          />
        )}

        {renderedTab === "faq" && (
          <FAQExplorer
            faqs={faqs}
            currentUser={currentUser}
            onVote={handleFAQVote}
            onRefreshFaqs={() => fetchAllData(currentUser.id)}
          />
        )}

        {renderedTab === "query" && (
          <QueryForum
            queries={queries}
            currentUser={currentUser}
            onRefreshQueries={handleRefreshQueriesOnly}
            onNavigateToFAQ={() => setActiveTab("faq")}
            initialNewQueryText={preseededNewQueryText}
            selectedThreadIdParam={selectedThreadIdParam}
            onClearThreadParam={() => setActiveTab("query")}
          />
        )}

        {renderedTab === "yaksha" && (
          <YakshaChat
            currentUser={currentUser}
            onNavigate={setActiveTab}
          />
        )}

        {renderedTab === "dashboard" && (
          <Dashboard />
        )}

        {renderedTab === "admin" && (
          <AdminPanel
            allUsers={allUsers}
            onRefreshUsers={() => fetchAllData(currentUser.id)}
            currentUser={currentUser}
          />
        )}

      </main>

      {/* Humble Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/40 py-8 text-center text-[10px] font-mono text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>VICHARANASHALA HQ © 2026 • SAMAGAMA KNOWLEDGE NETWORK</span>
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>YAKSHA CONTEXT INDEX IN SYNC (34ms)</span>
          </span>
        </div>
      </footer>

    </div>
  );
}
