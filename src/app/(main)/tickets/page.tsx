"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
  Ticket as TicketIcon,
} from "lucide-react";
import { Badge, getPriorityBadgeVariant, getStatusBadgeVariant } from "../../../components/ui/Badge";
import { Button, cn } from "../../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card";
import { EmptyState, TableRowSkeleton } from "../../../components/ui/Loader";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../../components/ui/Table";
import { createTicket } from "../../../services/ticketService";
import { useAuthStore } from "../../../store/authStore";
import { useTicketStore } from "../../../store/ticketStore";
import { CreateTicketData, Ticket } from "../../../types/ticket";
import { PRIORITY_LABELS, STATUS_LABELS, TICKET_PRIORITIES, TICKET_STATUSES } from "../../../utils/constants";
import { formatDate, timeAgo } from "../../../utils/formatDate";

type SortKey = "updatedAt" | "createdAt" | "priority";

const priorityRank: Record<string, number> = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

export default function TicketsPage() {
  const user = useAuthStore((state) => state.user);
  const { tickets, isLoading, fetchTickets, addTicket } = useTicketStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;

  const isStaff = user?.role === "Admin" || user?.role === "SupportAgent";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTicketData>();

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const queueStats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "Open").length,
      inProgress: tickets.filter((ticket) => ticket.status === "InProgress").length,
      urgent: tickets.filter((ticket) => ticket.priority === "Urgent").length,
    };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets
      .filter((ticket) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          ticket.title.toLowerCase().includes(query) ||
          ticket.description.toLowerCase().includes(query) ||
          String(ticket.id).includes(query) ||
          ticket.createdBy?.name?.toLowerCase().includes(query) ||
          ticket.assignedTo?.name?.toLowerCase().includes(query);
        const matchesStatus = statusFilter === "ALL" || ticket.status === statusFilter;
        const matchesPriority = priorityFilter === "ALL" || ticket.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (sortKey === "priority") {
          return priorityRank[b.priority] - priorityRank[a.priority];
        }

        return new Date(b[sortKey]).getTime() - new Date(a[sortKey]).getTime();
      });
  }, [tickets, searchQuery, statusFilter, priorityFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / perPage));
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * perPage, currentPage * perPage);

  const onCreateTicket = async (data: CreateTicketData) => {
    try {
      setIsCreating(true);
      const ticket = await createTicket(data);
      addTicket(ticket);
      toast.success("Ticket created successfully");
      setShowCreateModal(false);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || "Failed to create ticket");
    } finally {
      setIsCreating(false);
    }
  };

  const pageTitle = isStaff ? "Ticket Queue" : "My Tickets";

  return (
    <div className="space-y-6 pb-10">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <TicketIcon className="h-4 w-4 text-primary" />
            {isStaff ? "Support operations" : "Customer support"}
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{pageTitle}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            {isStaff
              ? "Search, triage, assign, and monitor customer issues across the full support workflow."
              : "Create support requests, track their progress, and continue conversations with agents."}
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total", value: queueStats.total, tone: "border-slate-200 dark:border-slate-800" },
          { label: "Open", value: queueStats.open, tone: "border-blue-200 dark:border-blue-900" },
          { label: "In Progress", value: queueStats.inProgress, tone: "border-amber-200 dark:border-amber-900" },
          { label: "Urgent", value: queueStats.urgent, tone: "border-red-200 dark:border-red-900" },
        ].map((item) => (
          <Card key={item.label} className={cn("border-l-4", item.tone)}>
            <CardContent className="p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{item.label}</p>
              <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search ticket ID, subject, customer, or assignee..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:w-auto">
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="ALL">All Statuses</option>
                {TICKET_STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
              </select>
              <select
                value={priorityFilter}
                onChange={(event) => {
                  setPriorityFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="ALL">All Priorities</option>
                {TICKET_PRIORITIES.map((priority) => <option key={priority} value={priority}>{PRIORITY_LABELS[priority]}</option>)}
              </select>
              <select
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as SortKey)}
                className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="updatedAt">Recently Updated</option>
                <option value="createdAt">Newest Created</option>
                <option value="priority">Priority First</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            <h2 className="text-base font-semibold text-slate-950 dark:text-white">Queue Results</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            {filteredTickets.length} matching tickets
          </div>
        </CardHeader>
        <Table>
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TableHeaderCell>Ticket</TableHeaderCell>
              <TableHeaderCell>Priority</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Assigned Agent</TableHeaderCell>
              <TableHeaderCell>Created</TableHeaderCell>
              <TableHeaderCell>
                <span className="inline-flex items-center gap-1">
                  Last Updated <ArrowDownUp className="h-3 w-3" />
                </span>
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => <TableRowSkeleton key={index} />)
            ) : paginatedTickets.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState title="No tickets found" description="Try changing the search, filters, or create a new ticket." icon={TicketIcon} />
                </td>
              </tr>
            ) : (
              paginatedTickets.map((ticket: Ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <Link href={`/tickets/${ticket.id}`} className="group block min-w-[240px]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-primary">#{ticket.id}</span>
                        <span className="truncate text-sm font-semibold text-slate-950 group-hover:text-primary dark:text-white">
                          {ticket.title}
                        </span>
                      </div>
                      <p className="mt-1 max-w-md truncate text-xs text-slate-500">
                        {ticket.createdBy ? `Customer: ${ticket.createdBy.name}` : ticket.description}
                      </p>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityBadgeVariant(ticket.priority)}>{PRIORITY_LABELS[ticket.priority]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(ticket.status)}>{STATUS_LABELS[ticket.status]}</Badge>
                  </TableCell>
                  <TableCell>
                    {ticket.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-cyan-100 text-center text-xs font-bold leading-7 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200">
                          {ticket.assignedTo.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium">{ticket.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">{formatDate(ticket.createdAt)}</TableCell>
                  <TableCell className="text-sm text-slate-500">{timeAgo(ticket.updatedAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {filteredTickets.length > perPage && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filteredTickets.length)} of {filteredTickets.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          reset();
        }}
        title="Create Support Ticket"
        size="lg"
      >
        <form onSubmit={handleSubmit(onCreateTicket)} className="space-y-5">
          <Input
            label="Subject"
            placeholder="Example: Billing invoice failed to download"
            {...register("title", { required: "Subject is required" })}
            error={errors.title?.message}
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Issue Details</label>
            <textarea
              rows={5}
              placeholder="Describe what happened, expected behavior, error messages, and affected users."
              {...register("description", { required: "Issue details are required" })}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            />
            {errors.description && <p className="text-sm font-medium text-destructive">{errors.description.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Priority</label>
            <select
              {...register("priority", { required: "Priority is required" })}
              defaultValue="Medium"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              {TICKET_PRIORITIES.map((priority) => <option key={priority} value={priority}>{PRIORITY_LABELS[priority]}</option>)}
            </select>
          </div>
          <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3 text-xs text-cyan-900 dark:border-cyan-900 dark:bg-cyan-950/30 dark:text-cyan-200">
            New tickets start as Open. Support staff can assign an agent, update priority, and move the ticket through the workflow.
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating}>
              Create Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
