import { z } from 'zod';

// NDA Form Schema
export const ndaFormSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  date: z.string().min(1, 'Date is required'),
  agreement_checkbox: z.boolean().refine(val => val === true, 'You must agree to the terms'),
});

// Guarantor Form Schema
export const guarantorFormSchema = z.object({
  guarantor1_name: z.string().min(2, 'First guarantor name is required'),
  guarantor1_phone: z.string().min(10, 'First guarantor phone is required'),
  guarantor1_address: z.string().min(5, 'First guarantor address is required'),
  guarantor1_relationship: z.string().min(2, 'First guarantor relationship is required'),
  guarantor2_name: z.string().min(2, 'Second guarantor name is required'),
  guarantor2_phone: z.string().min(10, 'Second guarantor phone is required'),
  guarantor2_address: z.string().min(5, 'Second guarantor address is required'),
  guarantor2_relationship: z.string().min(2, 'Second guarantor relationship is required'),
});

// Biodata Form Schema
export const biodataFormSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Gender is required' }),
  phone: z.string().min(10, 'Phone number is required'),
  email: z.string().email('Valid email is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  emergency_contact_name: z.string().min(2, 'Emergency contact name is required'),
  emergency_contact_phone: z.string().min(10, 'Emergency contact phone is required'),
  emergency_contact_relationship: z.string().min(2, 'Emergency contact relationship is required'),
});

// Contract Letter Form Schema
export const contractLetterFormSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  position: z.string().min(2, 'Position is required'),
  start_date: z.string().min(1, 'Start date is required'),
  salary: z.string().min(1, 'Salary information is required'),
  acceptance_date: z.string().min(1, 'Acceptance date is required'),
});

// Offer Letter Form Schema
export const offerLetterFormSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  position: z.string().min(2, 'Position is required'),
  acceptance_date: z.string().min(1, 'Acceptance date is required'),
  accepted: z.boolean().refine(val => val === true, 'You must accept the offer'),
});

// Type exports
export type NDAFormData = z.infer<typeof ndaFormSchema>;
export type GuarantorFormData = z.infer<typeof guarantorFormSchema>;
export type BiodataFormData = z.infer<typeof biodataFormSchema>;
export type ContractLetterFormData = z.infer<typeof contractLetterFormSchema>;
export type OfferLetterFormData = z.infer<typeof offerLetterFormSchema>;

// Form field configurations for rendering
export type FormFieldType = 'text' | 'email' | 'date' | 'checkbox' | 'radio' | 'textarea' | 'select';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export const formFieldConfigs: Record<string, FormFieldConfig[]> = {
  nda: [
    { name: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Enter your full legal name', required: true },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter your email', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'agreement_checkbox', label: 'I have read and agree to the terms of this Non-Disclosure Agreement', type: 'checkbox', required: true },
  ],
  guarantor_form: [
    { name: 'guarantor1_name', label: 'First Guarantor - Full Name', type: 'text', placeholder: 'Enter guarantor name', required: true },
    { name: 'guarantor1_phone', label: 'First Guarantor - Phone', type: 'text', placeholder: 'Enter phone number', required: true },
    { name: 'guarantor1_address', label: 'First Guarantor - Address', type: 'textarea', placeholder: 'Enter full address', required: true },
    { name: 'guarantor1_relationship', label: 'First Guarantor - Relationship', type: 'text', placeholder: 'e.g., Parent, Sibling, Friend', required: true },
    { name: 'guarantor2_name', label: 'Second Guarantor - Full Name', type: 'text', placeholder: 'Enter guarantor name', required: true },
    { name: 'guarantor2_phone', label: 'Second Guarantor - Phone', type: 'text', placeholder: 'Enter phone number', required: true },
    { name: 'guarantor2_address', label: 'Second Guarantor - Address', type: 'textarea', placeholder: 'Enter full address', required: true },
    { name: 'guarantor2_relationship', label: 'Second Guarantor - Relationship', type: 'text', placeholder: 'e.g., Parent, Sibling, Friend', required: true },
  ],
  biodata: [
    { name: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Enter your full legal name', required: true },
    { name: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
    { name: 'gender', label: 'Gender', type: 'select', options: [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }], required: true },
    { name: 'phone', label: 'Phone Number', type: 'text', placeholder: 'Enter phone number', required: true },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter email', required: true },
    { name: 'address', label: 'Residential Address', type: 'textarea', placeholder: 'Enter your full address', required: true },
    { name: 'city', label: 'City', type: 'text', placeholder: 'Enter city', required: true },
    { name: 'state', label: 'State', type: 'text', placeholder: 'Enter state', required: true },
    { name: 'emergency_contact_name', label: 'Emergency Contact Name', type: 'text', placeholder: 'Enter emergency contact name', required: true },
    { name: 'emergency_contact_phone', label: 'Emergency Contact Phone', type: 'text', placeholder: 'Enter emergency contact phone', required: true },
    { name: 'emergency_contact_relationship', label: 'Emergency Contact Relationship', type: 'text', placeholder: 'e.g., Spouse, Parent', required: true },
  ],
  contract_letter: [
    { name: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Enter your full legal name', required: true },
    { name: 'position', label: 'Position/Job Title', type: 'text', placeholder: 'Enter your position', required: true },
    { name: 'start_date', label: 'Start Date', type: 'date', required: true },
    { name: 'salary', label: 'Agreed Salary', type: 'text', placeholder: 'Enter salary amount', required: true },
    { name: 'acceptance_date', label: 'Acceptance Date', type: 'date', required: true },
  ],
  offer_letter: [
    { name: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Enter your full legal name', required: true },
    { name: 'position', label: 'Position/Job Title', type: 'text', placeholder: 'Enter your position', required: true },
    { name: 'acceptance_date', label: 'Acceptance Date', type: 'date', required: true },
    { name: 'accepted', label: 'I accept this offer of employment', type: 'checkbox', required: true },
  ],
};

// Get form schema by subtype
export function getFormSchema(subtype: string) {
  switch (subtype) {
    case 'nda':
      return ndaFormSchema;
    case 'guarantor_form':
      return guarantorFormSchema;
    case 'biodata':
      return biodataFormSchema;
    case 'contract_letter':
      return contractLetterFormSchema;
    case 'offer_letter':
      return offerLetterFormSchema;
    default:
      return null;
  }
}

// Get form field config by subtype
export function getFormFieldConfig(subtype: string): FormFieldConfig[] | null {
  return formFieldConfigs[subtype] || null;
}
