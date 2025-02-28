'use client'

import { useEffect, useState } from 'react';
import { 
  getLinguagens, 
  createLinguagem, 
  updateLinguagem, 
  deleteLinguagem 
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
import type { Linguagem } from '../types/types';

interface Proprietario {
  id: number;
  nome: string;
}

export default function Linguagem({ proprietarioId }: { proprietarioId?: string }) {
  const [linguagens, setLinguagens] = useState<Linguagem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLinguagem, setCurrentLinguagem] = useState<Partial<Linguagem>>(() => ({
    // Initialize with proprietarioId from props or localStorage
    proprietario_id: proprietarioId ? proprietarioId : 
                    localStorage.getItem('selectedProprietarioId') || ''
  }));
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedLinguagemDetails, setSelectedLinguagemDetails] = useState<Linguagem | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);

  useEffect(() => {
    const loadLinguagens = async () => {
      setLinguagens([]); // Clear existing linguagens
      
      const storedId = proprietarioId || localStorage.getItem('selectedProprietarioId');
      if (storedId) {
        try {
          console.log('Fetching linguagens for proprietarioId:', storedId);
          const data = await getLinguagens(storedId);
          console.log('Received data:', data);
          
          // Use data directly since getCategorias already filters by proprietario_id
          setLinguagens(data);
        } catch (error) {
          console.error('Error loading linguagens:', error);
          setLinguagens([]);
        }
      }
    };
    
    loadLinguagens();
    
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
        setCurrentLinguagem(prev => ({
          ...prev,
          proprietario_id: storedId
        }));
      }
    }
  }, [isModalOpen, proprietarioId]);

  const openModal = (linguagem?: Linguagem) => {
    if (linguagem) {
      setCurrentLinguagem(linguagem);
      setIsEditMode(true);
    } else {
      setCurrentLinguagem({});
      setIsEditMode(false);
    }
    setIsModalOpen(true);
  };

  const handleCreate = async () => {
    if (currentLinguagem.nome && currentLinguagem.descricao && currentLinguagem.proprietario_id) {
      const linguagemToSave = {
        nome: currentLinguagem.nome,
        descricao: currentLinguagem.descricao,
        proprietario_id: Number(currentLinguagem.proprietario_id)
      };

      try {
        console.log('Dados sendo enviados:', linguagemToSave); // Debug
        const created = await createLinguagem(linguagemToSave);
        setLinguagens([...linguagens, created]);
        setIsModalOpen(false);
        setCurrentLinguagem({});
      } catch (error: any) {
        console.error('Erro ao criar linguagem:', error);
        console.error('Dados do erro:', error.response?.data);
      }
    }
  };

  const handleUpdate = async () => {
    if (currentLinguagem.id && currentLinguagem.nome && currentLinguagem.descricao) {
      const linguagemToUpdate = {
        nome: currentLinguagem.nome,
        descricao: currentLinguagem.descricao
      };

      const updated = await updateLinguagem(currentLinguagem.id, linguagemToUpdate);
      setLinguagens(linguagens.map(l => (l.id === currentLinguagem.id ? updated : l)));
      setIsModalOpen(false);
      setCurrentLinguagem({});
    }
  };

  const handleDelete = async (id: string) => {
    await deleteLinguagem(id);
    setLinguagens(linguagens.filter(l => l.id !== id));
  };

  const showLinguagemDetails = (linguagem: Linguagem) => {
    setSelectedLinguagemDetails(linguagem);
  };

  return (
    <div className="min-h-screen">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 mt-[70px] lg:mt-0">
        <h1 className="text-2xl sm:text-2xl font-bold text-gray-800">
            Adicione uma linguagem
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
              {Array.isArray(linguagens) && linguagens.map((linguagem, index) => (
                    <tr key={linguagem.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                    {index + 1}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {linguagem.nome}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => showLinguagemDetails(linguagem)}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
                        title="Detalhes"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => openModal(linguagem)}
                        className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-50 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(linguagem.id)}
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
                  {isEditMode ? 'Editar Linguagem' : 'Nova Linguagem'}
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
                    value={currentLinguagem.proprietario_id || ''}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  >
                    <option value={currentLinguagem.proprietario_id}>
                      {proprietarios.find(p => p.id === Number(currentLinguagem.proprietario_id))?.nome || 'Carregando...'}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                  <input 
                    type="text" 
                    placeholder="Digite o nome da categoria" 
                    value={currentLinguagem.nome || ''} 
                    onChange={(e) => setCurrentLinguagem({ ...currentLinguagem, nome: e.target.value })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <textarea 
                    placeholder="Descreva os detalhes da linguagem" 
                    value={currentLinguagem.descricao || ''} 
                    onChange={(e) => setCurrentLinguagem({ ...currentLinguagem, descricao: e.target.value })}
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
        {selectedLinguagemDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Detalhes do Alinhamento</h2>
                <button 
                  onClick={() => setSelectedLinguagemDetails(null)}
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
                      <p className="text-gray-800 font-bold text-sm sm:text-base">{selectedLinguagemDetails.nome}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">ID</p>
                      <p className="text-gray-800 font-bold text-sm sm:text-base">{selectedLinguagemDetails.id}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Descrição</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-md text-sm sm:text-base">
                    {selectedLinguagemDetails.descricao}
                  </p>
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={() => setSelectedLinguagemDetails(null)}
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