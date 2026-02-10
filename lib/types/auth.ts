export type UserRole = 'admin' | 'staff' | 'manager';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  department?: string;
  position?: string;
  profile_image_url?: string;
  phone?: string;
  emergency_contact?: string;
  emergency_contact_phone?: string;
  date_of_hire?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
