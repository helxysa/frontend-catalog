'use client'
import Link from 'next/link'; 
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ListChecks, 
  AppWindow, 
  FileText, 
  Settings, 
  ChevronDown,
  Menu,
  X,
  Building2
} from 'lucide-react';
import { getProprietario, baseURL } from '../../proprietario/actions/actions'
import Image from 'next/image';

interface Proprietario {
  id: number;
  nome: string;
  sigla: string;
  logo: string;
}

export function Sidebar() {
  const [isReportMenuOpen, setIsReportMenuOpen] = useState(false);
  const [isConfigMenuOpen, setIsConfigMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [proprietarioId, setProprietarioId] = useState<string>('');
  const [proprietario, setProprietario] = useState<Proprietario | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const storedId = localStorage.getItem('selectedProprietarioId');
    if (storedId) {
      setProprietarioId(storedId);
      fetchProprietarioDetails(storedId);
    }
  }, []);

  const fetchProprietarioDetails = async (id: string) => {
    try {
      const data = await getProprietario();
      const selected = data.find((p: Proprietario) => p.id === parseInt(id));
      if (selected) {
        setProprietario(selected);
      }
    } catch (error) {
      console.error('Error fetching proprietario details:', error);
    }
  };

  const toggleReportMenu = () => {
    setIsReportMenuOpen(!isReportMenuOpen);
  };

  const toggleConfigMenu = () => {
    setIsConfigMenuOpen(!isConfigMenuOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isMobileMenuOpen) {
      setIsReportMenuOpen(false);
      setIsConfigMenuOpen(false);
    }
  };

  const demandaLink = proprietarioId 
    ? `/proprietario/${proprietarioId}/demandas`
    : '/proprietario'; 

  const renderMenuItems = (isMobile = false) => {
    const isActive = (path: string) => {
      if (path === '/proprietario' && pathname === '/proprietario') {
        return true;
      }
      if (path !== '/proprietario' && pathname.startsWith(path)) {
        return true;
      }
      return false;
    };

    const getItemClasses = (path: string) => {
      const baseClasses = `flex items-center ${isMobile ? 'px-3 py-3' : 'px-4 py-2.5'} text-gray-600 hover:bg-gray-50 hover:text-gray-800 rounded-lg transition-colors group relative`;
      const activeClasses = isActive(path) ? 'bg-blue-50/50 text-blue-800 border-l-4 border-blue-500 pl-[calc(1rem-2px)]' : '';
      return `${baseClasses} ${activeClasses}`;
    };

    const getIconClasses = (path: string) => {
      return `w-5 h-5 ${isActive(path) ? 'text-blue-600' : 'text-gray-400'} group-hover:text-gray-600`;
    };

    return (
      <div className={`${isMobile ? 'space-y-2 p-4' : 'px-2 space-y-1'}`}>
        <Link href="/proprietario" prefetch className="block">
          <div className={`${getItemClasses('/proprietario')} py-3`}>
            <div className="relative h-10 w-10 flex-shrink-0">
              {proprietario?.logo ? (
                <img
                  src={`${baseURL}${proprietario.logo}`}
                  alt={`Logo ${proprietario.nome}`}
                  className="rounded-full object-cover h-full w-full border-2 border-gray-200 shadow-md hover:border-blue-200 transition-colors"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      const fallback = parent.querySelector('.fallback-icon');
                      if (fallback) {
                        fallback.classList.remove('hidden');
                      }
                    }
                  }}
                />
              ) : null}
              <div className={`fallback-icon ${proprietario?.logo ? 'hidden' : ''} absolute inset-0 rounded-full bg-gray-50 flex items-center justify-center border-2 border-gray-200 shadow-md`}>
                <Building2 className={`h-6 w-6 ${isActive('/proprietario') ? 'text-blue-600' : 'text-gray-400'} group-hover:text-gray-600`} />
              </div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <span className="text-sm font-medium block leading-tight break-words">Proprietários</span>
              {proprietario && (
                <span className="text-xs text-gray-500 block break-words mt-0.5">
                  {proprietario.sigla}
                </span>
              )}
            </div>
          </div>
        </Link>

        <Link href={`/proprietario/${proprietarioId}/dashboard`} prefetch className="block">
          <div className={getItemClasses(`/proprietario/${proprietarioId}/dashboard`)}>
            <LayoutDashboard className={getIconClasses(`/proprietario/${proprietarioId}/dashboard`)} />
            <span className="ml-3 text-sm font-medium">Dashboard</span>
          </div>
        </Link>

        <Link href={demandaLink} prefetch className="block">
          <div className={getItemClasses(`/proprietario/${proprietarioId}/demandas`)}>
            <ListChecks className={getIconClasses(`/proprietario/${proprietarioId}/demandas`)} />
            <span className="ml-3 text-sm font-medium">Demandas</span>
          </div>
        </Link>

        <Link href={`/proprietario/${proprietarioId}/solucoes`} prefetch className="block">
          <div className={getItemClasses(`/proprietario/${proprietarioId}/solucoes`)}>
            <AppWindow className={getIconClasses(`/proprietario/${proprietarioId}/solucoes`)} />
            <span className="ml-3 text-sm font-medium">Soluções</span>
          </div>
        </Link>

       
       <div className="relative">
          <button 
            className={`w-full ${getItemClasses('/relatorios')}`}
            onClick={toggleReportMenu}
          >
            <FileText className={getIconClasses('/relatorios')} />
            <span className="ml-3 text-sm font-medium">Relatórios</span>
            <ChevronDown 
              className={`w-4 h-4 ml-auto text-gray-400 transition-transform 
                ${isReportMenuOpen ? 'rotate-180' : ''}`} 
            />
          </button>
          
          <div 
            className={`${isReportMenuOpen ? 'block' : 'hidden'} ${isMobile ? 'ml-2 mt-1 space-y-2' : 'ml-4 mt-1 space-y-1'} py-1`}
          >
            <Link href={`/proprietario/${proprietarioId}/relatorios/demandas`} prefetch className="block">
              <div className={getItemClasses('/relatorios/demandas')}>
                <ListChecks className={`w-4 h-4 ${isActive('/relatorios/demandas') ? 'text-blue-600' : 'text-gray-400'} group-hover:text-gray-600`} />
                <span className="ml-3 text-sm">Demandas</span>
              </div>
            </Link>
          </div>
        </div>  


        {/* Configurações Dropdown */}
        <div className="relative">
          <button 
            className={`w-full ${getItemClasses(`/proprietario/${proprietarioId}/configuracoes`)}`}
            onClick={toggleConfigMenu}
          >
            <Settings className={getIconClasses(`/proprietario/${proprietarioId}/configuracoes`)} />
            <span className="ml-3 text-sm font-medium">Configurações</span>
            <ChevronDown 
              className={`w-4 h-4 ml-auto text-gray-400 transition-transform 
                ${isConfigMenuOpen ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {/* Config submenu items */}
          {['categorias', 'alinhamentos', 'desenvolvedores', 'linguagem', 'prioridades', 'responsaveis', 'status', 'tipos'].map((item) => (
            <div 
              key={item}
              className={`${isConfigMenuOpen ? 'block' : 'hidden'} ${isMobile ? 'ml-2 mt-1 space-y-2' : 'ml-4 mt-1 space-y-1'} py-1`}
            >
              <Link 
                href={`/proprietario/${proprietarioId}/configuracoes/${item}`} 
                prefetch
                className="block"
              >
                <div className={getItemClasses(`/proprietario/${proprietarioId}/configuracoes/${item}`)}>
                  <span className="ml-3 text-sm capitalize">{item}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
     
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-50 flex items-center justify-between p-4">
        <Link href={`/proprietario/${proprietarioId}/dashboard`} className="flex items-center space-x-4 flex-1 min-w-0 mr-4">
          <div className="relative h-12 w-12 flex-shrink-0">
            {proprietario?.logo ? (
              <img
                src={`${baseURL}${proprietario.logo}`}
                alt={`Logo ${proprietario.nome}`}
                className="rounded-full object-cover h-full w-full border-2 border-gray-100 shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    const fallback = parent.querySelector('.fallback-icon');
                    if (fallback) {
                      fallback.classList.remove('hidden');
                    }
                  }
                }}
              />
            ) : null}
            <div className={`fallback-icon ${proprietario?.logo ? 'hidden' : ''} absolute inset-0 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200`}>
              <Building2 className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 leading-tight break-words">
              {proprietario?.nome || 'Selecione um Proprietário'}
            </h1>
            {proprietario?.sigla && (
              <p className="text-sm text-gray-500 break-words">{proprietario.sigla}</p>
            )}
          </div>
        </Link>
        <button 
          onClick={toggleMobileMenu} 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isMobileMenuOpen ? 
            <X className="w-8 h-8 text-gray-700" /> : 
            <Menu className="w-8 h-8 text-gray-700" />
          }
        </button>
      </div>

      
      <aside className="hidden md:flex flex-col w-64 h-screen bg-white shadow-md border-r border-gray-100 fixed left-0">
        <div className="px-6 py-6 border-b border-gray-100">
          <Link href={`/proprietario/${proprietarioId}/dashboard`} className="flex flex-col items-center text-center space-y-3">
            <div className="relative h-16 w-16 flex-shrink-0">
              {proprietario?.logo ? (
                <img
                  src={`${baseURL}${proprietario.logo}`}
                  alt={`Logo ${proprietario.nome}`}
                  className="rounded-full object-cover h-full w-full border-2 border-gray-100 shadow-sm hover:border-blue-200 transition-colors"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      const fallback = parent.querySelector('.fallback-icon');
                      if (fallback) {
                        fallback.classList.remove('hidden');
                      }
                    }
                  }}
                />
              ) : null}
              <div className={`fallback-icon ${proprietario?.logo ? 'hidden' : ''} absolute inset-0 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200`}>
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <div className="w-full">
              <h2 className="text-lg font-semibold text-gray-900 leading-tight break-words">
                {proprietario?.nome || 'Selecione um Proprietário'}
              </h2>
              {proprietario?.sigla && (
                <p className="text-sm text-gray-500 mt-0.5 break-words">{proprietario.sigla}</p>
              )}
            </div>
          </Link>
        </div>
  
        <nav className="flex-1 mt-4 overflow-y-auto">
          {renderMenuItems()}
        </nav>

        {/* Footer with MP-AP info */}
        <div className="px-4 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 relative flex-shrink-0">
              <Image
                src="/images.webp"
                alt="MP-AP Logo"
                width={40}
                height={40}
                className="object-contain w-full h-full opacity-90"
                sizes="40px"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">Ministério Público</p>
              <p className="text-xs text-gray-600 truncate">do Estado do Amapá</p>
            </div>
          </div>
        </div>
      </aside>

      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}

      <div 
        className={`
          fixed top-0 pt-16 left-0 right-0 bottom-0 bg-white z-40 
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          md:hidden overflow-y-auto
        `}
      >
        <div className="h-full overflow-y-auto pb-20 flex flex-col">
          <nav className="p-4 flex-1">
            {renderMenuItems(true)}
          </nav>

          {/* Mobile Footer with MP-AP info */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 mt-auto">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 relative flex-shrink-0">
                <Image
                  src="/images.webp"
                  alt="MP-AP Logo"
                  width={40}
                  height={40}
                  className="object-contain w-full h-full opacity-90"
                  sizes="40px"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">Ministério Público</p>
                <p className="text-xs text-gray-600 truncate">do Estado do Amapá</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <div className="md:pl-64">
        
      </div>
    </>
  );
}