'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock } from 'lucide-react';

/**
 * Replaces /reset-password/[uid]/[token], which POSTed a `uid` + `token` pair
 * to a dead Django endpoint. The uid is gone: it was a second identifier the
 * server had to trust, and the token alone already resolves to exactly one
 * user server-side.
 */

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPasswordPage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < MIN_PASSWORD_LENGTH) {
      setStatus({
        type: 'error',
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: "Passwords don't match" });
      return;
    }

    setIsLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
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
      setTimeout(() => router.push('/login'), 2000);
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
          Set new password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Choose a new password for your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {status.type === 'success' ? (
            <div className="text-center">
              <div className="p-4 rounded-md bg-green-50 text-green-700 text-sm">
                {status.message}
              </div>
              <p className="mt-4 text-sm text-gray-600">Taking you to the login page...</p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={MIN_PASSWORD_LENGTH}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 py-2 sm:text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    autoComplete="new-password"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  At least {MIN_PASSWORD_LENGTH} characters.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 py-2 sm:text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {status.message && status.type === 'error' && (
                <div className="p-4 rounded-md bg-red-50 text-red-700 text-sm" role="alert">
                  {status.message}
                  <div className="mt-2">
                    <Link href="/forgot-password" className="font-medium underline">
                      Request a new link
                    </Link>
                  </div>
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
                  {isLoading ? 'Resetting...' : 'Reset password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
