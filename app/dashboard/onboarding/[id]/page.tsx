'use client';

import React from "react"

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { getDocumentWithProgress, submitCompletedDocument } from '@/app/actions/documents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  FileText, 
  ArrowLeft, 
  AlertCircle, 
  Download, 
  Upload, 
  X, 
  ExternalLink,
  Loader2,
  CheckIcon,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface OnboardingDocument {
  id: string;
  title: string;
  description: string;
  content: string;
  file_url: string | null;
  document_type: string;
  is_required: boolean;
  created_at: string;
  metadata?: {
    onboarding_subtype?: string;
  } | null;
}

interface OnboardingProgress {
  id: string;
  completed_at: string | null;
  signed_at: string | null;
  notes: string;
  status?: 'not_started' | 'draft' | 'submitted' | 'approved' | 'rejected';
  admin_comments?: string | null;
  reviewed_at?: string | null;
  form_data?: {
    uploaded_file_url?: string;
    uploaded_at?: string;
    original_filename?: string;
  } | null;
  signature_url?: string | null;
}

export default function OnboardingDocumentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

  const [document, setDocument] = useState<OnboardingDocument | null>(null);
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [notes, setNotes] = useState('');
  const [acknowledgment, setAcknowledgment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && documentId) {
      fetchData();
    }
  }, [user, loading, router, documentId]);

  const fetchData = async () => {
    if (!user?.id) return;
    
    try {
      const result = await getDocumentWithProgress(documentId, user.id);
      
      if (result.success && result.data) {
        setDocument(result.data.document);
        if (result.data.progress) {
          setProgress(result.data.progress);
          setNotes(result.data.progress.notes || '');
          // Restore uploaded file URL if exists
          if (result.data.progress.form_data?.uploaded_file_url) {
            setUploadedFileUrl(result.data.progress.form_data.uploaded_file_url);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file type
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return false;
    }
    
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return false;
    }
    
    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setUploadedFile(file);
      uploadFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  const uploadFile = async (file: File) => {
    if (!user?.id) {
      toast.error('You must be logged in to upload files');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', '/completed-documents');
      formData.append('userId', user.id);
      formData.append('documentType', 'completed-document');

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/uploads/documents', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      setUploadProgress(100);
      setUploadedFileUrl(data.url);
      toast.success('File uploaded successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
      toast.error(errorMessage);
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadedFileUrl(null);
  };

  const handleSubmitDocument = async () => {
    if (!user || !document) return;

    if (!uploadedFileUrl) {
      toast.error('Please upload your completed document first');
      return;
    }

    if (!acknowledgment) {
      toast.error('Please confirm that the information is accurate');
      return;
    }

    setIsSaving(true);
    try {
      const result = await submitCompletedDocument({
        documentId: document.id,
        userId: user.id,
        uploadedFileUrl,
        notes,
        originalFilename: uploadedFile?.name,
      });

      if (result.success) {
        toast.success('Document submitted for review');
        await fetchData();
      } else {
        toast.error(result.error || 'Failed to submit document');
      }
    } catch (error) {
      console.error('Error submitting document:', error);
      toast.error('An error occurred while submitting');
    } finally {
      setIsSaving(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-slate-600">Document not found</p>
        </div>
      </div>
    );
  }

  const submissionStatus = progress?.status || 'not_started';
  const isApproved = submissionStatus === 'approved';
  const isRejected = submissionStatus === 'rejected';
  const isSubmitted = submissionStatus === 'submitted';
  const canSubmit = uploadedFileUrl && acknowledgment && !isUploading;

  const getStatusBadge = () => {
    switch (submissionStatus) {
      case 'approved':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-green-700 font-medium text-sm">Approved</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-100 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-700 font-medium text-sm">Rejected</span>
          </div>
        );
      case 'submitted':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-700 font-medium text-sm">Pending Review</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#43005F]/5 to-[#FE871F]/5 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/dashboard/onboarding"
            className="text-[#43005F] hover:text-[#320044] border border-gray-200 p-2 mt-3  rounded text-sm mb-6 inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Onboarding</span>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#43005F] mt-4 flex items-center gap-2">
                <FileText className="h-8 w-8" />
                {document.title}
              </h1>
              <p className="text-gray-600 mt-2">{document.description}</p>
            </div>
            {getStatusBadge()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Show when approved */}
        {isApproved && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">Document Approved</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-green-700">
                This document was approved on {new Date(progress?.reviewed_at || '').toLocaleDateString()}
              </p>
              {progress?.form_data?.uploaded_file_url && (
                <div className="p-3 bg-white rounded border border-green-200">
                  <p className="text-sm font-medium text-slate-900 mb-2">Your Submitted Document:</p>
                  <a 
                    href={progress.form_data.uploaded_file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    View submitted document
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {progress?.admin_comments && (
                <div className="p-3 bg-white rounded border border-green-200">
                  <p className="text-sm font-medium text-slate-900 mb-2">Admin Comments:</p>
                  <p className="text-sm text-slate-700">{progress.admin_comments}</p>
                </div>
              )}
              <Link href="/dashboard/onboarding" className="mt-4 inline-block">
                <Button variant="outline" className="bg-transparent">Back to Onboarding</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Show when rejected */}
        {isRejected && (
          <>
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-900">Document Rejected</CardTitle>
                <CardDescription className="text-red-700">
                  This document requires revision. Please review the admin comments below, make changes, and resubmit.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {progress?.admin_comments && (
                  <div className="p-4 bg-white rounded border border-red-200">
                    <p className="text-sm font-medium text-slate-900 mb-2">Admin Comments:</p>
                    <p className="text-sm text-slate-700">{progress.admin_comments}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Show download and upload sections for resubmission */}
            <DownloadSection document={document} />
            <UploadSection 
              uploadedFile={uploadedFile}
              uploadedFileUrl={uploadedFileUrl}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              isDragOver={isDragOver}
              notes={notes}
              acknowledgment={acknowledgment}
              canSubmit={canSubmit}
              isSaving={isSaving}
              onFileInputChange={handleFileInputChange}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onRemoveFile={handleRemoveFile}
              onNotesChange={setNotes}
              onAcknowledgmentChange={setAcknowledgment}
              onSubmit={handleSubmitDocument}
              formatFileSize={formatFileSize}
            />
          </>
        )}

        {/* Show when submitted (pending review) */}
        {isSubmitted && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-900">Document Submitted</CardTitle>
              <CardDescription className="text-yellow-700">
                Your document is pending admin review. You will be notified once it is reviewed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-yellow-800">
                Submitted on {new Date(progress?.completed_at || '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {progress?.form_data?.uploaded_file_url && (
                <div className="p-3 bg-white rounded border border-yellow-200">
                  <p className="text-sm font-medium text-slate-900 mb-2">Your Submitted Document:</p>
                  <a 
                    href={progress.form_data.uploaded_file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    View submitted document
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {progress?.notes && (
                <div className="p-3 bg-white rounded border border-yellow-200">
                  <p className="text-sm font-medium text-slate-900 mb-2">Your Notes:</p>
                  <p className="text-sm text-slate-700">{progress.notes}</p>
                </div>
              )}
              <Link href="/dashboard/onboarding" className="mt-4 inline-block">
                <Button variant="outline" className="bg-transparent">Back to Onboarding</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Show download and upload sections for new submissions */}
        {!isApproved && !isRejected && !isSubmitted && (
          <>
            <DownloadSection document={document} />
            <UploadSection 
              uploadedFile={uploadedFile}
              uploadedFileUrl={uploadedFileUrl}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              isDragOver={isDragOver}
              notes={notes}
              acknowledgment={acknowledgment}
              canSubmit={canSubmit}
              isSaving={isSaving}
              onFileInputChange={handleFileInputChange}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onRemoveFile={handleRemoveFile}
              onNotesChange={setNotes}
              onAcknowledgmentChange={setAcknowledgment}
              onSubmit={handleSubmitDocument}
              formatFileSize={formatFileSize}
            />
          </>
        )}
      </div>
    </div>
  );
}

// Download Section Component
function DownloadSection({ document }: { document: OnboardingDocument }) {
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  return (
    <Card className="bg-slate-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Download Document
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-blue-200 bg-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <span className="font-semibold">Instructions:</span>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Download the document using the button below</li>
              <li>Open it with Adobe Acrobat Reader (free) or any PDF viewer that supports form filling</li>
              <li>Fill in all required information</li>
              <li>Save the completed document</li>
              <li>Upload it back using the upload section below</li>
            </ol>
          </AlertDescription>
        </Alert>

        <div className="p-4 bg-blue-200 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600 mb-3">
            To fill the PDF form, we recommend using:
          </p>
          <ul className="text-sm text-slate-600 space-y-1 mb-4">
            <li>
              <a 
                href="https://get.adobe.com/reader/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                Adobe Acrobat Reader (free)
              </a>
            </li>
            <li>
              <a 
                href="https://www.foxit.com/pdf-reader/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                Foxit Reader
              </a>
            </li>
          </ul>
        </div>

        {/* Text Content Preview */}
        {document.content && (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm font-medium text-slate-900 mb-2">Document Description:</p>
            <p className="text-slate-700 whitespace-pre-wrap text-sm">{document.content}</p>
          </div>
        )}

        {/* Action Buttons */}
        {document.file_url ? (
          <div className="space-y-4">
            <div className="flex gap-3">
              <Button asChild size="lg" className="flex-1">
                <a 
                  href={document.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download Document
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setShowPdfPreview(!showPdfPreview)}
                className="bg-transparent gap-2"
              >
                {showPdfPreview ? (
                  <>
                    <EyeOff className="h-5 w-5" />
                    Hide PDF
                  </>
                ) : (
                  <>
                    <Eye className="h-5 w-5" />
                    View PDF
                  </>
                )}
              </Button>
            </div>

            {/* Embedded PDF Preview */}
            {showPdfPreview && (
              <div className="border rounded-lg overflow-hidden bg-slate-50">
                <iframe
                  src={`${document.file_url}#toolbar=1&navpanes=0&scrollbar=1`}
                  className="w-full h-[600px] rounded-lg"
                  title={document.title}
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">No file attached to this document</p>
        )}
      </CardContent>
    </Card>
  );
}

// Upload Section Component
function UploadSection({
  uploadedFile,
  uploadedFileUrl,
  isUploading,
  uploadProgress,
  isDragOver,
  notes,
  acknowledgment,
  canSubmit,
  isSaving,
  onFileInputChange,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveFile,
  onNotesChange,
  onAcknowledgmentChange,
  onSubmit,
  formatFileSize,
}: {
  uploadedFile: File | null;
  uploadedFileUrl: string | null;
  isUploading: boolean;
  uploadProgress: number;
  isDragOver: boolean;
  notes: string;
  acknowledgment: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onRemoveFile: () => void;
  onNotesChange: (value: string) => void;
  onAcknowledgmentChange: (value: boolean) => void;
  onSubmit: () => void;
  formatFileSize: (bytes: number) => string;
}) {
  return (
    <Card className="bg-slate-750">
      <CardHeader>
        <CardTitle className="flex items-center text-slate-200 gap-2">
          <Upload className="h-5 w-5" />
          Upload Completed Document
        </CardTitle>
        <CardDescription>
          Upload your completed PDF document for admin review
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Dropzone */}
        {!uploadedFileUrl && (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-slate-300 hover:border-slate-400 hover:bg-slate-300'
              }
              ${isUploading ? 'pointer-events-none opacity-60' : ''}
            `}
          >
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={onFileInputChange}
              className="hidden"
              id="file-upload"
              disabled={isUploading}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-300 mb-1">
                Click to Upload or Drag PDF Here
              </p>
              <p className="text-sm text-slate-400">
                Only PDF files accepted. Maximum file size: 10MB
              </p>
            </label>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Uploading...</span>
              <span className="text-slate-300">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2 bg-slate-300 text-slate-300" />
          </div>
        )}

        {/* Uploaded File Display */}
        {uploadedFileUrl && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">
                    {uploadedFile?.name || 'Document uploaded'}
                  </p>
                  {uploadedFile && (
                    <p className="text-sm text-green-700">
                      {formatFileSize(uploadedFile.size)} - Uploaded on {new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                  <a 
                    href={uploadedFileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
                  >
                    <FileText className="h-3 w-3" />
                    View uploaded file
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemoveFile}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Notes Section */}
        <div className="space-y-2">
          <label htmlFor="notes" className="text-sm font-medium text-slate-300">
            Additional Notes or Questions (Optional)
          </label>
          <Textarea
            id="notes"
            placeholder="Add any notes, questions, or clarifications about this document..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="min-h-24 text-slate-200"
          />
          <p className="text-xs text-slate-500">These notes will be visible to the admin reviewing your document</p>
        </div>

        {/* Acknowledgment Checkbox */}
        <div className="border-t border-slate-200 pt-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="acknowledgment"
              checked={acknowledgment}
              onCheckedChange={(checked) => onAcknowledgmentChange(checked === true)}
              className="mt-1"
            />
            <div className="flex-1">
              <label
                htmlFor="acknowledgment"
                className="text-sm font-medium text-slate-200 cursor-pointer"
              >
                I confirm this information is accurate
              </label>
              <p className="text-xs text-slate-400 mt-1">
                By checking this box, you confirm that all information in the uploaded document is accurate and complete
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={onSubmit}
          disabled={!canSubmit || isSaving}
          className="w-full bg-slate-900 border hover:bg-slate-950 coursor-pointer"
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckIcon className="h-4 w-4 mr-2" />
              Submit for Review
            </>
          )}
        </Button>

        {!uploadedFileUrl && (
          <p className="text-xs text-center text-slate-500">
            Please upload your completed document before submitting
          </p>
        )}
      </CardContent>
    </Card>
  );
}
