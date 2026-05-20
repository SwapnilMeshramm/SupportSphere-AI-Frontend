"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Plus,
  ShieldCheck,
  Sparkles,
  Ticket,
  Timer,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card";
import { Badge, getPriorityBadgeVariant, getStatusBadgeVariant } from "../../../components/ui/Badge";
import { Button, cn } from "../../../components/ui/Button";
import { CardSkeleton, EmptyState } from "../../../components/ui/Loader";
import { getDashboardStats, getTickets } from "../../../services/ticketService";
import { DashboardStats } from "../../../services/ticketService";
import { Ticket as TicketType } from "../../../types/ticket";
import { useAuthStore } from "../../../store/authStore";
import { formatDate, timeAgo } from "../../../utils/formatDate";
import { PRIORITY_LABELS, STATUS_LABELS } from "../../../utils/constants";
import toast from "react-hot-toast";

type MetricCard = {
  label: string;
  value: string;
  detail: string;
  icon: React.ElementType;
  tone: string;
};

const workflow = [
  { label: "Open", description: "New customer request", tone: "bg-blue-500" },
  { label: "In Progress", description: "Agent is investigating", tone: "bg-amber-500" },
  { label: "Resolved", description: "Solution delivered", tone: "bg-emerald-500" },
  { label: "Closed", description: "Customer confirmed", tone: "bg-slate-500" },
];

const barData = [42, 68, 54, 86, 73, 38, 52];

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tickets, setTickets] = useState<TicketType[]>([]);

  const isAdmin = user?.role === "Admin";
  const isAgent = user?.role === "SupportAgent";
  const isStaff = isAdmin || isAgent;

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const ticketData = await getTickets();
        setTickets(ticketData);

        if (isStaff) {
          const statsData = await getDashboardStats();
          setStats(statsData);
        }
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, isStaff]);

  const derived = useMemo(() => {
    const open = tickets.filter((ticket) => ticket.status === "Open").length;
    const inProgress = tickets.filter((ticket) => ticket.status === "InProgress").length;
    const resolved = tickets.filter((ticket) => ticket.status === "Resolved").length;
    const urgent = tickets.filter((ticket) => ticket.priority === "Urgent").length;
    const assignedToMe = tickets.filter((ticket) => ticket.assignedToId === user?.id).length;
    const pendingReply = tickets.filter((ticket) => ticket.status === "Open" || ticket.status === "InProgress").length;

    return { open, inProgress, resolved, urgent, assignedToMe, pendingReply };
  }, [tickets, user?.id]);

  const metrics: MetricCard[] = isAdmin
    ? [
        { label: "Total Tickets", value: String(stats?.totalTickets ?? tickets.length), detail: "All customer issues", icon: Ticket, tone: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" },
        { label: "Open Tickets", value: String(stats?.openTickets ?? derived.open), detail: "Need triage", icon: AlertCircle, tone: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
        { label: "Resolved Today", value: String(stats?.resolvedToday ?? derived.resolved), detail: "Closed by support", icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
        { label: "Active Agents", value: String(stats?.activeAgents ?? 0), detail: "Available support staff", icon: UserRoundCheck, tone: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300" },
        { label: "CSAT", value: "4.8/5", detail: "Customer satisfaction", icon: Sparkles, tone: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" },
        { label: "Avg Response", value: "9m", detail: "First reply target", icon: Timer, tone: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300" },
      ]
    : isAgent
      ? [
          { label: "Assigned to Me", value: String(derived.assignedToMe), detail: "My active workload", icon: UserRoundCheck, tone: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300" },
          { label: "Pending Replies", value: String(derived.pendingReply), detail: "Customer waiting", icon: MessageSquare, tone: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
          { label: "Urgent Tickets", value: String(derived.urgent), detail: "Priority escalation", icon: AlertCircle, tone: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" },
          { label: "Resolved", value: String(derived.resolved), detail: "Completed cases", icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
        ]
      : [
          { label: "My Tickets", value: String(tickets.length), detail: "All submitted issues", icon: Ticket, tone: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" },
          { label: "In Progress", value: String(derived.inProgress), detail: "Being handled now", icon: Clock3, tone: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
          { label: "Resolved", value: String(derived.resolved), detail: "Solved by support", icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
        ];

  const visibleTickets = isAgent
    ? tickets.filter((ticket) => ticket.assignedToId === user?.id || !ticket.assignedToId).slice(0, 6)
    : tickets.slice(0, 6);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => <CardSkeleton key={item} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <section className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              {isAdmin ? "Admin Operations" : isAgent ? "Agent Workspace" : "Customer Portal"}
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              {isAdmin
                ? "Support operations command center"
                : isAgent
                  ? "Your ticket resolution queue"
                  : "Track your support requests"}
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
              {isAdmin
                ? "Monitor workload, agent capacity, service quality, and customer conversations from one place."
                : isAgent
                  ? "Prioritize assigned conversations, update ticket state, and keep customers informed."
                  : "Create a ticket, follow status changes, and reply directly to the support team."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/tickets">
              <Button variant="outline">View Tickets</Button>
            </Link>
            <Link href={isStaff ? "/analytics" : "/tickets"}>
              <Button>
                {isStaff ? <BarChart3 className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                {isStaff ? "Open Analytics" : "Create Ticket"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label} hover>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{metric.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{metric.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{metric.detail}</p>
                </div>
                <div className={cn("rounded-lg p-2.5", metric.tone)}>
                  <metric.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                {isStaff ? "Live Ticket Queue" : "Recent Tickets"}
              </h2>
              <p className="text-xs text-slate-500">Newest conversations and their current workflow state</p>
            </div>
            <Link href="/tickets" className="text-sm font-semibold text-primary hover:text-primary/80">
              Open queue
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {visibleTickets.length === 0 ? (
              <EmptyState title="No tickets yet" description="Create a ticket to start a support conversation." icon={Ticket} />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {visibleTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/tickets/${ticket.id}`}
                    className="flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-400">#{ticket.id}</span>
                        <Badge variant={getStatusBadgeVariant(ticket.status)}>{STATUS_LABELS[ticket.status]}</Badge>
                        <Badge variant={getPriorityBadgeVariant(ticket.priority)}>{PRIORITY_LABELS[ticket.priority]}</Badge>
                      </div>
                      <p className="mt-2 truncate text-sm font-semibold text-slate-950 dark:text-white">{ticket.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {ticket.assignedTo ? `Assigned to ${ticket.assignedTo.name}` : "Unassigned"} · Updated {timeAgo(ticket.updatedAt)}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">Ticket Workflow</h2>
              <p className="text-xs text-slate-500">How work moves through SupportSphere</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workflow.map((step, index) => (
                <div key={step.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn("h-3 w-3 rounded-full", step.tone)} />
                    {index < workflow.length - 1 && <div className="mt-1 h-10 w-px bg-slate-200 dark:bg-slate-700" />}
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">{step.label}</p>
                    <p className="text-xs text-slate-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {isStaff && (
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div>
                <h2 className="text-base font-semibold text-slate-950 dark:text-white">Resolution Trend</h2>
                <p className="text-xs text-slate-500">Ticket volume over the last seven days</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex h-56 items-end gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
                {barData.map((value, index) => (
                  <div key={index} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-44 w-full items-end justify-center">
                      <div
                        className="w-full max-w-9 rounded-t bg-slate-900 transition-all hover:bg-primary dark:bg-cyan-400"
                        style={{ height: `${value}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <h2 className="text-base font-semibold text-slate-950 dark:text-white">Activity Timeline</h2>
                <p className="text-xs text-slate-500">Recent operational signals</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.slice(0, 4).map((ticket) => (
                  <div key={ticket.id} className="flex gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Ticket #{ticket.id} updated</p>
                      <p className="text-xs text-slate-500">{ticket.title} · {formatDate(ticket.updatedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
