/**
 * auth.ts — Global TypeScript definitions for authentication and user sessions
 * Syailendra Group ERP
 */

export interface UserSession {
  uid: number;
  name: string;
  email: string;
  companyId: number;
  companyName: string;
  groups: number[];
  isAdmin: boolean;
}

export interface AuthActionResult<T = UserSession> {
  success: boolean;
  data?: T;
  error?: string;
}
