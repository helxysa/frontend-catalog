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
  Building2,
  ChevronLeft,
  ChevronRight,
  Tags,
  GitCompare,
  Users,
  Code2,
  AlertCircle,
  UserCog,
  CircleDot,
  FileType2 
} from 'lucide-react';
import { getProprietarios } from '../../proprietario/actions/actions';
const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333';
import Image from 'next/image';
import { useSidebar } from './SidebarContext';
import dynamic from 'next/dynamic';
import { useAuth } from '../../contexts/AuthContext';

interface Proprietario {
  id: number;
  nome: string;
  sigla: string;
  logo: string;
}

// Componente de imagem otimizado com lazy loading
const OptimizedImage = dynamic(() => import('next/image'), { 
  loading: () => (
    <div className="rounded-full bg-gray-100 h-full w-full flex items-center justify-center">
      <Building2 className="h-6 w-6 text-gray-400" />
    </div>
  ),
  ssr: true // Altere para true para renderizar no servidor
});

export function Sidebar() {
  const [isReportMenuOpen, setIsReportMenuOpen] = useState(false);
  const [isConfigMenuOpen, setIsConfigMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [proprietarioId, setProprietarioId] = useState<string>('');
  const [proprietario, setProprietario] = useState<Proprietario | null>(null);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const isManager = user?.isManager;

  useEffect(() => {
    const storedId = localStorage.getItem('selectedProprietarioId');
    if (storedId) {
      setProprietarioId(storedId);
      fetchProprietarioDetails(storedId);
    }
  }, []);

  const fetchProprietarioDetails = async (id: string) => {
    try {
      const data = await getProprietarios();
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

  const handleImageError = (id: number) => {
    setImageError(prev => ({ ...prev, [id]: true }));
  };

  const renderLogo = (size: string, className: string = "") => {
    if (proprietario?.logo && !imageError[proprietario.id]) {
      try {
        const logoUrl = new URL(proprietario.logo, baseURL).toString();
        return (
          <div className={`relative ${size} ${className}`}>
            <Image
              src={logoUrl}
              alt={`Logo ${proprietario.nome}`}
              fill
              sizes="(max-width: 768px) 100vw, 40px"
              className="rounded-full object-cover"
              loading="eager" // Altere para eager para priorizar o carregamento
              priority={true} // Adicione priority para imagens acima da dobra
              onError={() => handleImageError(proprietario.id)}
              unoptimized={false} // Altere para false para permitir otimizações
            />
          </div>
        );
      } catch (error) {
        console.error(`URL inválida para o logo no Sidebar: ${proprietario.logo}. BaseURL: ${baseURL}`);
        handleImageError(proprietario.id);
      }
    }
    
    return (
      <div className={`${size} ${className} rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200`}>
        <Building2 className="h-6 w-6 text-gray-400" />
      </div>
    );
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
      const baseClasses = `flex items-center ${isCollapsed ? 'px-2 justify-center' : 'px-4'} py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-800 rounded-lg transition-all duration-200 group relative`;
      const activeClasses = isActive(path) ? 'bg-blue-50/50 text-blue-800 border-l-4 border-blue-500' : '';
      return `${baseClasses} ${activeClasses}`;
    };

    return (
      <div className={`${isMobile ? 'space-y-2 p-4' : 'px-2 space-y-1'}`}>
        <Link href="/proprietario" prefetch className="block">
          <div className={`${getItemClasses('/proprietario')} py-3`}>
            <div className="relative h-10 w-10 flex-shrink-0">
              {renderLogo("h-10 w-10")}
            </div>
            {!isCollapsed && (
              <div className="ml-4 flex-1 min-w-0">
                <span className="text-sm font-medium block leading-tight">Proprietários</span>
                {proprietario && (
                  <span className="text-xs text-gray-500 block mt-0.5">
                    {proprietario.sigla}
                  </span>
                )}
              </div>
            )}
          </div>
        </Link>

        {[
          { href: `/proprietario/${proprietarioId}/dashboard`, icon: LayoutDashboard, text: 'Dashboard' },
          { href: demandaLink, icon: ListChecks, text: 'Demandas' },
          { href: `/proprietario/${proprietarioId}/solucoes`, icon: AppWindow, text: 'Soluções' },
        ].map((item) => (
          <Link href={item.href} key={item.text} prefetch className="block">
            <div className={getItemClasses(item.href)}>
              <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-blue-600' : 'text-gray-400'} group-hover:text-gray-600`} />
              {!isCollapsed && (
                <span className="ml-3 text-sm font-medium">{item.text}</span>
              )}
            </div>
          </Link>
        ))}

          {/* <Link href={`/proprietario/${proprietarioId}/relatorios`} prefetch className="block">
            <div className={getItemClasses(`/proprietario/${proprietarioId}/relatorios`)}>
              <FileText className={`w-5 h-5 ${isActive(`/proprietario/${proprietarioId}/relatorios`) ? 'text-blue-600' : 'text-gray-400'} group-hover:text-gray-600`} />
              {!isCollapsed && (
                <span className="ml-3 text-sm font-medium">Relatórios</span>
              )}
            </div>
          </Link>  */}

        {!isManager && (
          <div className="relative">
            <button 
              className={`w-full ${getItemClasses(`/proprietario/${proprietarioId}/configuracoes`)}`}
              onClick={toggleConfigMenu}
            >
              <Settings className={`w-5 h-5 ${isActive(`/proprietario/${proprietarioId}/configuracoes`) ? 'text-blue-600' : 'text-gray-400'} group-hover:text-gray-600`} />
              {!isCollapsed && (
                <>
                  <span className="ml-3 text-sm font-medium">Configurações</span>
                  <ChevronDown 
                    className={`w-4 h-4 ml-auto text-gray-400 transition-transform 
                      ${isConfigMenuOpen ? 'rotate-180' : ''}`} 
                  />
                </>
              )}
            </button>
            {!isCollapsed && ['categorias', 'alinhamentos', 'desenvolvedores', 'tecnologias', 'prioridades', 'times', 'status', 'tipos', 'responsaveis'].map((item) => {
              const getItemIcon = (itemName: string) => {
                const iconMap: { [key: string]: any } = {
                  categorias: Tags,
                  alinhamentos: GitCompare,
                  desenvolvedores: Users,
                  linguagem: Code2,
                  prioridades: AlertCircle,
                  responsaveis: UserCog,
                  status: CircleDot,
                  tipos: FileType2,
                };
                return iconMap[itemName] || Settings;
              };
              
              const ItemIcon = getItemIcon(item);
              
              return (
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
                      <ItemIcon className={`w-4 h-4 ${isActive(`/proprietario/${proprietarioId}/configuracoes/${item}`) ? 'text-blue-600' : 'text-gray-400'} group-hover:text-gray-600`} />
                      <span className="ml-3 text-sm capitalize">{item}</span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
     
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-50 flex items-center justify-between p-4">
        <Link href={`/proprietario/${proprietarioId}/dashboard`} className="flex items-center space-x-4 flex-1 min-w-0 mr-4">
          <div className="relative h-12 w-12 flex-shrink-0">
            {renderLogo("h-12 w-12")}
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

      
      <aside className={`hidden md:flex flex-col ${isCollapsed ? 'w-20' : 'w-64'} h-screen bg-white shadow-md border-r border-gray-100 fixed left-0 transition-all duration-300`} style={{ zIndex: 40 }}>
        <div className="px-4 py-6 border-b border-gray-100">
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors w-full flex justify-center"
              aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-6 h-6 text-gray-600" />
              ) : (
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              )}
            </button>

            <Link href={`/proprietario/${proprietarioId}/dashboard`} className="flex flex-col items-center text-center space-y-3">
              {renderLogo(isCollapsed ? "h-10 w-10" : "h-16 w-16")}
              {!isCollapsed && (
                <div className="w-full">
                  <h2 className="text-lg font-semibold text-gray-900 leading-tight break-words">
                    {proprietario?.nome || 'Selecione um Proprietário'}
                  </h2>
                  {proprietario?.sigla && (
                    <p className="text-sm text-gray-500 mt-0.5 break-words">{proprietario.sigla}</p>
                  )}
                </div>
              )}
            </Link>
          </div>
        </div>
  
        <nav className="flex-1 mt-2 overflow-y-auto">
          {renderMenuItems()}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 justify-center">
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-700">Ministério Público</p>
                <p className="text-xs text-gray-600">do Estado do Amapá</p>
              </div>
            )}
            <div className="h-10 w-10 relative flex-shrink-0">
              <Image
                src="/images.webp"
                alt="MP-AP Logo"
                width={40}
                height={40}
                className="object-contain w-full h-full opacity-90"
                sizes="40px"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </aside>

      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] md:hidden"
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
                  loading="lazy"
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

      
      <div className={`md:pl-${isCollapsed ? '20' : '64'} transition-all duration-300`}>
        
      </div>
    </>
  );
}
