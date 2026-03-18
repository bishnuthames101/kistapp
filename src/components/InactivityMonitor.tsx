'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InactivityMonitor() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const lastActivityRef = useRef(Date.now());
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Get timeout based on user role
  const getInactivityTimeout = () => {
    if (!session?.user?.role) return 120000; // Default 2 minutes
    return session.user.role === 'admin' ? 90000 : 120000; // 90s for admin, 120s for patient
  };

  // Reset activity timer
  const resetActivity = () => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
    setShowWarning(false);

    // Update session to refresh the lastActivity timestamp on server
    if (session) {
      update();
    }
  };

  // Check for inactivity
  const checkInactivity = () => {
    if (status !== 'authenticated' || !session) return;

    const now = Date.now();
    const timeSinceActivity = now - lastActivityRef.current;
    const timeout = getInactivityTimeout();
    const warningTime = timeout - 15000; // Show warning 15 seconds before logout

    // Show warning
    if (timeSinceActivity > warningTime && !warningShownRef.current) {
      warningShownRef.current = true;
      setShowWarning(true);
      setTimeLeft(Math.ceil((timeout - timeSinceActivity) / 1000));
    }

    // Update countdown
    if (warningShownRef.current) {
      const remaining = Math.ceil((timeout - timeSinceActivity) / 1000);
      setTimeLeft(remaining > 0 ? remaining : 0);
    }

    // Logout on timeout
    if (timeSinceActivity > timeout) {
      handleLogout();
    }
  };

  const handleLogout = async () => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    const isAdmin = session?.user?.role === 'admin';
    await signOut({ redirect: false });

    // Redirect to appropriate login page
    router.push(isAdmin ? '/admin-login?timeout=true' : '/login?timeout=true');
  };

  const handleStayLoggedIn = () => {
    resetActivity();
  };

  useEffect(() => {
    if (status !== 'authenticated') return;

    // Activity event listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

    // Throttled activity handler (max once per 5 seconds)
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledResetActivity = () => {
      if (!throttleTimeout) {
        resetActivity();
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
        }, 5000); // Throttle: only update every 5 seconds
      }
    };

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, throttledResetActivity);
    });

    // Start checking for inactivity
    checkIntervalRef.current = setInterval(checkInactivity, 1000); // Check every second

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, throttledResetActivity);
      });

      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }

      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [status, session]);

  // Don't render anything if not authenticated
  if (status !== 'authenticated' || !showWarning) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Session About to Expire
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            You will be logged out in <span className="font-bold text-red-600">{timeLeft}</span> seconds due to inactivity.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleStayLoggedIn}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Stay Logged In
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Logout Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
