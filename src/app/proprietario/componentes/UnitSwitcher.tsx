'use client'
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { getProprietarios } from '../actions/actions';
const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, ChevronDown } from 'lucide-react';
import dynamic from 'next/dynamic';

// Definir a interface Proprietario
interface Proprietario {
  id: number;
  nome: string;
  sigla: string;
  logo: string | null;
}

// Componente de imagem otimizado com lazy loading
const OptimizedImage = dynamic(() => import('next/image'), {
  loading: () => (
    <div className="rounded-full bg-gray-200 h-full w-full flex items-center justify-center">
      <Building2 className="h-4 w-4 text-gray-400" />
    </div>
  ),
  ssr: false
});

export default function UnitSwitcher() {
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectedProprietario, setSelectedProprietario] = useState<Proprietario | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  // Função para lidar com a mudança de proprietário
  const handleProprietarioChange = (id: string) => {
    setSelectedId(id);
    const proprietario = proprietarios.find(p => p.id.toString() === id);
    if (proprietario) {
      setSelectedProprietario(proprietario);
      localStorage.setItem('selectedProprietarioId', id);
    }
  };

  useEffect(() => {
    const loadProprietarios = async () => {
      try {
        const data = await getProprietarios();
        setProprietarios(data);

        // Se não houver proprietários, não fazer nada
        if (!data || data.length === 0) return;

        // Se houver apenas um proprietário, selecionar automaticamente
        if (data.length === 1) {
          handleProprietarioChange(data[0].id.toString());
          return;
        }

        // Verificar se há um proprietário selecionado no localStorage
        const storedId = localStorage.getItem('selectedProprietarioId');

        // Se houver um ID armazenado e ele pertencer ao usuário atual, usá-lo
        if (storedId) {
          const proprietarioExists = data.some((p: Proprietario) => p.id.toString() === storedId);
          if (proprietarioExists) {
            handleProprietarioChange(storedId);
            return;
          }
        }

        // Caso contrário, selecionar o primeiro proprietário
        handleProprietarioChange(data[0].id.toString());
      } catch (error) {
        console.error('Erro ao carregar proprietários:', error);
      }
    };

    if (user) {
      loadProprietarios();
    }
  }, [user]);

  // Adicionar um useEffect para atualizar o selectedProprietario quando mudar de página
  useEffect(() => {
    const storedId = localStorage.getItem('selectedProprietarioId');
    if (storedId && proprietarios.length > 0) {
      const proprietario = proprietarios.find(p => p.id.toString() === storedId);
      if (proprietario) {
        setSelectedProprietario(proprietario);
        setSelectedId(storedId);
      }
    }
  }, [pathname, proprietarios]);

  const handleSelect = (proprietario: Proprietario) => {
    setSelectedProprietario(proprietario);
    setSelectedId(proprietario.id.toString());
    localStorage.setItem('selectedProprietarioId', proprietario.id.toString());
    setIsOpen(false);
    router.push(`/proprietario/${proprietario.id}/dashboard`);
  };

  const handleImageError = (id: number) => {
    setImageError(prev => ({ ...prev, [id]: true }));
  };

  const renderLogo = (proprietario: Proprietario, size = 8) => {
    if (proprietario?.logo && !imageError[proprietario.id]) {
      try {
        const logoUrl = new URL(proprietario.logo, baseURL).toString();
        return (
          <div className={`relative h-${size} w-${size} overflow-hidden rounded-full bg-gray-200`}>
            {/* Esqueleto, visível por padrão */}
            {!isImageLoaded && (
              <div className="h-full w-full animate-pulse bg-gray-300"></div>
            )}

            {/* Imagem, inicialmente invisível */}
            <Image
              src={logoUrl}
              alt={`Logo ${proprietario.nome}`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className={`object-cover transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onError={() => handleImageError(proprietario.id)}
              onLoadingComplete={() => setIsImageLoaded(true)} // Muda o estado quando a imagem carrega
              unoptimized={true}
            />
          </div>
        );
      } catch (error) {
        console.error(`URL inválida para o logo no UnitSwitcher: ${proprietario.logo}. BaseURL: ${baseURL}`);
        handleImageError(proprietario.id);
      }
    }

    return (
      <div className={`h-${size} w-${size} rounded-full bg-gray-200 flex items-center justify-center`}>
        <Building2 className={`h-${size / 2} w-${size / 2} text-gray-400`} />
      </div>
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 w-[250px] px-3 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="relative h-8 w-8 flex-shrink-0">
          {selectedProprietario && renderLogo(selectedProprietario)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {selectedProprietario?.nome || 'Selecione uma Unidade'}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {selectedProprietario?.sigla || 'Nenhuma unidade selecionada'}
          </p>
        </div>
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-full min-w-[250px] bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-[60vh] overflow-y-auto">
            <div className="py-1">
              {proprietarios.map((proprietario) => (
                <button
                  key={proprietario.id}
                  onClick={() => handleSelect(proprietario)}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-left hover:bg-gray-50"
                >
                  <div className="relative h-8 w-8 flex-shrink-0">
                    {renderLogo(proprietario)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {proprietario.nome}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {proprietario.sigla}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 
