'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="max-w-5xl mx-auto px-3 sm:px-4 min-h-14 py-2 flex items-center justify-between gap-2">
        <Link
          href="/"
          className="font-semibold text-base sm:text-lg shrink-0 whitespace-nowrap"
        >
          🔨 Auction House
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 text-sm">
          {user ? (
            <>
              <Link
                href="/auctions/new"
                className="rounded-md bg-black px-2.5 sm:px-3 py-1.5 text-white hover:bg-gray-800 whitespace-nowrap"
              >
                + Sell<span className="hidden sm:inline"> an item</span>
              </Link>
              <span className="hidden md:inline text-gray-600 max-w-[10rem] truncate">
                Hi, {user.name}
              </span>
              <button
                onClick={logout}
                className="rounded-md bg-gray-100 px-2.5 sm:px-3 py-1.5 hover:bg-gray-200 whitespace-nowrap"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-1 hover:underline whitespace-nowrap"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-black px-2.5 sm:px-3 py-1.5 text-white hover:bg-gray-800 whitespace-nowrap"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
