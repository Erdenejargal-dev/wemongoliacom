'use client';

import { useState } from 'react';
import { Menu, X, ChevronDown, Mountain, ArrowRight, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left - Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#destinations" className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
              Destinations
              <ChevronDown className="w-3.5 h-3.5" />
            </a>
            <a href="#travel" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
              Tours
            </a>
            <a href="#about" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
              About Us
            </a>
            <Link href="/dashboard/business" className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors">
              For Business
            </Link>
          </div>

          {/* Center - Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img 
              src="/wemongolia.svg" 
              alt="We Mongolia Logo" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Right - Actions */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="h-9 w-20 bg-gray-200 animate-pulse rounded-lg"></div>
            ) : session ? (
              <div className="flex items-center gap-3">
                <Link 
                  href="/dashboard" 
                  className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{session.user?.name}</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="hidden sm:flex items-center gap-1 text-gray-600 hover:text-red-600 text-sm font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="hidden sm:block text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                  Sign in
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2">
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col gap-1">
              <a 
                href="#destinations" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Destinations
              </a>
              <a 
                href="#travel" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Tours
              </a>
              <a 
                href="#about" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                About Us
              </a>
              <Link
                href="/dashboard/business"
                onClick={() => setMobileMenuOpen(false)}
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold p-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                For Business
              </Link>
              <div className="border-t border-gray-200 mt-2 pt-2">
                {session ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      {session.user?.name}
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 text-gray-600 hover:text-red-600 text-sm font-medium p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-gray-600 hover:text-gray-900 text-sm font-medium p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-orange-500 hover:text-orange-600 text-sm font-medium p-3 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
