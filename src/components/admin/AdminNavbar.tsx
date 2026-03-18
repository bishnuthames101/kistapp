'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { User, LogOut } from 'lucide-react';

interface AdminNavbarProps {
  userName: string;
}

export default function AdminNavbar({ userName }: AdminNavbarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="text-xl font-bold text-blue-600">
              Admin Dashboard
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/admin/appointments" className="text-gray-600 hover:text-blue-600">
                Appointments
              </Link>
              <Link href="/admin/medicines" className="text-gray-600 hover:text-blue-600">
                Medicines
              </Link>
              <Link href="/admin/orders" className="text-gray-600 hover:text-blue-600">
                Orders
              </Link>
              <Link href="/admin/lab-tests" className="text-gray-600 hover:text-blue-600">
                Lab Tests
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700">{userName} (Admin)</span>
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                  <Link
                    href="/"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <span>Back to Site</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
