'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, FileText, CheckCircle2, Calendar, User, X, Check, Download, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { approveDocumentSubmission } from '@/app/actions/documents';

interface SubmissionDetail {
  id: string;
  user_id: string;
  document_id: string;
  completed_at: string;
  notes: string | null;
  status?: 'not_started' | 'draft' | 'submitted' | 'approved' | 'rejected';
  admin_comments?: string | null;
  reviewed_at?: string | null;
  form_data?: {
    uploaded_file_url?: string;
    uploaded_at?: string;
    original_filename?: string;
  } | null;
  signature_url?: string | null;
  signature_ip?: string | null;
  signature_timestamp?: string | null;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    employee_id: string | null;
    department: string | null;
    position: string | null;
  };
  document: {
    id: string;
    title: string;
    description: string;
    content: string;
    file_url: string | null;
  };
}

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;

  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminComments, setAdminComments] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchSubmissionDetail();
  }, [submissionId]);

  const fetchSubmissionDetail = async () => {
    setIsLoading(true);
    try {
      // Check if this is an HR record submission (prefixed with "hr-")
      const isHRRecord = submissionId.startsWith('hr-');
      const actualId = isHRRecord ? submissionId.replace('hr-', '') : submissionId;

      if (isHRRecord) {
        // Fetch HR record details
        const { data: hrData, error: hrError } = await supabase
          .from('hr_records')
          .select(`
            id,
            user_id,
            record_type,
            title,
            description,
            content,
            file_url,
            acknowledged_at,
            acknowledgment_file_url,
            signature_url,
            acknowledgment_notes,
            users:user_id (id, first_name, last_name, email, employee_id, department, position)
          `)
          .eq('id', actualId)
          .single();

        if (hrError || !hrData) {
          console.error('Fetch HR detail error:', hrError);
          toast.error('Failed to load HR record details');
          return;
        }

        const userInfo = Array.isArray(hrData.users) ? hrData.users[0] : hrData.users;

        const formattedData: SubmissionDetail = {
          id: `hr-${hrData.id}`,
          user_id: hrData.user_id,
          document_id: hrData.id,
          completed_at: hrData.acknowledged_at || '',
          notes: hrData.acknowledgment_notes || null,
          status: 'approved',
          admin_comments: null,
          reviewed_at: hrData.acknowledged_at,
          form_data: hrData.acknowledgment_file_url ? {
            uploaded_file_url: hrData.acknowledgment_file_url,
            uploaded_at: hrData.acknowledged_at || undefined,
          } : null,
          signature_url: hrData.signature_url || null,
          signature_ip: null,
          signature_timestamp: hrData.acknowledged_at,
          user: userInfo,
          document: {
            id: hrData.id,
            title: hrData.title || hrData.record_type?.replace(/_/g, ' ') || 'HR Record',
            description: hrData.description || 'HR Record',
            content: hrData.content || '',
            file_url: hrData.file_url || null,
          },
        };

        setSubmission(formattedData);
        return;
      }

      // Standard onboarding_progress record
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select(
          `
          id,
          user_id,
          document_id,
          completed_at,
          notes,
          status,
          admin_comments,
          reviewed_at,
          form_data,
          signature_url,
          signature_ip,
          signature_timestamp,
          users:user_id (id, first_name, last_name, email, employee_id, department, position)
        `
        )
        .eq('id', submissionId)
        .single();

      if (error) {
        console.error('Fetch detail error:', error);
        toast.error('Failed to load submission details');
        return;
      }

      if (data) {
        // Separately fetch the document to avoid join issues
        let documentData: SubmissionDetail['document'] = {
          id: data.document_id,
          title: 'Unknown Document',
          description: '',
          content: '',
          file_url: null,
        };

        if (data.document_id) {
          const { data: docData } = await supabase
            .from('onboarding_documents')
            .select('id, title, description, content, file_url')
            .eq('id', data.document_id)
            .single();

          if (docData) {
            documentData = docData;
          }
        }

        const userInfo = Array.isArray(data.users) ? data.users[0] : data.users;

        const formattedData: SubmissionDetail = {
          id: data.id,
          user_id: data.user_id,
          document_id: data.document_id,
          completed_at: data.completed_at || '',
          notes: data.notes,
          status: data.status,
          admin_comments: data.admin_comments,
          reviewed_at: data.reviewed_at,
          form_data: data.form_data as SubmissionDetail['form_data'],
          signature_url: data.signature_url,
          signature_ip: data.signature_ip,
          signature_timestamp: data.signature_timestamp,
          user: userInfo,
          document: documentData,
        };

        setSubmission(formattedData);
        if (data.admin_comments) {
          setAdminComments(data.admin_comments);
        }
      }
    } catch (error) {
      console.error('Error fetching submission detail:', error);
      toast.error('An error occurred while loading submission details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!submission) return;

    setIsProcessing(true);
    try {
      const result = await approveDocumentSubmission({
        progressId: submission.id,
        approved: true,
        adminComments,
      });

      if (result.success) {
        toast.success('Document approved successfully');
        await fetchSubmissionDetail();
      } else {
        toast.error(result.error || 'Failed to approve document');
      }
    } catch (error) {
      console.error('Error approving document:', error);
      toast.error('An error occurred while approving');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!submission) return;

    if (!adminComments.trim()) {
      toast.error('Please provide comments explaining the rejection');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await approveDocumentSubmission({
        progressId: submission.id,
        approved: false,
        adminComments,
      });

      if (result.success) {
        toast.success('Document rejected successfully');
        await fetchSubmissionDetail();
      } else {
        toast.error(result.error || 'Failed to reject document');
      }
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast.error('An error occurred while rejecting');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Loading submission details...</div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="space-y-4">
        <Link href="/admin/submissions">
          <Button variant="ghost" className="gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Submissions
          </Button>
        </Link>
        <Card>
          <CardContent className="pt-6">
            <p className="text-slate-600">Submission not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const uploadedFileUrl = submission.form_data?.uploaded_file_url;
  const originalFileUrl = submission.document?.file_url;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Link href="/admin/submissions">
        <Button variant="ghost" className="gap-2 mt-4 bg-slate-300 border">
          <ArrowLeft className="h-4 w-4" />
          Back to Submissions
        </Button>
      </Link>

      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mt-4">Submission Details</h1>
        <p className="text-xs sm:text-sm text-slate-700 mt-1">
          Review staff member submission for onboarding document
        </p>
      </div>

      {/* Staff and Submission Info Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff Information */}
        <Card className="lg:col-span-1 bg-white border-gray-200">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base text-slate-700 sm:text-lg flex items-center gap-2">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              Staff Member
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
            <div>
              <p className="text-xs sm:text-sm text-slate-800">Name</p>
              <p className="text-sm sm:text-base font-medium text-slate-700">
                {submission.user.first_name} {submission.user.last_name}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-800">Email</p>
              <p className="text-sm sm:text-base font-medium text-slate-700 break-all">
                {submission.user.email}
              </p>
            </div>
            {submission.user.employee_id && (
              <div>
                <p className="text-sm text-slate-700">Employee ID</p>
                <p className="font-medium text-slate-600">
                  {submission.user.employee_id}
                </p>
              </div>
            )}
            {submission.user.department && (
              <div>
                <p className="text-sm text-slate-700">Department</p>
                <p className="font-medium text-slate-600">
                  {submission.user.department}
                </p>
              </div>
            )}
            {submission.user.position && (
              <div>
                <p className="text-sm text-slate-700">Position</p>
                <p className="font-medium text-slate-600">
                  {submission.user.position}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submission Information */}
        <Card className="lg:col-span-2 bg-white border-gray-200">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base text-primary sm:text-lg flex items-center gap-2">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              Document Submission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-4 pt-0 sm:p-6 sm:pt-0">
            {/* Document Details */}
            <div>
              <p className="text-xs sm:text-sm text-slate-800 mb-2">Document</p>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-slate-600">
                    {submission.document?.title || 'N/A'}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-700 mt-1">
                    {submission.document?.description || 'No description'}
                  </p>
                </div>
                <Badge className={`border-0 flex items-center gap-1 whitespace-nowrap w-fit text-xs ${
                  submission.status === 'approved' 
                    ? 'bg-green-100 text-green-700' 
                    : submission.status === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  <CheckCircle2 className="h-3 w-3" />
                  {submission.status === 'approved' ? 'Approved' : 
                   submission.status === 'rejected' ? 'Rejected' : 'Pending Review'}
                </Badge>
              </div>
            </div>

            {/* Submission Date */}
            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-600" />
                <div>
                  <p className="text-sm text-slate-400">Submitted On</p>
                  <p className="font-medium text-slate-600">
                    {new Date(submission.completed_at).toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Staff Notes */}
            {submission.notes && (
              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-300 mb-2">Staff Notes</p>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-400 whitespace-pre-wrap">
                    {submission.notes}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Document Comparison - Side by Side PDFs */}
      {(originalFileUrl || uploadedFileUrl) && (
        <Card className='bg-primary/80'>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base text-slate-300 sm:text-lg">Document Comparison</CardTitle>
            <CardDescription className="text-xs text-slate-400 sm:text-sm">
              Compare the original blank document with the staff&apos;s completed submission
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Original Document */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-200">Original Document</h3>
                  {originalFileUrl && (
                    <Button variant="outline" size="sm" asChild className="bg-slate-300">
                      <a href={originalFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  )}
                </div>
                {originalFileUrl ? (
                  <div className="border rounded-lg overflow-hidden bg-slate-50">
                    <iframe
                      src={`${originalFileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                      className="w-full h-[500px] rounded-lg"
                      title="Original Document"
                    />
                  </div>
                ) : (
                  <div className="h-96 flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-300 gap-3">
                    <FileText className="h-10 w-10 text-slate-300" />
                    <p className="text-slate-500">No original PDF file attached</p>
                    {submission.document?.content && (
                      <div className="px-6 py-3 max-h-64 overflow-y-auto w-full">
                        <p className="text-xs text-slate-400 mb-1 font-medium">Document Content:</p>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{submission.document.content}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Completed Document */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-200">
                    Completed Document
                    {submission.form_data?.original_filename && (
                      <span className="font-normal text-sm text-slate-500 ml-2">
                        ({submission.form_data.original_filename})
                      </span>
                    )}
                  </h3>
                  {uploadedFileUrl && (
                    <Button variant="outline" size="sm" asChild className="bg-slate-300">
                      <a href={uploadedFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  )}
                </div>
                {uploadedFileUrl ? (
                  <div className="border rounded-lg overflow-hidden bg-slate-50 border-green-200">
                    <iframe
                      src={`${uploadedFileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                      className="w-full h-[500px] rounded-lg"
                      title="Completed Document"
                    />
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    <p className="text-slate-500">No completed document uploaded</p>
                  </div>
                )}
                {submission.form_data?.uploaded_at && (
                  <p className="text-xs text-slate-300">
                    Uploaded on {new Date(submission.form_data.uploaded_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legacy Form Data (if any old submissions exist) */}
      {submission.form_data && !submission.form_data.uploaded_file_url && Object.keys(submission.form_data).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Submitted Form Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              {Object.entries(submission.form_data).map(([key, value]) => (
                <div key={key} className="flex gap-3">
                  <p className="text-sm font-medium text-slate-900 min-w-32 capitalize">
                    {key.replace(/_/g, ' ')}:
                  </p>
                  <p className="text-sm text-slate-700 flex-1">
                    {typeof value === 'string' && value.startsWith('http') ? (
                      <a 
                        href={value} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        View uploaded file
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      String(value)
                    )}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Digital Signature (legacy) */}
      {submission.signature_url && (
        <Card className="">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Digital Signature</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
              <img 
                src={submission.signature_url || "/placeholder.svg"} 
                alt="Digital Signature" 
                className="max-w-full sm:max-w-xs border border-slate-300 rounded bg-white p-2"
              />
              {submission.signature_timestamp && (
                <p className="text-xs text-slate-600 mt-2">
                  Signed on {new Date(submission.signature_timestamp).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Section */}
      {submission.status !== 'approved' && submission.status !== 'rejected' && (
        <Card className="border-blue-200 bg-blue-950">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg text-slate-300">Review Submission</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-blue-200">
              Approve or reject this document submission
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
            {submission.status === 'submitted' && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertDescription className="text-yellow-800">
                  <span className="font-semibold">Status:</span> Pending your review
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="admin-comments" className="text-sm font-medium text-slate-200">
                Admin Comments (Required for Rejection)
              </label>
              <Textarea
                id="admin-comments"
                placeholder="Add comments about this submission... (e.g., reasons for approval/rejection, required changes, etc.)"
                value={adminComments}
                onChange={(e) => setAdminComments(e.target.value)}
                className="min-h-28 text-slate-300"
              />
              <p className="text-xs text-slate-400">
                These comments will be visible to the staff member
              </p>
            </div>

            <div className="border-t border-blue-200 pt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700 text-sm"
              >
                <Check className="h-4 w-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Approve'}
              </Button>
              <Button
                onClick={handleReject}
                disabled={isProcessing}
                variant="destructive"
                className="flex-1 text-sm"
              >
                <X className="h-4 w-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Reject'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Status Display */}
      {submission.status === 'approved' && (
        <Card className="border-green-200 bg-slate-900">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg text-green-600">Approved</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
            <div>
              <p className="text-xs sm:text-sm text-green-500">
                Approved on {new Date(submission.reviewed_at || '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {submission.admin_comments && (
              <div className="p-3 bg-green-950 rounded border border-green-200">
                <p className="text-sm font-medium text-slate-100 mb-2">Admin Comments:</p>
                <p className="text-sm text-slate-200 whitespace-pre-wrap">{submission.admin_comments}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {submission.status === 'rejected' && (
        <Card className="border-red-200 bg-red-200">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg text-red-900">Rejected</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-red-700">
              This document was rejected and requires revision
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
            <div>
              <p className="text-xs sm:text-sm text-red-700">
                Rejected on {new Date(submission.reviewed_at || '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {submission.admin_comments && (
              <div className="p-4 bg-white rounded border border-red-200">
                <p className="text-sm font-medium text-slate-900 mb-2">Rejection Reason:</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{submission.admin_comments}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
