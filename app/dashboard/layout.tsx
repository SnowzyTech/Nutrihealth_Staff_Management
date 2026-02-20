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
      <div className="p-6 border-b border-[#5a1a75] bg-[#43005F]">
        <h1 className="text-lg font-semibold text-white tracking-tight">
          Nutrihealth
        </h1>
        <p className="text-xs text-orange-200 mt-0.5">Staff Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 bg-[#43005F]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                active
                  ? 'bg-[#FE871F] text-[#43005F]'
                  : 'text-orange-100 hover:bg-[#5a1a75] hover:text-white'
              }`}
            >
              <Icon className="h-[18px] w-[18px] flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User area + logout */}
      <div className="p-4 border-t border-[#5a1a75] bg-[#43005F]">
        <div className="mb-3 px-2">
          <p className="text-sm font-medium text-white truncate">{user?.first_name} {user?.last_name}</p>
          <p className="text-xs text-orange-200">Staff Member</p>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 justify-center bg-[#5a1a75] border-[#5a1a75] text-white hover:bg-[#FE871F] hover:text-[#43005F] text-sm h-9"
          size="sm"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - mobile: full-width overlay, desktop: fixed 260px */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-[#43005F] border-r border-[#5a1a75] flex flex-col transition-transform duration-300 ease-in-out
        w-full sm:w-72 lg:w-[260px]
        lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile close button */}
        <button 
          className="absolute top-5 right-5 p-2 rounded-lg text-orange-200 hover:text-white hover:bg-[#5a1a75] lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-w-0 bg-white">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-primary border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-gray-100" />
            </button>
            <span className="text-sm font-medium text-background lg:hidden">Nutrihealth</span>
          </div>
          <div className="text-sm text-gray-400 hidden sm:block">
            Welcome back, <span className="font-medium text-gray-300">{user?.first_name}</span>
          </div>
        </div>
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
