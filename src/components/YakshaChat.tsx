/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { ChatMessage, User } from "../types";
import { 
  Sparkles, 
  Send, 
  Cpu, 
  ShieldAlert, 
  HelpCircle, 
  FileText, 
  CornerDownRight, 
  BookOpen, 
  RefreshCw,
  Gauge
} from "lucide-react";

interface YakshaChatProps {
  currentUser: User;
  onNavigate: (tab: string) => void;
}

export default function YakshaChat({ currentUser, onNavigate }: YakshaChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "model",
      text: "Greetings intern! I am Yaksha, the Vicharanashala Institutional Intelligence Bot.\n\nI am connected to the `visakha-mcp` code guidelines, Rosetta logging standards, and ViBe LMS course structure.\n\nAsk me about setup problems, evaluation guidelines, or program policies. Select **Yaksha Mini** on the right side if you require high-speed SQLite lookup actions.",
      createdAt: new Date().toISOString()
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isMini, setIsMini] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: userInput,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setUserInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          isMini
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, {
          id: `ai-${Date.now()}`,
          sender: "model",
          text: data.text,
          createdAt: new Date().toISOString(),
          citations: data.citations || [],
          confidence: data.confidence || 0.85
        }]);
      } else {
        throw new Error(data.message || "Unknown retrieval error");
      }
    } catch (err: any) {
      console.error("Yaksha processing failures: ", err);
      setMessages(prev => [...prev, {
        id: `ai-err-${Date.now()}`,
        sender: "model",
        text: `Error contacting neural layer: ${err.message}. Please verify the server container has configured a valid GEMINI_API_KEY.`,
        createdAt: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChatHistory = () => {
    setMessages([
      {
        id: "welcome",
        sender: "model",
        text: "System context cache cleared. Yaksha online.",
        createdAt: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-16 h-[72vh] animate-fade-in text-slate-100">
      
      {/* Dynamic Conversational Pane */}
      <div className="lg:col-span-3 flex flex-col h-full bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Chat Control header */}
        <div className="p-4 bg-slate-900 border-b border-slate-850 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`p-1.5 rounded-lg text-white ${
              isMini ? "bg-amber-600 shadow shadow-amber-950/45" : "bg-sky-600 shadow shadow-sky-950/45"
            }`}>
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-100">
                {isMini ? "Yaksha Mini Agent" : "Yaksha Core RAG System"}
              </span>
              <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                {isMini ? "Quantized Fast-Path SQLite Engine" : "Full Gemini LLM Grounded Intelligence"}
              </span>
            </div>
          </div>

          <button 
            onClick={clearChatHistory}
            className="flex items-center space-x-1 px-2.5 py-1 text-[10px] font-mono text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all border border-slate-800"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Cache</span>
          </button>
        </div>

        {/* Chat log displays */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
          {messages.map((m, idx) => {
            const isUser = m.sender === "user";
            return (
              <div key={m.id || idx} className={`flex max-w-[85%] ${isUser ? "ml-auto" : "mr-auto"} flex-col space-y-1.5`}>
                <div className={`px-4 py-3 text-xs leading-relaxed rounded-2xl font-sans text-left whitespace-pre-wrap ${
                  isUser 
                    ? "bg-sky-600/90 text-white rounded-br-none" 
                    : "bg-slate-900 border border-slate-850 text-slate-300 rounded-bl-none"
                }`}>
                  {m.text}
                </div>

                {/* Citations & Evidence RAG blocks (If available - AI Responses only) */}
                {!isUser && m.citations && m.citations.length > 0 && (
                  <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-900 text-[10px] space-y-1.5 animate-fade-in">
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-550 uppercase tracking-wider">
                      <span className="flex items-center space-x-1">
                        <FileText className="w-3 h-3 text-sky-400" />
                        <span>Sources Cited ({m.citations.length})</span>
                      </span>

                      {m.confidence && (
                        <span className={`border px-1 rounded uppercase tracking-widest ${
                          m.confidence > 0.8 
                            ? "border-emerald-950 text-emerald-450 bg-emerald-950/10" 
                            : "border-amber-950 text-amber-450 bg-amber-950/10"
                        }`}>
                          Score: {(m.confidence * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 pl-1">
                      {m.citations.map((cite, i) => (
                        <div key={i} className="flex items-center text-[10px] text-slate-450 font-sans">
                          <CornerDownRight className="w-3 h-3 text-indigo-400 shrink-0 mr-1.5" />
                          <span className="truncate">{cite}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct escalation action if AI answer isn't sufficient/complete */}
                {!isUser && m.id !== "welcome" && (
                  <div className="flex items-center justify-start pl-2">
                    <button
                      type="button"
                      onClick={() => {
                        // Locate preceding customer message for best contextual title seeding
                        const precedingMsgObj = messages[idx - 1];
                        const preseededTitle = precedingMsgObj && precedingMsgObj.sender === "user" 
                          ? precedingMsgObj.text 
                          : "Query regarding Vicharanashala operations";
                        onNavigate(`query-new-${encodeURIComponent(preseededTitle)}`);
                      }}
                      className="text-[10px] font-mono text-rose-450 hover:text-rose-350 flex items-center space-x-1 hover:underline px-2.5 py-0.5 rounded-lg bg-rose-950/20 border border-rose-900/40 transition-colors mt-0.5"
                      title="Promote this technical query into a community ticket for physical mentor verification."
                    >
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-400 animate-pulse" />
                      <span>Unhelpful AI answer? Escalate as Query Ticket</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Loader indicators */}
          {loading && (
            <div className="flex mr-auto flex-col space-y-1 max-w-[80%] animate-pulse">
              <div className="px-4 py-3 bg-slate-900 rounded-2xl rounded-bl-none text-xs text-slate-400 font-sans flex items-center space-x-2">
                <Gauge className="w-3.5 h-3.5 animate-spin text-sky-400" />
                <span className="font-mono text-[10px]">Retrieving relevant documents and crafting context...</span>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSendMessage} className="p-3.5 bg-slate-900 border-t border-slate-850 flex items-center gap-3">
          <input
            type="text"
            placeholder={isMini ? "Direct pipeline SQLite lookup trigger..." : "Ask Yaksha a program policy or technical guidelines query..."}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500/50 rounded-xl text-slate-100 text-xs px-4 py-3 placeholder-slate-650 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!userInput.trim() || loading}
            className="p-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Model Selection and Guidance sidebar */}
      <div className="space-y-4 lg:col-span-1 h-full flex flex-col justify-between">
        
        {/* Toggle widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
            Model Configuration
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setIsMini(false)}
              className={`w-full text-left p-3 rounded-xl border flex flex-col gap-0.5 transition-all cursor-pointer ${
                !isMini
                  ? "bg-slate-950 border-sky-500/40 text-white"
                  : "bg-transparent border-slate-800 hover:border-slate-700 text-slate-400"
              }`}
            >
              <div className="flex items-center space-x-1.5 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Yaksha Core RAG</span>
              </div>
              <span className="text-[10px] text-slate-500">
                Contextual reasoning using verified knowledge datasets and full LLMs. Highly accurate.
              </span>
            </button>

            <button
              onClick={() => setIsMini(true)}
              className={`w-full text-left p-3 rounded-xl border flex flex-col gap-0.5 transition-all cursor-pointer ${
                isMini
                  ? "bg-slate-950 border-amber-500/40 text-white"
                  : "bg-transparent border-slate-800 hover:border-slate-700 text-slate-400"
              }`}
            >
              <div className="flex items-center space-x-1.5 text-xs font-bold">
                <Gauge className="w-3.5 h-3.5 text-amber-500" />
                <span>Yaksha Mini</span>
              </div>
              <span className="text-[10px] text-slate-500">
                Direct mapping via lightweight query models. Instant operational solutions with sub-40ms latency.
              </span>
            </button>
          </div>
        </div>

        {/* AI Trust guidelines */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5">
          <div className="flex items-center space-x-2 text-indigo-400">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-bold">RAG Pipeline Rules</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal font-sans">
            Yaksha utilizes token similarity embeddings to lookup context inside the database. It synthesizes Markdown answers complete with bibliography and accuracy indices.
          </p>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start space-x-2.5 text-[10px]">
            <ShieldAlert className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <span className="text-slate-450 leading-relaxed font-sans">
              Hallucinations are actively minimized by confining response context strictly to identified manuals.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
