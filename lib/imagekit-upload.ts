/**
 * Client-side direct upload to ImageKit.
 * 
 * This bypasses the Vercel serverless function 4.5MB body size limit
 * by uploading files directly from the browser to ImageKit's servers.
 * 
 * Flow:
 * 1. Client fetches auth tokens from our lightweight API endpoint
 * 2. Client uploads file directly to ImageKit using those tokens
 * 3. No file data passes through Vercel serverless functions
 */

const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';

interface ImageKitAuthParams {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
}

interface UploadOptions {
  file: File;
  folder?: string;
  fileName?: string;
  userId?: string;
  documentType?: string;
  onProgress?: (progress: number) => void;
}

interface UploadResult {
  success: boolean;
  url?: string;
  fileId?: string;
  name?: string;
  filePath?: string;
  error?: string;
}

/**
 * Fetch authentication parameters from our API endpoint.
 * This is a tiny request (no file data) so it stays well under Vercel's limits.
 */
async function getAuthParams(): Promise<ImageKitAuthParams> {
  const response = await fetch('/api/uploads/documents?auth=true');

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to get upload authentication');
  }

  return response.json();
}

/**
 * Upload a file directly to ImageKit from the browser.
 * Bypasses Vercel's 4.5MB serverless function payload limit.
 */
export async function uploadToImageKit(options: UploadOptions): Promise<UploadResult> {
  const {
    file,
    folder = '/documents',
    fileName,
    userId,
    documentType,
    onProgress,
  } = options;

  try {
    // Step 1: Get auth tokens from our API (lightweight request, no file data)
    const authParams = await getAuthParams();

    // Step 2: Build the upload form data
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const prefix = userId ? `${userId}_` : '';
    const typePrefix = documentType ? `${documentType}_` : '';
    const finalFileName = fileName || `${prefix}${typePrefix}${timestamp}_${safeName}`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', finalFileName);
    formData.append('folder', folder);
    formData.append('useUniqueFileName', 'true');
    formData.append('publicKey', authParams.publicKey);
    formData.append('signature', authParams.signature);
    formData.append('expire', String(authParams.expire));
    formData.append('token', authParams.token);

    // Step 3: Upload directly to ImageKit (browser → ImageKit, bypassing Vercel)
    const uploadPromise = new Promise<UploadResult>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({
              success: true,
              url: data.url,
              fileId: data.fileId,
              name: data.name,
              filePath: data.filePath,
            });
          } catch {
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.message || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was cancelled'));
      });

      xhr.open('POST', IMAGEKIT_UPLOAD_URL);
      xhr.send(formData);
    });

    return await uploadPromise;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
    return {
      success: false,
      error: errorMessage,
    };
  }
}
