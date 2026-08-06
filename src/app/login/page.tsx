import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Patient Login',
  description: 'Sign in to your Kist Poly Clinic account to manage appointments, lab tests and pharmacy orders.',
  path: '/login',
  noIndex: true,
});

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
