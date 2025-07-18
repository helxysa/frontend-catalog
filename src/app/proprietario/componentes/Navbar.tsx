"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 transition-all duration-300 z-50 shadow-sm">
      <div className="h-20 flex items-center justify-between px-6 lg:px-8 w-full max-w-[1880px] mx-auto">
        {/* Left side - Catalog */}
        <div className="flex items-center">
          <Link
            href="/proprietario"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
          >

            <span className="text-2xl font-bold text-gray-900">Catalog</span>
          </Link>
        </div>

        {/* Right side - Ministry Info, Logo and Logout */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 relative flex-shrink-0">
                <Image
                  src="/images.webp"
                  alt="MP-AP Logo"
                  width={56}
                  height={56}
                  className="object-contain w-full h-full"
                  priority
                  sizes="56px"
                />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">Ministério Público</h2>
                <p className="text-sm text-gray-600">do Estado do Amapá</p>
              </div>
            </div>

            <div className="h-10 border-l border-gray-300" />

            <button
              onClick={async () => {
                await logout();
                router.push('/login');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-3 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
            title={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMobileMenuOpen ? (
              <X className="h-7 w-7" />
            ) : (
              <Menu className="h-7 w-7" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-20 right-0 left-0 bg-white border-b border-gray-200 shadow-lg md:hidden z-50">
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
              {/* Mobile Logo */}
              <div className="h-16 w-16 relative">
                <Image
                  src="/images.webp"
                  alt="MP-AP Logo"
                  width={64}
                  height={64}
                  className="object-contain w-full h-full"
                  sizes="64px"
                />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">Ministério Público</h2>
                <p className="text-sm text-gray-600">do Estado do Amapá</p>
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              {/* Logout Button for Mobile */}
              <button
                onClick={async () => {
                  await logout();
                  router.push('/login');
                }}
                className="flex items-center gap-2 w-full px-4 py-3 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}