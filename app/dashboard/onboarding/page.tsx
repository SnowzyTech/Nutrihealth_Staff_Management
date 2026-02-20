'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  Circle,
  FileText,
  ArrowRight,
  Lock,
  Clock,
  AlertCircle,
  PartyPopper,
} from 'lucide-react';
import Link from 'next/link';
import { getAssignedDocuments } from '@/app/actions/documents';

type DocumentStatus = 'locked' | 'not_started' | 'in_progress' | 'submitted' | 'approved';

interface DocumentWithStatus {
  id: string;
  progressId: string;
  title: string;
  description: string;
  content: string | null;
  file_url: string | null;
  document_type: string;
  is_required: boolean;
  order_index: number;
  completed_at: string | null;
  signed_at: string | null;
  status: DocumentStatus;
}

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchOnboardingData();
    }
  }, [user, loading, router]);

  const fetchOnboardingData = async () => {
    if (!user?.id) return;

    try {
      const result = await getAssignedDocuments(user.id);

      if (!result.success || !result.data || result.data.length === 0) {
        setDocuments([]);
        setIsLoading(false);
        return;
      }

      const onboardingDocs = result.data.filter((item: { document: { document_type: string } }) =>
        item.document?.document_type === 'onboarding'
      );

      const sortedDocs = onboardingDocs.sort((a: { document: { order_index: number } }, b: { document: { order_index: number } }) =>
        (a.document?.order_index || 0) - (b.document?.order_index || 0)
      );

      const docsWithStatus: DocumentWithStatus[] = sortedDocs.map((item: {
        id: string;
        completed_at: string | null;
        signed_at: string | null;
        status: string | null;
        document: {
          id: string;
          title: string;
          description: string;
          content: string | null;
          file_url: string | null;
          document_type: string;
          is_required: boolean;
          order_index: number;
        };
      }, index: number) => {
        let status: DocumentStatus = 'not_started';

        if (item.status === 'approved') {
          status = 'approved';
        } else if (item.status === 'submitted') {
          status = 'submitted';
        } else if (item.status === 'rejected') {
          status = 'in_progress';
        } else if (item.status === 'draft' || item.completed_at) {
          status = 'in_progress';
        }

        return {
          id: item.document?.id || item.id,
          progressId: item.id,
          title: item.document?.title || 'Untitled Document',
          description: item.document?.description || '',
          content: item.document?.content || null,
          file_url: item.document?.file_url || null,
          document_type: item.document?.document_type || 'onboarding',
          is_required: item.document?.is_required ?? true,
          order_index: item.document?.order_index || index,
          completed_at: item.completed_at,
          signed_at: item.signed_at,
          status,
        };
      });

      setDocuments(docsWithStatus);
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-blue-600" />
          <p className="text-sm text-slate-500">Loading onboarding documents...</p>
        </div>
      </div>
    );
  }

  const approvedCount = documents.filter((d) => d.status === 'approved').length;
  const totalCount = documents.length;
  const progressPercentage = totalCount > 0 ? (approvedCount / totalCount) * 100 : 0;
  const allComplete = approvedCount === totalCount && totalCount > 0;

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600 text-white text-xs">Approved</Badge>;
      case 'submitted':
        return <Badge className="bg-[#FE871F] text-white text-xs">Under Review</Badge>;
      case 'locked':
        return <Badge className="bg-gray-300 text-gray-700 text-xs"><Lock className="h-3 w-3 mr-1" />Locked</Badge>;
      default:
        return <Badge className="bg-gray-300 text-gray-700 text-xs">Not Started</Badge>;
    }
  };

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      case 'submitted':
        return <Clock className="h-6 w-6 text-blue-600" />;
      case 'in_progress':
        return <Circle className="h-6 w-6 text-amber-500 fill-amber-100" />;
      case 'locked':
        return <Lock className="h-6 w-6 text-slate-400" />;
      default:
        return <Circle className="h-6 w-6 text-slate-300" />;
    }
  };

  const getActionButton = (doc: DocumentWithStatus) => {
    switch (doc.status) {
      case 'locked':
        return (
          <Button disabled variant="outline" className="bg-slate-300">
            <Lock className="mr-2 h-4 w-4" />
            Unavailable
          </Button>
        );
      case 'approved':
        return (
          <Button variant="outline" asChild className="bg-slate-300">
            <Link href={`/dashboard/onboarding/${doc.id}`}>
              View Document
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        );
      case 'submitted':
        return (
          <Button disabled variant="outline" className="bg-slate-300">
            <Clock className="mr-2 h-4 w-4" />
            Awaiting Review
          </Button>
        );
      default:
        return (
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link href={`/dashboard/onboarding/${doc.id}`}>
              {doc.status === 'in_progress' ? 'Continue' : 'Start'} Document
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        );
    }
  };

  const getStatusMessage = (doc: DocumentWithStatus) => {
    switch (doc.status) {
      case 'approved':
        return (
          <div className="p-3 bg-green-50 rounded-lg border border-green-300">
            <p className="text-sm text-green-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              Approved on {new Date(doc.completed_at || '').toLocaleDateString()}
            </p>
          </div>
        );
      case 'submitted':
        return (
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-300">
            <p className="text-sm text-orange-800 flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0" />
              {"Awaiting admin review. You'll be notified once approved."}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-[#43005F]">Onboarding Documents</h1>
        <p className="text-gray-600 mt-1">Complete your onboarding requirements</p>
      </div>

      {/* Info Notice */}
      <Alert className="border-[#FE871F]/30 bg-orange-50">
        <AlertCircle className="h-5 w-5 text-[#FE871F]" />
        <AlertDescription className="text-[#43005F]">
          <span className="font-semibold">Complete all documents below.</span>{' '}
          You can open, review, and submit any document in any order. Once submitted, your admin will review and approve or request changes.
        </AlertDescription>
      </Alert>

      {/* Progress Card */}
      <Card className="bg-white border-gray-200 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Onboarding Progress</p>
              <p className="text-2xl font-bold text-[#43005F] mt-1">
                {approvedCount} <span className="text-base font-normal text-gray-600">of {totalCount} completed</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[#FE871F]">{Math.round(progressPercentage)}%</p>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-3 bg-gray-200" />
        </CardContent>
      </Card>

      {/* All Complete Celebration */}
      {allComplete && (
        <Card className="border-green-300 bg-green-50 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-green-100 border border-green-300 flex items-center justify-center flex-shrink-0">
                <PartyPopper className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-green-800 text-lg">Onboarding Complete!</h3>
                <p className="text-green-700 mt-1">
                  Congratulations! You have successfully completed all onboarding documents.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#43005F]">Required Documents</h2>
        {documents.length === 0 ? (
          <Card className="bg-white border-gray-200 shadow-xl">
            <CardContent className="py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-[#43005F] font-medium">No onboarding documents available yet</p>
              <p className="text-gray-600 text-sm mt-1">Please check back later.</p>
            </CardContent>
          </Card>
        ) : (
          documents.map((doc, index) => (
            <Card
              key={doc.id}
              className={`bg-white border-gray-200 shadow-xl transition-all ${
                doc.status === 'approved' ? 'border-green-300 bg-green-50' :
                doc.status === 'locked' ? 'opacity-60' :
                doc.status === 'submitted' ? 'border-orange-300 bg-orange-50' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Step Number */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    doc.status === 'approved' ? 'bg-green-600 text-white' :
                    doc.status === 'submitted' ? 'bg-[#FE871F] text-white' :
                    doc.status === 'locked' ? 'bg-gray-300 text-gray-600' :
                    'bg-[#43005F] text-white'
                  }`}>
                    {doc.status === 'approved' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Document Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-[#43005F]">{doc.title}</h3>
                      {getStatusBadge(doc.status)}
                      {doc.is_required && (
                        <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{doc.description}</p>

                    {/* Status Message */}
                    {getStatusMessage(doc) && (
                      <div className="mt-3">
                        {getStatusMessage(doc)}
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0 hidden sm:block">
                    {getActionButton(doc)}
                  </div>
                </div>

                {/* Mobile Action */}
                <div className="mt-4 sm:hidden">
                  {getActionButton(doc)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
