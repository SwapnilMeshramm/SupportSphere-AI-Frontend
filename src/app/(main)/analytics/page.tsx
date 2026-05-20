"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  Smile, 
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  Mail,
  Globe,
  Zap
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import Link from "next/link";

export default function AnalyticsPage() {
  const user = useAuthStore((state) => state.user);
  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    if (user && user.role === "Customer") {
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
    }
  }, [user]);

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] px-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-950/30 rounded-2xl flex items-center justify-center mb-6 text-red-600 dark:text-red-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Access Restricted
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            The analytics dashboard is only accessible to Support Agents and Administrators. Please return to the tickets management page.
          </p>
          <Link href="/tickets">
            <Button className="w-full">Go to Tickets</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          System Analytics
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Real-time performance metrics, ticket volumes, and agent productivity.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Resolution Time</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-950 dark:text-white">1.8 hrs</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-2">
              <ArrowDownRight className="w-4 h-4" />
              <span>12.4% faster vs last week</span>
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">First Response Time</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-950 dark:text-white">9.4 min</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-2">
              <ArrowDownRight className="w-4 h-4" />
              <span>4.2% reduction in wait time</span>
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Resolution Rate</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-950 dark:text-white">96.8%</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4" />
              <span>+1.2% increase vs last month</span>
            </p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Customer Satisfaction</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg">
              <Smile className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-950 dark:text-white">4.85 / 5</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4" />
              <span>+0.05 vs historical average</span>
            </p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ticket Volume Chart Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Weekly Ticket Volume</h2>
              <p className="text-xs text-slate-500">Tickets created vs tickets resolved</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-primary rounded-full"></span>
                <span className="text-slate-600 dark:text-slate-400">Created</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                <span className="text-slate-600 dark:text-slate-400">Resolved</span>
              </div>
            </div>
          </div>

          {/* Custom Sleek CSS Bar Graph */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 border-b border-slate-100 dark:border-slate-700/60 pb-2">
            {[
              { day: "Mon", created: 65, resolved: 58 },
              { day: "Tue", created: 80, resolved: 72 },
              { day: "Wed", created: 95, resolved: 88 },
              { day: "Thu", created: 70, resolved: 78 },
              { day: "Fri", created: 85, resolved: 90 },
              { day: "Sat", created: 30, resolved: 25 },
              { day: "Sun", created: 25, resolved: 32 },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="flex items-end justify-center gap-1.5 w-full h-[85%]">
                  {/* Created Bar */}
                  <div 
                    className="w-4 bg-primary hover:bg-primary/95 rounded-t-sm transition-all duration-500 relative" 
                    style={{ height: `${bar.created}%` }}
                  >
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[10px] py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap shadow font-semibold">
                      {bar.created} Created
                    </span>
                  </div>
                  {/* Resolved Bar */}
                  <div 
                    className="w-4 bg-emerald-500 hover:bg-emerald-600 rounded-t-sm transition-all duration-500 relative" 
                    style={{ height: `${bar.resolved}%` }}
                  >
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[10px] py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap shadow font-semibold">
                      {bar.resolved} Resolved
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-medium">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Volume by Channel Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Volume by Channel</h2>
            <p className="text-xs text-slate-500">Origin of incoming support cases</p>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { label: "Email Support", count: 245, percent: 55, icon: <Mail className="w-4 h-4 text-blue-500" />, color: "bg-blue-500" },
              { label: "Web Portal", count: 120, percent: 27, icon: <Globe className="w-4 h-4 text-emerald-500" />, color: "bg-emerald-500" },
              { label: "Chat Widgets", count: 58, percent: 13, icon: <MessageSquare className="w-4 h-4 text-purple-500" />, color: "bg-purple-500" },
              { label: "API Integrations", count: 22, percent: 5, icon: <BarChart3 className="w-4 h-4 text-amber-500" />, color: "bg-amber-500" },
            ].map((channel, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                    {channel.icon}
                    <span>{channel.label}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {channel.count} <span className="font-semibold">({channel.percent}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${channel.color} rounded-full`} style={{ width: `${channel.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard Grid */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Agent Performance Leaderboard</h2>
              <p className="text-xs text-slate-500">Key metrics for support specialists active today</p>
            </div>
            <Button size="sm" variant="outline">View Detailed Log</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/60 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <th className="pb-3 pr-4">Agent Name</th>
                  <th className="pb-3 px-4">Tickets Solved</th>
                  <th className="pb-3 px-4">Avg First Response</th>
                  <th className="pb-3 px-4">Satisfaction Score</th>
                  <th className="pb-3 pl-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40 text-sm">
                {[
                  { name: "Sarah Connor", solved: 48, speed: "5.2m", score: "4.92 / 5", status: "Active" },
                  { name: "John Doe", solved: 36, speed: "8.4m", score: "4.85 / 5", status: "Active" },
                  { name: "Ellen Ripley", solved: 32, speed: "6.1m", score: "4.95 / 5", status: "Away" },
                  { name: "Marcus Wright", solved: 27, speed: "12.3m", score: "4.70 / 5", status: "Active" },
                  { name: "Peter Parker", solved: 15, speed: "15.0m", score: "4.55 / 5", status: "Offline" },
                ].map((agent, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 pr-4 font-semibold text-slate-900 dark:text-white">{agent.name}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">{agent.solved}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{agent.speed}</td>
                    <td className="py-3.5 px-4 font-medium text-emerald-600 dark:text-emerald-400">{agent.score}</td>
                    <td className="py-3.5 pl-4 text-right">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        agent.status === "Active" 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : agent.status === "Away"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                      }`}>
                        {agent.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
