"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Building2 } from 'lucide-react';
import UnitSwitcher from '../../proprietario/componentes/UnitSwitcher';
import { getProprietario, baseURL } from '../../proprietario/actions/actions';

interface Proprietario {
  id: number;
  nome: string;
  sigla: string;
  logo: string;
}

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [proprietario, setProprietario] = useState<Proprietario | null>(null);
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === '/proprietario') {
      return 'Proprietários';
    }
    
    if (pathname.includes('/dashboard')) {
      return 'Dashboard';
    }
    
    if (pathname.includes('/demandas')) {
      return 'Demandas';
    }
    
    if (pathname.includes('/solucoes')) {
      return 'Soluções';
    }
    
    if (pathname.includes('/relatorios')) {
      return 'Relatórios';
    }
    
    if (pathname.includes('/configuracoes')) {
      const configPath = pathname.split('/').pop();
      if (configPath && configPath !== 'configuracoes') {
        return configPath.charAt(0).toUpperCase() + configPath.slice(1);
      }
      return 'Configurações';
    }
    
    return '';
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Fetch proprietario details
    const fetchProprietarioDetails = async () => {
      const storedId = localStorage.getItem('selectedProprietarioId');
      if (storedId) {
        try {
          const data = await getProprietario();
          const selected = data.find((p: Proprietario) => p.id === parseInt(storedId));
          if (selected) {
            setProprietario(selected);
          }
        } catch (error) {
          console.error('Error fetching proprietario details:', error);
        }
      }
    };

    fetchProprietarioDetails();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav className={`
      fixed top-0 right-0 bg-white border-b border-gray-200 transition-all duration-300
      ${isMobileView ? 'left-0' : 'left-64'}
      z-50
    `}>
      <div className="h-16 flex items-center justify-between px-6">
        {/* Page Title */}
        <h1 className="text-xl font-semibold text-gray-800">
          {getPageTitle()}
        </h1>

        {/* Unit Switcher and Mobile Menu */}
        <div className="flex items-center gap-4 mr-8">
          <div className="relative z-20">
            <UnitSwitcher />
          </div>
          
          {/* Mobile menu button - Only show on mobile */}
          {isMobileView && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              title={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileView && isMobileMenuOpen && (
        <div className="absolute top-16 right-0 left-0 bg-white border-b border-gray-200 shadow-lg">
          <div className="p-2 space-y-1">
            <Link
              href="/ajuda"
              className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Ajuda
            </Link>
            <Link
              href="/configuracoes"
              className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Configurações
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}