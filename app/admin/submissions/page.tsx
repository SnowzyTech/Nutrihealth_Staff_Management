'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  CheckCircle2,
  Clock,
  ChevronRight,
  Calendar,
  Search,
  BookOpen,
  ClipboardList,
  FolderOpen,
  XCircle,
  Inbox,
  RefreshCw,
  ChevronLeft,
} from 'lucide-react';
import { getAllSubmissions } from '@/app/actions/documents';
import { getAllStaff } from '@/app/actions/user';
import { toast } from 'sonner';

interface Submission {
  id: string;
  user_id: string;
  document_id: string;
  completed_at: string;
  notes: string | null;
  status: 'submitted' | 'approved' | 'rejected' | null;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    department?: string;
  } | null;
  document: {
    id: string;
    title: string;
    description: string;
    document_type: string;
  } | null;
}

type DocumentTypeFilter = 'all' | 'onboarding' | 'handbook' | 'hr_records';
type StatusFilter = 'all' | 'submitted' | 'approved' | 'rejected';

const ALL_DEPARTMENTS = [
  'Executive / Management',
  'HR',
  'Finance',
  'Media Department',
  'Sales',
  'Logistics',
  'Operations / Facilities',
];

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [allStaffMembers, setAllStaffMembers] = useState<{ id: string; name: string; department: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [documentTypeFilter, setDocumentTypeFilter] = useState<DocumentTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const [submissionsResult, staffResult] = await Promise.all([
        getAllSubmissions(),
        getAllStaff(),
      ]);

      if (!submissionsResult.success) {
        console.error('Fetch submissions error:', submissionsResult.error);
        toast.error('Failed to load submissions');
        return;
      }

      const staffMap = new Map<string, { first_name: string; last_name: string; email: string; department: string }>();
      if (staffResult.success && staffResult.data) {
        for (const staff of staffResult.data) {
          staffMap.set(staff.id, {
            first_name: staff.first_name,
            last_name: staff.last_name,
            email: staff.email,
            department: staff.department || '',
          });
        }

        setAllStaffMembers(
          staffResult.data.map((s: { id: string; first_name: string; last_name: string; department?: string }) => ({
            id: s.id,
            name: `${s.first_name} ${s.last_name}`,
            department: s.department || '',
          })).sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name))
        );
      }

      const enrichedSubmissions = (submissionsResult.data as Submission[]).map((sub) => {
        const staffInfo = staffMap.get(sub.user_id);
        if (staffInfo && sub.user) {
          return {
            ...sub,
            user: {
              ...sub.user,
              department: sub.user.department || staffInfo.department,
            },
          };
        }
        return sub;
      });

      setSubmissions(enrichedSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('An error occurred while loading submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredSubmissions = () => {
    return submissions.filter((submission) => {
      if (documentTypeFilter !== 'all') {
        if (!submission.document || submission.document.document_type !== documentTypeFilter) {
          return false;
        }
      }
      if (statusFilter !== 'all') {
        if (submission.status !== statusFilter) {
          return false;
        }
      }
      if (staffFilter !== 'all') {
        if (submission.user_id !== staffFilter) {
          return false;
        }
      }
      if (departmentFilter !== 'all') {
        if (submission.user?.department !== departmentFilter) {
          return false;
        }
      }
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const userName = `${submission.user?.first_name || ''} ${submission.user?.last_name || ''}`.toLowerCase();
        const userEmail = submission.user?.email?.toLowerCase() || '';
        const docTitle = submission.document?.title?.toLowerCase() || '';
        const dept = submission.user?.department?.toLowerCase() || '';
        if (!userName.includes(search) && !userEmail.includes(search) && !docTitle.includes(search) && !dept.includes(search)) {
          return false;
        }
      }
      return true;
    });
  };

  const filteredSubmissions = getFilteredSubmissions();
  const totalPages = Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE);
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, documentTypeFilter, statusFilter, staffFilter, departmentFilter]);

  const getCountByType = (type: string) => {
    return submissions.filter(s => s.document?.document_type === type).length;
  };

  const getCountByStatus = (status: string) => {
    return submissions.filter(s => s.status === status).length;
  };

  const stats = {
    total: submissions.length,
    onboarding: getCountByType('onboarding'),
    handbook: getCountByType('handbook'),
    hr_records: getCountByType('hr_records'),
    pending: getCountByStatus('submitted'),
    approved: getCountByStatus('approved'),
    rejected: getCountByStatus('rejected'),
  };

  const hasActiveFilters = staffFilter !== 'all' || departmentFilter !== 'all' || documentTypeFilter !== 'all' || statusFilter !== 'all' || searchTerm;

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-700 border-0 flex w-fit items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700 border-0 flex w-fit items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      case 'submitted':
      default:
        return (
          <Badge className="bg-amber-100 text-amber-700 border-0 flex w-fit items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending Review
          </Badge>
        );
    }
  };

  const getDocumentTypeBadge = (type: string | undefined) => {
    switch (type) {
      case 'onboarding':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <ClipboardList className="h-3 w-3 mr-1" />
            Onboarding
          </Badge>
        );
      case 'handbook':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <BookOpen className="h-3 w-3 mr-1" />
            Handbook
          </Badge>
        );
      case 'hr_records':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <FolderOpen className="h-3 w-3 mr-1" />
            HR Records
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
            <FileText className="h-3 w-3 mr-1" />
            Other
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-50">Document Submissions</h1>
            {stats.pending > 0 && (
              <Badge className="bg-amber-900/30 text-amber-400 border-amber-700">
                {stats.pending} Pending
              </Badge>
            )}
          </div>
          <p className="text-slate-400 mt-1">Review and manage all staff document submissions</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchSubmissions}
          disabled={isLoading}
          className="bg-slate-400 self-start"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-700 bg-slate-800 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300 uppercase tracking-wide">Total</p>
                <p className="text-3xl font-bold text-slate-50 mt-1">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center">
                <Inbox className="h-6 w-6 text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-800 bg-gradient-to-br from-amber-950 to-amber-900 shadow-xl shadow-amber-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-200 uppercase tracking-wide">Pending</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-800/50 flex items-center justify-center ring-4 ring-amber-900/50">
                <Clock className="h-6 w-6 text-amber-200" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-800 bg-gradient-to-br from-green-950 to-green-900 shadow-xl shadow-green-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-200 uppercase tracking-wide">Approved</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.approved}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-800/50 flex items-center justify-center ring-4 ring-green-900/50">
                <CheckCircle2 className="h-6 w-6 text-green-200" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-800 bg-gradient-to-br from-red-950 to-red-900 shadow-xl shadow-red-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-200 uppercase tracking-wide">Rejected</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.rejected}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-800/50 flex items-center justify-center ring-4 ring-red-900/50">
                <XCircle className="h-6 w-6 text-red-200" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-slate-700 bg-slate-800 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search by name, email, or document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-600 bg-slate-700 text-slate-50 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <Select value={documentTypeFilter} onValueChange={(value) => setDocumentTypeFilter(value as DocumentTypeFilter)}>
              <SelectTrigger className="w-full lg:w-44 text-slate-200">
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="handbook">Handbook</SelectItem>
                <SelectItem value="hr_records">HR Records</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
              <SelectTrigger className="w-full lg:w-44 text-slate-300">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <Select value={staffFilter} onValueChange={setStaffFilter}>
              <SelectTrigger className="w-full md:w-56 text-slate-300 ">
                <SelectValue placeholder="Filter by Staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff Members</SelectItem>
                {allStaffMembers.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-56 text-slate-200">
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {ALL_DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                variant="outline"
                className="bg-slate-300"
                onClick={() => {
                  setStaffFilter('all');
                  setDepartmentFilter('all');
                  setDocumentTypeFilter('all');
                  setStatusFilter('all');
                  setSearchTerm('');
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card className="border-slate-700 bg-slate-800 shadow-xl">
        <CardHeader className="border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-slate-50">Submissions</CardTitle>
              <CardDescription className="text-slate-400">
                {filteredSubmissions.length !== submissions.length
                  ? `Showing ${filteredSubmissions.length} of ${submissions.length} submissions`
                  : `${submissions.length} total submissions`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-blue-600" />
                <p className="text-sm text-slate-500">Loading submissions...</p>
              </div>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-900 font-medium">No submissions found</p>
              <p className="text-slate-500 text-sm mt-1">
                {submissions.length === 0
                  ? 'Staff submissions will appear here once they submit documents'
                  : 'Try adjusting your filters to see more results'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-900/50  border-b border-slate-700">
                      <TableHead className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Staff Member</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Department</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Document</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Type</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Date</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-300 uppercase tracking-wide text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSubmissions.map((submission) => (
                      <TableRow key={submission.id} className="hover:bg-slate-750  border-b border-slate-700 transition-colors">
                        <TableCell>
                          <div className="pl-3 pt-1">
                            <p className="font-medium text-slate-50">
                              {submission.user?.first_name || 'Unknown'}{' '}
                              {submission.user?.last_name || 'User'}
                            </p>
                            <p className="text-sm text-slate-400">
                              {submission.user?.email || 'No email'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-300">
                            {submission.user?.department || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-300">
                              {submission.document?.title || 'Unknown Document'}
                            </p>
                            <p className="text-sm text-slate-500 line-clamp-1">
                              {submission.document?.description || 'No description'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getDocumentTypeBadge(submission.document?.document_type)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            {new Date(submission.completed_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(submission.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50" asChild>
                            <Link href={`/admin/submissions/${submission.id}`}>
                              <span>View</span>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {paginatedSubmissions.map((submission) => (
                  <Link key={submission.id} href={`/admin/submissions/${submission.id}`} className="block p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900">
                          {submission.user?.first_name || 'Unknown'} {submission.user?.last_name || 'User'}
                        </p>
                        <p className="text-sm text-slate-500 mt-0.5">{submission.document?.title || 'Unknown Document'}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {getDocumentTypeBadge(submission.document?.document_type)}
                          {getStatusBadge(submission.status)}
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(submission.completed_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                  <p className="text-sm text-slate-600">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredSubmissions.length)} of {filteredSubmissions.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="bg-transparent"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="px-3 py-1 text-sm font-medium text-slate-700">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="bg-transparent"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
