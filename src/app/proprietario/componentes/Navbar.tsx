"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

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
      <div className="h-20 flex items-center justify-between px-6 lg:px-8 w-full max-w-[2000px] mx-auto">
        {/* Left side - Catalog */}
        <div className="flex items-center">
          <Link 
            href="/proprietario" 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-md font-bold text-base group-hover:from-blue-700 group-hover:to-blue-800 transition-all">
              1.0
            </div>
            <span className="text-2xl font-bold text-gray-900">Catalog</span>
          </Link>
        </div>

        {/* Right side - Ministry Info and Logo */}
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-8">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Ministério Público</h2>
              <p className="text-sm text-gray-600">do Estado do Amapá</p>
            </div>
            <div className="h-14 w-14 relative">
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
          </div>

          {/* Mobile menu button */}
          {/* <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-3 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
            title={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMobileMenuOpen ? (
              <X className="h-7 w-7" />
            ) : (
              <Menu className="h-7 w-7" />
            )}
          </button> */}
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
             
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}