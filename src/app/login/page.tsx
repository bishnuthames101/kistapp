import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Login - KIST Poly Clinic',
  description: 'Sign in to your account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
