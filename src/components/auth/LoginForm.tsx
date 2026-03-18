'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Phone, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function LoginForm() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [timeoutMessage, setTimeoutMessage] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user was redirected due to timeout
    if (searchParams.get('timeout') === 'true') {
      setTimeoutMessage('Your session has expired due to inactivity. Please login again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await login(phone, password);

      // Update session to get the latest user data
      await update();

      // Wait a bit more for session to fully update
      await new Promise(resolve => setTimeout(resolve, 200));

      // Get the updated session
      const response = await fetch('/api/auth/session');
      const sessionData = await response.json();

      // Redirect based on user role
      if (sessionData?.user?.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      setError(error.message || 'Failed to login. Please check your credentials.');
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
        <p className="mt-2 text-gray-600">Please sign in to your account</p>
      </div>
      {timeoutMessage && (
        <div className="glass-card bg-yellow-50/50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">{timeoutMessage}</p>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="glass-card bg-red-50/50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
      <form className="glass-form mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="phone" className="glass-label">Phone number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="glass-input pl-10"
                placeholder="Phone number (98XXXXXXXX)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                pattern="^[9][0-9]{9}$"
                title="Please enter a valid 10-digit phone number starting with 9"
                autoComplete="username"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="glass-label">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="glass-input pl-10"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="glass-button w-full"
          >
            Sign in
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
