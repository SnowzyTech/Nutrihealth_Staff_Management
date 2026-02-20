'use client';

import React, { useEffect, useState } from "react"
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, FileText, BookOpen, Settings, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/context/auth-context';
import { Toaster } from 'sonner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
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
    if (loading) {
      console.log('[v0] Admin layout: Still loading auth');
      return;
    }

    console.log('[v0] Admin layout: Auth loaded, user:', user?.email);

    if (!user) {
      console.log('[v0] Admin layout: No user, redirecting to login');
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'admin') {
      console.log('[v0] Admin layout: User is not admin, role:', user.role);
      router.push('/dashboard');
      return;
    }

    console.log('[v0] Admin layout: User is admin, rendering');
  }, [user, loading, router]);

  // Close sidebar on route change (mobile)
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
      router.push('/auth/login');
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-3 text-sm font-medium text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
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
      <div className="p-6 border-b border-[#5a1a75]">
        <h1 className="text-xl font-bold text-white tracking-tight">Admin Panel</h1>
        <p className="text-sm text-orange-200 mt-1">Nutrihealth Consult</p>
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
                  ? 'bg-[#5a1a75] text-white border-l-4 border-[#FE871F]'
                  : 'text-orange-100 hover:bg-[#5a1a75] hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#5a1a75]">
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="w-full flex items-center gap-2 bg-[#5a1a75] border-[#5a1a75] text-white hover:bg-[#FE871F] hover:text-[#43005F] text-sm"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - desktop: always visible, mobile: slide-in overlay */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#43005F] text-white flex flex-col transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile close button */}
        <button 
          className="absolute top-4 right-4 p-1 text-orange-200 hover:text-white lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-w-0 bg-white">
        {/* Top bar with hamburger - mobile only */}
        <div className="sticky top-0 z-30 bg-primary border-b border-gray-200 px-4 py-4 flex items-center gap-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-gray-200" />
          </button>
          <h2 className="text-sm font-medium text-gray-100">Nutrihealth Admin</h2>
        </div>

        <div className="p-4 lg:p-8 min-h-full">
          {children}
        </div>
      </main>
      
      <Toaster richColors position="top-right" />
    </div>
  );
}
