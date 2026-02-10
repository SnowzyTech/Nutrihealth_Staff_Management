'use client';

import React from "react"

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

interface SignaturePadProps {
  onSignatureCapture: (signatureData: string) => void;
  onClear?: () => void;
}

export function SignaturePad({ onSignatureCapture, onClear }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();

    setIsEmpty(false);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setIsEmpty(true);
    onClear?.();
  };

  const saveSignature = () => {
    if (!canvasRef.current) return;

    const signatureData = canvasRef.current.toDataURL('image/png');
    onSignatureCapture(signatureData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Digital Signature</CardTitle>
        <CardDescription>Please draw your signature below</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={400}
            height={200}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full cursor-crosshair bg-white"
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={clearSignature}
            className="flex items-center gap-2 bg-transparent"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
          <Button
            type="button"
            onClick={saveSignature}
            disabled={isEmpty}
            className="ml-auto"
          >
            Save Signature
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
