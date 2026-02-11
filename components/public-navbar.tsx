'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/about', label: 'About' },
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="fixed top-0 w-full bg-white border-b border-slate-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-blue-600">
            Nutrihealth Consult
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-slate-600" />
            ) : (
              <Menu className="h-5 w-5 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Slide in from right, takes half screen width */}
      <div
        className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-1/2 bg-white border-l border-slate-200 shadow-xl transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col p-6 gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base font-medium py-2 border-b border-slate-100 transition-colors ${
                pathname === item.href
                  ? 'text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[-1] md:hidden top-16"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
}
