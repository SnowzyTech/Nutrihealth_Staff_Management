'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, FileText, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
  documentTitle: string;
  onFillFormClick?: () => void;
  showFillButton?: boolean;
}

export function PDFViewer({
  pdfUrl,
  documentTitle,
  onFillFormClick,
  showFillButton = true,
}: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isIframeVisible, setIsIframeVisible] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${documentTitle}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Unable to display PDF. Please download and open manually.');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Viewer
          </CardTitle>
          <CardDescription>
            View the PDF document below or download it to fill manually
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Download Button */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="bg-transparent gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>

            {isIframeVisible ? (
              <Button
                onClick={() => setIsIframeVisible(false)}
                variant="outline"
                className="bg-transparent gap-2"
              >
                <EyeOff className="h-4 w-4" />
                Hide PDF
              </Button>
            ) : (
              <Button
                onClick={() => setIsIframeVisible(true)}
                variant="outline"
                className="bg-transparent gap-2"
              >
                <Eye className="h-4 w-4" />
                View PDF
              </Button>
            )}

            {showFillButton && onFillFormClick && (
              <Button
                onClick={onFillFormClick}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Fill Form Fields
              </Button>
            )}
          </div>

          {/* PDF Viewer */}
          {isIframeVisible && (
            <div className="space-y-2">
              {isLoading && (
                <div className="h-96 bg-slate-100 rounded-lg flex items-center justify-center">
                  <div className="text-slate-600">Loading PDF...</div>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                className="w-full h-96 rounded-lg border border-slate-200"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title={documentTitle}
              />
              <p className="text-xs text-slate-500">
                You can view and interact with the PDF above. Use the toolbar to zoom, search, or print.
              </p>
            </div>
          )}

          {/* Info Message */}
          {!isIframeVisible && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <span className="font-semibold">To fill this PDF:</span> Download the file, open it with Adobe Reader or your PDF editor, fill in the required fields, save it, and upload the completed file.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
