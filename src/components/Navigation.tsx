/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Notification } from "../types";
import { 
  Compass, 
  HelpCircle, 
  MessageSquareCode, 
  LayoutDashboard, 
  ShieldCheck, 
  Bell, 
  Layers, 
  Tv, 
  Sparkles,
  ArrowRightLeft
} from "lucide-react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  allUsers: User[];
  onUserSwitch: (userId: string) => void;
  notifications: Notification[];
  onNotificationRead: (id: string) => void;
}

export default function Navigation({
  activeTab,
  setActiveTab,
  currentUser,
  allUsers,
  onUserSwitch,
  notifications,
  onNotificationRead
}: NavigationProps) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);

  const navItems = [
    { id: "landing", label: "Home", icon: Compass, roles: ["intern", "mentor", "admin"] },
    { id: "faq", label: "FAQ Explorer", icon: HelpCircle, roles: ["intern", "mentor", "admin"] },
    { id: "query", label: "Query Forum", icon: Layers, roles: ["intern", "mentor", "admin"] },
    { id: "yaksha", label: "Yaksha Chat", icon: MessageSquareCode, roles: ["intern", "mentor", "admin"] },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["intern", "mentor", "admin"] },
    { id: "admin", label: "Admin Panel", icon: ShieldCheck, roles: ["admin"] }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-slate-100 px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("landing")}>
          <div className="relative bg-gradient-to-tr from-sky-500 to-indigo-600 p-2 rounded-xl text-white shadow-lg">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="font-sans font-bold text-lg tracking-tight bg-gradient-to-r from-sky-400 via-indigo-200 to-white bg-clip-text text-transparent">
              VICHARANASHALA
            </span>
            <span className="block text-[10px] text-slate-400 font-mono tracking-widest uppercase">
              faq knowledge system
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="hidden md:flex space-x-1">
          {navItems.map(item => {
            if (!item.roles.includes(currentUser.role)) return null;
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === "query" && activeTab.startsWith("query-"));
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-slate-800 text-sky-400 shadow-inner font-medium"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls & Profile details */}
        <div className="flex items-center space-x-4">
          
          {/* Points display with SP gamification */}
          <div className="hidden lg:flex items-center px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
            <div className="flex items-center space-x-1.5 hover:text-emerald-400 cursor-help" title="Spurthi (SP) - Active Engineering Contributions & Code Reviews">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400">SP:</span>
              <span className="text-emerald-400 font-bold">{currentUser.spurthiPoints || 0}</span>
            </div>
          </div>

          {/* Quick Role Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowNotifMenu(false);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700/80 transition-all font-mono"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400" />
              <span className="capitalize">{currentUser.role} View</span>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-950 border border-slate-800 shadow-xl py-2 z-50">
                <div className="px-3 py-1.5 border-b border-slate-800/80 text-slate-400 text-[10px] font-mono tracking-wider uppercase">
                  simulate platform roles
                </div>
                {allUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onUserSwitch(u.id);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-900 transition-colors ${
                      currentUser.id === u.id ? "bg-slate-900 text-sky-400 font-semibold" : "text-slate-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <img src={u.avatar} alt="" className="w-6 h-6 rounded-full border border-slate-700" />
                      <div>
                        <div className="font-medium text-slate-200">{u.name}</div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase">{u.role}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowRoleMenu(false);
              }}
              className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-sans font-bold flex items-center justify-center text-white scale-90">
                  {unreadNotifications.length}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-950 border border-slate-800 shadow-xl py-2 z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b border-slate-800/80 flex justify-between items-center text-slate-300">
                  <span className="text-xs font-semibold tracking-wide">Notifications</span>
                  {unreadNotifications.length > 0 && (
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-sky-400 font-mono">
                      {unreadNotifications.length} Unread
                    </span>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs font-sans">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        onNotificationRead(notif.id);
                        if (notif.linkUrl) {
                          setActiveTab(notif.linkUrl.startsWith("/query/") ? `query-thread-${notif.linkUrl.substring(7)}` : "dashboard");
                        }
                        setShowNotifMenu(false);
                      }}
                      className={`px-4 py-3 border-b border-slate-900 cursor-pointer flex items-start space-x-3 transition-colors hover:bg-slate-900 ${
                        !notif.read ? "bg-slate-800/25" : ""
                      }`}
                    >
                      <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 opacity-80" />
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-slate-200">{notif.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-sans leading-relaxed">{notif.content}</div>
                        <span className="block text-[9px] text-slate-500 font-mono mt-1">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* User badge avatar */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-8 h-8 rounded-full border-2 border-sky-400/80 shadow"
            />
            <div className="hidden lg:block text-left text-xs">
              <span className="block text-slate-200 font-semibold leading-none">{currentUser.name}</span>
              <span className="text-[10px] text-slate-500 font-mono leading-none capitalize">{currentUser.role}</span>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}
