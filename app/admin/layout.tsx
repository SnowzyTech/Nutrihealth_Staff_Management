'use client';

import React, { useEffect, useState } from "react"
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, FileText, BookOpen, Settings, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Toaster } from 'sonner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Prevent body scroll in admin layout to avoid double scrollbar / whitespace
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/login');
          return;
        }

        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!userData || userData.role !== 'admin') {
          router.push('/dashboard');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Admin verification error:', error);
        router.push('/auth/login');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAdmin();
  }, [router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/auth/login';
    }
  };

  if (isVerifying) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const adminNavItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/staff', label: 'Staff Management', icon: Users },
    { href: '/admin/submissions', label: 'Submissions', icon: FileText },
    { href: '/admin/documents', label: 'Documents', icon: FileText },
    { href: '/admin/training', label: 'Training', icon: BookOpen },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-slate-50 tracking-tight">Admin Panel</h1>
        <p className="text-sm text-slate-400 mt-1">Nutrihealth Consult</p>
      </div>

      <nav className="p-4 flex-1 space-y-2">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                active
                  ? 'bg-slate-800 text-slate-50 border-l-4 border-blue-500'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-50'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="w-full flex items-center gap-2 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-50 text-sm"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - desktop: always visible, mobile: slide-in overlay */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 text-white flex flex-col transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile close button */}
        <button 
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-w-0 bg-slate-900">
        {/* Top bar with hamburger - mobile only */}
        <div className="sticky top-0 z-30 bg-slate-950 border-b border-slate-800 px-4 py-4 flex items-center gap-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-slate-400" />
          </button>
          <h2 className="text-sm font-medium text-slate-200">Nutrihealth Admin</h2>
        </div>

        <div className="p-4 lg:p-8 min-h-full">
          {children}
        </div>
      </main>
      
      <Toaster richColors position="top-right" />
    </div>
  );
}
