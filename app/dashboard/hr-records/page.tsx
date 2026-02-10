'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useRouter } from 'next/navigation';
import { getStaffHRRecords, submitHRRecordAcknowledgment } from '@/app/actions/documents';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  FileText, Lock, Award, AlertTriangle, AlertCircle,
  ClipboardList, Calendar, DollarSign, FileDown,
  Upload, Eye, EyeOff, CheckCircle2, X, Loader2, ExternalLink, Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface HRRecord {
  id: string;
  record_type: string;
  content: string;
  file_url: string | null;
  visibility: string;
  created_at: string;
  acknowledged_at: string | null;
  acknowledgment_file_url: string | null;
  signature_url: string | null;
  acknowledgment_notes: string | null;
}

const hrRecordTypeLabels: Record<string, string> = {
  promotion_letter: 'Promotion Letter',
  query_letter: 'Query Letter',
  warning_letter: 'Warning Letter',
  appraisal_report: 'Appraisal Report',
  leave_record: 'Leave Record',
  salary_information: 'Salary Information',
};

const hrRecordTypeIcons: Record<string, React.ReactNode> = {
  promotion_letter: <Award className="h-5 w-5" />,
  query_letter: <AlertCircle className="h-5 w-5" />,
  warning_letter: <AlertTriangle className="h-5 w-5" />,
  appraisal_report: <ClipboardList className="h-5 w-5" />,
  leave_record: <Calendar className="h-5 w-5" />,
  salary_information: <DollarSign className="h-5 w-5" />,
};

export default function HRRecordsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<HRRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [acknowledgeDialogOpen, setAcknowledgeDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HRRecord | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [acknowledgmentNotes, setAcknowledgmentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewRecordId, setPreviewRecordId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }
    if (user) {
      fetchHRRecords();
    }
  }, [user, loading, router]);

  const fetchHRRecords = async () => {
    if (!user?.id) return;
    try {
      const result = await getStaffHRRecords(user.id);
      if (result.success) {
        setRecords(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching HR records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRecordTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'promotion_letter': return 'bg-green-900/30 text-green-400 border-green-500/30';
      case 'query_letter': return 'bg-amber-900/30 text-amber-400 border-amber-500/30';
      case 'warning_letter': return 'bg-red-900/30 text-red-400 border-red-500/30';
      case 'appraisal_report': return 'bg-blue-900/30 text-blue-400 border-blue-500/30';
      case 'leave_record': return 'bg-blue-900/30 text-blue-400 border-blue-500/30';
      case 'salary_information': return 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-600 text-slate-300 border-slate-500/30';
    }
  };

  const getRecordTypeIconColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'promotion_letter': return 'bg-green-600/20 border border-green-500/30 text-green-400';
      case 'query_letter': return 'bg-amber-600/20 border border-amber-500/30 text-amber-400';
      case 'warning_letter': return 'bg-red-600/20 border border-red-500/30 text-red-400';
      case 'appraisal_report': return 'bg-blue-600/20 border border-blue-500/30 text-blue-400';
      case 'leave_record': return 'bg-blue-600/20 border border-blue-500/30 text-blue-400';
      case 'salary_information': return 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400';
      default: return 'bg-slate-600/20 border border-slate-500/30 text-slate-400';
    }
  };

  const getRecordTypeLabel = (type: string) => {
    return hrRecordTypeLabels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getRecordTypeIcon = (type: string) => {
    return hrRecordTypeIcons[type] || <FileText className="h-5 w-5" />;
  };

  const recordsByType = records.reduce((acc, record) => {
    const type = record.record_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(record);
    return acc;
  }, {} as Record<string, HRRecord[]>);

  const sortedRecords = [...records].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleDownloadPDF = async (record: HRRecord) => {
    if (!record.file_url) return;
    try {
      const response = await fetch(record.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${getRecordTypeLabel(record.record_type)}_${new Date(record.created_at).toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const openAcknowledgeDialog = (record: HRRecord) => {
    setSelectedRecord(record);
    setUploadedFile(null);
    setUploadedFileUrl(null);
    setSignatureData(null);
    setAcknowledgmentNotes('');
    setAcknowledgeDialogOpen(true);
  };

  const validateFile = (file: File): boolean => {
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return false;
    }
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
    if (file) handleFileSelect(file);
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
    if (file) handleFileSelect(file);
  }, []);

  const uploadFile = async (file: File) => {
    if (!user?.id) return;
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', '/completed-documents');
      formData.append('userId', user.id);
      formData.append('documentType', 'hr-acknowledgment');

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

  const handleSubmitAcknowledgment = async () => {
    if (!user?.id || !selectedRecord) return;
    if (!uploadedFileUrl) {
      toast.error('Please upload the completed PDF document');
      return;
    }
    if (!signatureData) {
      toast.error('Please sign to acknowledge the document');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitHRRecordAcknowledgment({
        recordId: selectedRecord.id,
        userId: user.id,
        uploadedFileUrl,
        signatureDataUrl: signatureData,
        notes: acknowledgmentNotes,
      });

      if (result.success) {
        toast.success('Document acknowledged and submitted');
        setAcknowledgeDialogOpen(false);
        await fetchHRRecords();
      } else {
        toast.error(result.error || 'Failed to submit acknowledgment');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-blue-600" />
          <p className="text-sm text-slate-500">Loading HR records...</p>
        </div>
      </div>
    );
  }

  const renderRecordCard = (record: HRRecord) => (
    <Card key={record.id} className="bg-slate-700 border-slate-600 shadow-xl hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 rounded-lg ${getRecordTypeIconColor(record.record_type)} flex items-center justify-center flex-shrink-0`}>
            {getRecordTypeIcon(record.record_type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-slate-50">{getRecordTypeLabel(record.record_type)}</h3>
              <Badge className={`${getRecordTypeColor(record.record_type)} border`}>
                {getRecordTypeLabel(record.record_type)}
              </Badge>
              {record.acknowledged_at && (
                <Badge className="bg-green-900/30 text-green-400 border-green-500/30 gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Acknowledged
                </Badge>
              )}
              {record.visibility === 'private' && (
                <Lock className="h-4 w-4 text-slate-500" />
              )}
            </div>
            <p className="text-sm text-slate-400 mb-3">
              {new Date(record.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>

            {record.content && (
              <p className="text-sm text-slate-300 mb-3">{record.content}</p>
            )}

            {/* PDF Preview */}
            {previewRecordId === record.id && record.file_url && (
              <div className="border border-slate-600 rounded-lg overflow-hidden bg-slate-800 mb-3">
                <iframe
                  src={`${record.file_url}#toolbar=1&navpanes=0&scrollbar=1`}
                  className="w-full h-[400px] rounded-lg"
                  title={getRecordTypeLabel(record.record_type)}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {record.file_url && (
                <>
                  <Button onClick={() => handleDownloadPDF(record)} variant="outline" size="sm" className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-600">
                    <FileDown className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={() => setPreviewRecordId(previewRecordId === record.id ? null : record.id)}
                    variant="outline" size="sm" className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-600"
                  >
                    {previewRecordId === record.id ? (
                      <><EyeOff className="h-4 w-4 mr-2" />Hide PDF</>
                    ) : (
                      <><Eye className="h-4 w-4 mr-2" />View PDF</>
                    )}
                  </Button>
                </>
              )}
              {record.file_url && !record.acknowledged_at && (
                <Button onClick={() => openAcknowledgeDialog(record)} size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1">
                  <Upload className="h-4 w-4" />
                  Acknowledge & Submit
                </Button>
              )}
            </div>

            {/* Acknowledgment info */}
            {record.acknowledged_at && (
              <div className="p-3 bg-green-900/20 rounded-lg border border-green-500/30 mt-3 space-y-2">
                <p className="text-sm text-green-300 font-medium">
                  Acknowledged on {new Date(record.acknowledged_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
                {record.acknowledgment_file_url && (
                  <a href={record.acknowledgment_file_url} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    View submitted document
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {record.signature_url && (
                  <div>
                    <p className="text-xs text-green-300 mb-1">Signature:</p>
                    <img src={record.signature_url || "/placeholder.svg"} alt="Signature" className="max-w-[200px] h-auto border border-green-500/30 rounded bg-slate-800 p-1" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-50">My HR Records</h1>
        <p className="text-slate-300 mt-1">Your personal HR documents and records</p>
      </div>

      {records.length === 0 ? (
        <Card className="bg-slate-700 border-slate-600 shadow-xl">
          <CardContent className="py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-slate-500" />
            </div>
            <p className="text-slate-50 font-medium">No HR records available yet</p>
            <p className="text-slate-400 text-sm mt-1">Your HR documents will appear here when issued</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList className="bg-slate-700 border border-slate-600 p-1">
            <TabsTrigger value="timeline" className="flex items-center gap-2 data-[state=active]:bg-slate-800 data-[state=active]:text-slate-50">
              <Calendar className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="category" className="flex items-center gap-2 data-[state=active]:bg-slate-800 data-[state=active]:text-slate-50">
              <ClipboardList className="h-4 w-4" />
              By Category
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-4">
            {sortedRecords.map((record) => renderRecordCard(record))}
          </TabsContent>

          <TabsContent value="category" className="space-y-8">
            {Object.entries(recordsByType).map(([type, typeRecords]) => (
              <div key={type}>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-600">
                  <Badge className={`${getRecordTypeColor(type)} border`}>
                    {typeRecords.length}
                  </Badge>
                  <h3 className="text-lg font-semibold text-slate-50">
                    {getRecordTypeLabel(type)}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {typeRecords
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((record) => renderRecordCard(record))}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      )}

      {/* Acknowledge Dialog */}
      <Dialog open={acknowledgeDialogOpen} onOpenChange={setAcknowledgeDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Acknowledge & Submit Document
            </DialogTitle>
            <DialogDescription>
              Upload the completed PDF document, sign to acknowledge, and submit to admin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Step 1: Upload PDF */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Step 1: Upload Completed PDF</h3>

              {!uploadedFileUrl && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}
                    ${isUploading ? 'pointer-events-none opacity-60' : ''}
                  `}
                >
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="hr-file-upload"
                    disabled={isUploading}
                  />
                  <label htmlFor="hr-file-upload" className="cursor-pointer">
                    <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-700 mb-1">
                      Click to Upload or Drag PDF Here
                    </p>
                    <p className="text-xs text-slate-500">
                      Only PDF files accepted. Maximum: 10MB
                    </p>
                  </label>
                </div>
              )}

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Uploading...</span>
                    <span className="text-slate-600">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {uploadedFileUrl && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900 text-sm">
                          {uploadedFile?.name || 'Document uploaded'}
                        </p>
                        {uploadedFile && (
                          <p className="text-xs text-green-700">{formatFileSize(uploadedFile.size)}</p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRemoveFile}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Signature */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Step 2: Sign to Acknowledge</h3>
              <SignatureCanvas onSignature={setSignatureData} signatureData={signatureData} />
            </div>

            {/* Step 3: Notes */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-900">Step 3: Additional Notes (Optional)</h3>
              <Textarea
                placeholder="Add any notes or questions..."
                value={acknowledgmentNotes}
                onChange={(e) => setAcknowledgmentNotes(e.target.value)}
                className="min-h-20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAcknowledgeDialogOpen(false)} disabled={isSubmitting} className="bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAcknowledgment}
              disabled={!uploadedFileUrl || !signatureData || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</>
              ) : (
                <><CheckCircle2 className="h-4 w-4 mr-2" />Submit Acknowledgment</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Inline Signature Canvas Component
function SignatureCanvas({
  onSignature,
  signatureData,
}: {
  onSignature: (data: string | null) => void;
  signatureData: string | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const getPosition = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const pos = getPosition(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const pos = getPosition(e);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setIsEmpty(false);
  };

  const stopDrawing = () => {
    if (isDrawing && canvasRef.current && !isEmpty) {
      const data = canvasRef.current.toDataURL('image/png');
      onSignature(data);
    }
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setIsEmpty(true);
    onSignature(null);
  };

  return (
    <div className="space-y-2">
      <div className="border-2 border-dashed border-slate-300 rounded-lg bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          width={500}
          height={150}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full cursor-crosshair touch-none"
          style={{ height: '150px' }}
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Draw your signature above</p>
        <Button type="button" variant="ghost" size="sm" onClick={clearSignature} disabled={isEmpty}
          className="text-slate-600 hover:text-red-600 gap-1">
          <Trash2 className="h-3 w-3" />
          Clear
        </Button>
      </div>
      {signatureData && (
        <div className="flex items-center gap-1 text-green-600 text-xs">
          <CheckCircle2 className="h-3 w-3" />
          Signature captured
        </div>
      )}
    </div>
  );
}
