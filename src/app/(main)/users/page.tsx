'use client';

import React, { useState, useEffect } from 'react';
import { Search, Users as UsersIcon, Mail, Calendar, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Badge, getRoleBadgeVariant } from '../../../components/ui/Badge';
import { EmptyState, Skeleton } from '../../../components/ui/Loader';
import { cn } from '../../../components/ui/Button';
import { User, Role } from '../../../types/user';
import { USER_ROLES } from '../../../utils/constants';
import { formatDate } from '../../../utils/formatDate';
import { useUserStore } from '../../../store/userStore';
import { useAuthStore } from '../../../store/authStore';

const roleColors: Record<Role, string> = {
  Admin: 'from-purple-500 to-violet-600',
  SupportAgent: 'from-blue-500 to-indigo-600',
  Customer: 'from-emerald-500 to-teal-600',
};

export default function UsersPage() {
  const actor = useAuthStore((state) => state.user);
  const { users, isLoading: storeLoading, fetchUsers } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (actor && actor.role === 'Admin') {
      fetchUsers().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [actor, fetchUsers]);

  const displayUsers = actor && actor.role === 'Admin' ? users : (actor ? [actor] : []);

  const filteredUsers = displayUsers.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleCounts = {
    Admin: displayUsers.filter((u) => u.role === 'Admin').length,
    SupportAgent: displayUsers.filter((u) => u.role === 'SupportAgent').length,
    Customer: displayUsers.filter((u) => u.role === 'Customer').length,
  };

  const isAdmin = actor && actor.role === 'Admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isAdmin ? 'Users Directory' : 'My Profile'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isAdmin ? 'Manage team members and customers' : 'View your account credentials and role permission details'}
        </p>
      </div>

      {/* Role Summary Cards */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(['Admin', 'SupportAgent', 'Customer'] as Role[]).map((role) => (
            <Card key={role} hover className="cursor-pointer" onClick={() => setRoleFilter(roleFilter === role ? 'ALL' : role)}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{role === 'SupportAgent' ? 'Support Agents' : role + 's'}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{roleCounts[role]}</p>
                  </div>
                  <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg', roleColors[role])}>
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      {isAdmin && (
        <Card>
          <div className="p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 px-3 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">All Roles</option>
              {USER_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </Card>
      )}

      {/* Users Table / Profile view */}
      {!isAdmin && actor ? (
        <Card className="border-indigo-200/50 dark:border-indigo-800/30">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className={cn('w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-3xl font-bold text-white shadow-lg flex-shrink-0', roleColors[actor.role])}>
                {actor.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 space-y-4 text-center sm:text-left">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{actor.name}</h3>
                  <Badge variant={getRoleBadgeVariant(actor.role)} className="mt-1">{actor.role}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2">
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 justify-center sm:justify-start">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <span>{actor.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 justify-center sm:justify-start">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <span>Member since {formatDate(actor.createdAt)}</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-left text-slate-505 dark:text-slate-400 leading-relaxed">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Access Restriction:</span> Full directory access is restricted to Administrators. Support agents can manage tickets directly, and Customers can view their account metrics.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/50">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-700/30">
                      <td className="px-6 py-4"><div className="flex items-center gap-3"><Skeleton className="w-9 h-9 rounded-full" /><Skeleton className="h-4 w-28" /></div></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState title="No users found" description="Try adjusting your search or filters" icon={UsersIcon} />
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white shadow-md', roleColors[user.role])}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
                      <td className="px-6 py-4">
                        <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDate(user.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* User Profile Card (Selected User) */}
      {selectedUser && (
        <Card className="border-indigo-200/50 dark:border-indigo-800/30">
          <CardHeader>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">User Profile</h2>
            <button onClick={() => setSelectedUser(null)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Close</button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className={cn('w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl font-bold text-white shadow-lg', roleColors[selectedUser.role])}>
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedUser.name}</h3>
                  <Badge variant={getRoleBadgeVariant(selectedUser.role)} className="mt-1">{selectedUser.role}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Mail className="w-4 h-4" />
                    {selectedUser.email}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="w-4 h-4" />
                    Joined {formatDate(selectedUser.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
