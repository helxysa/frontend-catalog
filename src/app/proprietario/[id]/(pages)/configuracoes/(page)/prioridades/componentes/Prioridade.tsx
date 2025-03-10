'use client'

import { useEffect, useState } from 'react';
import { 
  getPrioridades, 
  createPrioridade, 
  updatePrioridade, 
  deletePrioridade 
} from '../actions/actions';
import { 
  Plus, 
  Filter, 
  Edit2, 
  Trash2, 
  X, 
  Info,
  ChevronRight,
  Menu 
} from 'lucide-react';
import type { Prioridade } from '../types/types';
import { useSidebar } from '../../../../../../../componentes/Sidebar/SidebarContext';
interface Proprietario {
  id: number;
  nome: string;
}

export default function Prioridade({ proprietarioId }: { proprietarioId?: string }) {
  const [prioridades, setPrioridades] = useState<Prioridade[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPrioridade, setCurrentPrioridade] = useState<Partial<Prioridade>>(() => ({
    // Initialize with proprietarioId from props or localStorage
    proprietario_id: proprietarioId ? proprietarioId : 
                    localStorage.getItem('selectedProprietarioId') || ''
  }));
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPrioridadeDetails, setSelectedPrioridadeDetails] = useState<Prioridade | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const { isCollapsed } = useSidebar();
  useEffect(() => {
    const loadPrioridades = async () => {
      setPrioridades([]); // Clear existing prioridades
      
      const storedId = proprietarioId || localStorage.getItem('selectedProprietarioId');
      if (storedId) {
        try {
          console.log('Fetching prioridades for proprietarioId:', storedId);
          const data = await getPrioridades(storedId);
          console.log('Received data:', data);
          
          // Use data directly since getCategorias already filters by proprietario_id
          setPrioridades(data);
        } catch (error) {
          console.error('Error loading prioridades:', error);
          setPrioridades([]);
        }
      }
    };
    
    loadPrioridades();
    
    // Only load proprietários if we're in the main categories view
    if (!proprietarioId) {
      const loadProprietarios = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/proprietarios`);
        const data = await response.json();
        setProprietarios(data);
      };
      loadProprietarios();
    }
  }, [proprietarioId]);

  // When modal is opened, ensure proprietarioId is set
  useEffect(() => {
    if (isModalOpen) {
      const storedId = proprietarioId || localStorage.getItem('selectedProprietarioId') || undefined;
      if (storedId) {
        setCurrentPrioridade(prev => ({
          ...prev,
          proprietario_id: storedId
        }));
      }
    }
  }, [isModalOpen, proprietarioId]);

  const openModal = (prioridade?: Prioridade) => {
    if (prioridade) {
      setCurrentPrioridade(prioridade);
      setIsEditMode(true);
    } else {
      setCurrentPrioridade({});
      setIsEditMode(false);
    }
    setIsModalOpen(true);
  };

  const handleCreate = async () => {
    if (currentPrioridade.nome && currentPrioridade.descricao && currentPrioridade.proprietario_id) {
      const prioridadeToSave = {
        nome: currentPrioridade.nome,
        descricao: currentPrioridade.descricao,
        proprietario_id: Number(currentPrioridade.proprietario_id)
      };

      try {
        console.log('Dados sendo enviados:', prioridadeToSave); // Debug
        const created = await createPrioridade(prioridadeToSave);
        setPrioridades([...prioridades, created]);
        setIsModalOpen(false);
        setCurrentPrioridade({});
      } catch (error: any) {
        console.error('Erro ao criar prioridade:', error);
        console.error('Dados do erro:', error.response?.data);
      }
    }
  };

  const handleUpdate = async () => {
    if (currentPrioridade.id && currentPrioridade.nome && currentPrioridade.descricao) {
      const prioridadeToUpdate = {
        nome: currentPrioridade.nome,
        descricao: currentPrioridade.descricao
      };

      const updated = await updatePrioridade(currentPrioridade.id, prioridadeToUpdate);
      setPrioridades(prioridades.map(p => (p.id === currentPrioridade.id ? updated : p)));
      setIsModalOpen(false);
      setCurrentPrioridade({});
    }
  };

  const handleDelete = async (id: string) => {
    await deletePrioridade(id);
    setPrioridades(prioridades.filter(p => p.id !== id));
  };

  const showPrioridadeDetails = (prioridade: Prioridade) => {
    setSelectedPrioridadeDetails(prioridade);
  };

  return (
  
 <div className={`
  w-full bg-gray-50
  transition-all duration-300 ease-in-out
  ${isCollapsed 
    ? 'ml-10 w-[calc(100%-2rem)] fixed left-1 top-13 h-screen overflow-y-auto' 
    : 'w-full'
  }
  py-6 px-6
`}>
  <div className={`
    transition-all duration-300 ease-in-out
    ${isCollapsed ? 'w-[96%] mx-auto pb-20' : 'w-[100%] mx-auto'}
  `}> 	
        {/* Header */}
        <div className="flex justify-between items-center mb-6 mt-[70px] lg:mt-0">
        <h1 className="text-2xl sm:text-2xl font-bold text-gray-800">
            Adicione uma prioridade
          </h1>
          <div className="flex gap-2">
            <button 
              onClick={() => openModal()}
              className="bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>
        </div>

        {/* Table with mobile scroll and responsive layout */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.isArray(prioridades) && prioridades.map((prioridade, index) => (
                <tr key={prioridade.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                    {index + 1}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {prioridade.nome}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => showPrioridadeDetails(prioridade)}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
                        title="Detalhes"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => openModal(prioridade)}
                        className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-50 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(prioridade.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal for Create/Edit - Responsive */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {isEditMode ? 'Editar Prioridade' : 'Nova Prioridade'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2"
                >
                  <X className="w-5 sm:w-6 h-5 sm:h-6" />
                </button>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div className="text-gray-700">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Proprietário</label>
                  <select
                    value={currentPrioridade.proprietario_id || ''}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  >
                    <option value={currentPrioridade.proprietario_id}>
                      {proprietarios.find(p => p.id === Number(currentPrioridade.proprietario_id))?.nome || 'Carregando...'}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                  <input 
                    type="text" 
                    placeholder="Digite o nome da prioridade" 
                    value={currentPrioridade.nome || ''} 
                    onChange={(e) => setCurrentPrioridade({ ...currentPrioridade, nome: e.target.value })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <textarea 
                    placeholder="Descreva os detalhes da prioridade" 
                    value={currentPrioridade.descricao || ''} 
                    onChange={(e) => setCurrentPrioridade({ ...currentPrioridade, descricao: e.target.value })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500 text-sm sm:text-base"
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm sm:text-base"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={isEditMode ? handleUpdate : handleCreate}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    {isEditMode ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal - Responsive */}
        {selectedPrioridadeDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Detalhes do Alinhamento</h2>
                <button 
                  onClick={() => setSelectedPrioridadeDetails(null)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2"
                >
                  <X className="w-5 sm:w-6 h-5 sm:h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Informações Principais</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">Nome</p>
                      <p className="text-gray-800 font-bold text-sm sm:text-base">{selectedPrioridadeDetails.nome}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">ID</p>
                      <p className="text-gray-800 font-bold text-sm sm:text-base">{selectedPrioridadeDetails.id}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Descrição</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-md text-sm sm:text-base">
                    {selectedPrioridadeDetails.descricao}
                  </p>
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={() => setSelectedPrioridadeDetails(null)}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
                  >
                    Fechar <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}