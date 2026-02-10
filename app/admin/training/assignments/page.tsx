'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Loader2, Users, Calendar, Clock, Trash2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { getTrainingAssignments, removeAssignment } from '@/app/actions/training-admin';
import { toast } from 'sonner';

interface Assignment {
  id: string;
  module_id: string;
  user_id: string;
  department: string | null;
  assignment_type: string;
  deadline: string | null;
  is_mandatory: boolean;
  notes: string | null;
  assigned_at: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    department: string | null;
  } | null;
  module: {
    id: string;
    title: string;
  } | null;
}

export default function AdminAssignmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }
    if (user && user.role === 'admin') {
      fetchAssignments();
    } else if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const fetchAssignments = async () => {
    try {
      const result = await getTrainingAssignments();
      if (result.success) {
        setAssignments(result.data || []);
      } else {
        toast.error(result.error || 'Failed to fetch assignments');
      }
    } catch {
      toast.error('Failed to fetch assignments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (assignmentId: string) => {
    setRemovingId(assignmentId);
    try {
      const result = await removeAssignment(assignmentId);
      if (result.success) {
        toast.success('Assignment removed');
        setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
      } else {
        toast.error(result.error || 'Failed to remove');
      }
    } catch {
      toast.error('Failed to remove assignment');
    } finally {
      setRemovingId(null);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    const name = a.user ? `${a.user.first_name} ${a.user.last_name}`.toLowerCase() : '';
    const moduleTitle = a.module?.title?.toLowerCase() || '';
    const term = searchTerm.toLowerCase();
    return name.includes(term) || moduleTitle.includes(term);
  });

  const isOverdue = (deadline: string | null) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-blue-600" />
          <p className="text-sm text-slate-500">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <Link href="/admin/training" className="flex-shrink-0 mt-1">
            <Button variant="outline" size="sm" className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-50">Training Assignments</h1>
            <p className="text-slate-400 mt-1 text-xs sm:text-sm">{assignments.length} total assignments</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAssignments}
            className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 flex-shrink-0 h-8 text-xs sm:text-sm"
          >
            <RefreshCw className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="border-slate-700 bg-slate-800 shadow-xl">
        <CardContent className="p-3 sm:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search by staff name or module..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-600 bg-slate-700 text-slate-50 placeholder:text-slate-400 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <Card className="border-slate-700 bg-slate-800 shadow-xl">
          <CardContent className="py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-slate-500" />
            </div>
            <p className="text-slate-50 font-medium">No assignments found</p>
            <p className="text-slate-400 text-sm mt-1">Assign training modules to staff from the training page.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="border-slate-700 bg-slate-800 shadow-lg overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1">
                      <p className="font-medium text-slate-50 text-sm sm:text-base truncate max-w-[140px] sm:max-w-none">
                        {assignment.user
                          ? `${assignment.user.first_name} ${assignment.user.last_name}`
                          : 'Unknown User'}
                      </p>
                      {assignment.is_mandatory && (
                        <Badge className="bg-red-900/30 text-red-400 border-red-700 text-[10px] sm:text-xs px-1.5">Required</Badge>
                      )}
                      {assignment.deadline && isOverdue(assignment.deadline) && (
                        <Badge className="bg-orange-900/30 text-orange-400 border-orange-700 text-[10px] sm:text-xs px-1.5">Overdue</Badge>
                      )}
                      <Badge variant="outline" className="bg-slate-700 text-slate-300 border-slate-600 text-[10px] sm:text-xs px-1.5">
                        {assignment.assignment_type}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400 truncate">
                      {assignment.module?.title || 'Unknown Module'}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] sm:text-xs text-slate-500">
                      {assignment.user?.email && (
                        <span className="truncate max-w-[150px] sm:max-w-none">{assignment.user.email}</span>
                      )}
                      {assignment.deadline && (
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          Due: {new Date(assignment.deadline).toLocaleDateString()}
                        </span>
                      )}
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        {new Date(assignment.assigned_at).toLocaleDateString()}
                      </span>
                    </div>
                    {assignment.notes && (
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-1 italic truncate">{assignment.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-red-800 text-red-400 hover:bg-red-900/30 flex-shrink-0 h-8 w-8 p-0"
                    onClick={() => handleRemove(assignment.id)}
                    disabled={removingId === assignment.id}
                  >
                    {removingId === assignment.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
