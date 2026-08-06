import RegisterForm from '@/components/auth/RegisterForm';

import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Create an Account',
  description: 'Register for a KIST Poly Clinic account to book appointments, order medicines and track lab tests.',
  path: '/register',
  noIndex: true,
});

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm />
    </div>
  );
}
