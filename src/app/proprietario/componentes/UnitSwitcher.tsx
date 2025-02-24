"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Building2 } from 'lucide-react';
import { getProprietario, baseURL } from '../actions/actions';

interface Proprietario {
  id: number;
  nome: string;
  sigla: string;
  logo: string | null;
}

export default function UnitSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [selectedProprietario, setSelectedProprietario] = useState<Proprietario | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProprietarios = async () => {
      try {
        const data = await getProprietario();
        setProprietarios(data || []);
        
        const storedId = localStorage.getItem('selectedProprietarioId');
        if (storedId) {
          const selected = data.find((p: Proprietario) => p.id === parseInt(storedId));
          if (selected) {
            setSelectedProprietario(selected);
          }
        }
      } catch (error) {
        console.error('Error fetching proprietarios:', error);
      }
    };

    fetchProprietarios();
  }, []);

  const handleSelect = (proprietario: Proprietario) => {
    setSelectedProprietario(proprietario);
    localStorage.setItem('selectedProprietarioId', proprietario.id.toString());
    setIsOpen(false);
    router.push(`/proprietario/${proprietario.id}/dashboard`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="relative h-8 w-8 flex-shrink-0">
          {selectedProprietario?.logo ? (
            <img
              src={`${baseURL}${selectedProprietario.logo}`}
              alt={`Logo ${selectedProprietario.nome}`}
              className="rounded-full object-cover h-full w-full"
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
          <div className={`fallback-icon ${selectedProprietario?.logo ? 'hidden' : ''} absolute inset-0 rounded-full bg-gray-200 flex items-center justify-center`}>
            <Building2 className="h-4 w-4 text-gray-400" />
          </div>
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
                    {proprietario.logo ? (
                      <img
                        src={`${baseURL}${proprietario.logo}`}
                        alt={`Logo ${proprietario.nome}`}
                        className="rounded-full object-cover h-full w-full"
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
                    <div className={`fallback-icon ${proprietario.logo ? 'hidden' : ''} absolute inset-0 rounded-full bg-gray-200 flex items-center justify-center`}>
                      <Building2 className="h-4 w-4 text-gray-400" />
                    </div>
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