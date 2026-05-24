/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { FAQ, User } from "../types";
import { 
  Search, 
  ThumbsUp, 
  ThumbsDown, 
  Eye, 
  Plus, 
  HelpCircle, 
  Tag, 
  Check, 
  X,
  Layers,
  Play,
  History,
  Award,
  AlertCircle,
  Edit2
} from "lucide-react";

interface FAQExplorerProps {
  faqs: FAQ[];
  currentUser: User;
  onVote: (id: string, helpful: boolean) => void;
  onRefreshFaqs: () => void;
  preseededSearch?: string;
}

export default function FAQExplorer({ faqs, currentUser, onVote, onRefreshFaqs, preseededSearch = "" }: FAQExplorerProps) {
  const [searchTerm, setSearchTerm] = useState(preseededSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [hasVotedMap, setHasVotedMap] = useState<Record<string, boolean>>({});
  const [problemSolvedMap, setProblemSolvedMap] = useState<Record<string, boolean>>({});

  // Inline editing states for Admins/Mentors
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [showHistoryFaqId, setShowHistoryFaqId] = useState<string | null>(null);

  const getSimilarityScore = (question: string, query: string): number => {
    if (!query.trim()) return 0;
    const qWords = question.toLowerCase().split(/[\s,.\-?]+/);
    const queryWords = query.toLowerCase().split(/[\s,.\-?]+/);
    let matches = 0;
    queryWords.forEach(kw => {
      if (kw.length > 2 && qWords.some(qw => qw.includes(kw) || kw.includes(qw))) {
        matches++;
      }
    });
    const score = Math.round((matches / Math.max(1, queryWords.filter(w => w.length > 2).length)) * 100);
    return Math.min(100, Math.max(question.toLowerCase().includes(query.toLowerCase()) ? 92 : 0, score));
  };

  const getEmbedUrl = (url: string | undefined): string | null => {
    if (!url) return null;
    try {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
      }
      if (url.includes("loom.com")) {
        const parts = url.split("/share/");
        if (parts.length === 2) {
          return `https://www.loom.com/embed/${parts[1].split("?")[0]}`;
        }
      }
    } catch (e) {
      console.warn(e);
    }
    return null;
  };

  // Creator Modal State (For Admins)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newCategory, setNewCategory] = useState("Rosetta Journal");
  const [newTagsString, setNewTagsString] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    if (preseededSearch) {
      setSearchTerm(preseededSearch);
    }
  }, [preseededSearch]);

  const categories = ["All", ...Array.from(new Set(faqs.map(f => f.category)))];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (selectedCategory === "All") return matchesSearch;
    return faq.category === selectedCategory && matchesSearch;
  });

  const handleVoteAction = async (faqId: string, helpful: boolean) => {
    if (hasVotedMap[faqId]) return; // Prevent double actions in local UI
    setHasVotedMap(prev => ({ ...prev, [faqId]: true }));
    onVote(faqId, helpful);
  };

  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim() || !newCategory.trim()) return;
    setCreateLoading(true);

    try {
      const parsedTags = newTagsString
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const res = await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: newQuestion,
          answer: newAnswer,
          category: newCategory,
          tags: parsedTags,
          videoUrl: newVideoUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewQuestion("");
        setNewAnswer("");
        setNewTagsString("");
        setNewVideoUrl("");
        setShowCreateModal(false);
        onRefreshFaqs();
      }
    } catch (err) {
      console.error("Failed to construct dynamic FAQ", err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateFaq = async (faqId: string) => {
    try {
      const parsedTags = editTags.split(",").map(t => t.trim()).filter(Boolean);
      const res = await fetch(`/api/faqs/${faqId}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: editQuestion,
          answer: editAnswer,
          category: editCategory,
          tags: parsedTags,
          videoUrl: editVideoUrl,
          editedBy: currentUser.name
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditingFaqId(null);
        onRefreshFaqs();
      }
    } catch (err) {
      console.error("FAQ update error", err);
    }
  };

  const handleVerifyFaq = async (faqId: string) => {
    try {
      const res = await fetch(`/api/faqs/${faqId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verifiedBy: currentUser.name })
      });
      const data = await res.json();
      if (data.success) {
        onRefreshFaqs();
      }
    } catch (err) {
      console.error("FAQ verification error", err);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      
      {/* Header and Action Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans text-white">FAQ Knowledge Engine</h2>
          <p className="text-xs text-slate-400 mt-1">Verified institutional and curriculum guidelines reviewed by Sage Mentors.</p>
        </div>

        {currentUser.role === "admin" && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold tracking-wide transition-all self-start md:self-auto shadow-md shadow-sky-950/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create FAQ</span>
          </button>
        )}
      </div>

      {/* Filter Options & Search bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Categories Sidebar */}
        <div className="space-y-2 lg:col-span-1">
          <div className="text-[10px] font-mono tracking-wider text-slate-500 uppercase px-1">
            Browse Categories
          </div>
          <div className="flex flex-row overflow-x-auto lg:flex-col gap-1.5 pb-2 lg:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-left text-xs px-3 py-2 rounded-lg transition-all shrink-0 font-sans ${
                  selectedCategory === cat 
                    ? "bg-slate-800 text-sky-400 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Display block */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search index keywords, modules, or git tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500/50 rounded-xl text-slate-100 text-sm pl-11 pr-4 py-3 placeholder-slate-500 focus:outline-none"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")} 
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="space-y-3.5">
            {filteredFaqs.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 space-y-3">
                <HelpCircle className="w-10 h-10 mx-auto text-slate-700" />
                <p className="text-sm">No FAQ matches found for "{searchTerm}"</p>
                <p className="text-xs text-slate-500">Ask Yaksha in the AI Chat tab to synthesize dynamic documentation.</p>
              </div>
            ) : (
              filteredFaqs.map(faq => {
                const isExpanded = expandedFaqId === faq.id;
                const voted = hasVotedMap[faq.id];
                return (
                  <div 
                    key={faq.id} 
                    className={`bg-slate-900 border transition-all duration-200 rounded-xl overflow-hidden hover:border-slate-800/80 ${
                      isExpanded ? "border-slate-850 bg-slate-900/90 shadow-xl" : "border-slate-850"
                    }`}
                  >
                    {/* Collapsed Header trigger */}
                    <div 
                      onClick={() => {
                        setExpandedFaqId(isExpanded ? null : faq.id);
                        // Trigger look increment
                        fetch(`/api/faqs/${faq.id}`);
                      }}
                      className="p-5 flex items-start justify-between gap-4 cursor-pointer"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="text-[10px] font-mono tracking-wider bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase leading-none">
                            {faq.category}
                          </span>
                          {searchTerm && (
                            <span className="text-[10px] font-mono bg-sky-950/80 border border-sky-800 text-sky-400 px-2 py-0.5 rounded leading-none flex items-center space-x-1">
                              <span className="w-1 h-1 rounded-full bg-sky-400 animate-pulse"></span>
                              <span>{getSimilarityScore(faq.question, searchTerm)}% Match</span>
                            </span>
                          )}
                          <span className="text-slate-500 text-[10px] font-mono">
                            ID: {faq.id}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-100 font-sans leading-snug">
                          {faq.question}
                        </h3>
                      </div>
                      <span className="text-slate-500 text-xs shrink-0 self-center font-mono select-none">
                        {isExpanded ? "[ Hide ]" : "[ Read ]"}
                      </span>
                    </div>

                    {/* Expandable answer details panel */}
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-slate-950/40 bg-slate-900/50 mt-1 pt-4 text-xs space-y-4 text-slate-300 font-sans leading-relaxed">
                        
                        {editingFaqId === faq.id ? (
                          <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                            <h4 className="text-xs font-semibold text-sky-400 uppercase font-mono">Edit FAQ Metadata</h4>
                            
                            <div>
                              <label className="block text-[9px] uppercase font-mono text-slate-500 mb-1">Question</label>
                              <input 
                                type="text"
                                value={editQuestion}
                                onChange={(e) => setEditQuestion(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] uppercase font-mono text-slate-500 mb-1">Answer explanation</label>
                              <textarea 
                                value={editAnswer}
                                rows={4}
                                onChange={(e) => setEditAnswer(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-sans resize-none"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] uppercase font-mono text-slate-500 mb-1">Category</label>
                                <input 
                                  type="text"
                                  value={editCategory}
                                  onChange={(e) => setEditCategory(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] uppercase font-mono text-slate-500 mb-1">Tags (comma-separated)</label>
                                <input 
                                  type="text"
                                  value={editTags}
                                  onChange={(e) => setEditTags(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] uppercase font-mono text-slate-500 mb-1">Loom / YouTube Video URL</label>
                              <input 
                                type="text"
                                placeholder="https://www.loom.com/share/... or YouTube link"
                                value={editVideoUrl}
                                onChange={(e) => setEditVideoUrl(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                              />
                            </div>

                            <div className="flex justify-end space-x-2 pt-2">
                              <button
                                type="button"
                                onClick={() => setEditingFaqId(null)}
                                className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateFaq(faq.id)}
                                className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="bg-slate-950/20 p-4 rounded-xl border border-slate-800/30 whitespace-pre-wrap selection:bg-sky-500/20">
                              {faq.answer}
                            </p>

                            {/* Stream embedded Loom or YouTube helper videos directly inside the client sandbox */}
                            {faq.videoUrl && getEmbedUrl(faq.videoUrl) && (
                              <div className="mt-2.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-900 space-y-2">
                                <div className="flex items-center space-x-2 text-[10px] text-sky-400 font-mono">
                                  <Play className="w-3.5 h-3.5" />
                                  <span>Screen walkthrough attached below:</span>
                                </div>
                                <div className="rounded-xl overflow-hidden bg-black border border-slate-900 aspect-video relative">
                                  <iframe
                                    src={getEmbedUrl(faq.videoUrl)!}
                                    title="Walkthrough Walkthrough Video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    className="w-full h-full border-0 absolute inset-0"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Verification Indicators & Stale Knowledge alerts (Re-verification Nudge) */}
                            <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-900 space-y-2 text-[10px] font-mono">
                              <div className="flex flex-wrap items-center justify-between gap-2.5">
                                <div className="flex items-center space-x-1.5">
                                  <Award className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-slate-400">
                                    Status: <strong className="text-emerald-400 uppercase">{faq.verificationStatus || "verified"}</strong> 
                                  </span>
                                  <span className="text-slate-600">•</span>
                                  <span className="text-slate-400">
                                    Version <strong className="text-sky-300">v{faq.version || 1}</strong>
                                  </span>
                                </div>
                                
                                {faq.lastVerifiedAt && (
                                  <span className="text-slate-500 text-[9px]">
                                    Last certified: {new Date(faq.lastVerifiedAt).toLocaleString()} by {faq.lastVerifiedBy || "A Sage Admin"}
                                  </span>
                                )}
                              </div>

                              {/* Self-Evolving review nudge logic */}
                              {(() => {
                                const verifiedTime = new Date(faq.lastVerifiedAt || faq.createdAt).getTime();
                                const ageInDays = (new Date().getTime() - verifiedTime) / (1000 * 60 * 60 * 24);
                                const isStale = faq.verificationStatus === "needs_review" || ageInDays > 15;

                                if (isStale) {
                                  return (
                                    <div className="bg-amber-950/20 border border-amber-900/60 p-2.5 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                      <span className="text-amber-400 flex items-center space-x-1">
                                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Stale Info Alert: Last vetted {Math.max(1, Math.round(ageInDays))} days ago. Needs validation check.</span>
                                      </span>
                                      
                                      {(currentUser.role === "admin" || currentUser.role === "mentor") && (
                                        <button
                                          onClick={() => handleVerifyFaq(faq.id)}
                                          className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-white border border-amber-500/30 transition-all text-[9.5px]"
                                        >
                                          Stamp Vetted as Still Accurate
                                        </button>
                                      )}
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>

                            {/* Edit state access for Mentors & Admins */}
                            <div className="flex items-center space-x-2 pt-1 font-mono">
                              {(currentUser.role === "admin" || currentUser.role === "mentor") && (
                                <button
                                  onClick={() => {
                                    setEditingFaqId(faq.id);
                                    setEditQuestion(faq.question);
                                    setEditAnswer(faq.answer);
                                    setEditCategory(faq.category);
                                    setEditTags(faq.tags.join(", "));
                                    setEditVideoUrl(faq.videoUrl || "");
                                  }}
                                  className="px-2 py-1 rounded bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-350 hover:text-white flex items-center space-x-1 transition-all text-[9px]"
                                >
                                  <Edit2 className="w-3 h-3 text-sky-400" />
                                  <span>Edit Content</span>
                                </button>
                              )}

                              <button
                                onClick={() => setShowHistoryFaqId(showHistoryFaqId === faq.id ? null : faq.id)}
                                className={`px-2 py-1 rounded border flex items-center space-x-1 text-[9px] transition-all ${
                                  showHistoryFaqId === faq.id
                                    ? "bg-slate-800 border-slate-700 text-white"
                                    : "bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                                }`}
                              >
                                <History className="w-3 h-3 text-amber-400" />
                                <span>Version Audit Trail ({faq.editHistory?.length || 1})</span>
                              </button>
                            </div>

                            {/* Toggleable history listing */}
                            {showHistoryFaqId === faq.id && (
                              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 space-y-1.5 text-[9px] font-mono">
                                <h5 className="text-[10px] text-amber-400 uppercase font-bold tracking-wider mb-2">Knowledge Audit Trails & Versions</h5>
                                {faq.editHistory && faq.editHistory.length > 0 ? (
                                  faq.editHistory.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start border-l-2 border-slate-800 pl-2 py-0.5 ml-1">
                                      <div>
                                        <p className="text-slate-200 font-semibold mb-0.5">Version {item.version} Modification</p>
                                        <p className="text-slate-400 font-sans italic text-[9px]">"{item.changeSummary || 'No change description'}"</p>
                                      </div>
                                      <span className="text-slate-500 whitespace-nowrap text-right text-[8px]">
                                        {item.editedBy} • {new Date(item.editedAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex justify-between items-start border-l-2 border-emerald-800 pl-2 py-0.5 ml-1">
                                    <div>
                                      <p className="text-slate-300">v1 • INITIAL_COMMIT_CORPUS</p>
                                      <p className="text-slate-500 italic text-[8.5px] mt-0.5">"Initial verified Samagama documentation load."</p>
                                    </div>
                                    <span className="text-slate-550 text-[8px]">
                                      System • {new Date(faq.createdAt || "2026-05-23").toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {/* Extra metadata and Helpful checks */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[10px] font-mono text-slate-500 border-t border-slate-800/50">
                          
                          {/* Tags & Action Button */}
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1.5">
                              <Tag className="w-3.5 h-3.5 text-sky-400" />
                              {faq.tags.map(t => (
                                <span key={t} className="text-slate-400 hover:text-slate-300">
                                  #{t}
                                </span>
                              ))}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVoteAction(faq.id, true);
                                setProblemSolvedMap(prev => ({ ...prev, [faq.id]: true }));
                              }}
                              disabled={problemSolvedMap[faq.id] || voted}
                              className={`px-2 py-1 rounded border flex items-center space-x-1 px-2.5 py-1 text-[9px] font-mono transition-all ${
                                problemSolvedMap[faq.id]
                                  ? "bg-emerald-950/40 border-emerald-900 text-emerald-400 cursor-default"
                                  : "bg-slate-950 border-slate-850 text-slate-400 hover:text-white hover:bg-slate-900"
                              }`}
                            >
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>{problemSolvedMap[faq.id] ? "Marked as Solved!" : "This Solved My Problem"}</span>
                            </button>
                          </div>

                          <div className="flex items-center space-x-6">
                            
                            {/* Analytics metrics */}
                            <span className="flex items-center space-x-1">
                              <Eye className="w-3.5 h-3.5" />
                              <span>{faq.views + 1} Reads</span>
                            </span>

                            {/* Upvote & Downvote actions */}
                            <div className="flex items-center space-x-3 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVoteAction(faq.id, true);
                                }}
                                disabled={voted}
                                className={`flex items-center space-x-1 transition-colors ${
                                  voted ? "text-slate-600" : "text-slate-400 hover:text-emerald-400"
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>{faq.helpfulCount}</span>
                              </button>

                              <span className="text-slate-800">|</span>

                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVoteAction(faq.id, false);
                                }}
                                disabled={voted}
                                className={`flex items-center space-x-1 transition-colors ${
                                  voted ? "text-slate-600" : "text-slate-400 hover:text-rose-450"
                                }`}
                              >
                                <ThumbsDown className="w-3 h-3" />
                                <span>{faq.unhelpfulCount}</span>
                              </button>
                            </div>

                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Creator Modal (For Admins) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl p-6 relative overflow-hidden">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-2 font-sans flex items-center space-x-2">
              <Layers className="w-5 h-5 text-sky-400" />
              <span>Create Official FAQ Article</span>
            </h3>
            <p className="text-xs text-slate-500 mb-5">Draft authorized curriculum standards that immediately propagate inside search indices.</p>

            <form onSubmit={handleCreateFaq} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1.5">Question / Issue</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How does coursework verification affect Phase 2 qualifications?"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl text-xs px-3.5 py-2.5 focus:border-sky-500/50 focus:outline-none placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1.5">Verification Answer Details</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Insert verified explanation, linking to relevant Samagama articles or Vibe timelines..."
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl text-xs px-3.5 py-2.5 focus:border-sky-500/50 focus:outline-none placeholder-slate-600 resize-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1.5">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl text-xs px-3.5 py-2.5 focus:outline-none"
                  >
                    <option value="Rosetta Journal">Rosetta Journal</option>
                    <option value="ViBe Platform">ViBe Platform</option>
                    <option value="AI Chatbots">AI Chatbots</option>
                    <option value="Onboarding & Documents">Onboarding & Documents</option>
                    <option value="Team Formation">Team Formation</option>
                    <option value="Technical Stack">Technical Stack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1.5">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. SQLite, Windows, WSL"
                    value={newTagsString}
                    onChange={(e) => setNewTagsString(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl text-xs px-3.5 py-2.5 focus:border-sky-500/50 focus:outline-none placeholder-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1.5">Walkthrough Loom or YouTube Video URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://www.loom.com/share/xxxx or YouTube link"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl text-xs px-3.5 py-2.5 focus:border-sky-500/50 focus:outline-none placeholder-slate-600"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition-all duration-150 disabled:opacity-50"
                >
                  {createLoading ? "Creating..." : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
