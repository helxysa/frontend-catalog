'use client'

import { useEffect, useState } from 'react';
import { 
  getResponsaveis, 
  createResponsavel, 
  updateResponsavel, 
  deleteResponsavel 
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
import type { Responsavel } from '../types/types';

interface Proprietario {
  id: number;
  nome: string;
}

export default function Responsavel({ proprietarioId }: { proprietarioId?: string }) {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentResponsavel, setCurrentResponsavel] = useState<Partial<Responsavel>>(() => ({
    // Initialize with proprietarioId from props or localStorage
    proprietario_id: proprietarioId ? proprietarioId : 
                    localStorage.getItem('selectedProprietarioId') || ''
  }));
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedResponsavelDetails, setSelectedResponsavelDetails] = useState<Responsavel | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);

  useEffect(() => {
    const loadResponsaveis = async () => {
      setResponsaveis([]); // Clear existing responsaveis
      
      const storedId = proprietarioId || localStorage.getItem('selectedProprietarioId');
      if (storedId) {
        try {
          console.log('Fetching responsaveis for proprietarioId:', storedId);
          const data = await getResponsaveis(storedId);
          console.log('Received data:', data);
          
          // Use data directly since getCategorias already filters by proprietario_id
          setResponsaveis(data);
        } catch (error) {
          console.error('Error loading responsaveis:', error);
          setResponsaveis([]);
        }
      }
    };
    
    loadResponsaveis();
    
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
        setCurrentResponsavel(prev => ({
          ...prev,
          proprietario_id: storedId
        }));
      }
    }
  }, [isModalOpen, proprietarioId]);

  const openModal = (responsavel?: Responsavel) => {
    if (responsavel) {
      setCurrentResponsavel(responsavel);
      setIsEditMode(true);
    } else {
      setCurrentResponsavel({});
      setIsEditMode(false);
    }
    setIsModalOpen(true);
  };

  const handleCreate = async () => {
    if (currentResponsavel.nome && currentResponsavel.email && currentResponsavel.proprietario_id) {
      const responsavelToSave = {
        nome: currentResponsavel.nome,
        email: currentResponsavel.email,
        proprietario_id: Number(currentResponsavel.proprietario_id)
      };

      try {
        console.log('Dados sendo enviados:', responsavelToSave); // Debug
        const created = await createResponsavel(responsavelToSave);
        setResponsaveis([...responsaveis, created]);
        setIsModalOpen(false);
        setCurrentResponsavel({});
      } catch (error: any) {
        console.error('Erro ao criar responsavel:', error);
        console.error('Dados do erro:', error.response?.data);
      }
    }
  };

  const handleUpdate = async () => {
    if (currentResponsavel.id && currentResponsavel.nome && currentResponsavel.email) {
        const responsavelToUpdate = {
        nome: currentResponsavel.nome,
        email: currentResponsavel.email
      };

      const updated = await updateResponsavel(currentResponsavel.id, responsavelToUpdate);
      setResponsaveis(responsaveis.map(r => (r.id === currentResponsavel.id ? updated : r)));
      setIsModalOpen(false);
      setCurrentResponsavel({});
    }
  };

  const handleDelete = async (id: string) => {
    await deleteResponsavel(id);
    setResponsaveis(responsaveis.filter(r => r.id !== id));
  };

  const showResponsavelDetails = (responsavel: Responsavel) => {
    setSelectedResponsavelDetails(responsavel);
  };

  return (
    <div className="min-h-screen">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 mt-[70px] lg:mt-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {proprietarioId ? 'Responsáveis do Escritório' : 'Responsáveis'}
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
              {Array.isArray(responsaveis) && responsaveis.map((responsavel, index) => (
                <tr key={responsavel.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                    {index + 1}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {responsavel.nome}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => showResponsavelDetails(responsavel)}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
                        title="Detalhes"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => openModal(responsavel)}
                        className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-50 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(responsavel.id)}
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
                  {isEditMode ? 'Editar Responsável' : 'Novo Responsável'}
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
                    value={currentResponsavel.proprietario_id || ''}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  >
                    <option value={currentResponsavel.proprietario_id}>
                      {proprietarios.find(p => p.id === Number(currentResponsavel.proprietario_id))?.nome || 'Carregando...'}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                  <input 
                    type="text" 
                    placeholder="Digite o nome do responsável" 
                    value={currentResponsavel.nome || ''} 
                    onChange={(e) => setCurrentResponsavel({ ...currentResponsavel, nome: e.target.value })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email"
                    placeholder="Digite o email do responsável" 
                    value={currentResponsavel.email || ''} 
                    onChange={(e) => setCurrentResponsavel({ ...currentResponsavel, email: e.target.value })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500 text-sm sm:text-base"
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
        {selectedResponsavelDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Detalhes do Alinhamento</h2>
                <button 
                  onClick={() => setSelectedResponsavelDetails(null)}
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
                      <p className="text-gray-800 font-bold text-sm sm:text-base">{selectedResponsavelDetails.nome}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">ID</p>
                      <p className="text-gray-800 font-bold text-sm sm:text-base">{selectedResponsavelDetails.id}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Email</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-md text-sm sm:text-base">
                    {selectedResponsavelDetails.email}
                  </p>
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={() => setSelectedResponsavelDetails(null)}
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