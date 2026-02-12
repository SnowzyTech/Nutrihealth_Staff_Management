import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject?: string;
  name?: string;
  email?: string;
  temporaryPassword?: string;
  loginUrl?: string;
  documentTitle?: string;
  actionUrl?: string;
  message?: string;
}

// Professional email template wrapper
function getEmailTemplate(content: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>NutriHealth Consult</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #14B8A6 0%, #0891B2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                    NutriHealth Consult
                  </h1>
                  <p style="margin: 5px 0 0 0; color: #E0F2F1; font-size: 14px;">
                    Excellence in Healthcare Staffing
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  ${content}
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">
                    <strong>NutriHealth Consult</strong>
                  </p>
                  <p style="margin: 0 0 5px 0; color: #6c757d; font-size: 12px;">
                    📧 support@nutrihealthconsult.com
                  </p>
                  <p style="margin: 0; color: #adb5bd; font-size: 11px;">
                    This is an automated message. Please do not reply directly to this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export async function sendWelcomeEmail({
  to,
  name,
  email,
  temporaryPassword,
  loginUrl,
}: EmailOptions) {
  try {
    console.log(`[EMAIL] Sending welcome email to ${to}`);
    
    const content = `
      <h2 style="color: #1e293b; margin: 0 0 20px 0;">Welcome to Our Team! 🎉</h2>
      
      <p style="color: #334155; line-height: 1.6; margin: 0 0 20px 0;">
        Dear <strong>${name}</strong>,
      </p>
      
      <p style="color: #334155; line-height: 1.6; margin: 0 0 20px 0;">
        Your account has been created successfully. We're excited to have you join the NutriHealth Consult family!
      </p>
      
      <div style="background-color: #f1f5f9; border-left: 4px solid #14B8A6; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 10px 0; color: #1e293b; font-size: 14px;">
          <strong>Your Login Credentials:</strong>
        </p>
        <p style="margin: 5px 0; color: #334155; font-family: 'Courier New', monospace; font-size: 14px;">
          <strong>Email:</strong> ${email}
        </p>
        <p style="margin: 5px 0; color: #334155; font-family: 'Courier New', monospace; font-size: 14px;">
          <strong>Temporary Password:</strong> ${temporaryPassword}
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #14B8A6 0%, #0891B2 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          Log In to Your Account
        </a>
      </div>
      
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #92400e; font-size: 13px;">
          ⚠️ <strong>Important:</strong> You will be required to change your password on first login for security purposes.
        </p>
      </div>
      
      <p style="color: #334155; line-height: 1.6; margin: 20px 0 0 0;">
        If you have any questions, please don't hesitate to contact our HR department.
      </p>
      
      <p style="color: #334155; line-height: 1.6; margin: 10px 0 0 0;">
        Best regards,<br>
        <strong>NutriHealth Consult HR Team</strong>
      </p>
    `;

    const result = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject: 'Welcome to NutriHealth Consult - Your Account is Ready!',
      html: getEmailTemplate(content),
    });

    if (result.error) {
      console.error('[EMAIL ERROR]', result.error);
      return { success: false, error: result.error.message };
    }

    console.log(`[EMAIL SUCCESS] Welcome email sent to ${to}. Message ID: ${result.data?.id}`);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('[EMAIL EXCEPTION]', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
  }
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: EmailOptions & { resetUrl?: string }) {
  try {
    console.log(`[EMAIL] Sending password reset to ${to}`);
    
    const content = `
      <h2 style="color: #1e293b; margin: 0 0 20px 0;">Password Reset Request 🔐</h2>
      
      <p style="color: #334155; line-height: 1.6; margin: 0 0 20px 0;">
        Hello <strong>${name}</strong>,
      </p>
      
      <p style="color: #334155; line-height: 1.6; margin: 0 0 20px 0;">
        We received a request to reset your password. Click the button below to create a new password:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #14B8A6 0%, #0891B2 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          Reset My Password
        </a>
      </div>
      
      <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #991b1b; font-size: 13px;">
          ⏱️ This link will expire in <strong>1 hour</strong> for security reasons.
        </p>
      </div>
      
      <p style="color: #64748b; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px;">
        If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>
    `;

    const result = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject: 'Reset Your Password - NutriHealth Consult',
      html: getEmailTemplate(content),
    });

    if (result.error) {
      console.error('[EMAIL ERROR]', result.error);
      return { success: false, error: result.error.message };
    }

    console.log(`[EMAIL SUCCESS] Password reset sent to ${to}`);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('[EMAIL EXCEPTION]', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
  }
}

export async function sendDocumentNotificationEmail({
  to,
  name,
  documentTitle,
  actionUrl,
}: EmailOptions) {
  try {
    console.log(`[EMAIL] Sending document notification to ${to}`);
    
    const content = `
      <h2 style="color: #1e293b; margin: 0 0 20px 0;">Action Required: New Document 📄</h2>
      
      <p style="color: #334155; line-height: 1.6; margin: 0 0 20px 0;">
        Hello <strong>${name}</strong>,
      </p>
      
      <p style="color: #334155; line-height: 1.6; margin: 0 0 20px 0;">
        You have been assigned a new document that requires your attention:
      </p>
      
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 600;">
          📋 ${documentTitle}
        </p>
      </div>
      
      <p style="color: #334155; line-height: 1.6; margin: 0 0 20px 0;">
        Please review and complete this document at your earliest convenience.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${actionUrl}" style="display: inline-block; background: linear-gradient(135deg, #14B8A6 0%, #0891B2 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          View Document
        </a>
      </div>
    `;

    const result = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject: `Action Required: ${documentTitle}`,
      html: getEmailTemplate(content),
    });

    if (result.error) {
      console.error('[EMAIL ERROR]', result.error);
      return { success: false, error: result.error.message };
    }

    console.log(`[EMAIL SUCCESS] Document notification sent to ${to}`);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('[EMAIL EXCEPTION]', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
  }
}

export async function sendTrainingAssignmentEmail({
  to,
  name,
  documentTitle,
  deadline,
  actionUrl,
}: EmailOptions & { deadline?: string }) {
  try {
    console.log(`[EMAIL] Sending training assignment to ${to}`);
    
    const content = `
      <h2 style="color: #1e293b; margin: 0 0 20px 0;">New Training Course Assigned 🎓</h2>
      
      <p style="color: #334155; line-height: 1.6; margin: 0 0 20px 0;">
        Hello <strong>${name}</strong>,
      </p>
      
      <p style="color: #334155; line-height: 1.6; margin: 0 0 20px 0;">
        You have been assigned a new training course:
      </p>
      
      <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 10px 0; color: #1e293b; font-size: 16px; font-weight: 600;">
          📚 ${documentTitle}
        </p>
        ${deadline ? `
        <p style="margin: 5px 0 0 0; color: #1e3a8a; font-size: 14px;">
          ⏰ <strong>Deadline:</strong> ${deadline}
        </p>
        ` : ''}
      </div>
      
      <p style="color: #334155; line-height: 1.6; margin: 0 0 20px 0;">
        Please complete this training course as soon as possible to stay compliant with our training requirements.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${actionUrl}" style="display: inline-block; background: linear-gradient(135deg, #14B8A6 0%, #0891B2 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          Start Course
        </a>
      </div>
    `;

    const result = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject: `New Training Assignment: ${documentTitle}`,
      html: getEmailTemplate(content),
    });

    if (result.error) {
      console.error('[EMAIL ERROR]', result.error);
      return { success: false, error: result.error.message };
    }

    console.log(`[EMAIL SUCCESS] Training assignment sent to ${to}`);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('[EMAIL EXCEPTION]', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
  }
}

// NEW: Send bulk training assignment emails
export async function sendBulkTrainingEmails(
  recipients: Array<{ email: string; name: string }>,
  courseTitle: string,
  deadline: string | undefined,
  courseUrl: string
) {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const recipient of recipients) {
    const result = await sendTrainingAssignmentEmail({
      to: recipient.email,
      name: recipient.name,
      documentTitle: courseTitle,
      deadline,
      actionUrl: courseUrl,
    });

    if (result.success) {
      results.successful++;
    } else {
      results.failed++;
      results.errors.push(`${recipient.email}: ${result.error}`);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}
