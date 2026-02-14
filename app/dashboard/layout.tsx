'use client';

import React from "react"
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, BookOpen, FileText, GraduationCap, User, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (user.role === 'admin') {
      router.push('/admin');
      return;
    }

    if (!user.is_active) {
      router.push('/auth/login');
      return;
    }
  }, [user, loading, router]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/auth/login';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800 mx-auto"></div>
          <p className="mt-3 text-sm font-medium text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role === 'admin' || !user.is_active) {
    return null;
  }

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/onboarding', label: 'Onboarding', icon: FileText },
    { href: '/dashboard/training', label: 'Training', icon: GraduationCap },
    { href: '/dashboard/handbook', label: 'Handbook', icon: BookOpen },
    { href: '/dashboard/hr-records', label: 'HR Records', icon: FileText },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      {/* Logo area */}
      <div className="p-6 border-b border-slate-700 bg-slate-900">
        <h1 className="text-lg font-semibold text-slate-50 tracking-tight">
          Nutrihealth
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Staff Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 bg-slate-900">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-50'
              }`}
            >
              <Icon className="h-[18px] w-[18px] flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User area + logout */}
      <div className="p-4 border-t border-slate-700 bg-slate-900">
        <div className="mb-3 px-2">
          <p className="text-sm font-medium text-slate-50 truncate">{user?.first_name} {user?.last_name}</p>
          <p className="text-xs text-slate-500">Staff Member</p>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 justify-center bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 text-sm h-9"
          size="sm"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - mobile: full-width overlay, desktop: fixed 260px */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out
        w-full sm:w-72 lg:w-[260px]
        lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile close button */}
        <button 
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-w-0 bg-slate-900">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 px-4 py-3 flex items-center justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-700 transition-colors lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-slate-300" />
            </button>
            <span className="text-sm font-medium text-slate-400 lg:hidden">Nutrihealth</span>
          </div>
          <div className="text-sm text-slate-400 hidden sm:block">
            Welcome back, <span className="font-medium text-slate-50">{user?.first_name}</span>
          </div>
        </div>
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
