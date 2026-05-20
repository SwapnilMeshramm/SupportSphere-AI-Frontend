"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import { useNotificationStore } from "../../../store/notificationStore";
import { 
  Bell, 
  Check, 
  MessageSquare, 
  UserCheck, 
  Tag, 
  PlusCircle, 
  AlertCircle,
  FileText
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { timeAgo } from "../../../utils/formatDate";
import toast from "react-hot-toast";
import Link from "next/link";

export default function NotificationsPage() {
  const user = useAuthStore((state) => state.user);
  const { notifications, isLoading, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const loadNotifications = async () => {
    if (!user) return;
    try {
      await fetchNotifications(user.id);
    } catch (error: any) {
      toast.error("Failed to load notifications.");
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const handleMarkAsRead = async (id: number) => {
    if (!user) return;
    try {
      await markAsRead(user.id, id);
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error("Could not update notification");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    if (notifications.every(n => n.read)) return;

    try {
      await markAllAsRead(user.id);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "TicketCreated":
        return <PlusCircle className="w-5 h-5 text-emerald-500" />;
      case "TicketAssigned":
        return <UserCheck className="w-5 h-5 text-blue-500" />;
      case "StatusChanged":
        return <Tag className="w-5 h-5 text-purple-500" />;
      case "PriorityChanged":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case "NewReply":
        return <MessageSquare className="w-5 h-5 text-pink-500" />;
      default:
        return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "UNREAD") return !n.read;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Notifications
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Stay up to date with updates to your customer support tickets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.read) && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Tabs / Filters */}
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-px">
        <button
          onClick={() => setFilter("ALL")}
          className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-colors ${
            filter === "ALL"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-950 dark:hover:text-white"
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("UNREAD")}
          className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-colors ${
            filter === "UNREAD"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-950 dark:hover:text-white"
          }`}
        >
          Unread ({notifications.filter(n => !n.read).length})
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500">Retrieving notification feed...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 mb-4">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">All caught up!</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {filter === "UNREAD" 
              ? "You don't have any unread notifications at the moment."
              : "You don't have any notifications yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800 shadow-sm overflow-hidden">
          {filteredNotifications.map((notification) => (
            <div 
              key={notification.id}
              className={`p-5 flex items-start gap-4 transition-colors ${
                notification.read 
                  ? "bg-white dark:bg-slate-800" 
                  : "bg-slate-50/60 dark:bg-slate-900/30"
              }`}
            >
              {/* Icon Container */}
              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-4">
                  <p className={`text-sm ${
                    notification.read 
                      ? "text-slate-600 dark:text-slate-400" 
                      : "font-medium text-slate-900 dark:text-white"
                  }`}>
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {timeAgo(notification.createdAt)}
                    </span>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1 text-slate-400 hover:text-primary rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {notification.ticketId && (
                  <Link 
                    href={`/tickets/${notification.ticketId}`}
                    className="inline-flex text-xs font-semibold text-primary hover:underline"
                  >
                    View Ticket #{notification.ticketId}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
