# Account Creation Flow - Nutrihealth Consult

## Overview

This document explains how accounts are created in the Nutrihealth Consult system. Based on the original specification, **staff members do NOT create their own accounts**. Instead, **only administrators can create staff accounts**.

---

## Account Creation Flow

### 1. Initial Admin Setup
When the system is first deployed, an **admin creates their own account** at the admin signup page.

**Path:** `/auth/admin-signup`

**Requirements:**
- Admin setup code (from environment variable `NEXT_PUBLIC_ADMIN_SIGNUP_CODE`)
- First name, Last name, Email, Password
- Admin account is created with `role = 'admin'`

**Process:**
1. Admin navigates to `/auth/admin-signup`
2. Enters admin setup code for verification
3. Creates account with email and secure password
4. System redirects to login page
5. Admin logs in and access admin dashboard at `/admin`

---

### 2. Staff Account Creation by Admin
Admins create staff accounts through the admin dashboard.

**Path:** `/admin/staff` - Add New Staff button

**Staff Creation Flow:**
1. Admin navigates to `/admin/staff`
2. Clicks "Add New Staff Member" button
3. Fills in form:
   - First Name
   - Last Name
   - Email
   - Employee ID
   - Department
   - Position
   - Start Date
   - Send Welcome Email (checkbox)

4. Admin submits form
5. Server Action (`createStaffMember`) is triggered:
   - Generates temporary secure password (12 characters)
   - Creates Supabase Auth user
   - Creates user record in database with `role = 'staff'`
   - Sends welcome email with temporary password (if checkbox enabled)
   - Returns temporary password to admin (if email not sent)

6. Admin either:
   - **Option A:** Lets system send email with temporary password and login instructions
   - **Option B:** Copies temporary password and manually communicates it to staff

---

### 3. Staff First Login & Password Change
When staff receives their temporary password, they must change it on first login.

**Process:**
1. Staff logs in at `/auth/login` with:
   - Email: (provided by admin)
   - Password: (temporary password)

2. System detects `requires_password_change = true` metadata
3. Redirects to `/auth/change-password` page
4. Staff enters new secure password
5. Password is changed in Supabase Auth
6. Redirects to `/dashboard`
7. Staff now has full access with their new password

---

## Staff Account Self-Signup

**Status:** DISABLED (By specification)

The `/auth/signup` page exists for documentation purposes but includes a message:

> "Staff accounts are created by administrators. Contact your admin if you need an account."

This prevents unauthorized staff self-registration.

---

## Password Recovery

If staff forget their password:

1. Go to `/auth/login`
2. Click "Forgot password?" link
3. Navigate to `/auth/forgot-password`
4. Enter email address
5. System sends password reset email (via Resend)
6. Staff clicks reset link
7. Sets new password
8. Returns to login

---

## Email Notifications

### Welcome Email (New Staff Account)
Sent when admin creates staff account with "Send Welcome Email" enabled.

**Content:**
- Greeting with staff name
- Account creation confirmation
- Temporary password (or instructions to get it from admin)
- Link to login page
- Steps to log in and change password

**Sent To:** Staff email address
**Provider:** Resend email service

### Password Reset Email
Sent when staff requests password recovery.

**Content:**
- Password reset link
- Instructions to create new password
- Note about security

---

## Account Roles & Permissions

### Admin Role
- Create/edit/delete staff accounts
- Manage handbook content
- Assign training courses
- Upload HR documents
- View all staff records
- Full system access

### Staff Role
- View assigned documents
- Complete onboarding
- View training courses
- Access handbook (read-only)
- Change own password
- View own profile
- Sign documents

---

## Security Considerations

1. **Temporary Passwords:** Generated with 12+ characters including uppercase, lowercase, numbers, symbols
2. **Forced Password Change:** Staff must change temporary password on first login
3. **Admin Code:** Admin signup protected by admin code verification
4. **RLS Policies:** Database row-level security prevents unauthorized access
5. **Email Verification:** Supabase handles email verification
6. **No Self-Registration:** Staff cannot create accounts without admin

---

## Environment Variables Required

For admin signup code:
\`\`\`
NEXT_PUBLIC_ADMIN_SIGNUP_CODE=your-admin-code-here
\`\`\`

For email sending:
\`\`\`
RESEND_API_KEY=your-resend-api-key
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
\`\`\`

---

## Database Schema for Accounts

### users table
\`\`\`sql
id UUID PRIMARY KEY  -- Supabase auth.users.id
email TEXT UNIQUE
first_name TEXT
last_name TEXT
employee_id TEXT UNIQUE
role enum ('admin', 'staff')
department TEXT
position TEXT
is_active BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
\`\`\`

### Supabase Auth user_metadata
\`\`\`json
{
  "full_name": "John Doe",
  "requires_password_change": true/false
}
\`\`\`

---

## Troubleshooting

### Staff Can't Login
- Check email and temporary password are correct
- Verify staff account exists in `/admin/staff`
- Check `is_active` status in database

### Welcome Email Not Received
- Verify Resend API key is configured
- Check spam/junk folder
- Verify email address in staff creation form

### Admin Signup Code Not Working
- Verify `NEXT_PUBLIC_ADMIN_SIGNUP_CODE` environment variable is set
- Check for extra spaces or typos
- Code is case-sensitive

### Staff Can't Change Password
- Check they're being redirected to `/auth/change-password`
- Verify `requires_password_change` is true in user metadata
- Ensure new password meets security requirements (6+ characters)

---

## API Endpoints & Server Actions

### Authentication Actions
- `loginAction()` - Staff/Admin login
- `signupAction()` - General signup (staff or admin)
- `logoutAction()` - Logout user
- `resetPasswordAction()` - Request password reset
- `changePasswordAction()` - Change password

### User Management Actions
- `getUserProfile()` - Get user details
- `updateUserProfile()` - Update user information
- `getAllStaff()` - Get list of all staff (admin only)
- `createStaffMember()` - Create new staff account (admin only)
- `deactivateStaff()` - Deactivate staff account (admin only)

---

## Flow Diagram

\`\`\`
First Time Setup:
┌─────────────────────────────────────┐
│ Admin visits /auth/admin-signup     │
├─────────────────────────────────────┤
│ Enters admin code + credentials     │
├─────────────────────────────────────┤
│ Account created with role='admin'   │
├─────────────────────────────────────┤
│ Admin logs in at /auth/login        │
└─────────────────────────────────────┘

Staff Account Creation:
┌─────────────────────────────────────┐
│ Admin visits /admin/staff           │
├─────────────────────────────────────┤
│ Clicks "Add New Staff Member"       │
├─────────────────────────────────────┤
│ Fills in staff details              │
├─────────────────────────────────────┤
│ System generates temp password      │
├─────────────────────────────────────┤
│ Sends welcome email with password   │
├─────────────────────────────────────┤
│ Staff receives email                │
└─────────────────────────────────────┘

Staff First Login:
┌─────────────────────────────────────┐
│ Staff visits /auth/login            │
├─────────────────────────────────────┤
│ Enters email + temp password        │
├─────────────────────────────────────┤
│ System detects requires_password... │
├─────────────────────────────────────┤
│ Redirects to /change-password       │
├─────────────────────────────────────┤
│ Staff enters new password           │
├─────────────────────────────────────┤
│ Redirects to /dashboard             │
└─────────────────────────────────────┘
\`\`\`
