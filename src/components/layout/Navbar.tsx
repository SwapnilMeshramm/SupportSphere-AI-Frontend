'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Search, Sun, Moon, Menu, Command, ChevronDown } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { cn } from '../ui/Button';
import { Notification } from '../../types/user';
import { useRouter } from 'next/navigation';
import { timeAgo } from '../../utils/formatDate';

export default function Navbar() {
  const { toggleSidebar, theme, toggleTheme } = useUIStore();
  const { user } = useAuthStore();
  const { notifications, fetchNotifications, markAsRead } = useNotificationStore();
  const router = useRouter();
  
  const [showNotifications, setShowNotifications] = useState(false);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      await fetchNotifications(user.id);
    } catch (err) {
      console.error('Failed to fetch navbar notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleNotificationClick = async (n: Notification) => {
    setShowNotifications(false);
    if (!n.read && user) {
      try {
        await markAsRead(user.id, n.id);
      } catch (err) {
        console.error(err);
      }
    }
    if (n.ticketId) {
      router.push(`/tickets/${n.ticketId}`);
    } else {
      router.push('/notifications');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const recentNotifications = notifications.slice(0, 4);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/90 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300'
      )}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets, customers, agents..."
            className="w-[min(38vw,440px)] h-10 pl-10 pr-16 text-sm bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-slate-400 text-slate-700 dark:text-slate-200 transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-950 md:flex">
            <Command className="h-3 w-3" /> K
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
          title="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-red-100 text-red-650 dark:bg-red-950/40 dark:text-red-400 font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-750">
                {recentNotifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                    No new notifications
                  </div>
                ) : (
                  recentNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={cn(
                        'px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0',
                        !n.read && 'bg-indigo-50/45 dark:bg-indigo-900/10'
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        {!n.read && <div className="mt-2 w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0" />}
                        <div className={n.read ? 'ml-4' : ''}>
                          <p className={`text-xs ${!n.read ? 'font-medium text-slate-900 dark:text-white' : 'text-slate-650 dark:text-slate-400'}`}>
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-700 text-center bg-slate-50/50 dark:bg-slate-800/50">
                <button
                  onClick={() => { setShowNotifications(false); router.push('/notifications'); }}
                  className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <button className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 bg-slate-950 dark:bg-cyan-400 rounded-lg flex items-center justify-center text-xs font-bold text-white dark:text-slate-950 shadow-md">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">{user?.name || 'User'}</p>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">{user?.role || 'Customer'}</p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
        </button>
      </div>
    </header>
  );
}
