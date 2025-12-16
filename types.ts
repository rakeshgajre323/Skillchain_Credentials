export enum UserRole {
  STUDENT = 'STUDENT',
  INSTITUTE = 'INSTITUTE',
  COMPANY = 'COMPANY',
  ADMIN = 'ADMIN'
}

export type ViewState = 'LANDING' | 'LOGIN' | 'SIGNUP' | 'VERIFY_OTP' | 'DASHBOARD' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD' | 'ADD_CERTIFICATE' | 'VERIFY';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  apparId?: string; // For students
  recognitionNumber?: string; // For institutes
  isVerified?: boolean;
  phone?: string;
  status?: 'pending' | 'active' | 'suspended';
}

export interface Certificate {
  id: string;
  certificateId: string; // UUID
  studentName: string;
  studentApparId: string;
  courseName: string;
  grade: string;
  issuerName: string;
  issueDate: string;
  ipfsCid: string;
  blockchainTx: string;
  isValid: boolean;
  imageUrl?: string; // Optional custom image
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}