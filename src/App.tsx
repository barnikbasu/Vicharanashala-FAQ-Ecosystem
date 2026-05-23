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

const DEFAULT_USER: User = {
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
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("admin");
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);
  const [allUsers, setAllUsers] = useState<User[]>([DEFAULT_USER]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [queries, setQueries] = useState<Query[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Initial Bootstrapping
  const fetchAllData = async (userIdToLoad?: string) => {
    try {
      // 1. FAQs
      const rFaqs = await fetch("/api/faqs");
      const jFaqs = await rFaqs.json();
      if (jFaqs.success) setFaqs(jFaqs.faqs);

      // 2. Forum Queries
      const rQueries = await fetch("/api/queries");
      const jQueries = await rQueries.json();
      if (jQueries.success) setQueries(jQueries.queries);

      // 3. User lists
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
      console.error("Failed to sync system database state: ", e);
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
      if (selectedUser.role === "admin") {
        setActiveTab("admin");
      } else if (activeTab === "admin") {
        setActiveTab("landing");
      }
    }
    await fetchAllData(userId);
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
