'use client';

import React, { useEffect, useState } from 'react';
import { Search, Filter, Plus, ChevronLeft, ChevronRight, Ticket as TicketIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge, getStatusBadgeVariant, getPriorityBadgeVariant } from '../../../components/ui/Badge';
import { EmptyState, TableRowSkeleton } from '../../../components/ui/Loader';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { cn } from '../../../components/ui/Button';
import { useTicketStore } from '../../../store/ticketStore';
import { createTicket } from '../../../services/ticketService';
import { Ticket, TicketPriority, TicketStatus } from '../../../types/ticket';
import { TICKET_STATUSES, TICKET_PRIORITIES, STATUS_LABELS, PRIORITY_LABELS } from '../../../utils/constants';
import { formatDate } from '../../../utils/formatDate';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Link from 'next/link';

// Using real API via useTicketStore and services

export default function TicketsPage() {
  const { tickets, isLoading: storeLoading, fetchTickets, addTicket } = useTicketStore();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchTickets().finally(() => setIsLoading(false));
  }, [fetchTickets]);

  // Filter tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalPages = Math.ceil(filteredTickets.length / perPage);
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * perPage, currentPage * perPage);

  const onCreateTicket = async (data: any) => {
    try {
      const newTicket = await createTicket({
        title: data.title,
        description: data.description,
        priority: data.priority,
      });
      addTicket(newTicket);
      toast.success('Ticket created successfully!');
      setShowCreateModal(false);
      reset();
    } catch {
      toast.error('Failed to create ticket');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tickets</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track all support tickets</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full h-10 pl-10 pr-4 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="h-10 px-3 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">All Status</option>
            {TICKET_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
            className="h-10 px-3 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">All Priority</option>
            {TICKET_PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
          </select>
        </div>
      </Card>

      {/* Tickets Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700/50">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
              ) : paginatedTickets.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState title="No tickets found" description="Try adjusting your search or filters" icon={TicketIcon} />
                  </td>
                </tr>
              ) : (
                paginatedTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <Link href={`/tickets/${ticket.id}`} className="text-sm font-mono text-indigo-500 hover:text-indigo-600">
                        #{ticket.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white max-w-xs truncate">{ticket.title}</td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusBadgeVariant(ticket.status)}>{STATUS_LABELS[ticket.status]}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getPriorityBadgeVariant(ticket.priority)}>{PRIORITY_LABELS[ticket.priority]}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(ticket.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700/50">
            <p className="text-sm text-slate-500">
              Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filteredTickets.length)} of {filteredTickets.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                    currentPage === i + 1
                      ? 'bg-indigo-500 text-white'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Create Ticket Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); reset(); }} title="Create New Ticket" size="lg">
        <form onSubmit={handleSubmit(onCreateTicket)} className="space-y-5">
          <Input
            label="Title"
            placeholder="Brief description of the issue"
            {...register('title', { required: 'Title is required' })}
            error={errors.title?.message as string}
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              placeholder="Provide detailed information about the issue..."
              rows={4}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 resize-none"
            />
            {errors.description && <p className="text-sm font-medium text-destructive">{errors.description.message as string}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Priority</label>
            <select
              {...register('priority', { required: 'Priority is required' })}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {TICKET_PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); reset(); }}>
              Cancel
            </Button>
            <Button type="submit">
              Create Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
