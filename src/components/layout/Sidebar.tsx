'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Ticket,
  Users,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  UserRoundCheck,
  Building2,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../ui/Button';

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === 'Admin';
  const isStaff = user?.role === 'Admin' || user?.role === 'SupportAgent';

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { href: '/tickets', label: isStaff ? 'Ticket Queue' : 'My Tickets', icon: Ticket, show: true },
    { href: '/users', label: isAdmin ? 'Users' : 'Profile', icon: isAdmin ? Users : UserRoundCheck, show: true },
    { href: '/analytics', label: 'Analytics', icon: BarChart3, show: isStaff },
    { href: '/notifications', label: 'Notifications', icon: Bell, show: true },
    { href: '/settings', label: 'Settings', icon: Settings, show: true },
  ].filter((item) => item.show);

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-950 text-white transition-all duration-300 ease-in-out shadow-2xl',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="flex-shrink-0 w-10 h-10 bg-white text-slate-950 rounded-lg flex items-center justify-center shadow-lg">
          <Sparkles className="w-5 h-5" />
        </div>
        {sidebarOpen && (
          <div className="min-w-0">
            <span className="block text-base font-bold tracking-tight text-white whitespace-nowrap">
              SupportSphere AI
            </span>
            <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Service workspace
            </span>
          </div>
        )}
      </div>

      {sidebarOpen && (
        <div className="mx-3 mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Building2 className="h-4 w-4 text-cyan-300" />
            {user?.role || 'Customer'} Console
          </div>
          <p className="mt-1 text-[11px] leading-4 text-slate-500">
            {isAdmin
              ? 'Full access to users, queues, analytics, and settings.'
              : isStaff
                ? 'Resolve assigned tickets and manage customer conversations.'
                : 'Create tickets and track progress with the support team.'}
          </p>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:bg-white/10 hover:text-slate-100'
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  'w-5 h-5 flex-shrink-0 transition-colors',
                  isActive ? 'text-slate-950' : 'text-slate-500 group-hover:text-slate-300'
                )}
              />
              {sidebarOpen && <span>{item.label}</span>}
              {isActive && sidebarOpen && (
                <div className="ml-auto w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        {sidebarOpen ? (
          <div className="flex items-center gap-3 rounded-lg bg-white/[0.03] p-2">
            <div className="w-9 h-9 bg-cyan-400 rounded-lg flex items-center justify-center text-sm font-bold text-slate-950 shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role || 'Agent'}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 bg-cyan-400 rounded-lg flex items-center justify-center text-sm font-bold text-slate-950">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-950 transition-colors shadow-md"
      >
        {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
}
