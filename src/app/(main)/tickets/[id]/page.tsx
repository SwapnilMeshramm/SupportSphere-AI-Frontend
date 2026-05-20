"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Clock, 
  User, 
  AlertTriangle, 
  MessageSquare, 
  Edit3,
  UserPlus,
  Send,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../../../../components/ui/Card";
import { Badge, getStatusBadgeVariant, getPriorityBadgeVariant } from "../../../../components/ui/Badge";
import { Button } from "../../../../components/ui/Button";
import { Modal } from "../../../../components/ui/Modal";
import { cn } from "../../../../components/ui/Button";
import { STATUS_LABELS, PRIORITY_LABELS, TICKET_STATUSES, TICKET_PRIORITIES } from "../../../../utils/constants";
import { formatDateTime } from "../../../../utils/formatDate";
import { useAuthStore } from "../../../../store/authStore";
import { 
  getTicketById, 
  getTicketComments, 
  addComment, 
  updateTicketStatus, 
  updateTicketPriority, 
  assignTicket 
} from "../../../../services/ticketService";
import { getUsers } from "../../../../services/userService";
import { Ticket, Comment, TicketPriority, TicketStatus } from "../../../../types/ticket";
import { User as UserType } from "../../../../types/user";
import toast from "react-hot-toast";

const isTicketStatus = (status: string): status is TicketStatus => {
  return TICKET_STATUSES.includes(status as TicketStatus);
};

const isTicketPriority = (priority: string): priority is TicketPriority => {
  return TICKET_PRIORITIES.includes(priority as TicketPriority);
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [agents, setAgents] = useState<UserType[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editAssigneeId, setEditAssigneeId] = useState<string>("UNASSIGNED");

  const ticketId = params.id as string;

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [ticketData, commentsData] = await Promise.all([
        getTicketById(ticketId),
        getTicketComments(ticketId)
      ]);
      
      setTicket(ticketData);
      setComments(commentsData || []);
      
      // Initialize edit state variables
      setEditStatus(ticketData.status);
      setEditPriority(ticketData.priority);
      setEditAssigneeId(ticketData.assignedToId ? String(ticketData.assignedToId) : "UNASSIGNED");

      // Fetch agents list if agent/admin wants to assign
      if (currentUser && (currentUser.role === "Admin" || currentUser.role === "SupportAgent")) {
        const usersList = await getUsers();
        const supportStaff = usersList.filter(u => u.role === "Admin" || u.role === "SupportAgent");
        setAgents(supportStaff);
      }
    } catch (error: any) {
      toast.error("Failed to retrieve ticket details.");
      router.push("/tickets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && ticketId) {
      loadData();
    }
  }, [currentUser, ticketId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      setIsSubmittingComment(true);
      const newComment = await addComment(ticketId, newCommentText);
      setComments(prev => [...prev, newComment]);
      setNewCommentText("");
      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to add comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUpdateTicket = async () => {
    if (!ticket) return;

    try {
      setIsLoading(true);
      
      // Send updates sequentially or concurrently
      const promises: Promise<any>[] = [];
      
      if (editStatus !== ticket.status && isTicketStatus(editStatus)) {
        promises.push(updateTicketStatus(ticketId, editStatus));
      }
      
      if (editPriority !== ticket.priority && isTicketPriority(editPriority)) {
        promises.push(updateTicketPriority(ticketId, editPriority));
      }

      const parsedAssignee = editAssigneeId === "UNASSIGNED" ? null : Number(editAssigneeId);
      if (parsedAssignee !== ticket.assignedToId) {
        promises.push(assignTicket(ticketId, parsedAssignee));
      }

      if (promises.length > 0) {
        await Promise.all(promises);
        toast.success("Ticket updated successfully!");
        // Reload fresh ticket data
        const updatedTicket = await getTicketById(ticketId);
        setTicket(updatedTicket);
        setEditAssigneeId(updatedTicket.assignedToId ? String(updatedTicket.assignedToId) : "UNASSIGNED");
      }
      
      setShowEditModal(false);
    } catch (error) {
      toast.error("Failed to update ticket parameters.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-slate-500">Loading ticket metadata...</p>
      </div>
    );
  }

  if (!ticket) return null;

  const currentStatusKey = ticket.status;
  const currentPriorityKey = ticket.priority;
  const isAgentOrAdmin = currentUser && (currentUser.role === "Admin" || currentUser.role === "SupportAgent");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Back Button */}
      <button
        onClick={() => router.push("/tickets")}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tickets
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center flex-wrap gap-2.5 mb-2">
            <span className="text-sm font-mono text-indigo-500 font-semibold">#{ticket.id}</span>
            <Badge variant={getStatusBadgeVariant(ticket.status)}>{STATUS_LABELS[currentStatusKey] || ticket.status}</Badge>
            <Badge variant={getPriorityBadgeVariant(ticket.priority)}>{PRIORITY_LABELS[currentPriorityKey] || ticket.priority}</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{ticket.title}</h1>
        </div>
        {isAgentOrAdmin && (
          <Button variant="outline" onClick={() => setShowEditModal(true)}>
            <Edit3 className="w-4 h-4 mr-2" />
            Manage Ticket
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (Description & Chat flow) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Ticket Description</h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </CardContent>
          </Card>

          {/* Comments / Discussion Thread */}
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4.5 h-4.5 text-slate-400" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Discussion Thread</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No updates or replies posted yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment) => {
                    const isAuthorStaff = comment.author?.role === "Admin" || comment.author?.role === "SupportAgent";
                    return (
                      <div key={comment.id} className="flex gap-4 items-start">
                        {/* Avatar */}
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-sm",
                          isAuthorStaff 
                            ? "bg-gradient-to-br from-indigo-500 to-violet-600" 
                            : "bg-gradient-to-br from-emerald-500 to-teal-600"
                        )}>
                          {comment.author?.name ? comment.author.name.charAt(0).toUpperCase() : "U"}
                        </div>

                        {/* Speech Bubble */}
                        <div className="flex-1 min-w-0 bg-slate-50/70 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                {comment.author?.name || "Deleted User"}
                              </span>
                              {isAuthorStaff && (
                                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                                  Staff
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400">
                              {formatDateTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Reply Form */}
              <div className="border-t border-slate-100 dark:border-slate-850 pt-6">
                <form onSubmit={handlePostComment} className="flex gap-3">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    disabled={isSubmittingComment}
                    placeholder={
                      isAgentOrAdmin 
                        ? "Post a message or response to client..." 
                        : "Post an update or reply..."
                    }
                    className="flex-1 min-w-0 h-11 px-4 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-250 placeholder:text-slate-400"
                  />
                  <Button type="submit" disabled={isSubmittingComment || !newCommentText.trim()} className="h-11 px-4.5">
                    {isSubmittingComment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Reply
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5 space-y-5">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Creator</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm">
                    {ticket.createdBy?.name ? ticket.createdBy.name.charAt(0).toUpperCase() : "C"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{ticket.createdBy?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{ticket.createdBy?.email}</p>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Assigned Agent</p>
                {ticket.assignedTo ? (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm">
                      {ticket.assignedTo.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{ticket.assignedTo.name}</p>
                      <p className="text-xs text-slate-500 truncate">{ticket.assignedTo.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <UserPlus className="w-4 h-4" />
                    <span>Unassigned</span>
                  </div>
                )}
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Status</p>
                  <Badge variant={getStatusBadgeVariant(ticket.status)}>{STATUS_LABELS[currentStatusKey] || ticket.status}</Badge>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Priority</p>
                  <Badge variant={getPriorityBadgeVariant(ticket.priority)}>{PRIORITY_LABELS[currentPriorityKey] || ticket.priority}</Badge>
                </div>
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Created:</span>
                  </div>
                  <span className="text-slate-700 dark:text-slate-350 font-medium">{formatDateTime(ticket.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Updated:</span>
                  </div>
                  <span className="text-slate-700 dark:text-slate-350 font-medium">{formatDateTime(ticket.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit / Management Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Manage Ticket Details">
        <div className="space-y-5">
          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-slate-700 dark:text-white"
            >
              {TICKET_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Priority</label>
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-slate-700 dark:text-white"
            >
              {TICKET_PRIORITIES.map((p) => (
                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
              ))}
            </select>
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Assign Support Staff</label>
            <select
              value={editAssigneeId}
              onChange={(e) => setEditAssigneeId(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-slate-700 dark:text-white"
            >
              <option value="UNASSIGNED">Unassigned</option>
              {agents.map((agent) => (
                <option key={agent.id} value={String(agent.id)}>
                  {agent.name} ({agent.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button onClick={handleUpdateTicket}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
