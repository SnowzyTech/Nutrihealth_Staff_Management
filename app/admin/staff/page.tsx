'use client';

import React from "react"
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Briefcase,
  Loader2,
  CheckCircle,
  UserX,
  MoreVertical,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Shield,
} from 'lucide-react';
import { createStaffMember, deactivateStaff } from '@/app/actions/user';
import { toast } from 'sonner';

// Department → Positions mapping
const DEPARTMENT_POSITIONS: Record<string, string[]> = {
  'Executive / Management': ['CEO', 'General Manager (GM)', 'Managing Director (MD)'],
  'HR': ['Human Resource Officer', 'HR Manager', 'HR Assistant'],
  'Finance': ['Head of Finance', 'Senior Accountant', 'Accountant', 'Data Analyst'],
  'Media Department': ['Creative Director', 'Team Lead', 'Video Editor', 'Media Buyer', 'Social Media Manager', 'Content Creator', 'Videographer', 'Creative Graphic Designer'],
  'Sales': ['Team Lead', 'Sales Representative'],
  'Logistics': ['Logistics Manager', 'Field Logistics Officer', 'Inventory Officer', 'Store Keeper'],
  'Operations / Facilities': ['Cleaner'],
};

const DEPARTMENTS = Object.keys(DEPARTMENT_POSITIONS);

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department: string;
  position: string;
  phone: string;
  date_of_hire: string;
  is_active: boolean;
  created_at: string;
  avatar_url?: string;
  employee_id?: string;
}

export default function AdminStaffPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [staff, setStaff] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedStaffForView, setSelectedStaffForView] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    employeeId: '',
    department: '',
    position: '',
    startDate: '',
    role: 'staff' as 'staff' | 'manager' | 'admin',
    phone: '',
    sendEmail: true,
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && user.role === 'admin') {
      fetchStaffData();
    } else if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const fetchStaffData = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      setStaff(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      employeeId: '',
      department: '',
      position: '',
      startDate: '',
      role: 'staff',
      phone: '',
      sendEmail: true,
    });
    setFormError('');
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (!formData.firstName || !formData.lastName || !formData.email ||
        !formData.employeeId || !formData.department || !formData.position || !formData.startDate) {
        setFormError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      const result = await createStaffMember({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        employeeId: formData.employeeId,
        department: formData.department,
        position: formData.position,
        startDate: new Date(formData.startDate),
        role: formData.role,
        phone: formData.phone || undefined,
        isActive: true,
        sendEmail: formData.sendEmail,
      });

      if (!result.success) {
        setFormError(result.error || 'Failed to create staff member');
        setIsSubmitting(false);
        return;
      }

      toast.success(result.message || 'Staff member created successfully');

      if (result.temporaryPassword) {
        toast.info(`Temporary password: ${result.temporaryPassword}`, { duration: 60000 });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchStaffData();
    } catch (error) {
      console.error('Error creating staff:', error);
      setFormError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivateStaff = async (userId: string, staffName: string) => {
    if (!confirm(`Are you sure you want to deactivate ${staffName}?`)) {
      return;
    }

    try {
      const result = await deactivateStaff(userId);
      if (result.success) {
        toast.success('Staff member deactivated');
        fetchStaffData();
      } else {
        toast.error(result.error || 'Failed to deactivate staff member');
      }
    } catch {
      toast.error('An unexpected error occurred');
    }
  };

  const filteredStaff = staff.filter((s) => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      fullName.includes(term) ||
      s.email.toLowerCase().includes(term) ||
      s.department?.toLowerCase().includes(term);
    const matchesDepartment =
      departmentFilter === 'all' || s.department === departmentFilter;
    const matchesRole =
      roleFilter === 'all' || s.role === roleFilter;
    return matchesSearch && matchesDepartment && matchesRole;
  });

  const totalPages = Math.ceil(filteredStaff.length / ITEMS_PER_PAGE);
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, roleFilter]);

  const activeStaff = staff.filter((s) => s.is_active).length;
  const inactiveStaff = staff.filter((s) => !s.is_active).length;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-72 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-40 bg-slate-200 rounded animate-pulse" />
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                    <div className="h-8 w-12 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="h-12 w-12 rounded-full bg-slate-200 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Table skeleton */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="h-6 w-16 bg-slate-200 rounded animate-pulse" />
                <div className="h-6 w-16 bg-slate-200 rounded animate-pulse" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Access Denied</h3>
            <p className="text-slate-600">This page is restricted to administrators only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl mt-4 font-bold text-primary tracking-tight">
            Staff Management
          </h1>
          <p className="text-slate-700 mt-1">
            Manage staff accounts and permissions
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-secondary mt-4 cursor-pointer hover:bg-orange-800 text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Staff Member
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-xl shadow-blue-900/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 uppercase tracking-wide">
                  Total Staff
                </p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  {staff.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center ring-4 ring-blue-50">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-xl shadow-green-900/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 uppercase tracking-wide">
                  Active
                </p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  {activeStaff}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center ring-4 ring-green-50">
                <CheckCircle className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-xl shadow-gray-900/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                  Inactive
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {inactiveStaff}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center ring-4 ring-gray-50">
                <UserX className="h-6 w-6 text-gray-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="border-gray-200 bg-white shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#43005F] focus:ring-2 focus:ring-[#43005F]/20"
                />
              </div>
            </div>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-52 border-gray-300 bg-white text-gray-900">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                <SelectItem value="all" className="text-gray-900">All Departments</SelectItem>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept} className="text-gray-900">
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-40 border-gray-300 bg-white text-gray-900">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                <SelectItem value="all" className="text-gray-900">All Roles</SelectItem>
                <SelectItem value="admin" className="text-gray-900">Admin</SelectItem>
                <SelectItem value="manager" className="text-gray-900">Manager</SelectItem>
                <SelectItem value="staff" className="text-gray-900">Staff</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={fetchStaffData}
              disabled={isLoading}
              className="border-gray-300 bg-white text-gray-600 hover:bg-gray-100 shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh staff list</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table - Desktop */}
      {filteredStaff.length === 0 ? (
        <Card className="border-gray-200 bg-white shadow-xl">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No staff members found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || departmentFilter !== 'all' || roleFilter !== 'all'
                  ? 'Try adjusting your filters or search term'
                  : 'Get started by creating your first staff member'}
              </p>
              {!searchTerm && departmentFilter === 'all' && roleFilter === 'all' && (
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-[#43005F] hover:bg-[#320044] text-white gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Staff Member
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="border-gray-200 bg-white shadow-xl hidden md:block">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary border-b border-primary/90">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">
                        Staff Member
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">
                        Hire Date
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-200 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {paginatedStaff.map((staffMember) => (
                      <tr key={staffMember.id} className="hover:bg-slate-750 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={staffMember.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback className="bg-blue-900 text-blue-200 font-semibold text-sm">
                                {staffMember.first_name?.[0]}{staffMember.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-primary">
                                {staffMember.first_name} {staffMember.last_name}
                              </p>
                              <p className="text-sm text-slate-600">
                                {staffMember.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-70">{staffMember.department || 'N/A'}</p>
                          <p className="text-xs text-slate-600">{staffMember.position || ''}</p>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`${getRoleColor(staffMember.role)} capitalize`}>
                            {staffMember.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {staffMember.is_active ? (
                            <Badge className="bg-green-200 text-green-800 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-600 border-slate-200">
                              <UserX className="h-3 w-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-800">
                          {staffMember.date_of_hire
                            ? new Date(staffMember.date_of_hire).toLocaleDateString()
                            : '--'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-600 cursor-pointer">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedStaffForView(staffMember);
                                  setViewDetailsOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {staffMember.is_active && staffMember.id !== user?.id && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeactivateStaff(
                                        staffMember.id,
                                        `${staffMember.first_name} ${staffMember.last_name}`
                                      )
                                    }
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {paginatedStaff.map((staffMember) => (
              <Card key={staffMember.id} className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={staffMember.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                        {staffMember.first_name?.[0]}{staffMember.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {staffMember.first_name} {staffMember.last_name}
                        </h3>
                        {staffMember.is_active ? (
                          <Badge className="bg-green-100 text-green-700 text-xs border-green-200">Active</Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-600 text-xs border-slate-200">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mb-2 truncate">{staffMember.email}</p>
                      <div className="flex flex-wrap gap-2 text-xs mb-3">
                        <Badge variant="outline" className="border-slate-300 text-slate-600">
                          {staffMember.department || 'N/A'}
                        </Badge>
                        <Badge className={`${getRoleColor(staffMember.role)} capitalize`}>
                          {staffMember.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-transparent border-slate-300 text-sm"
                          onClick={() => {
                            setSelectedStaffForView(staffMember);
                            setViewDetailsOpen(true);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                        {staffMember.is_active && staffMember.id !== user?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent border-slate-300 text-sm"
                            onClick={() =>
                              handleDeactivateStaff(
                                staffMember.id,
                                `${staffMember.first_name} ${staffMember.last_name}`
                              )
                            }
                          >
                            <UserX className="h-3.5 w-3.5 mr-1" />
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-600">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredStaff.length)} of{' '}
                {filteredStaff.length} staff members
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-slate-300 bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={
                        page === currentPage
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'border-slate-300 bg-transparent'
                      }
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-slate-300 bg-transparent"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Staff Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Create New Staff Member
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Add a new staff member to the platform. They will receive a welcome email with login credentials.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateStaff} className="space-y-6">
            {formError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                {formError}
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-700">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="border-slate-300"
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-700">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="border-slate-300"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-slate-300"
                  placeholder="john.doe@nutrihealth.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="border-slate-300"
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>

            {/* Employment Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Employment Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="text-slate-700">Employee ID *</Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="border-slate-300"
                    placeholder="EMP-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-slate-700">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value, position: '' })}
                  >
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position" className="text-slate-700">Position *</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => setFormData({ ...formData, position: value })}
                    disabled={!formData.department}
                  >
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder={formData.department ? 'Select position' : 'Select department first'} />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.department && DEPARTMENT_POSITIONS[formData.department]?.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-slate-700">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: 'staff' | 'manager' | 'admin') =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-slate-700">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="border-slate-300"
                  required
                />
              </div>
            </div>

            {/* Email Options */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendEmail"
                checked={formData.sendEmail}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, sendEmail: checked as boolean })
                }
              />
              <Label htmlFor="sendEmail" className="text-sm font-medium text-slate-700 cursor-pointer">
                Send welcome email with login credentials
              </Label>
            </div>

            {/* Action Buttons */}
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
                disabled={isSubmitting}
                className="border-slate-300 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Staff Member
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Staff Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Staff Member Details
            </DialogTitle>
          </DialogHeader>
          {selectedStaffForView && (
            <div className="space-y-6">
              {/* Profile header */}
              <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedStaffForView.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-lg">
                    {selectedStaffForView.first_name?.[0]}{selectedStaffForView.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {selectedStaffForView.first_name} {selectedStaffForView.last_name}
                  </h3>
                  <p className="text-slate-500">{selectedStaffForView.position || selectedStaffForView.department || 'Staff'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`${getRoleColor(selectedStaffForView.role)} capitalize`}>
                      {selectedStaffForView.role}
                    </Badge>
                    {selectedStaffForView.is_active ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-600 border-slate-200">Inactive</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Detail grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="text-slate-900 break-all">{selectedStaffForView.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </p>
                  <p className="text-slate-900">{selectedStaffForView.phone || '--'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Department
                  </p>
                  <p className="text-slate-900">{selectedStaffForView.department || '--'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Position
                  </p>
                  <p className="text-slate-900">{selectedStaffForView.position || '--'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Employee ID
                  </p>
                  <p className="text-slate-900">{selectedStaffForView.employee_id || '--'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Hire Date
                  </p>
                  <p className="text-slate-900">
                    {selectedStaffForView.date_of_hire
                      ? new Date(selectedStaffForView.date_of_hire).toLocaleDateString()
                      : '--'}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDetailsOpen(false)}
              className="border-slate-300 bg-transparent"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
