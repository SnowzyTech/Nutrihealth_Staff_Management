'use client';

import React from "react"

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useRouter } from 'next/navigation';
import { HANDBOOK_CHAPTERS, getAllTopics } from '@/lib/data/handbook-content';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  BookOpen, Search, ChevronRight, ChevronDown,
  Info, Heart, Handshake, Settings, Gift, Calendar, Shield, FileText,
  Bookmark, X,
} from 'lucide-react';
import Link from 'next/link';

const ICON_MAP: Record<string, React.ElementType> = {
  info: Info,
  heart: Heart,
  handshake: Handshake,
  settings: Settings,
  gift: Gift,
  calendar: Calendar,
  shield: Shield,
  'file-text': FileText,
};

function getBookmarks(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('handbook-bookmarks');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export default function HandbookPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  const allTopics = useMemo(() => getAllTopics(), []);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return allTopics.filter(
      (t) =>
        t.topicTitle.toLowerCase().includes(term) ||
        t.sectionTitle.toLowerCase().includes(term) ||
        t.chapterTitle.toLowerCase().includes(term) ||
        t.content.toLowerCase().includes(term)
    );
  }, [searchTerm, allTopics]);

  const toggleChapter = (id: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const highlightMatch = (text: string, term: string) => {
    if (!term.trim()) return text;
    const idx = text.toLowerCase().indexOf(term.toLowerCase());
    if (idx === -1) return text;
    const start = Math.max(0, idx - 60);
    const end = Math.min(text.length, idx + term.length + 60);
    const snippet = (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
    return snippet;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-blue-600" />
          <p className="text-sm text-slate-500">Loading handbook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-50">Staff Handbook</h1>
            <p className="text-slate-400 text-xs sm:text-sm">Nutrihealth Consult Employee Handbook</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card className="bg-slate-800 border-slate-700 shadow-xl">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                type="text"
                placeholder="Search handbook..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowBookmarksOnly(false);
                }}
                className="pl-10 bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-500 text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant={showBookmarksOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setShowBookmarksOnly(!showBookmarksOnly);
                setSearchTerm('');
              }}
              className={showBookmarksOnly
                ? 'bg-amber-600 hover:bg-amber-700 text-white h-9 text-xs sm:text-sm'
                : 'bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 h-9 text-xs sm:text-sm'}
            >
              <Bookmark className="h-3.5 w-3.5 mr-1.5" />
              Bookmarks
              {bookmarks.length > 0 && (
                <Badge className="ml-1.5 bg-amber-500/20 text-amber-300 border-0 text-[10px] px-1.5">
                  {bookmarks.length}
                </Badge>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchTerm.trim() && (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &ldquo;{searchTerm}&rdquo;
          </p>
          {searchResults.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="py-12 text-center">
                <Search className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-300 font-medium">No results found</p>
                <p className="text-slate-500 text-sm mt-1">Try different keywords</p>
              </CardContent>
            </Card>
          ) : (
            searchResults.map((result) => (
              <Link
                key={`${result.chapterId}-${result.sectionId}-${result.topicId}`}
                href={`/dashboard/handbook/${result.chapterId}?section=${result.sectionId}`}
              >
                <Card className="bg-slate-800 border-slate-700 hover:border-amber-500/40 transition-colors cursor-pointer mb-2">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-50">{result.sectionTitle}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Section {result.sectionNumber} &middot; {result.chapterTitle}
                        </p>
                        <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                          {highlightMatch(result.content, searchTerm)}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Bookmarks View */}
      {showBookmarksOnly && !searchTerm.trim() && (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">
            {bookmarks.length} bookmarked section{bookmarks.length !== 1 ? 's' : ''}
          </p>
          {bookmarks.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="py-12 text-center">
                <Bookmark className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-300 font-medium">No bookmarks yet</p>
                <p className="text-slate-500 text-sm mt-1">Open a chapter and bookmark sections you want to revisit</p>
              </CardContent>
            </Card>
          ) : (
            bookmarks.map((bm) => {
              const [chapterId, sectionId] = bm.split('::');
              const chapter = HANDBOOK_CHAPTERS.find((c) => c.id === chapterId);
              const section = chapter?.sections.find((s) => s.id === sectionId);
              if (!chapter || !section) return null;
              return (
                <Link
                  key={bm}
                  href={`/dashboard/handbook/${chapterId}?section=${sectionId}`}
                >
                  <Card className="bg-slate-800 border-slate-700 hover:border-amber-500/40 transition-colors cursor-pointer mb-2">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-3">
                        <Bookmark className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0 fill-amber-400" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-50">{section.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Section {section.number} &middot; {chapter.title}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      )}

      {/* Table of Contents */}
      {!searchTerm.trim() && !showBookmarksOnly && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Table of Contents</h2>
            <Badge variant="outline" className="bg-transparent text-slate-500 border-slate-600 text-xs">
              {HANDBOOK_CHAPTERS.length} chapters
            </Badge>
          </div>

          {HANDBOOK_CHAPTERS.map((chapter) => {
            const Icon = ICON_MAP[chapter.icon] || BookOpen;
            const isExpanded = expandedChapters.has(chapter.id);

            return (
              <Card
                key={chapter.id}
                className="bg-slate-800 border-slate-700 shadow-lg overflow-hidden"
              >
                {/* Chapter header - clickable to expand */}
                <button
                  onClick={() => toggleChapter(chapter.id)}
                  className="w-full text-left"
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-amber-600/15 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {chapter.number !== "0" && (
                            <span className="text-[10px] sm:text-xs font-mono text-amber-500/70">
                              {chapter.number}
                            </span>
                          )}
                          <h3 className="text-sm sm:text-base font-semibold text-slate-50 truncate">
                            {chapter.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate hidden sm:block">
                          {chapter.description}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 sm:hidden">
                          {chapter.sections.length} section{chapter.sections.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="bg-transparent text-slate-500 border-slate-600 text-[10px] hidden sm:inline-flex">
                          {chapter.sections.length} sections
                        </Badge>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </button>

                {/* Expanded sections list */}
                {isExpanded && (
                  <div className="border-t border-slate-700 bg-slate-800/50">
                    {chapter.sections.map((section, idx) => {
                      const isBookmarked = bookmarks.includes(`${chapter.id}::${section.id}`);
                      return (
                        <Link
                          key={section.id}
                          href={`/dashboard/handbook/${chapter.id}?section=${section.id}`}
                        >
                          <div
                            className={`flex items-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3 hover:bg-slate-700/50 transition-colors cursor-pointer group ${
                              idx < chapter.sections.length - 1 ? 'border-b border-slate-700/50' : ''
                            }`}
                          >
                            <span className="text-[10px] sm:text-xs font-mono text-slate-500 w-6 sm:w-8 text-right flex-shrink-0">
                              {section.number}
                            </span>
                            <span className="text-xs sm:text-sm text-slate-300 group-hover:text-slate-50 transition-colors flex-1 min-w-0 truncate">
                              {section.title}
                            </span>
                            {isBookmarked && (
                              <Bookmark className="h-3 w-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                            )}
                            <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
