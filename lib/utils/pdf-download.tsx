export async function downloadDocumentAsPDF(
  documentTitle: string,
  content: string,
  formData?: Record<string, any>,
  signatureUrl?: string
) {
  try {
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              color: #333;
            }
            h1 {
              color: #2c3e50;
              border-bottom: 2px solid #3498db;
              padding-bottom: 10px;
            }
            .content {
              line-height: 1.6;
              margin: 20px 0;
            }
            .form-data {
              margin-top: 30px;
              border-top: 1px solid #bdc3c7;
              padding-top: 20px;
            }
            .form-field {
              margin-bottom: 10px;
              page-break-inside: avoid;
            }
            .field-label {
              font-weight: bold;
              color: #2c3e50;
            }
            .field-value {
              margin-left: 20px;
              margin-bottom: 15px;
            }
            .signature {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #bdc3c7;
            }
            .signature-image {
              max-width: 200px;
              height: auto;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #bdc3c7;
              font-size: 12px;
              color: #7f8c8d;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <h1>${documentTitle}</h1>
          <div class="content">${content}</div>
          
          ${formData ? `
            <div class="form-data">
              <h2>Submitted Information</h2>
              ${Object.entries(formData)
                .map(([key, value]) => {
                  if (!value || key === 'signatureData') return '';
                  return `
                    <div class="form-field">
                      <div class="field-label">${formatLabel(key)}</div>
                      <div class="field-value">${value}</div>
                    </div>
                  `;
                })
                .join('')}
            </div>
          ` : ''}
          
          ${signatureUrl ? `
            <div class="signature">
              <p class="field-label">Digital Signature:</p>
              <img src="${signatureUrl}" class="signature-image" alt="Signature" />
              <p style="margin-top: 10px; font-size: 12px;">
                Signed on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
              </p>
            </div>
          ` : ''}
          
          <div class="footer">
            <p>This document was generated on ${new Date().toLocaleString()}</p>
            <p>Nutrihealth Consult - Staff Management System</p>
          </div>
        </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentTitle}-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, message: 'Document downloaded successfully' };
  } catch (error) {
    console.error('PDF download error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to download document' 
    };
  }
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
