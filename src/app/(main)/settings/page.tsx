'use client';

import React from 'react';
import { User, Palette, Bell, Shield, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';

export default function SettingsPage() {
  const { theme, toggleTheme } = useUIStore();
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-slate-400" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Profile</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-500/20">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{user?.name || 'User'}</p>
              <p className="text-sm text-slate-500">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" defaultValue={user?.name || ''} placeholder="Your name" />
            <Input label="Email" defaultValue={user?.email || ''} placeholder="Your email" type="email" />
          </div>
          <div className="flex justify-end pt-2">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-slate-400" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Appearance</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Dark Mode</p>
              <p className="text-xs text-slate-500 mt-0.5">Toggle between light and dark themes</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-indigo-500' : 'bg-slate-300'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-400" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Notifications</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Email notifications', desc: 'Receive updates via email' },
            { label: 'Ticket assignment alerts', desc: 'Get notified when a ticket is assigned to you' },
            { label: 'Resolution updates', desc: 'Get notified when tickets are resolved' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <button
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-500 transition-colors"
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm translate-x-6 transition-transform" />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-400" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Security</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Current Password" type="password" placeholder="••••••••" />
          <Input label="New Password" type="password" placeholder="••••••••" />
          <Input label="Confirm New Password" type="password" placeholder="••••••••" />
          <div className="flex justify-end pt-2">
            <Button variant="outline">Update Password</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
