import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';

// ImageKit configuration
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
});

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

    // Validate file size (50MB max for videos, 10MB for others)
    const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size: ${file.type.startsWith('video/') ? '50MB' : '10MB'}` },
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
