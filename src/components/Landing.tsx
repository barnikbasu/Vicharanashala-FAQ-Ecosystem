/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Sparkles, 
  HelpCircle, 
  Send, 
  ArrowRight, 
  BookOpen, 
  Terminal, 
  Award,
  ChevronRight,
  ShieldCheck,
  MessagesSquare
} from "lucide-react";

interface LandingProps {
  onNavigate: (tab: string) => void;
  onSearchQuery?: (text: string) => void;
  totalFAQsCount: number;
  totalUnresolvedCount: number;
}

export default function Landing({ onNavigate, onSearchQuery, totalFAQsCount, totalUnresolvedCount }: LandingProps) {
  const [askInput, setAskInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    difficulty: string;
    suggestedTags: string[];
    rewrittenTitle: string;
    aiSummary: string;
    duplicateCandidates: string[];
  } | null>(null);

  const handleQuickAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askInput.trim()) return;
    setLoading(true);
    setAnalysisResult(null);

    try {
      const res = await fetch("/api/ai/analyze-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: askInput })
      });
      const data = await res.json();
      if (data.success) {
        setAnalysisResult(data);
      }
    } catch (err) {
      console.error("Failed to fetch rapid analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-16 animate-fade-in">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800/80 px-8 py-14 text-center shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-10 bottom-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800/80 text-xs text-sky-400 font-mono mb-6">
          <Sparkles className="w-4 h-4 animate-spin text-sky-400" />
          <span>Vibe-Coded AI Institutional Intelligence</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
          Smarter Support for{" "}
          <span className="bg-gradient-to-r from-sky-400 via-indigo-200 to-white bg-clip-text text-transparent">
            Vicharanashala Interns
          </span>
        </h1>

        <p className="mt-4 text-slate-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
          Reduce repetitive mentor questions, access Visakha-MCP technical schemas, update your Rosetta journal, and resolve production bugs collaboratively.
        </p>

        {/* Ask Before Asking AI Search Core */}
        <div className="mt-10 max-w-2xl mx-auto">
          <form onSubmit={handleQuickAsk} className="relative flex items-center p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-sky-500/50 shadow-lg">
            <HelpCircle className="w-5 h-5 text-slate-500 ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Ask anything (e.g. 'How do I mount Docker SQLite paths in Visakha-MCP?')..."
              value={askInput}
              onChange={(e) => setAskInput(e.target.value)}
              className="w-full bg-transparent border-0 text-slate-100 text-sm focus:outline-none px-3 py-2 placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="shrink-0 flex items-center space-x-1 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Analyze</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Prompt / Analysis results view */}
          {analysisResult && (
            <div className="mt-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-4 shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-mono tracking-wider uppercase text-sky-400">
                    Smart AI Pre-Screening Analysis
                  </h3>
                  <p className="text-sm font-semibold text-slate-200 mt-1">
                    "{analysisResult.rewrittenTitle}"
                  </p>
                </div>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                  analysisResult.difficulty === "easy" 
                    ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/30" 
                    : analysisResult.difficulty === "medium"
                    ? "bg-amber-950/40 text-amber-400 border-amber-800/30"
                    : "bg-rose-950/40 text-rose-400 border-rose-800/30"
                }`}>
                  Estimated: {analysisResult.difficulty}
                </span>
              </div>

              <div className="text-xs text-slate-400 font-sans italic">
                {analysisResult.aiSummary}
              </div>

              {analysisResult.suggestedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {analysisResult.suggestedTags.map(tag => (
                    <span key={tag} className="bg-slate-800 border border-slate-700/60 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Semantic duplicate checker */}
              {analysisResult.duplicateCandidates.length > 0 ? (
                <div className="border-t border-slate-800/80 pt-3 mt-3">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                    Highly Matching System Articles Detected (Preventing Duplication):
                  </div>
                  <div className="space-y-1">
                    {analysisResult.duplicateCandidates.map((cand, idx) => (
                      <div key={idx} className="flex items-center text-xs text-slate-300">
                        <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
                        <span className="truncate">{cand}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-3 mt-3">
                    <button
                      onClick={() => onNavigate("faq")}
                      className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 rounded-lg text-xs font-semibold tracking-wide transition-colors"
                    >
                      Browse Existing FAQs
                    </button>
                    <button
                      onClick={() => {
                        // Navigate to query forum with fields filled
                        onNavigate(`query-new-${encodeURIComponent(askInput)}`);
                      }}
                      className="px-3 py-1.5 bg-sky-650/40 hover:bg-sky-600/60 border border-sky-500/30 text-sky-300 rounded-lg text-xs font-semibold tracking-wide transition-colors"
                    >
                      Submit Anyway as New Query
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-slate-800/80 pt-3 mt-3 flex justify-between items-center bg-slate-950/40 p-3 rounded-lg border">
                  <span className="text-xs text-slate-400">
                    No matching duplicates found. Ready to raise in the community forum!
                  </span>
                  <button
                    onClick={() => onNavigate(`query-new-${encodeURIComponent(askInput)}`)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <span>Raise Query</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Program Statistics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 px-6 py-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-3xl font-extrabold text-white block">{totalFAQsCount}</span>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">Verified FAQ Articles</span>
          </div>
          <div className="h-10 w-10 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-400">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-6 py-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-3xl font-extrabold text-amber-400 block">{totalUnresolvedCount}</span>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">Unresolved Queries</span>
          </div>
          <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
            <Terminal className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-6 py-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-3xl font-extrabold text-indigo-400 block">34 ms</span>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">Yaksha Mini Latency</span>
          </div>
          <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
            <MessagesSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Structured Guidelines and Map Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Onboarding block */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center space-x-2.5 mb-5">
            <Award className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Vicharanashala Passing Journey</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 border border-indigo-800 border-dashed">1</span>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Continuous Coursework (Phase 1)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Log into ViBe LMS using your registered email and finish coursework lectures. Sync your realizations in the forum daily.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 border border-indigo-800 border-dashed">2</span>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Honorable Rosetta Diaries</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Reflect on daily systems struggles, Docker files, and model prompt setups. Submit weekly logs for formal review.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 border border-indigo-800 border-dashed">3</span>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Community & Forum Help</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Contribute answers to pending unresolved queries inside the dashboard to climb the leaderboard and secure the Sage Mentor endorsement.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Help Links */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg font-bold text-white">Advanced Knowledge Actions</h2>
            </div>
            <p className="text-xs text-slate-450 leading-relaxed max-w-sm mb-6">
              Use Yaksha context awareness with model groundings, or view real-time program heatmaps to locate active help windows.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => onNavigate("faq")}
              className="p-3 text-left bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 hover:bg-slate-900/60 transition-all cursor-pointer group"
            >
              <div className="text-[10px] text-slate-500 font-mono">01 / FAQ INDEX</div>
              <div className="text-xs font-bold text-slate-300 mt-1 flex items-center justify-between group-hover:text-white">
                <span>Browse FAQ</span>
                <ChevronRight className="w-4 h-4 text-sky-400" />
              </div>
            </button>

            <button 
              onClick={() => onNavigate("yaksha")}
              className="p-3 text-left bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 hover:bg-slate-900/60 transition-all cursor-pointer group"
            >
              <div className="text-[10px] text-slate-500 font-mono">02 / INTERN AI</div>
              <div className="text-xs font-bold text-slate-300 mt-1 flex items-center justify-between group-hover:text-white">
                <span>Chat Yaksha</span>
                <ChevronRight className="w-4 h-4 text-indigo-400" />
              </div>
            </button>

            <button 
              onClick={() => onNavigate("query")}
              className="p-3 text-left bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 hover:bg-slate-900/60 transition-all cursor-pointer group"
            >
              <div className="text-[10px] text-slate-500 font-mono">03 / FORUM DISCUSS</div>
              <div className="text-xs font-bold text-slate-300 mt-1 flex items-center justify-between group-hover:text-white">
                <span>View Queries</span>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </div>
            </button>

            <button 
              onClick={() => onNavigate("dashboard")}
              className="p-3 text-left bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 hover:bg-slate-900/60 transition-all cursor-pointer group"
            >
              <div className="text-[10px] text-slate-500 font-mono">04 / PROGRAM STATS</div>
              <div className="text-xs font-bold text-slate-300 mt-1 flex items-center justify-between group-hover:text-white">
                <span>Control Board</span>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </div>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
