'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User, Menu, X, ShoppingBag, FlaskRound as Flask, Stethoscope } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * /doctors, /about and /contact used to be reachable only from the footer,
 * even though the doctor roster is the highest-intent page on a clinic site.
 */
const NAV_LINKS: ReadonlyArray<{
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}> = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/lab-tests', label: 'Lab Tests', icon: Flask },
  { href: '/epharmacy', label: 'ePharmacy', icon: ShoppingBag },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // The dropdown previously stayed open until its own button was clicked again.
  useEffect(() => {
    if (!isUserMenuOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsUserMenuOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setIsUserMenuOpen(false);
  };

  return (
    <nav className={`glass-navbar sticky top-0 z-50 transform transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center gap-3 shrink-0" aria-label="Kist Poly Clinic home">
            <Image
              src="/logo.jpg"
              alt=""
              width={48}
              height={48}
              priority
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-1 ring-blue-600/20"
            />
            <span className="flex flex-col leading-tight">
              <span className="text-lg sm:text-xl font-bold text-blue-600">Kist Poly Clinic</span>
              <span className="hidden lg:block text-[11px] text-gray-500">
                &amp; Medical Center &middot; Estd. 2067
              </span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="text-gray-700 hover:text-blue-600 flex items-center whitespace-nowrap"
              >
                {Icon && <Icon className="w-4 h-4 mr-1" />}
                {label}
              </Link>
            ))}

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="menu"
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 glass rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">{user?.name}</span>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass-card py-1 z-50">
                    <Link
                      href={user?.role === 'admin' ? '/admin' : '/dashboard'}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-white/50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white/50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link href="/register" className="glass-button">
                  Register
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-gray-700 hover:text-blue-600 flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {Icon && <Icon className="w-4 h-4 mr-1" />}
                  {label}
                </Link>
              ))}

              {user ? (
                <>
                  <Link href={user?.role === 'admin' ? '/admin' : '/dashboard'} className="text-gray-700 hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left text-gray-700 hover:text-blue-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/register" className="glass-button inline-block text-center" onClick={() => setIsMobileMenuOpen(false)}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
