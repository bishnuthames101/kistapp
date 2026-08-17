'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';

/**
 * This page used to POST to `http://127.0.0.1:8000/api/password-reset/`, a
 * Django endpoint that no longer exists — so every request failed and anyone
 * who forgot their password was locked out for good. It now talks to
 * /api/auth/password-reset.
 *
 * The success message is deliberately non-committal ("if an account exists"):
 * confirming whether an email is registered would let anyone test who is a
 * patient of the clinic.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus({
          type: 'error',
          message: data.error || 'Something went wrong. Please try again.',
        });
        return;
      }

      setStatus({ type: 'success', message: data.message });
    } catch {
      setStatus({
        type: 'error',
        message: 'Could not reach the server. Please check your connection.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we&apos;ll send you a link to reset your password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {status.type === 'success' ? (
            <div className="text-center">
              <div className="p-4 rounded-md bg-green-50 text-green-700 text-sm">
                {status.message}
              </div>
              <p className="mt-4 text-sm text-gray-600">
                The link expires in 30 minutes and can only be used once.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-block font-medium text-blue-600 hover:text-blue-500"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 py-2 sm:text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {status.message && status.type === 'error' && (
                  <div className="p-4 rounded-md bg-red-50 text-red-700 text-sm" role="alert">
                    {status.message}
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isLoading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Sending...' : 'Send reset link'}
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Back to login
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
