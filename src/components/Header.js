"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Header() {
  const cart = useSelector(state => state.cart);
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  const cartItemCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  const isAdmin = session?.user?.role === 'admin';

  return (
    <header className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-purple-600">Hamza Shop</span>
          </Link>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-gray-900 focus:outline-none">
  {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
</button>

          </div>

          {/* Navigation */}
          <nav className={`${isMenuOpen ? 'block' : 'hidden'} md:flex md:items-center md:space-x-8`}>
            <Link href="/" className="block text-gray-600 hover:text-gray-900 py-2 md:py-0">
              Home
            </Link>
            <Link href="/men" className="block text-gray-600 hover:text-gray-900 py-2 md:py-0">
              Men
            </Link>
            <Link href="/women" className="block text-gray-600 hover:text-gray-900 py-2 md:py-0">
              Women
            </Link>
            <Link href="/unisex" className="block text-gray-600 hover:text-gray-900 py-2 md:py-0">
              Unisex
            </Link>
          </nav>

          {/* Right side icons */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/cart" className="text-gray-600 hover:text-gray-900">
              <div className="relative">
                <ShoppingCartIcon className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-purple-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </span>
                )}
              </div>
            </Link>

            {session ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                  <UserIcon className="h-6 w-6" />
                  <span className="hidden md:inline">{session.user.name}</span>
                </button>
                <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/signin"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}