'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { getChapterById, HANDBOOK_CHAPTERS } from '@/lib/data/handbook-content';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, ArrowLeft, ChevronRight, ChevronLeft, ChevronUp,
  Bookmark, List, X,
} from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function getBookmarks(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('handbook-bookmarks');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setBookmarksStorage(bookmarks: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('handbook-bookmarks', JSON.stringify(bookmarks));
}

function ChapterContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const chapterId = params.id as string;
  const targetSection = searchParams.get('section');

  const chapter = getChapterById(chapterId);
  const [activeSection, setActiveSection] = useState<string>(targetSection || '');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [showToc, setShowToc] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  // Scroll to target section on load
  useEffect(() => {
    if (targetSection && sectionRefs.current[targetSection]) {
      setTimeout(() => {
        sectionRefs.current[targetSection]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [targetSection]);

  // Track scroll position for active section and show/hide scroll-to-top
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      if (!chapter) return;
      const offset = 120;
      for (let i = chapter.sections.length - 1; i >= 0; i--) {
        const section = chapter.sections[i];
        const el = sectionRefs.current[section.id];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset) {
            setActiveSection(section.id);
            return;
          }
        }
      }
      if (chapter.sections.length > 0) {
        setActiveSection(chapter.sections[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [chapter]);

  const toggleBookmark = useCallback((sectionId: string) => {
    const key = `${chapterId}::${sectionId}`;
    setBookmarks((prev) => {
      const next = prev.includes(key)
        ? prev.filter((b) => b !== key)
        : [...prev, key];
      setBookmarksStorage(next);
      return next;
    });
  }, [chapterId]);

  const scrollToSection = (sectionId: string) => {
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setShowToc(false);
  };

  // Find prev/next chapters
  const chapterIndex = HANDBOOK_CHAPTERS.findIndex((c) => c.id === chapterId);
  const prevChapter = chapterIndex > 0 ? HANDBOOK_CHAPTERS[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < HANDBOOK_CHAPTERS.length - 1 ? HANDBOOK_CHAPTERS[chapterIndex + 1] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/handbook" className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300">
          <ArrowLeft className="h-4 w-4" />
          Back to Handbook
        </Link>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-16 text-center">
            <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-medium">Chapter not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Mobile TOC overlay */}
      {showToc && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowToc(false)}
          />
          <div className="fixed inset-y-0 right-0 w-72 sm:w-80 bg-slate-900 border-l border-slate-700 z-50 lg:hidden overflow-y-auto">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-50">Sections</h3>
              <button onClick={() => setShowToc(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-2">
              {chapter.sections.map((section) => {
                const isBookmarked = bookmarks.includes(`${chapterId}::${section.id}`);
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                      activeSection === section.id
                        ? 'bg-amber-600/20 text-amber-300'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-mono text-[10px] text-slate-500 w-6 flex-shrink-0">{section.number}</span>
                    <span className="flex-1 truncate">{section.title}</span>
                    {isBookmarked && <Bookmark className="h-2.5 w-2.5 text-amber-400 fill-amber-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </>
      )}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm -mx-4 lg:-mx-8 px-4 lg:px-8 py-3 border-b border-gray-200 mb-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/dashboard/handbook">
              <Button variant="outline" size="sm" className="bg-white border-gray-200 text-[#43005F] hover:bg-gray-100 hover:text-[#320044] h-8 w-8 p-0 flex-shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                {chapter.number !== "0" && (
                  <span className="text-[10px] font-mono text-[#FE871F]/70">Ch.{chapter.number}</span>
                )}
                <h1 className="text-sm sm:text-base font-semibold text-[#43005F] truncate">{chapter.title}</h1>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowToc(true)}
            className="bg-primary border-gray-200 cursor-pointer text-slate-100 hover:text-slate-300 hover:bg-primary/90 h-8 text-xs lg:hidden flex-shrink-0"
          >
            <List className="h-3.5 w-3.5 mr-1" />
            Sections
          </Button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* Chapter intro */}
          <div className="mb-8">
            <Badge variant="outline" className="bg-transparent text-amber-400 border-amber-500/30 text-xs mb-3">
              {chapter.number !== "0" ? `Section ${chapter.number}` : 'Preamble'}
            </Badge>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{chapter.title}</h2>
            <p className="text-sm text-slate-700">{chapter.description}</p>
          </div>

          {/* Sections */}
          {chapter.sections.map((section) => {
            const isBookmarked = bookmarks.includes(`${chapterId}::${section.id}`);
            return (
              <div
                key={section.id}
                ref={(el) => { sectionRefs.current[section.id] = el; }}
                className="scroll-mt-20"
              >
                <Card className="bg-white border-gray-200 shadow-lg overflow-hidden">
                  {/* Section header */}
                  <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-mono text-[#FE871F]/70 flex-shrink-0">{section.number}</span>
                      <h3 className="text-sm sm:text-base font-semibold text-[#43005F] truncate">{section.title}</h3>
                    </div>
                    <button
                      onClick={() => toggleBookmark(section.id)}
                      className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${
                        isBookmarked
                          ? 'text-[#FE871F] hover:text-[#E67E1B]'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this section'}
                    >
                      <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-[#FE871F]' : ''}`} />
                    </button>
                  </div>

                  {/* Section content */}
                  <CardContent className="p-4 sm:p-6">
                    {section.topics.map((topic) => (
                      <div key={topic.id} className="prose prose-sm max-w-none">
                        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {topic.content}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            );
          })}

          {/* Chapter navigation */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 pb-8">
            {prevChapter ? (
              <Link href={`/dashboard/handbook/${prevChapter.id}`} className="flex-1">
                <Card className="bg-white border-gray-200 hover:border-[#FE871F]/30 transition-colors cursor-pointer h-full">
                  <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                    <ChevronLeft className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider">Previous</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{prevChapter.title}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ) : <div className="flex-1" />}
            {nextChapter ? (
              <Link href={`/dashboard/handbook/${nextChapter.id}`} className="flex-1">
                <Card className="bg-white border-gray-200 hover:border-[#FE871F]/30 transition-colors cursor-pointer h-full">
                  <CardContent className="p-3 sm:p-4 flex items-center justify-end gap-3">
                    <div className="min-w-0 text-right">
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider">Next</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{nextChapter.title}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ) : <div className="flex-1" />}
          </div>
        </div>

        {/* Desktop sidebar TOC */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-20">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">In this chapter</h4>
            <nav className="space-y-0.5">
              {chapter.sections.map((section) => {
                const isBookmarked = bookmarks.includes(`${chapterId}::${section.id}`);
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors ${
                      activeSection === section.id
                        ? 'bg-amber-600/15 text-amber-300 border-l-2 border-amber-400'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border-l-2 border-transparent'
                    }`}
                  >
                    <span className="flex-1 truncate">{section.title}</span>
                    {isBookmarked && <Bookmark className="h-2.5 w-2.5 text-amber-400 fill-amber-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>
      </div>

      {/* Scroll to top FAB */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 h-10 w-10 rounded-full bg-[#43005F] border border-[#43005F] text-white hover:bg-[#320044] shadow-lg flex items-center justify-center z-30 transition-colors"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export default function HandbookChapterPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-blue-600" />
      </div>
    }>
      <ChapterContent />
    </Suspense>
  );
}
