'use client';

import { useSession, signOut } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ACTIVITY_REFRESH_INTERVAL_MS,
  INACTIVITY_WARNING_LEAD_MS,
  inactivityTimeoutFor,
} from '@/lib/session-policy';

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'] as const;

export default function InactivityMonitor() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const lastActivityRef = useRef(Date.now());
  const lastServerRefreshRef = useRef(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const role = session?.user?.role;
  const timeout = inactivityTimeoutFor(role);

  const handleLogout = useCallback(async () => {
    const isAdmin = role === 'admin';
    await signOut({ redirect: false });
    router.push(isAdmin ? '/admin-login?timeout=true' : '/login?timeout=true');
  }, [role, router]);

  // useSession returns a new `update` on every render; keeping it in a ref
  // stops the effect below from tearing down and re-attaching its listeners.
  const updateRef = useRef(update);
  useEffect(() => {
    updateRef.current = update;
  }, [update]);

  const markActive = useCallback(() => {
    lastActivityRef.current = Date.now();
    // Functional form so a mousemove does not queue a state update per event.
    setShowWarning((shown) => (shown ? false : shown));
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const onActivity = () => {
      markActive();

      // Refresh the server-side timestamp on a slow cadence. This previously
      // ran every 5 seconds of mouse movement, firing a session write and a
      // throttled database read continuously while anyone used the site.
      const now = Date.now();
      if (now - lastServerRefreshRef.current > ACTIVITY_REFRESH_INTERVAL_MS) {
        lastServerRefreshRef.current = now;
        updateRef.current();
      }
    };

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, onActivity, { passive: true })
    );

    const interval = setInterval(() => {
      const idleFor = Date.now() - lastActivityRef.current;

      if (idleFor >= timeout) {
        handleLogout();
        return;
      }

      const remaining = timeout - idleFor;
      if (remaining <= INACTIVITY_WARNING_LEAD_MS) {
        setShowWarning(true);
        setTimeLeft(Math.ceil(remaining / 1000));
      }
    }, 1000);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, onActivity));
      clearInterval(interval);
    };
  }, [status, timeout, markActive, handleLogout]);

  const handleStayLoggedIn = () => {
    markActive();
    lastServerRefreshRef.current = Date.now();
    updateRef.current();
  };

  if (status !== 'authenticated' || !showWarning) {
    return null;
  }

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="inactivity-title"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 id="inactivity-title" className="text-lg font-medium text-gray-900 mb-2">
            Session About to Expire
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            You will be signed out in{' '}
            <span className="font-bold text-red-600">{timeLeft}</span> seconds due to inactivity.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              autoFocus
              onClick={handleStayLoggedIn}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Stay Signed In
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Sign Out Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
