'use client'
import Link from 'next/link'; 
import { useState } from 'react';
import { 
  LayoutDashboard, 
  ListChecks, 
  AppWindow, 
  FileText, 
  Settings, 
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

export function Sidebar() {
  const [isReportMenuOpen, setIsReportMenuOpen] = useState(false);
  const [isConfigMenuOpen, setIsConfigMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const renderMenuItems = (isMobile = false) => (
    <div className={`${isMobile ? 'space-y-2 p-4' : 'px-2 space-y-1'}`}>
      <Link href="/dashboard" className="block">
        <div className={`flex items-center ${isMobile ? 'px-3 py-3' : 'px-4 py-2.5'} text-gray-600 hover:bg-gray-50 hover:text-gray-800 rounded-lg transition-colors group`}>
          <LayoutDashboard className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          <span className="ml-3 text-sm font-medium">Dashboard</span>
        </div>
      </Link>
  
      <Link href="/demandas" className="block">
        <div className={`flex items-center ${isMobile ? 'px-3 py-3' : 'px-4 py-2.5'} text-gray-600 hover:bg-gray-50 hover:text-gray-800 rounded-lg transition-colors group`}>
          <ListChecks className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          <span className="ml-3 text-sm font-medium">Demandas</span>
        </div>
      </Link>
  
      <Link href="/solucoes" className="block">
        <div className={`flex items-center ${isMobile ? 'px-3 py-3' : 'px-4 py-2.5'} text-gray-600 hover:bg-gray-50 hover:text-gray-800 rounded-lg transition-colors group`}>
          <AppWindow className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          <span className="ml-3 text-sm font-medium">Soluções</span>
        </div>
      </Link>
  
      {/* Relatórios Dropdown */}
      <div className="relative">
        <button 
          className={`w-full flex items-center ${isMobile ? 'px-3 py-3' : 'px-4 py-2.5'} text-gray-600 hover:bg-gray-50 hover:text-gray-800 rounded-lg transition-colors group`} 
          onClick={toggleReportMenu}
        >
          <FileText className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          <span className="ml-3 text-sm font-medium">Relatórios</span>
          <ChevronDown 
            className={`w-4 h-4 ml-auto text-gray-400 transition-transform 
              ${isReportMenuOpen ? 'rotate-180' : ''}`} 
          />
        </button>
        
        <div 
          className={`${isReportMenuOpen ? 'block' : 'hidden'} ${isMobile ? 'ml-2 mt-1 space-y-2' : 'ml-4 mt-1 space-y-1'} py-1`}
        >
          {/* Relatórios Submenu Items - Similar to main menu items */}
          <Link href="/relatorios/demandas" className="block">
            <div className={`flex items-center ${isMobile ? 'px-3 py-3' : 'px-4 py-2'} text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-colors group`}>
              <ListChecks className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              <span className="ml-3 text-sm">Demandas</span>
            </div>
          </Link>
          {/* Other submenu items... */}
        </div>
      </div>
  
      {/* Configurações Dropdown */}
      <div className="relative">
        <button 
          className={`w-full flex items-center ${isMobile ? 'px-3 py-3' : 'px-4 py-2.5'} text-gray-600 hover:bg-gray-50 hover:text-gray-800 rounded-lg transition-colors group`} 
          onClick={toggleConfigMenu}
        >
          <Settings className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          <span className="ml-3 text-sm font-medium">Configurações</span>
          <ChevronDown 
            className={`w-4 h-4 ml-auto text-gray-400 transition-transform 
              ${isConfigMenuOpen ? 'rotate-180' : ''}`} 
          />
        </button>
        
        <div 
          className={`${isConfigMenuOpen ? 'block' : 'hidden'} ${isMobile ? 'ml-2 mt-1 space-y-2' : 'ml-4 mt-1 space-y-1'} py-1`}
        >
          <Link href="/configuracoes/categorias" className="block">
            <div className={`flex items-center ${isMobile ? 'px-3 py-3' : 'px-4 py-2'} text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-colors group`}>
              <span className="ml-3 text-sm">Categorias</span>
            </div>
          </Link>
        </div>
         
        <div 
          className={`${isConfigMenuOpen ? 'block' : 'hidden'} ${isMobile ? 'ml-2 mt-1 space-y-2' : 'ml-4 mt-1 space-y-1'} py-1`}
        >
          <Link href="/configuracoes/alinhamentos" className="block">
            <div className={`flex items-center ${isMobile ? 'px-3 py-3' : 'px-4 py-2'} text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-colors group`}>
              <span className="ml-3 text-sm">Alinhamentos</span>
            </div>
          </Link>
        </div>
        <div 
          className={`${isConfigMenuOpen ? 'block' : 'hidden'} ${isMobile ? 'ml-2 mt-1 space-y-2' : 'ml-4 mt-1 space-y-1'} py-1`}
        >
          <Link href="/configuracoes/desenvolvedores" className="block">
            <div className={`flex items-center ${isMobile ? 'px-3 py-3' : 'px-4 py-2'} text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-colors group`}>
              <span className="ml-3 text-sm">Desenvolvedores</span>
            </div>
          </Link>
        </div>

        <div 
          className={`${isConfigMenuOpen ? 'block' : 'hidden'} ${isMobile ? 'ml-2 mt-1 space-y-2' : 'ml-4 mt-1 space-y-1'} py-1`}
        >
          <Link href="/configuracoes/linguagem" className="block">
            <div className={`flex items-center ${isMobile ? 'px-3 py-3' : 'px-4 py-2'} text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-colors group`}>
              <span className="ml-3 text-sm">Linguagem</span>
            </div>
          </Link>
        </div>
        <div 
          className={`${isConfigMenuOpen ? 'block' : 'hidden'} ${isMobile ? 'ml-2 mt-1 space-y-2' : 'ml-4 mt-1 space-y-1'} py-1`}
        >
          <Link href="/configuracoes/prioridades" className="block">
            <div className={`flex items-center ${isMobile ? 'px-3 py-3' : 'px-4 py-2'} text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-colors group`}>
              <span className="ml-3 text-sm">Prioridades</span>
            </div>
          </Link>
        </div>
        <div 
          className={`${isConfigMenuOpen ? 'block' : 'hidden'} ${isMobile ? 'ml-2 mt-1 space-y-2' : 'ml-4 mt-1 space-y-1'} py-1`}
        >
          <Link href="/configuracoes/responsaveis" className="block">
            <div className={`flex items-center ${isMobile ? 'px-3 py-3' : 'px-4 py-2'} text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-colors group`}>
              <span className="ml-3 text-sm">Responsaveis</span>
            </div>
          </Link>
        </div>
        <div 
          className={`${isConfigMenuOpen ? 'block' : 'hidden'} ${isMobile ? 'ml-2 mt-1 space-y-2' : 'ml-4 mt-1 space-y-1'} py-1`}
        >
          <Link href="/configuracoes/status" className="block">
            <div className={`flex items-center ${isMobile ? 'px-3 py-3' : 'px-4 py-2'} text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-colors group`}>
              <span className="ml-3 text-sm">Status</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Header Mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-50 flex items-center justify-between p-4">
        <h1 className="text-xl font-bold text-gray-800">Catalog do Ministerio</h1>
        <button onClick={toggleMobileMenu} className="p-2 hover:bg-gray-100 rounded-lg">
          {isMobileMenuOpen ? 
            <X className="w-8 h-8 text-gray-700" /> : 
            <Menu className="w-8 h-8 text-gray-700" />
          }
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-screen bg-white shadow-md border-r border-gray-100">
        <div className="px-4 py-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800">Catalog do Ministerio</h1>
        </div>
  
        <nav className="mt-4 overflow-y-auto h-[calc(100vh-150px)]">
          {renderMenuItems()}
        </nav>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Menu Content */}
      <div 
        className={`
          fixed top-0 pt-16 left-0 right-0 bottom-0 bg-white z-40 
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          md:hidden overflow-y-auto
        `}
      >
        <div className="h-full overflow-y-auto pb-20">
          <nav className="p-4">
            {renderMenuItems(true)}
          </nav>
        </div>
      </div>
    </>
  );
}