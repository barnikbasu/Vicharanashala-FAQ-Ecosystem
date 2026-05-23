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
  Layers
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

  // Creator Modal State (For Admins)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newCategory, setNewCategory] = useState("Rosetta Journal");
  const [newTagsString, setNewTagsString] = useState("");
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
          tags: parsedTags
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewQuestion("");
        setNewAnswer("");
        setNewTagsString("");
        setShowCreateModal(false);
        onRefreshFaqs();
      }
    } catch (err) {
      console.error("Failed to construct dynamic FAQ", err);
    } finally {
      setCreateLoading(false);
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
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono tracking-wider bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase leading-none">
                            {faq.category}
                          </span>
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
                        <p className="bg-slate-950/20 p-4 rounded-xl border border-slate-800/30 whitespace-pre-wrap selection:bg-sky-500/20">
                          {faq.answer}
                        </p>

                        {/* Extra metadata and Helpful checks */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[10px] font-mono text-slate-500 border-t border-slate-800/50">
                          
                          {/* Tags */}
                          <div className="flex items-center space-x-1.5">
                            <Tag className="w-3.5 h-3.5 text-sky-400" />
                            {faq.tags.map(t => (
                              <span key={t} className="text-slate-400 hover:text-slate-300">
                                #{t}
                              </span>
                            ))}
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
