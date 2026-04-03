import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import { createServerClientWithCookies } from '@/lib/supabase/server';

// Increase timeout for larger uploads
export const maxDuration = 60;

// ImageKit configuration
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
});

/**
 * GET handler: Returns ImageKit authentication parameters for client-side direct uploads.
 * Requires an authenticated user session to prevent anonymous abuse.
 */
export async function GET() {
  try {
    // Verify the user is authenticated before issuing upload tokens
    const supabase = await createServerClientWithCookies();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (
      !process.env.IMAGEKIT_PUBLIC_KEY ||
      !process.env.IMAGEKIT_PRIVATE_KEY ||
      !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
    ) {
      return NextResponse.json(
        {
          error:
            'ImageKit is not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT in your environment variables.',
        },
        { status: 500 }
      );
    }

    const authParams = imagekit.getAuthenticationParameters();

    return NextResponse.json({
      ...authParams,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    });
  } catch (error) {
    console.error('ImageKit auth error:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication parameters' },
      { status: 500 }
    );
  }
}

/**
 * POST handler: Server-side upload fallback.
 * NOTE: This will fail on Vercel for files > 4.5MB due to serverless function payload limits.
 * Prefer using the client-side direct upload (GET auth + direct upload to ImageKit).
 * Kept as a fallback for small files or local development.
 */
export async function POST(request: NextRequest) {
  try {
    // Check if ImageKit is configured
    if (
      !process.env.IMAGEKIT_PUBLIC_KEY ||
      !process.env.IMAGEKIT_PRIVATE_KEY ||
      !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
    ) {
      return NextResponse.json(
        {
          error:
            'ImageKit is not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT in your environment variables.',
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || '/documents';
    // These are optional - used for organizing files
    const userId = formData.get('userId') as string | null;
    const documentType = formData.get('documentType') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // For completed-documents folder, only allow PDF
    const isCompletedDocuments = folder === '/completed-documents';

    // Validate file type
    const allowedTypes = isCompletedDocuments
      ? ['application/pdf']
      : [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'video/mp4',
          'video/webm',
          'image/jpeg',
          'image/png',
        ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: isCompletedDocuments
            ? 'Only PDF files are allowed for completed documents'
            : 'Invalid file type. Allowed: PDF, Word, MP4, WebM, JPEG, PNG',
        },
        { status: 400 }
      );
    }

    // Validate file size (50MB max for videos, 20MB for others)
    const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size: ${file.type.startsWith('video/') ? '50MB' : '20MB'}` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename with optional userId prefix
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const prefix = userId ? `${userId}_` : '';
    const typePrefix = documentType ? `${documentType}_` : '';
    const fileName = `${prefix}${typePrefix}${timestamp}_${safeName}`;

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
    });

    return NextResponse.json({
      success: true,
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      name: uploadResponse.name,
      filePath: uploadResponse.filePath,
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
