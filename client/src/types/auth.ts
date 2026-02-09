export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  providerId: string;
  role?: 'admin' | 'user';
}

export interface AuthError {
  code: string;
  message: string;
}

export interface UserProfile extends AuthUser {
  city?: string;
  address?: string;
  emergencyContact?: string;
}
