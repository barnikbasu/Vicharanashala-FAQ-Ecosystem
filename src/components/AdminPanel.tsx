/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, AuditLog, SystemPromptConfig } from "../types";
import { 
  Users, 
  Terminal, 
  Settings, 
  Clock, 
  Check, 
  Sparkles,
  ShieldCheck,
  Award
} from "lucide-react";

interface AdminPanelProps {
  allUsers: User[];
  onRefreshUsers: () => void;
  currentUser: User;
}

export default function AdminPanel({ allUsers, onRefreshUsers, currentUser }: AdminPanelProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pConfig, setPConfig] = useState<SystemPromptConfig | null>(null);

  // Calibration Form States
  const [sysInstructions, setSysInstructions] = useState("");
  const [temp, setTemp] = useState(0.2);
  const [modelName, setModelName] = useState("gemini-3.5-flash");
  
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchData = async () => {
    try {
      // 1. Audit logs
      const rLogs = await fetch("/api/audit-logs");
      const jLogs = await rLogs.json();
      if (jLogs.success) setLogs(jLogs.logs);

      // 2. Prompt systems
      const rPrompt = await fetch("/api/prompt-config");
      const jPrompt = await rPrompt.json();
      if (jPrompt.success) {
        setPConfig(jPrompt.config);
        setSysInstructions(jPrompt.config.systemInstruction);
        setTemp(jPrompt.config.temperature);
        setModelName(jPrompt.config.model);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdatePrompts = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/prompt-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: sysInstructions,
          temperature: temp,
          model: modelName,
          manager: `${currentUser.name} (Admin)`
        })
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        fetchData();
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in text-slate-100">
      
      {/* Header element */}
      <div>
        <h2 className="text-2xl font-bold font-sans text-white">System Administration Dashboard</h2>
        <p className="text-xs text-slate-400 mt-1">Calibrate neural instruction models, audit events logs, and allocate badges.</p>
      </div>

      {/* Split pane for Settings Form & Log stream */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Setting Forms Pane (Col-span 3) */}
        <div className="lg:col-span-3 space-y-6">
          
          <form onSubmit={handleUpdatePrompts} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Settings className="w-5 h-5 text-sky-400 animate-spin-slow" />
              <h3 className="text-sm font-bold text-white font-sans">Yaksha Prompt & AI System Calibration</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1.5">System Instructions Blueprint</label>
                <textarea
                  rows={8}
                  required
                  value={sysInstructions}
                  onChange={(e) => setSysInstructions(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 focus:border-sky-500/50 focus:outline-none placeholder-slate-600 resize-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1.5">Model Identifier</label>
                  <select
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-slate-150 rounded-xl text-xs px-3.5 py-2.5 outline-none focus:border-sky-500/50"
                  >
                    <option value="gemini-3.5-flash">gemini-3.5-flash (Standard recommended)</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro (High fidelity context)</option>
                    <option value="gemini-2.0-flash-exp">gemini-2.0-flash (Experimental low-latency)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1.5">Temperature: {temp}</label>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={temp}
                    onChange={(e) => setTemp(parseFloat(e.target.value))}
                    className="w-full mt-3 accent-sky-400 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-slate-550 mt-1">
                    <span>Deterministic (0.0)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-850">
              <button
                type="submit"
                disabled={saveLoading}
                className="flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition-all duration-150 disabled:opacity-45"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Calibrations Saved!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{saveLoading ? "Saving..." : "Deploy Calibrations"}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Users List administration panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Users className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white font-sans">Ecosystem Users</h3>
            </div>

            <div className="space-y-3.5">
              {allUsers.map(user => (
                <div key={user.id} className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={user.avatar} className="w-8 h-8 rounded-full border border-slate-750" alt="" />
                    <div>
                      <span className="block text-xs font-bold text-slate-200">
                        {user.name} ({user.email})
                      </span>
                      <span className="block text-[10px] text-slate-500 font-mono capitalize">
                        {user.role} View • {user.department}
                      </span>
                    </div>
                  </div>

                  {user.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {user.badges.map(badge => (
                        <span key={badge} className="bg-indigo-950 border border-indigo-900/30 text-indigo-455 text-[9px] px-2 py-0.5 rounded flex items-center space-x-1">
                          <Award className="w-2.5 h-2.5" />
                          <span>{badge}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Audit Logs Stream (Col-span 2) */}
        <div className="lg:col-span-2 h-full">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-full flex flex-col space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white font-sans">Ecosystem Audit Trail</h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[80vh] scrollbar-thin text-left">
              {logs.length === 0 ? (
                <div className="text-center p-10 text-xs text-slate-500 font-sans">No audit actions logged in this workspace block.</div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="bg-slate-950/60 border border-slate-850/80 p-3 rounded-lg space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-550 border-b border-slate-850/40 pb-1">
                      <span className="text-emerald-450 uppercase">{log.action}</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-350 leading-relaxed font-sans">
                      {log.details}
                    </div>

                    <div className="text-[9px] font-mono text-slate-500 text-right">
                      Logged by: {log.user}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
