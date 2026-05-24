/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Query, User, Answer } from "../types";
import { 
  Plus, 
  MessageCircle, 
  ChevronRight, 
  ThumbsUp, 
  Sparkles, 
  ArrowLeft, 
  Mic, 
  Volume2, 
  UploadCloud, 
  Cpu, 
  CheckCircle, 
  Clock, 
  UserPlus, 
  AlertCircle,
  Hash,
  Award
} from "lucide-react";

interface QueryForumProps {
  queries: Query[];
  currentUser: User;
  onRefreshQueries: () => void;
  onNavigateToFAQ: () => void;
  initialNewQueryText?: string;
  selectedThreadIdParam?: string;
  onClearThreadParam?: () => void;
}

export default function QueryForum({
  queries,
  currentUser,
  onRefreshQueries,
  onNavigateToFAQ,
  initialNewQueryText = "",
  selectedThreadIdParam = "",
  onClearThreadParam
}: QueryForumProps) {
  const [forumView, setForumView] = useState<"list" | "new" | "thread">("list");
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);

  // Listing page filter state
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [tagFilter, setTagFilter] = useState<string>("All");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"latest" | "upvotes" | "views">("latest");

  // Raise Query Form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDifficulty, setNewDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [newUrgency, setNewUrgency] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [newIsAnonymous, setNewIsAnonymous] = useState(false);
  const [newTagsString, setNewTagsString] = useState("");
  const [formAnalyzing, setFormAnalyzing] = useState(false);
  const [draftResult, setDraftResult] = useState<{
    difficulty?: string;
    suggestedTags?: string[];
    rewrittenTitle?: string;
    aiSummary?: string;
  } | null>(null);

  // Manual query merging state
  const [manualMergePrimary, setManualMergePrimary] = useState<string>("");
  const [manualMergeSecondary, setManualMergeSecondary] = useState<string>("");
  const [mergeStatusMsg, setMergeStatusMsg] = useState("");

  // Voice simulation state
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Dummy Drag-and-drop state
  const [dragOver, setDragOver] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string }[]>([]);

  // Response form state for thread
  const [newAnswerText, setNewAnswerText] = useState("");
  const [isDraftingAi, setIsDraftingAi] = useState(false);
  const [postLoading, setPostLoading] = useState(false);

  // Initialize from parameters
  useEffect(() => {
    if (initialNewQueryText) {
      setNewTitle(initialNewQueryText);
      setForumView("new");
    }
  }, [initialNewQueryText]);

  useEffect(() => {
    if (selectedThreadIdParam) {
      setSelectedQueryId(selectedThreadIdParam);
      setForumView("thread");
    }
  }, [selectedThreadIdParam]);

  const uniqueTags = ["All", ...Array.from(new Set(queries.flatMap(q => q.tags)))];

  const filteredQueries = queries
    .filter(q => {
      const matchesStatus = statusFilter === "All" || q.status === statusFilter.toLowerCase();
      const matchesTag = tagFilter === "All" || q.tags.includes(tagFilter);
      const matchesUrgency = urgencyFilter === "All" || (q.urgency || "medium") === urgencyFilter.toLowerCase();
      const matchesSearch = !searchQuery.trim() || 
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        q.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
        q.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesTag && matchesUrgency && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "upvotes") {
        return (b.upvotes?.length || 0) - (a.upvotes?.length || 0);
      }
      if (sortBy === "views") {
        return (b.views || 0) - (a.views || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const selectedQuery = queries.find(q => q.id === selectedQueryId);

  // AI-Assisted tag pre-screening trigger
  const triggerAiPreScreening = async () => {
    if (!newTitle.trim()) return;
    setFormAnalyzing(true);
    try {
      const res = await fetch("/api/ai/analyze-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, description: newDesc })
      });
      const data = await res.json();
      if (data.success) {
        setDraftResult(data);
        if (data.suggestedTags) {
          setNewTagsString(data.suggestedTags.join(", "));
        }
        if (data.difficulty) {
          setNewDifficulty(data.difficulty as any);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFormAnalyzing(false);
    }
  };

  // Recording Simulation
  const handleToggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      setRecordTimer(0);
      // Populate with realistic voice text
      setNewDesc(prev => (prev ? prev + "\n" : "") + "I encountered a Docker socket authorization block when trying to mount the models folder directly on WSL.");
    } else {
      setIsRecording(true);
      setRecordTimer(1);
      recordIntervalRef.current = setInterval(() => {
        setRecordTimer(prev => prev + 1);
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    };
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArr = Array.from(e.dataTransfer.files).map((f: any) => ({
        name: f.name,
        size: (f.size / 1024).toFixed(1) + " KB"
      }));
      setAttachedFiles(prev => [...prev, ...filesArr]);
    }
  };

  const simulateLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files).map((f: any) => ({
        name: f.name,
        size: (f.size / 1024).toFixed(1) + " KB"
      }));
      setAttachedFiles(prev => [...prev, ...filesArr]);
    }
  };

  // Raising submission
  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    try {
      const parsedTags = newTagsString
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const res = await fetch("/api/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          authorId: currentUser.id,
          tags: parsedTags.length > 0 ? parsedTags : ["General"],
          difficulty: newDifficulty,
          urgency: newUrgency,
          isAnonymous: newIsAnonymous
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewTitle("");
        setNewDesc("");
        setNewTagsString("");
        setNewUrgency("medium");
        setNewIsAnonymous(false);
        setAttachedFiles([]);
        setDraftResult(null);
        setForumView("list");
        onRefreshQueries();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Manual query merging
  const handleManualGroupMerge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMergePrimary || !manualMergeSecondary) return;
    setMergeStatusMsg("Merging duplicate threads...");
    try {
      const res = await fetch("/api/queries/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryId: manualMergePrimary,
          secondaryId: manualMergeSecondary,
          mergedBy: currentUser.name
        })
      });
      const data = await res.json();
      if (data.success) {
        setMergeStatusMsg("Queries grouped and merged successfully! Redirect link generated.");
        setManualMergePrimary("");
        setManualMergeSecondary("");
        onRefreshQueries();
      } else {
        setMergeStatusMsg(`Error: ${data.message}`);
      }
    } catch (err: any) {
      setMergeStatusMsg(`Failed to merge: ${err.message}`);
    }
  };

  // Upvote query
  const handleUpvoteQuery = async (queryId: string) => {
    try {
      await fetch(`/api/queries/${queryId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      onRefreshQueries();
    } catch (e) {
      console.error(e);
    }
  };

  // Upvote answer
  const handleUpvoteAnswer = async (queryId: string, answerId: string) => {
    try {
      await fetch(`/api/queries/${queryId}/answer/${answerId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      onRefreshQueries();
    } catch (e) {
      console.error(e);
    }
  };

  // Post response
  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswerText.trim() || !selectedQueryId) return;
    setPostLoading(true);

    try {
      const res = await fetch(`/api/queries/${selectedQueryId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorId: currentUser.id,
          content: newAnswerText,
          isAi: false
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewAnswerText("");
        onRefreshQueries();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPostLoading(false);
    }
  };

  // AI-Draft answer trigger
  const handleTriggerAiAnswerDraft = async () => {
    if (!selectedQueryId) return;
    setIsDraftingAi(true);
    try {
      const res = await fetch("/api/ai/draft-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queryId: selectedQueryId })
      });
      const data = await res.json();
      if (data.success) {
        setNewAnswerText(data.draft);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDraftingAi(false);
    }
  };

  // Assign current user as mentor
  const handleAssignSelf = async (queryId: string) => {
    try {
      const res = await fetch(`/api/queries/${queryId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId: currentUser.id })
      });
      if (res.ok) onRefreshQueries();
    } catch (e) {
      console.error(e);
    }
  };

  // Verify answer as resolved
  const handleVerifyAnswerAsSolution = async (queryId: string, answerId: string) => {
    try {
      const res = await fetch(`/api/queries/${queryId}/verify-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerId, mentorId: currentUser.id })
      });
      if (res.ok) onRefreshQueries();
    } catch (e) {
      console.error(e);
    }
  };

  // Escalate to senior mentor
  const handleEscalateQuery = async (queryId: string) => {
    try {
      const res = await fetch(`/api/queries/${queryId}/escalate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId: "user-3" }) // Assign to Vinayak Sen by default
      });
      if (res.ok) onRefreshQueries();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in text-slate-100">
      
      {/* 1. LISTING VIEW */}
      {forumView === "list" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Query discussion Forum</h2>
              <p className="text-xs text-slate-400 mt-1">Submit technical questions and collaborate on systems problems with other teams.</p>
            </div>
            <button
              onClick={() => {
                setNewTitle("");
                setNewDesc("");
                setForumView("new");
              }}
              className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Raise Query</span>
            </button>
          </div>

          {/* Quick Stats Filters Bar */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              
              {/* Main text search bar */}
              <div className="md:col-span-1 relative">
                <input 
                  type="text"
                  placeholder="Search title, tags, or details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg text-xs px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Status checkboxes/buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Status:</span>
                {["All", "Open", "Assigned", "Resolved"].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`px-2 py-1 text-[10px] rounded-md transition-colors ${
                      statusFilter === status 
                        ? "bg-slate-800 text-sky-400 font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Urgency selectors dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Urgency:</span>
                <select
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-[10px] rounded-md px-2 py-1 outline-none w-full"
                >
                  <option value="All">All Urgency</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Tag and Sorter selector */}
              <div className="flex items-center space-x-2">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-[10px] rounded-md px-1.5 py-1 outline-none w-1/2"
                >
                  <option value="latest">Latest</option>
                  <option value="upvotes">Upvotes</option>
                  <option value="views">Reads</option>
                </select>

                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-[10px] rounded-md px-1.5 py-1 outline-none w-1/2"
                >
                  {uniqueTags.map(tag => (
                    <option key={tag} value={tag}>#{tag}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Admin & Mentor manual grouping / merge engine */}
            {(currentUser.role === "admin" || currentUser.role === "mentor") && (
              <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl space-y-3">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-slate-200 font-sans uppercase tracking-wide">Duplicate Thread Merging Engine</span>
                </div>
                <p className="text-[10px] text-slate-400">Combine overlapping intern queries, consolidate tags and link multiple participants to clean the dashboard queue.</p>
                
                <form onSubmit={handleManualGroupMerge} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-[8px] uppercase font-mono text-slate-500 mb-1">Primary Thread (Remains Open)</label>
                    <select
                      value={manualMergePrimary}
                      onChange={(e) => setManualMergePrimary(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-[10px] rounded p-2 outline-none"
                    >
                      <option value="">-- Select Thread --</option>
                      {queries.filter(q => q.status !== "resolved").map(q => (
                        <option key={q.id} value={q.id}>{q.title.substring(0, 35)}... (ID: {q.id})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[8px] uppercase font-mono text-slate-500 mb-1">Duplicate Thread (Merged & Closed)</label>
                    <select
                      value={manualMergeSecondary}
                      onChange={(e) => setManualMergeSecondary(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-[10px] rounded p-2 outline-none"
                    >
                      <option value="">-- Select Duplicate to Close --</option>
                      {queries.filter(q => q.status !== "resolved" && q.id !== manualMergePrimary).map(q => (
                        <option key={q.id} value={q.id}>{q.title.substring(0, 35)}... (ID: {q.id})</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="bg-sky-600 hover:bg-sky-500 text-white font-mono text-[9px] uppercase font-bold py-2 px-3 rounded tracking-wider transition-all"
                  >
                    Bind & Merge Threads
                  </button>
                </form>

                {mergeStatusMsg && (
                  <p className="text-[10px] font-mono text-sky-450 animate-pulse">{mergeStatusMsg}</p>
                )}
              </div>
            )}
          </div>

          {/* Discussion List */}
          <div className="space-y-3">
            {filteredQueries.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                <AlertCircle className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-semibold">No queries matching this selection yet.</p>
                <p className="text-xs text-slate-500 mt-1">Be the first to raise a question and collaborate with the team!</p>
              </div>
            ) : (
              filteredQueries.map(q => (
                <div 
                  key={q.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl hover:border-slate-700 transition-all cursor-pointer p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  onClick={() => {
                    setSelectedQueryId(q.id);
                    setForumView("thread");
                  }}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                        q.status === "open" 
                          ? "bg-sky-950 text-sky-400 border-sky-800/30" 
                          : q.status === "assigned"
                          ? "bg-indigo-950 text-indigo-400 border-indigo-800/30"
                          : "bg-emerald-950 text-emerald-400 border-emerald-800/30"
                      }`}>
                        {q.status}
                      </span>

                      <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border border-slate-800 text-slate-400`}>
                        {q.difficulty}
                      </span>

                      {/* Explicit Urgency Indicators */}
                      <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                        (q.urgency || "medium") === "critical" ? "bg-rose-950/80 text-rose-400 border-rose-800/40" :
                        (q.urgency || "medium") === "high" ? "bg-amber-950/80 text-amber-400 border-amber-800/40" :
                        (q.urgency || "medium") === "medium" ? "bg-sky-950/60 text-sky-400 border-sky-800/30" :
                        "bg-slate-950 text-slate-500 border-slate-800/40"
                      }`}>
                        {q.urgency || "medium"} Urgency
                      </span>

                      {/* Display Merged indicator if appropriate */}
                      {q.duplicateOfId && (
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded border bg-amber-950/20 text-amber-300 border-amber-800/30 animate-pulse">
                          Merged Loop 🔗
                        </span>
                      )}

                      {q.additionalParticipants && q.additionalParticipants.length > 0 && (
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-sky-950/30 text-sky-300 border border-sky-900/40">
                          Group Thread (+{q.additionalParticipants.length} Interns)
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-100 hover:text-sky-450 transition-colors leading-snug flex items-center space-x-2">
                      {q.duplicateOfId && <span className="text-xs text-slate-500 line-through">[Closed]</span>}
                      <span>{q.title}</span>
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {q.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {q.tags.map(t => (
                        <span key={t} className="bg-slate-950 border border-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Metadata and statistics bar with Anonymity shielding */}
                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800/50">
                    <div className="flex items-center space-x-2">
                      <img 
                        src={q.isAnonymous ? "https://api.dicebear.com/7.x/identicon/svg?seed=anonymous" : q.author.avatar} 
                        className="w-6 h-6 rounded-full border border-slate-755" 
                        alt="" 
                      />
                      <div className="text-[10px] text-slate-400 font-mono">
                        <span className="block font-semibold leading-none text-slate-350">
                          {q.isAnonymous ? (
                            (currentUser.role === "admin" || currentUser.role === "mentor") ? (
                              <span className="text-amber-300 underline cursor-help" title="Anonymized Intern Profile. Displaying only to authorized mentorship roles.">
                                Anonymous ({q.author.name} 🔑)
                              </span>
                            ) : (
                              <span className="text-slate-500 select-none">Anonymous Intern</span>
                            )
                          ) : (
                            q.author.name
                          )}
                        </span>
                        <span className="text-[9px] text-slate-500 leading-none block mt-0.5">
                          {new Date(q.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-xs font-mono text-slate-400 shrink-0">
                      <span className="flex items-center space-x-1">
                        <MessageCircle className="w-3.5 h-3.5 text-sky-400" />
                        <span>{q.answers.length}</span>
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpvoteQuery(q.id);
                        }}
                        className={`flex items-center space-x-1 hover:text-white transition-colors ${
                          q.upvotes.includes(currentUser.id) ? "text-sky-400 font-bold" : ""
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{q.upvotes.length}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. RAISE QUERY (NEW) FORM */}
      {forumView === "new" && (
        <form onSubmit={handleSubmitQuery} className="bg-slate-950 border border-slate-850 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-850 pb-4">
            <button
              type="button"
              onClick={() => {
                setForumView("list");
                if (onClearThreadParam) onClearThreadParam();
              }}
              className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Forum</span>
            </button>
            <h3 className="text-sm font-bold text-white">Raise Community Query</h3>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 mb-1.5">
                <label className="block text-[10px] uppercase font-mono text-slate-400">Query Title</label>
                <button
                  type="button"
                  onClick={triggerAiPreScreening}
                  disabled={!newTitle.trim() || formAnalyzing}
                  className="text-[10px] font-mono text-sky-400 hover:text-sky-300 flex items-center space-x-1 disabled:opacity-40"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{formAnalyzing ? "Analyzing..." : "Trigger AI Pre-Screening"}</span>
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. SQLite database locks during concurrent Vibe sync operations"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl text-xs px-4 py-3 focus:outline-none focus:border-sky-500/50"
              />
            </div>

            {/* AI Diagnostics response card */}
            {draftResult && (
              <div className="p-4 bg-slate-900/60 rounded-xl border border-sky-800/30 text-xs space-y-3 animate-fade-in">
                <div className="flex items-center justify-between text-[10px] font-mono text-sky-400 uppercase tracking-wider">
                  <span>Yaksha Pre-screening Insights</span>
                  <span>Duplicate status clean</span>
                </div>
                <div className="text-slate-300 font-sans italic leading-relaxed">
                  "{draftResult.aiSummary || 'Analytic diagnostics complete. Tags and difficulty calculated automatically.'}"
                </div>
              </div>
            )}

            {/* Content description with Voice-to-Text simulation */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] uppercase font-mono text-slate-400">Detailed Description</label>
                
                {/* Voice toggle trigger */}
                <button
                  type="button"
                  onClick={handleToggleRecord}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                    isRecording 
                      ? "bg-rose-950 text-rose-400 border border-rose-800 animate-pulse" 
                      : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  <Mic className="w-3.5 h-3.5 shrink-0" />
                  <span>{isRecording ? `Dictating... 0:0${recordTimer}s` : "Voice Draft Input"}</span>
                  {isRecording && <Volume2 className="w-3 h-3 animate-bounce ml-0.5" />}
                </button>
              </div>

              <textarea
                required
                rows={6}
                placeholder="State technical steps, errors, WSL environment conditions, or file versions... Press the voice dictate button above to simulate natural speech formatting."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl text-xs px-4 py-3 focus:outline-none focus:border-sky-500/50 font-sans resize-none"
              />
            </div>

            {/* File Drag Zone Integration */}
            <div>
              <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1.5">Attach Technical Logs / Artifacts</label>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("hidden-file-input")?.click()}
                className={`p-6 bg-slate-900/40 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                  dragOver 
                    ? "border-sky-500 bg-sky-950/10" 
                    : "border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                }`}
              >
                <input 
                  type="file" 
                  id="hidden-file-input" 
                  className="hidden" 
                  multiple 
                  onChange={simulateLocalFileSelect} 
                />
                <UploadCloud className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <span className="block text-xs font-semibold text-slate-300">Drag files here or tap to select folder</span>
                <span className="block text-[10px] text-slate-500 font-mono mt-1">Accepts docker files, stacktraces, or PDF summaries (Max 8MB)</span>
              </div>

              {attachedFiles.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {attachedFiles.map((file, idx) => (
                    <div key={idx} className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center space-x-2">
                      <span className="truncate max-w-[120px]">{file.name}</span>
                      <span className="text-slate-600">({file.size})</span>
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setAttachedFiles(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="text-slate-500 hover:text-white"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Side features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1.5">Difficulty Tier</label>
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl text-xs px-3.5 py-2.5 outline-none focus:border-sky-500/50"
                >
                  <option value="easy">Easy (Curriculum issue, policy guidelines)</option>
                  <option value="medium">Medium (Docker execution error, standard code bugs)</option>
                  <option value="hard">Hard (MCP technical schemas, model system integrations)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1.5">Urgency Level</label>
                <select
                  value={newUrgency}
                  onChange={(e) => setNewUrgency(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl text-xs px-3.5 py-2.5 outline-none focus:border-sky-500/50"
                >
                  <option value="low">Low (General suggestion, enhancement feedback)</option>
                  <option value="medium">Medium (Standard error blocking task progression)</option>
                  <option value="high">High (Docker crash or multiple tools locked)</option>
                  <option value="critical">Critical (Complete project blocks, platform downtime)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1.5">Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. SQLite, visakha-mcp, Docker"
                  value={newTagsString}
                  onChange={(e) => setNewTagsString(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl text-xs px-3.5 py-2.5 focus:outline-none focus:border-sky-500/50"
                />
              </div>

              <div className="flex items-center space-x-3 bg-slate-900/40 border border-slate-800 p-3 rounded-xl">
                <input
                  type="checkbox"
                  id="anonymize-chk"
                  checked={newIsAnonymous}
                  onChange={(e) => setNewIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-sky-500 focus:ring-sky-500"
                />
                <label htmlFor="anonymize-chk" className="cursor-pointer select-none">
                  <span className="block text-[10px] uppercase font-mono text-slate-300">Post Anonymously</span>
                  <span className="block text-[9px] text-slate-500 leading-none mt-0.5">Hide your name. core team retains backdoor logs.</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-850">
            <button
              type="button"
              onClick={() => {
                setForumView("list");
                if (onClearThreadParam) onClearThreadParam();
              }}
              className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition-all shadow"
            >
              Submit Query Ticket
            </button>
          </div>
        </form>
      )}

      {/* 3. DISCUSSION THREAD VIEW */}
      {forumView === "thread" && selectedQuery && (
        <div className="space-y-6">
          
          {/* Header Action bar */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                setForumView("list");
                if (onClearThreadParam) onClearThreadParam();
              }}
              className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Forum</span>
            </button>

            {/* Mentor assignment and escalation tools */}
            <div className="flex items-center space-x-2">
              {currentUser.role === "intern" && selectedQuery.status !== "resolved" && selectedQuery.status !== "closed" && (
                <button
                  onClick={() => handleEscalateQuery(selectedQuery.id)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900/90 border border-rose-800/50 text-rose-300 text-xs font-semibold rounded-xl transition-colors"
                  title="Escalates ticket category to HARD difficulty and flags program mentors for direct solution drafting."
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-450 animate-pulse shrink-0" />
                  <span>Escalate to Core Team</span>
                </button>
              )}

              {["mentor", "admin"].includes(currentUser.role) && !selectedQuery.assignedMentor && (
                <button
                  onClick={() => handleAssignSelf(selectedQuery.id)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/40 text-indigo-300 text-xs font-semibold rounded-xl transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 shrink-0" />
                  <span>Assign to Myself</span>
                </button>
              )}

              {selectedQuery.assignedMentor && (
                <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse shrink-0" />
                  <span>Assigned Mentor:</span>
                  <span className="font-semibold text-slate-250 truncate max-w-[100px]">{selectedQuery.assignedMentor.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Core thread topic details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-500">
              <span className="font-semibold text-sky-400 uppercase">TICKET ID: {selectedQuery.id}</span>
              <span>•</span>
              <span>Raised {new Date(selectedQuery.createdAt).toLocaleString()}</span>
              <span>•</span>
              <span className="uppercase text-slate-400 font-bold">{selectedQuery.difficulty} difficulty</span>
            </div>

            <h1 className="text-xl font-bold text-white font-sans leading-tight">
              {selectedQuery.title}
            </h1>

            <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap bg-slate-950/20 py-3 px-4 rounded-xl border border-slate-850">
              {selectedQuery.description}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/60 pt-4">
              <div className="flex items-center space-x-3">
                <img src={selectedQuery.author.avatar} alt="" className="w-8 h-8 rounded-full border border-slate-750" />
                <div>
                  <span className="block text-xs font-bold text-slate-200">{selectedQuery.author.name}</span>
                  <span className="block text-[10px] text-slate-500 font-mono capitalize">{selectedQuery.author.role} • {selectedQuery.author.department}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3.5">
                <button
                  onClick={() => handleUpvoteQuery(selectedQuery.id)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                    selectedQuery.upvotes.includes(currentUser.id)
                      ? "bg-sky-950/50 text-sky-300 border-sky-850/40"
                      : "bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{selectedQuery.upvotes.length}</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI-derived diagnostic summaries if resolved */}
          {selectedQuery.aiSummary && (
            <div className="p-4 bg-sky-950/10 border border-sky-900/30 rounded-xl flex items-start space-x-3 text-xs leading-relaxed text-sky-300">
              <Sparkles className="w-5 h-5 text-sky-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="font-mono font-bold text-[10px] block text-sky-400 uppercase tracking-wide mb-1">Knowledge Synthesis Summary</span>
                <span>{selectedQuery.aiSummary}</span>
              </div>
            </div>
          )}

          {/* Thread List Answers */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300 font-sans">
              Collaborative Answers & Solutions ({selectedQuery.answers.length})
            </h3>

            {selectedQuery.answers.length === 0 ? (
              <div className="p-8 bg-slate-900/20 border border-slate-800/60 text-center rounded-xl text-slate-500 text-xs">
                No verified solutions suggested yet. Use the reply field below to help resolve this ticket!
              </div>
            ) : (
              selectedQuery.answers.map(ans => (
                <div 
                  key={ans.id}
                  className={`border rounded-xl p-5 space-y-3 transition-colors ${
                    ans.isMentorVerified 
                      ? "bg-slate-900 border-emerald-950 shadow-md shadow-emerald-950/10" 
                      : ans.isAiGenerated
                      ? "bg-slate-900 border-sky-950/40"
                      : "bg-slate-900 border-slate-850"
                  }`}
                >
                  <div className="flex items-start justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-2.5">
                      <img src={ans.author.avatar} alt="" className="w-6 h-6 rounded-full border border-slate-750" />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-200">{ans.author.name}</span>
                          {ans.isAiGenerated && (
                            <span className="bg-sky-950 text-sky-400 border border-sky-800/30 text-[9px] font-mono px-1.5 py-0.2 rounded">
                              AI BOT
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 leading-none">
                          Replied {new Date(ans.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Solution Indicator icon */}
                      {ans.isMentorVerified && (
                        <span className="flex items-center space-x-1 text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/30 font-mono text-[9px] uppercase font-bold tracking-wide">
                          <CheckCircle className="w-3 h-3" />
                          <span>Mentor Verified Solution</span>
                        </span>
                      )}

                      {/* Mentor actions: verify */}
                      {["mentor", "admin"].includes(currentUser.role) && !ans.isMentorVerified && (
                        <button
                          onClick={() => handleVerifyAnswerAsSolution(selectedQuery.id, ans.id)}
                          className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/20"
                        >
                          <span>Mark Solution Verified</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Reply detail markdown/text */}
                  <div className="text-xs text-slate-350 font-sans leading-relaxed whitespace-pre-wrap bg-slate-950/10 p-3.5 rounded-lg border border-slate-850">
                    {ans.content}
                  </div>

                  {/* Actions inside reply */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleUpvoteAnswer(selectedQuery.id, ans.id)}
                      className={`flex items-center space-x-1 text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors ${
                        ans.upvotes.includes(currentUser.id) ? "text-sky-400 font-semibold" : ""
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{ans.upvotes.length} helpful votes</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Reply Composition Box */}
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] uppercase font-mono text-slate-400">Post an Answer / Suggestion</label>
              
              {/* Draft AI assist button */}
              <button
                type="button"
                onClick={handleTriggerAiAnswerDraft}
                disabled={isDraftingAi}
                className="flex items-center space-x-1.5 px-3 py-1 bg-sky-950/80 hover:bg-sky-900 border border-sky-800/45 text-sky-400 hover:text-sky-300 text-[10px] font-mono rounded-xl transition-colors disabled:opacity-40"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>{isDraftingAi ? "Yaksha Drafting..." : "Draft Solution with RAG"}</span>
              </button>
            </div>

            <textarea
              rows={4}
              placeholder="State a verified code block, reference terminal command files, or cite resources... Use markdown syntax."
              value={newAnswerText}
              onChange={(e) => setNewAnswerText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl text-xs px-4 py-3 focus:outline-none focus:border-sky-500/50 resize-none font-sans"
            />

            <div className="flex justify-end">
              <button
                onClick={handlePostAnswer}
                disabled={postLoading}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold"
              >
                {postLoading ? "Posting..." : "Submit Answer"}
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
