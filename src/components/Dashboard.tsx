/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AnalyticsSummary } from "../types";
import { 
  Users, 
  BarChart2, 
  TrendingUp, 
  Award, 
  Target, 
  Grid, 
  Heart, 
  UserCheck, 
  Layers
} from "lucide-react";

const DEFAULT_ANALYTICS: AnalyticsSummary = {
  totalQueries: 12,
  resolvedQueries: 9,
  unresolvedQueries: 3,
  totalFAQs: 18,
  averageResolutionTimeHours: 14.5,
  tagCloud: [
    { text: "mongodb", value: 5 },
    { text: "react", value: 3 },
    { text: "node", value: 4 },
    { text: "express", value: 2 },
    { text: "mongoose", value: 3 }
  ],
  heatmap: [
    { day: "Monday", hours: Array.from({ length: 12 }, (_, i) => ({ hour: i * 2, count: 2 })) },
    { day: "Tuesday", hours: Array.from({ length: 12 }, (_, i) => ({ hour: i * 2, count: 1 })) },
    { day: "Wednesday", hours: Array.from({ length: 12 }, (_, i) => ({ hour: i * 2, count: 3 })) },
    { day: "Thursday", hours: Array.from({ length: 12 }, (_, i) => ({ hour: i * 2, count: 2 })) },
    { day: "Friday", hours: Array.from({ length: 12 }, (_, i) => ({ hour: i * 2, count: 4 })) },
    { day: "Saturday", hours: Array.from({ length: 12 }, (_, i) => ({ hour: i * 2, count: 0 })) },
    { day: "Sunday", hours: Array.from({ length: 12 }, (_, i) => ({ hour: i * 2, count: 1 })) }
  ],
  leaderboard: [
    {
      user: {
        id: "user-3",
        name: "Vinayak Sen",
        email: "vinayak.sen@example.com",
        role: "mentor",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        badges: ["Sage Mentor", "System Architect"],
        points: 2500,
        spurthiPoints: 1550,
        department: "Vicharanashala Core Team",
        joinedAt: "2024-01-15T00:00:00Z"
      },
      count: 14
    }
  ],
  tokenUsageCount: 425600,
  serverCpuPercent: 12.4,
  serverMemoryMb: 114.8
};

export default function Dashboard() {
  const [data, setData] = useState<AnalyticsSummary>(DEFAULT_ANALYTICS);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      const json = await res.json();
      if (json.success) {
        setData(json.analytics);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Find maximum value for helper graphs
  const maxTagCount = Math.max(...data.tagCloud.map(t => t.value), 1);

  return (
    <div className="space-y-8 pb-16 animate-fade-in text-slate-100">
      
      {/* Overview header */}
      <div>
        <h2 className="text-2xl font-bold font-sans text-white">Program Analytics & Leaderboards</h2>
        <p className="text-xs text-slate-400 mt-1">Review resolution rates, community contributions, and platform engagement statistics.</p>
      </div>

      {/* Numerical Stats section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-mono uppercase tracking-widest">Resolution Rate</span>
            <Target className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-sans text-white">
            {((data.resolvedQueries / Math.max(data.totalQueries, 1)) * 100).toFixed(0)}%
          </div>
          <span className="block text-[10px] text-emerald-400 font-mono">
            {data.resolvedQueries} out of {data.totalQueries} resolved with mentors
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-mono uppercase tracking-widest">Average Help time</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-sans text-white">
            {data.averageResolutionTimeHours} Hrs
          </div>
          <span className="block text-[10px] text-indigo-300 font-mono">
            Time between raising & verified answers
          </span>
        </div>

        {/* AI & SERVER INFRASTRUCTURE UTILIZATION */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-mono uppercase tracking-widest">AI Token Usage</span>
            <TrendingUp className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold font-sans text-white">
            {data.tokenUsageCount ? (data.tokenUsageCount / 1000).toFixed(1) + "k" : "425.6k"}
          </div>
          <span className="block text-[10px] text-orange-300 font-mono">
             Cumulative LLM context items tokens
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-mono uppercase tracking-widest">Server Allocation</span>
            <BarChart2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-sans text-white flex items-baseline space-x-1">
            <span>{data.serverCpuPercent || "12.4"}%</span>
            <span className="text-xs text-slate-500 font-normal">CPU</span>
            <span className="text-slate-400 text-sm font-light ml-2">/ {data.serverMemoryMb || "114"}M RAM</span>
          </div>
          <span className="block text-[10px] text-slate-550 font-mono">
            Dynamic Node runtime sandbox telemetry
          </span>
        </div>
      </div>

      {/* Grid containing Leaderboards and Key Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Leaderboard Table widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold font-sans text-white">Community Leaderboard</h3>
          </div>
          
          <div className="space-y-3">
            {data.leaderboard.map((member, index) => (
              <div 
                key={member.user.id}
                className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono font-extrabold text-slate-550 w-6">
                    #{index + 1}
                  </span>
                  <img src={member.user.avatar} className="w-8 h-8 rounded-full border border-slate-750 shrink-0" alt="" />
                  <div>
                    <span className="block text-xs font-bold text-slate-200">{member.user.name}</span>
                    <span className="block text-[9px] font-mono text-slate-500 capitalize">{member.user.role} • {member.user.department}</span>
                  </div>
                </div>

                 <div className="text-right">
                  <span className="block text-xs font-mono font-bold text-sky-400">
                    {member.user.points} PTS
                  </span>
                  <div className="flex items-center space-x-1.5 text-[9px] font-mono justify-end mt-0.5">
                    <span className="text-emerald-400 font-bold" title="Spurthi (SP) active contribution points">SP: {member.user.spurthiPoints || 0}</span>
                  </div>
                  <span className="block text-[8px] text-slate-500 font-mono mt-0.5">
                    {member.count} verified answers
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Tag frequencies and heatmaps */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          
          {/* Key Tag Frequencies */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-sky-400" />
              <h3 className="text-base font-bold font-sans text-white">Trending Technical Topics</h3>
            </div>

            <div className="space-y-2.5">
              {data.tagCloud.map(tag => {
                const percent = (tag.value / maxTagCount) * 100;
                return (
                  <div key={tag.text} className="text-xs space-y-1">
                    <div className="flex justify-between items-center text-[11px] font-mono">
                      <span className="text-slate-300">#{tag.text}</span>
                      <span className="text-slate-550">{tag.value} Questions</span>
                    </div>
                    {/* Visual Bar progress indicator */}
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${percent}%` }}
                        className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center space-x-3">
            <UserCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-[11px] text-slate-400">
              <span className="font-bold text-slate-200 block">Mentor Quality Endorsements</span>
              Passing Phase 1 triggers an automatic review of the active leaderboard positions. Secure top positions to demonstrate high code-leadership values.
            </div>
          </div>

        </div>

      </div>

      {/* Weekly support activity heatmap simulation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Grid className="w-5 h-5 text-amber-500 animate-pulse" />
            <h3 className="text-base font-bold font-sans text-white">Weekly Query Ticket Frequencies</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">PEAK ACTIVITY DENSITY WINDOWS</span>
        </div>

        <div className="space-y-1.5 overflow-x-auto pb-2 select-none">
          {data.heatmap.map((dayData) => (
            <div key={dayData.day} className="flex items-center space-x-2 shrink-0">
              <span className="text-[10px] font-mono text-slate-400 w-20 shrink-0 text-left">
                {dayData.day}
              </span>

              <div className="flex space-x-1.5 flex-1">
                {dayData.hours.map((hr, idx) => {
                  let colorClass = "bg-slate-950";
                  if (hr.count > 0 && hr.count <= 2) colorClass = "bg-indigo-950 border border-indigo-800/40 text-slate-400";
                  if (hr.count > 2 && hr.count <= 5) colorClass = "bg-indigo-900 border border-indigo-700/60 text-slate-200";
                  if (hr.count > 5) colorClass = "bg-indigo-600 border border-indigo-500 shadow-md text-white shadow-indigo-950/20";
                  return (
                    <div 
                      key={idx}
                      className={`h-7 w-7 rounded-md font-mono text-[9px] flex items-center justify-center cursor-help transition-all ${colorClass}`}
                      title={`${dayData.day} Hour ${hr.hour} - Count: ${hr.count}`}
                    >
                      {hr.count}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
