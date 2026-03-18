'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import axios from 'axios';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';

export interface User {
  id: string;
  phone: string;
  name: string;
  email: string;
  address: string;
  role: 'patient' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (phone: string, password: string) => Promise<void>;
  register: (phone: string, password: string, name: string, email: string, address: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  // Map NextAuth session to User type
  const user: User | null = session?.user ? {
    id: (session.user as any).id || '',
    phone: (session.user as any).phone || '',
    name: session.user.name || '',
    email: session.user.email || '',
    address: (session.user as any).address || '',
    role: (session.user as any).role || 'patient',
  } : null;

  const login = async (phone: string, password: string) => {
    const result = await signIn('credentials', {
      phone,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    if (!result?.ok) {
      throw new Error('Login failed');
    }

    // Wait a bit for the session to be updated
    await new Promise(resolve => setTimeout(resolve, 100));
  };

  const register = async (phone: string, password: string, name: string, email: string, address: string) => {
    try {
      const response = await axios.post('/api/auth/register', {
        phone,
        password,
        name,
        email,
        address,
      });

      // After successful registration, log the user in
      await login(phone, password);
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
  };

  // Auto-logout after 90 seconds of inactivity
  useInactivityTimeout({
    timeout: 90000, // 90 seconds in milliseconds
    onTimeout: () => {
      if (user) {
        logout();
      }
    },
    enabled: !!user, // Only enable when user is logged in
  });

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
