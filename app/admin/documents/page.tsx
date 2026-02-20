'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Plus, Search, Loader2, Upload, Users, UserPlus, Check, Edit2, X as XIcon, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import Link from 'next/link';
import { createDocument, getAllDocuments, assignDocumentToStaff, assignDocumentToAllStaff, getDocumentAssignments, createHRRecord, updateDocument, deleteDocument } from '@/app/actions/documents';
import { getAllStaff } from '@/app/actions/user';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

interface OnboardingDocument {
  id: string;
  title: string;
  description: string;
  content?: string;
  document_type: string;
  is_required: boolean;
  order_index: number;
  file_url: string | null;
  created_at: string;
  metadata?: {
    onboarding_subtype?: string;
  } | null;
}

export default function AdminDocumentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<OnboardingDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    document_type: 'onboarding' as 'onboarding' | 'handbook' | 'training' | 'policy' | 'hr_records' | 'other',
    is_required: true,
    onboarding_subtype: '' as '' | 'nda' | 'guarantor_form' | 'biodata' | 'contract_letter' | 'offer_letter',
    hr_subtype: '' as '' | 'promotion_letter' | 'query_letter' | 'warning_letter' | 'appraisal_report' | 'leave_record' | 'salary_information',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [assignToAllOnCreate, setAssignToAllOnCreate] = useState(true);
  const [selectedHRStaffId, setSelectedHRStaffId] = useState<string>('');
  const [selectedOnboardingStaffIds, setSelectedOnboardingStaffIds] = useState<string[]>([]);
  const [onboardingStaffSearch, setOnboardingStaffSearch] = useState('');
  
  // Assignment state
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<Array<{ id: string; first_name: string; last_name: string; email: string }>>([]);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [documentAssignments, setDocumentAssignments] = useState<Record<string, number>>({});

  // Edit state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    content: '',
    is_required: true,
  });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  
  // Pagination and filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [docTypeFilter, setDocTypeFilter] = useState<string>('all');
  const [requiredFilter, setRequiredFilter] = useState<string>('all');
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && user.role === 'admin') {
      fetchDocuments();
      fetchStaffList();
    } else if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const fetchStaffList = async () => {
    try {
      const result = await getAllStaff();
      if (result.success && result.data) {
        // Filter out admins
        const staff = result.data.filter((s: { role: string }) => s.role !== 'admin');
        setStaffList(staff);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const result = await getAllDocuments();
      if (result.success) {
        setDocuments(result.data || []);
      } else {
        toast.error(result.error || 'Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      document_type: 'onboarding',
      is_required: true,
      onboarding_subtype: '',
      hr_subtype: '',
    });
    setSelectedFile(null);
    setAssignToAllOnCreate(true);
    setSelectedHRStaffId('');
    setSelectedOnboardingStaffIds([]);
    setOnboardingStaffSearch('');
    setFormError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type (PDF only for onboarding documents)
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF document');
        return;
      }
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', '/documents');

      const response = await fetch('/api/uploads/documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (!formData.title || !formData.description) {
        setFormError('Please fill in the title and description');
        setIsSubmitting(false);
        return;
      }

      // Validate subtype selection for onboarding documents
      if (formData.document_type === 'onboarding' && !formData.onboarding_subtype) {
        setFormError('Please select an onboarding document type');
        setIsSubmitting(false);
        return;
      }

      // Validate staff selection for onboarding documents
      if (formData.document_type === 'onboarding' && selectedOnboardingStaffIds.length === 0) {
        setFormError('Please select at least one staff member to assign this onboarding document to');
        setIsSubmitting(false);
        return;
      }

      // Validate subtype and staff selection for HR records
      if (formData.document_type === 'hr_records') {
        if (!formData.hr_subtype) {
          setFormError('Please select an HR record type');
          setIsSubmitting(false);
          return;
        }
        if (!selectedHRStaffId) {
          setFormError('Please select a staff member for this HR record');
          setIsSubmitting(false);
          return;
        }
      }

      // Upload file if selected
      let fileUrl: string | undefined;
      if (selectedFile) {
        const uploadedUrl = await uploadFile(selectedFile);
        if (!uploadedUrl) {
          setFormError('Failed to upload file');
          setIsSubmitting(false);
          return;
        }
        fileUrl = uploadedUrl;
      }

      // Handle HR Records differently - they go to hr_records table
      if (formData.document_type === 'hr_records') {
        const result = await createHRRecord({
          title: formData.title,
          description: formData.description,
          content: formData.content,
          hrSubtype: formData.hr_subtype as 'promotion_letter' | 'query_letter' | 'warning_letter' | 'appraisal_report' | 'leave_record' | 'salary_information',
          fileUrl,
          staffId: selectedHRStaffId,
        });

        if (!result.success) {
          setFormError(result.error || 'Failed to create HR record');
          setIsSubmitting(false);
          return;
        }

        toast.success('HR record created and assigned to staff member');
        setIsDialogOpen(false);
        resetForm();
        await fetchDocuments();
        return;
      }

      // Regular document creation (onboarding, handbook, training, policy, other)
      const result = await createDocument({
        title: formData.title,
        description: formData.description,
        content: formData.content,
        documentType: formData.document_type,
        isRequired: formData.is_required,
        fileUrl,
        onboardingSubtype: formData.onboarding_subtype || undefined,
        hrSubtype: formData.hr_subtype || undefined,
      });

      if (!result.success) {
        setFormError(result.error || 'Failed to create document');
        setIsSubmitting(false);
        return;
      }

      // For onboarding documents: assign to selected staff members
      if (formData.document_type === 'onboarding' && selectedOnboardingStaffIds.length > 0 && result.data?.id) {
        let successCount = 0;
        for (const staffId of selectedOnboardingStaffIds) {
          const assignResult = await assignDocumentToStaff(result.data.id, staffId);
          if (assignResult.success) {
            successCount++;
          }
        }
        toast.success(`Document created and assigned to ${successCount} staff member(s)`);
      }
      // For other types: assign to all if checked
      else if (assignToAllOnCreate && result.data?.id) {
        const assignResult = await assignDocumentToAllStaff(result.data.id);
        if (assignResult.success) {
          toast.success(`Document created and assigned to ${assignResult.assignedCount || 'all'} staff member(s)`);
        } else {
          toast.success('Document created, but failed to assign to staff');
          toast.error(assignResult.error || 'Assignment failed');
        }
      } else {
        toast.success('Document created successfully. Remember to assign it to staff members.');
      }
      
      setIsDialogOpen(false);
      resetForm();
      await fetchDocuments();
    } catch (error) {
      console.error('Error adding document:', error);
      setFormError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = docTypeFilter === 'all' || doc.document_type === docTypeFilter;
    const matchesRequired = requiredFilter === 'all' || 
      (requiredFilter === 'required' && doc.is_required) ||
      (requiredFilter === 'optional' && !doc.is_required);
    return matchesSearch && matchesType && matchesRequired;
  });

  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, docTypeFilter, requiredFilter]);

  const openAssignDialog = async (documentId: string) => {
    setSelectedDocumentId(documentId);
    setSelectedStaffIds([]);
    setIsAssignDialogOpen(true);
    
    // Fetch current assignments for this document
    try {
      const result = await getDocumentAssignments(documentId);
      if (result.success && result.data) {
        const assignedIds = result.data.map((a: { user_id: string }) => a.user_id);
        setSelectedStaffIds(assignedIds);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handleAssignToSelected = async () => {
    if (!selectedDocumentId || selectedStaffIds.length === 0) {
      toast.error('Please select at least one staff member');
      return;
    }

    setIsAssigning(true);
    try {
      let successCount = 0;
      for (const staffId of selectedStaffIds) {
        const result = await assignDocumentToStaff(selectedDocumentId, staffId);
        if (result.success) {
          successCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Document assigned to ${successCount} staff member(s)`);
        setIsAssignDialogOpen(false);
        fetchDocuments();
      } else {
        toast.info('Document already assigned to selected staff members');
      }
    } catch (error) {
      console.error('Assignment error:', error);
      toast.error('Failed to assign document');
    } finally {
      setIsAssigning(false);
    }
  };

  const openEditDialog = (document: OnboardingDocument) => {
    setEditingDocumentId(document.id);
    setEditFormData({
      title: document.title,
      description: document.description,
      content: document.content || '',
      is_required: document.is_required,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDocumentId) return;

    setIsEditSubmitting(true);
    try {
      if (!editFormData.title || !editFormData.description) {
        toast.error('Please fill in the title and description');
        setIsEditSubmitting(false);
        return;
      }

      const result = await updateDocument({
        documentId: editingDocumentId,
        title: editFormData.title,
        description: editFormData.description,
        content: editFormData.content,
        isRequired: editFormData.is_required,
      });

      if (result.success) {
        toast.success('Document updated successfully');
        setIsEditDialogOpen(false);
        setEditingDocumentId(null);
        await fetchDocuments();
      } else {
        toast.error(result.error || 'Failed to update document');
      }
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleAssignToAll = async () => {
    if (!selectedDocumentId) return;

    setIsAssigning(true);
    try {
      const result = await assignDocumentToAllStaff(selectedDocumentId);
      if (result.success) {
        toast.success(result.message);
        setIsAssignDialogOpen(false);
        fetchDocuments();
      } else {
        toast.error(result.error || 'Failed to assign document');
      }
    } catch (error) {
      console.error('Bulk assignment error:', error);
      toast.error('Failed to assign document to all staff');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!deletingDocumentId) return;

    try {
      const result = await deleteDocument(deletingDocumentId);
      if (result.success) {
        toast.success('Document deleted successfully');
        setIsDeleteDialogOpen(false);
        setDeletingDocumentId(null);
        await fetchDocuments();
      } else {
        toast.error(result.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const getDocTypeColor = (type: string) => {
    switch (type) {
      case 'onboarding':
        return 'bg-blue-100 text-blue-700';
      case 'hr_records':
        return 'bg-red-100 text-red-700';
      case 'handbook':
        return 'bg-green-100 text-green-700';
      case 'training':
        return 'bg-purple-100 text-purple-700';
      case 'policy':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-slate-600">Loading...</div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-slate-600">Access denied. Admin only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#43005F]/5 to-[#FE871F]/5 border-b border-gray-200">
        <div className="px-3 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
          <Link href="/dashboard" className="text-[#43005F] hover:text-[#320044] text-sm mb-4 inline-flex items-center gap-1">
            <span>← Back to Dashboard</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 flex-shrink-0" />
                <span className="truncate">Document Management</span>
              </h1>
              <p className="text-gray-600 mt-2 text-xs sm:text-sm lg:text-base">Create and manage onboarding documents</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2 border bg-[#43005F] hover:bg-[#320044] cursor-pointer text-white">
                  <Plus className="h-4 w-4" />
                  Add Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Document</DialogTitle>
                  <DialogDescription>
                    Create a new document for staff onboarding, handbook, training, or policy.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddDocument}>
                  <div className="space-y-4 py-4">
                    {formError && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                        {formError}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        placeholder="Document title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Input
                        id="description"
                        placeholder="Brief description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="file">Upload PDF File</Label>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
                        <input
                          id="file"
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="file"
                          className="flex flex-col items-center cursor-pointer"
                        >
                          <Upload className="h-8 w-8 text-slate-400 mb-2" />
                          <span className="text-sm text-slate-600">
                            {selectedFile ? selectedFile.name : 'Click to upload PDF document'}
                          </span>
                          <span className="text-xs text-slate-400 mt-1">Max size: 10MB</span>
                        </label>
                        {selectedFile && (
                          <div className="mt-2 flex items-center justify-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedFile(null)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove file
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content">Content (Optional if file uploaded)</Label>
                      <Textarea
                        id="content"
                        placeholder="Document content or description"
                        value={formData.content}
                        onChange={(e) =>
                          setFormData({ ...formData, content: e.target.value })
                        }
                        className="min-h-32"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Document Type</Label>
                        <Select
                          value={formData.document_type}
                          onValueChange={(value: 'onboarding' | 'handbook' | 'training' | 'policy' | 'hr_records' | 'other') =>
                            setFormData({ ...formData, document_type: value, onboarding_subtype: '', hr_subtype: '' })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="onboarding">Onboarding Document</SelectItem>
                            <SelectItem value="hr_records">HR Records</SelectItem>
                            <SelectItem value="handbook">Handbook</SelectItem>
                            <SelectItem value="training">Training</SelectItem>
                            <SelectItem value="policy">Policy</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="required">Required</Label>
                        <Select
                          value={formData.is_required ? 'yes' : 'no'}
                          onValueChange={(value) =>
                            setFormData({ ...formData, is_required: value === 'yes' })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Onboarding Subtype Selection */}
                    {formData.document_type === 'onboarding' && (
                      <div className="space-y-2">
                        <Label htmlFor="onboarding_subtype">Onboarding Document Type *</Label>
                        <Select
                          value={formData.onboarding_subtype}
                          onValueChange={(value: '' | 'nda' | 'guarantor_form' | 'biodata' | 'contract_letter' | 'offer_letter') =>
                            setFormData({ ...formData, onboarding_subtype: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select onboarding document type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nda">NDA (Non-Disclosure Agreement)</SelectItem>
                            <SelectItem value="guarantor_form">Guarantor Form</SelectItem>
                            <SelectItem value="biodata">Bio-data Form</SelectItem>
                            <SelectItem value="contract_letter">Contract Letter</SelectItem>
                            <SelectItem value="offer_letter">Offer Letter</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500">Select the specific type of onboarding document</p>
                      </div>
                    )}

                    {/* HR Records Subtype Selection */}
                    {formData.document_type === 'hr_records' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="hr_subtype">HR Record Type *</Label>
                          <Select
                            value={formData.hr_subtype}
                            onValueChange={(value: '' | 'promotion_letter' | 'query_letter' | 'warning_letter' | 'appraisal_report' | 'leave_record' | 'salary_information') =>
                              setFormData({ ...formData, hr_subtype: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select HR record type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="promotion_letter">Promotion Letter</SelectItem>
                              <SelectItem value="query_letter">Query Letter</SelectItem>
                              <SelectItem value="warning_letter">Warning Letter</SelectItem>
                              <SelectItem value="appraisal_report">Appraisal Report</SelectItem>
                              <SelectItem value="leave_record">Leave Record</SelectItem>
                              <SelectItem value="salary_information">Salary Information</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-slate-500">Select the specific type of HR record</p>
                        </div>
                        
                        {/* Staff Selection for HR Records */}
                        <div className="space-y-2">
                          <Label htmlFor="hr_staff">Assign to Staff Member *</Label>
                          <Select
                            value={selectedHRStaffId}
                            onValueChange={(value) => setSelectedHRStaffId(value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select staff member" />
                            </SelectTrigger>
                            <SelectContent>
                              {staffList.map((staff) => (
                                <SelectItem key={staff.id} value={staff.id}>
                                  {staff.first_name} {staff.last_name} ({staff.email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-slate-500">HR records are assigned to individual staff members</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Assign to all checkbox - only show for handbook/training/policy/other (NOT onboarding or HR) */}
                    {formData.document_type !== 'hr_records' && formData.document_type !== 'onboarding' && (
                      <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Checkbox
                          id="assignToAll"
                          checked={assignToAllOnCreate}
                          onCheckedChange={(checked) => setAssignToAllOnCreate(checked === true)}
                        />
                        <div className="flex-1">
                          <label
                            htmlFor="assignToAll"
                            className="text-sm font-medium text-blue-900 cursor-pointer"
                          >
                            Assign to all staff immediately
                          </label>
                          <p className="text-xs text-blue-700">
                            Document will be assigned to all active staff members when created
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Staff selection for onboarding documents */}
                    {formData.document_type === 'onboarding' && (
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Assign to Staff Members *
                        </Label>
                        <p className="text-xs text-slate-500">Select one or more staff members who will receive this onboarding document.</p>
                        
                        {/* Search staff */}
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Search staff by name or email..."
                            value={onboardingStaffSearch}
                            onChange={(e) => setOnboardingStaffSearch(e.target.value)}
                            className="pl-9 h-9"
                          />
                        </div>

                        {/* Selected count and select all */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">
                            {selectedOnboardingStaffIds.length} staff member(s) selected
                          </span>
                          <div className="flex gap-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              className="bg-transparent text-xs h-7"
                              onClick={() => setSelectedOnboardingStaffIds(staffList.map(s => s.id))}
                            >
                              Select All
                            </Button>
                            {selectedOnboardingStaffIds.length > 0 && (
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                className="bg-transparent text-xs h-7"
                                onClick={() => setSelectedOnboardingStaffIds([])}
                              >
                                Clear All
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Staff list with checkboxes */}
                        <div className="border rounded-lg max-h-48 overflow-y-auto">
                          {staffList.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4">No staff members found.</p>
                          ) : (
                            staffList
                              .filter((staff) => {
                                if (!onboardingStaffSearch) return true;
                                const search = onboardingStaffSearch.toLowerCase();
                                return (
                                  `${staff.first_name} ${staff.last_name}`.toLowerCase().includes(search) ||
                                  staff.email.toLowerCase().includes(search)
                                );
                              })
                              .map((staff) => (
                                <label 
                                  key={staff.id}
                                  htmlFor={`staff-check-${staff.id}`}
                                  className="flex items-center gap-3 px-3 py-2 border-b last:border-b-0 hover:bg-slate-50 cursor-pointer"
                                >
                                  <input
                                    id={`staff-check-${staff.id}`}
                                    type="checkbox"
                                    checked={selectedOnboardingStaffIds.includes(staff.id)}
                                    onChange={() => setSelectedOnboardingStaffIds(prev => 
                                      prev.includes(staff.id) 
                                        ? prev.filter(id => id !== staff.id)
                                        : [...prev, staff.id]
                                    )}
                                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 accent-slate-900"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">
                                      {staff.first_name} {staff.last_name}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">{staff.email}</p>
                                  </div>
                                  {selectedOnboardingStaffIds.includes(staff.id) && (
                                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                                  )}
                                </label>
                              ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}
                      disabled={isSubmitting}
                      className="bg-transparent"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Document'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
  {/* Search and Filters */}
  <Card className="mb-8 bg-primary">
  <CardHeader>
  <div className="flex flex-col md:flex-row gap-3">
  <div className="relative flex-1">
  <Search className="absolute left-3 top-2 h-5 w-5 text-slate-400" />
  <Input
  type="text"
  placeholder="Search documents..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="pl-10 b-slate-300"
  />
  </div>
  <Select value={docTypeFilter} onValueChange={setDocTypeFilter}>
  <SelectTrigger className="w-full md:w-48 text-slate-300">
  <SelectValue placeholder="Document Type" />
  </SelectTrigger>
  <SelectContent>
  <SelectItem value="all">All Types</SelectItem>
  <SelectItem value="onboarding">Onboarding</SelectItem>
  <SelectItem value="handbook">Handbook</SelectItem>
  <SelectItem value="training">Training</SelectItem>
  <SelectItem value="policy">Policy</SelectItem>
  <SelectItem value="hr_records">HR Records</SelectItem>
  <SelectItem value="other">Other</SelectItem>
  </SelectContent>
  </Select>
  <Select value={requiredFilter} onValueChange={setRequiredFilter}>
  <SelectTrigger className="w-full md:w-40 text-slate-300">
  <SelectValue placeholder="Required" />
  </SelectTrigger>
  <SelectContent>
  <SelectItem value="all">All</SelectItem>
  <SelectItem value="required">Required</SelectItem>
  <SelectItem value="optional">Optional</SelectItem>
  </SelectContent>
  </Select>
  </div>
  {filteredDocuments.length !== documents.length && (
  <p className="text-sm text-slate-500 mt-2">
  Showing {filteredDocuments.length} of {documents.length} documents
  </p>
  )}
  </CardHeader>
  </Card>

        {/* Documents List */}
        <div className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <Card>
              <CardContent className="pt-8 pb-8 text-center">
                <p className="text-slate-600">No documents found</p>
              </CardContent>
            </Card>
          ) : (
            paginatedDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow bg-primary">
                <CardHeader className="p-4 sm:p-6">
                  <div className="space-y-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge className={`${getDocTypeColor(doc.document_type)} border-0 text-xs`}>
                          {doc.document_type}
                        </Badge>
                        {doc.is_required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span className="break-words text-slate-300">{doc.title}</span>
                      </CardTitle>
                      <CardDescription className="mt-2 text-xs sm:text-sm">{doc.description}</CardDescription>
                      {doc.file_url && (
                        <a 
                          href={doc.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs sm:text-sm text-blue-600 hover:text-blue-700 mt-2"
                        >
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                          View attached file
                        </a>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-slate-300 gap-1 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
                        onClick={() => openAssignDialog(doc.id)}
                      >
                        <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                        Assign
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-slate-300 gap-1 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
                        onClick={() => openEditDialog(doc)}
                      >
                        <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-transparent gap-1 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setDeletingDocumentId(doc.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
            <p className="text-xs sm:text-sm text-slate-600">
              Page {currentPage} of {totalPages} ({filteredDocuments.length} documents)
            </p>
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="bg-slate-100 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="bg-slate-100 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
              >
                Prev
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`text-xs sm:text-sm h-7 sm:h-8 px-2  sm:px-3 ${page !== currentPage ? 'bg-slate-300' : ''}`}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="bg-slate-200 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="bg-slate-200 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
              >
                Last
              </Button>
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Document</DialogTitle>
              <DialogDescription>
                Update the document information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditDocument}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    placeholder="Document title"
                    value={editFormData.title}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description *</Label>
                  <Input
                    id="edit-description"
                    placeholder="Brief description"
                    value={editFormData.description}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, description: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-content">Content</Label>
                  <Textarea
                    id="edit-content"
                    placeholder="Document content"
                    value={editFormData.content}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, content: e.target.value })
                    }
                    className="min-h-32"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-required">Required</Label>
                  <Select
                    value={editFormData.is_required ? 'yes' : 'no'}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, is_required: value === 'yes' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isEditSubmitting}
                  className="bg-transparent"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isEditSubmitting}
                >
                  {isEditSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Assignment Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assign Document to Staff
              </DialogTitle>
              <DialogDescription>
                Select staff members to assign this document to. They will be notified and the document will appear in their onboarding section.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {staffList.length === 0 ? (
                <p className="text-slate-600 text-center py-4">No staff members found. Create staff members first.</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">
                      {selectedStaffIds.length} staff member(s) selected
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAssignToAll}
                      disabled={isAssigning}
                      className="bg-transparent"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Assign to All
                    </Button>
                  </div>
                  <div className="border rounded-lg max-h-64 overflow-y-auto">
                    {staffList.map((staff) => (
                      <div 
                        key={staff.id}
                        className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-slate-50"
                      >
                        <Checkbox
                          id={`staff-${staff.id}`}
                          checked={selectedStaffIds.includes(staff.id)}
                          onCheckedChange={() => setSelectedStaffIds(prev => 
                            prev.includes(staff.id) 
                              ? prev.filter(id => id !== staff.id)
                              : [...prev, staff.id]
                          )}
                        />
                        <label 
                          htmlFor={`staff-${staff.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <p className="font-medium text-slate-900">
                            {staff.first_name} {staff.last_name}
                          </p>
                          <p className="text-sm text-slate-500">{staff.email}</p>
                        </label>
                        {selectedStaffIds.includes(staff.id) && (
                          <Check className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAssignDialogOpen(false)}
                disabled={isAssigning}
                className="bg-transparent"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAssignToSelected}
                disabled={isAssigning || selectedStaffIds.length === 0}
              >
                {isAssigning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign Selected
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Document</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this document? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeletingDocumentId(null);
                }}
                className="bg-transparent"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteDocument}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
