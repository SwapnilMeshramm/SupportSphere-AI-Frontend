"use client";

import React, { useEffect, useState } from "react";
import {
  Ticket,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Zap,
  Activity,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card";
import {
  Badge,
  getStatusBadgeVariant,
  getPriorityBadgeVariant,
} from "../../../components/ui/Badge";
import { CardSkeleton } from "../../../components/ui/Loader";
import { cn } from "../../../components/ui/Button";
import { timeAgo } from "../../../utils/formatDate";
import { getDashboardStats, getTickets } from "../../../services/ticketService";
import { DashboardStats } from "../../../services/ticketService";
import { Ticket as TicketType } from "../../../types/ticket";
import { useAuthStore } from "../../../store/authStore";
import toast from "react-hot-toast";

// Mock data for recent activity (will be replaced by API calls)
const recentActivity = [
  {
    id: "1",
    action: "Ticket #1042 created",
    user: "Sarah Johnson",
    time: new Date(Date.now() - 120000).toISOString(),
    type: "create",
  },
  {
    id: "2",
    action: "Ticket #1038 resolved",
    user: "Alex Chen",
    time: new Date(Date.now() - 3600000).toISOString(),
    type: "resolve",
  },
  {
    id: "3",
    action: "Ticket #1041 assigned to Mike",
    user: "Admin",
    time: new Date(Date.now() - 7200000).toISOString(),
    type: "assign",
  },
  {
    id: "4",
    action: "New user registered",
    user: "Jane Smith",
    time: new Date(Date.now() - 10800000).toISOString(),
    type: "user",
  },
  {
    id: "5",
    action: "Ticket #1035 priority changed to High",
    user: "System",
    time: new Date(Date.now() - 14400000).toISOString(),
    type: "update",
  },
];

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<TicketType[]>([]);
  const [customerStats, setCustomerStats] = useState({ total: 0, open: 0, resolved: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        if (user.role === "Admin" || user.role === "SupportAgent") {
          const [statsData, ticketsData] = await Promise.all([
            getDashboardStats(),
            getTickets(),
          ]);
          setStats(statsData);
          setRecentTickets(ticketsData.slice(0, 5));
        } else {
          // Customer role
          const ticketsData = await getTickets();
          setRecentTickets(ticketsData.slice(0, 5));
          
          const total = ticketsData.length;
          const open = ticketsData.filter(t => 
            ["OPEN", "IN_PROGRESS", "Open", "InProgress"].includes(t.status)
          ).length;
          const resolved = ticketsData.filter(t => 
            ["RESOLVED", "Resolved"].includes(t.status)
          ).length;
          setCustomerStats({ total, open, resolved });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const statsCards = user && (user.role === "Admin" || user.role === "SupportAgent")
    ? (stats
      ? [
          {
            label: "Total Tickets",
            value: stats.totalTickets.toString(),
            change: "+12.5%",
            trend: "up",
            icon: Ticket,
            color: "from-indigo-500 to-indigo-600",
            shadowColor: "shadow-indigo-500/20",
          },
          {
            label: "Open Tickets",
            value: stats.openTickets.toString(),
            change: "+3.2%",
            trend: "up",
            icon: Clock,
            color: "from-amber-500 to-orange-500",
            shadowColor: "shadow-amber-500/20",
          },
          {
            label: "Resolved Today",
            value: stats.resolvedToday.toString(),
            change: "+24.1%",
            trend: "up",
            icon: CheckCircle,
            color: "from-emerald-500 to-teal-500",
            shadowColor: "shadow-emerald-500/20",
          },
          {
            label: "Active Agents",
            value: stats.activeAgents.toString(),
            change: "-2",
            trend: "down",
            icon: Users,
            color: "from-violet-500 to-purple-600",
            shadowColor: "shadow-violet-500/20",
          },
        ]
      : [])
    : [
        {
          label: "My Total Tickets",
          value: customerStats.total.toString(),
          change: "All time",
          trend: "up",
          icon: Ticket,
          color: "from-indigo-500 to-indigo-600",
          shadowColor: "shadow-indigo-500/20",
        },
        {
          label: "My Open Tickets",
          value: customerStats.open.toString(),
          change: "Awaiting resolution",
          trend: "up",
          icon: Clock,
          color: "from-amber-500 to-orange-500",
          shadowColor: "shadow-amber-500/20",
        },
        {
          label: "My Resolved Tickets",
          value: customerStats.resolved.toString(),
          change: "Resolved by agents",
          trend: "up",
          icon: CheckCircle,
          color: "from-emerald-500 to-teal-500",
          shadowColor: "shadow-emerald-500/20",
        },
      ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back! Here's an overview of your support operations.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back! Here's an overview of your support operations.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <Card key={stat.label} hover className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                    stat.color,
                    stat.shadowColor,
                  )}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stat.value}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    stat.trend === "up" ? "text-emerald-500" : "text-red-500",
                  )}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-slate-400 ml-1">
                  vs last week
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Recent Tickets
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest support requests
              </p>
            </div>
            <button className="text-xs font-medium text-indigo-500 hover:text-indigo-600 transition-colors">
              View All →
            </button>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Assignee
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-indigo-500">
                      #{ticket.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white max-w-[200px] truncate">
                      {ticket.title}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusBadgeVariant(ticket.status)}>
                        {ticket.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {ticket.assignedTo
                        ? `${ticket.assignedTo.name}`
                        : "Unassigned"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Recent Activity
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest actions</p>
            </div>
            <Activity className="w-5 h-5 text-slate-400" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-700/30">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-1 w-2 h-2 rounded-full flex-shrink-0",
                        item.type === "create" && "bg-indigo-500",
                        item.type === "resolve" && "bg-emerald-500",
                        item.type === "assign" && "bg-amber-500",
                        item.type === "user" && "bg-purple-500",
                        item.type === "update" && "bg-blue-500",
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {item.action}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        by {item.user} · {timeAgo(item.time)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights & Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <Card className="border-indigo-200/50 dark:border-indigo-800/30 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-900/10 dark:to-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  AI Insights
                </h3>
                <p className="text-xs text-slate-500">
                  Powered by SupportSphere AI
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-medium">Trending Issue:</span> 12
                  tickets related to "login authentication" in the last 24
                  hours.
                </p>
              </div>
              <div className="flex items-start gap-2 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-medium">Resolution Rate:</span> Average
                  resolution time improved by 18% this week.
                </p>
              </div>
              <div className="flex items-start gap-2 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                <MessageSquare className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-medium">Suggestion:</span> Consider
                  creating a KB article for recurring password reset queries.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart Placeholder */}
        <Card>
          <CardHeader>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Ticket Trends
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Last 7 days</p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-48">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                (day, i) => {
                  const heights = [60, 45, 80, 55, 90, 35, 70];
                  return (
                    <div
                      key={day}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div className="w-full flex flex-col items-center gap-1">
                        <div
                          className="w-full max-w-[32px] bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-md transition-all duration-500 hover:from-indigo-600 hover:to-indigo-500"
                          style={{ height: `${heights[i]}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">{day}</span>
                    </div>
                  );
                },
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
