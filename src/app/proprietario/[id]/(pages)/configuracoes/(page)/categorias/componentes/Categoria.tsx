'use client'

import { useEffect, useState } from 'react';
import { 
  getCategorias, 
  createCategoria, 
  updateCategoria, 
  deleteCategoria 
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
import type { Categoria } from '../types/types';

interface Proprietario {
  id: number;
  nome: string;
}

export default function Categoria({ proprietarioId }: { proprietarioId?: string }) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategoria, setCurrentCategoria] = useState<Partial<Categoria>>(() => ({
    proprietario_id: proprietarioId ? proprietarioId : 
                    localStorage.getItem('selectedProprietarioId') || ''
  }));
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategoriaDetails, setSelectedCategoriaDetails] = useState<Categoria | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);

  useEffect(() => {
    const loadCategorias = async () => {
      setCategorias([]); // Clear existing categories
      
      const storedId = proprietarioId || localStorage.getItem('selectedProprietarioId');
      if (storedId) {
        try {
          console.log('Fetching categories for proprietarioId:', storedId);
          const data = await getCategorias(storedId);
          console.log('Received data:', data);
          
          // Use data directly since getCategorias already filters by proprietario_id
          setCategorias(data);
        } catch (error) {
          console.error('Error loading categorias:', error);
          setCategorias([]);
        }
      }
    };
    
    loadCategorias();
    
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
        setCurrentCategoria(prev => ({
          ...prev,
          proprietario_id: storedId
        }));
      }
    }
  }, [isModalOpen, proprietarioId]);

  const openModal = (categoria?: Categoria) => {
    if (categoria) {
      setCurrentCategoria(categoria);
      setIsEditMode(true);
    } else {
      setCurrentCategoria({});
      setIsEditMode(false);
    }
    setIsModalOpen(true);
  };

  const handleCreate = async () => {
    if (currentCategoria.nome && currentCategoria.descricao && currentCategoria.proprietario_id) {
      const categoriaToSave = {
        nome: currentCategoria.nome,
        descricao: currentCategoria.descricao,
        proprietario_id: Number(currentCategoria.proprietario_id)
      };

      try {
        console.log('Dados sendo enviados:', categoriaToSave); // Debug
        const created = await createCategoria(categoriaToSave);
        setCategorias([...categorias, created]);
        setIsModalOpen(false);
        setCurrentCategoria({});
      } catch (error: any) {
        console.error('Erro ao criar categoria:', error);
        console.error('Dados do erro:', error.response?.data);
      }
    }
  };

  const handleUpdate = async () => {
    if (currentCategoria.id && currentCategoria.nome && currentCategoria.descricao) {
      const categoriaToUpdate = {
        nome: currentCategoria.nome,
        descricao: currentCategoria.descricao
      };

      const updated = await updateCategoria(currentCategoria.id, categoriaToUpdate);
      setCategorias(categorias.map(c => (c.id === currentCategoria.id ? updated : c)));
      setIsModalOpen(false);
      setCurrentCategoria({});
    }
  };

  const handleDelete = async (id: string) => {
    await deleteCategoria(id);
    setCategorias(categorias.filter(c => c.id !== id));
  };

  const showCategoriaDetails = (categoria: Categoria) => {
    setSelectedCategoriaDetails(categoria);
  };

  return (
    <div className="min-h-screen">
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6 mt-[70px] lg:mt-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {proprietarioId ? 'Categorias do Escritório' : 'Categorias'}
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
              {Array.isArray(categorias) && categorias.map((categoria, index) => (
                <tr key={categoria.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                    {index + 1}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {categoria.nome}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => showCategoriaDetails(categoria)}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
                        title="Detalhes"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => openModal(categoria)}
                        className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-50 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(categoria.id)}
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
                  {isEditMode ? 'Editar Categoria' : 'Nova Categoria'}
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
                    value={currentCategoria.proprietario_id || ''}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  >
                    <option value={currentCategoria.proprietario_id}>
                      {proprietarios.find(p => p.id === Number(currentCategoria.proprietario_id))?.nome || 'Carregando...'}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                  <input 
                    type="text" 
                    placeholder="Digite o nome da categoria" 
                    value={currentCategoria.nome || ''} 
                    onChange={(e) => setCurrentCategoria({ ...currentCategoria, nome: e.target.value })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <textarea 
                    placeholder="Descreva os detalhes da categoria" 
                    value={currentCategoria.descricao || ''} 
                    onChange={(e) => setCurrentCategoria({ ...currentCategoria, descricao: e.target.value })}
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
        {selectedCategoriaDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Detalhes do Alinhamento</h2>
                <button 
                  onClick={() => setSelectedCategoriaDetails(null)}
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
                      <p className="text-gray-800 font-bold text-sm sm:text-base">{selectedCategoriaDetails.nome}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">ID</p>
                      <p className="text-gray-800 font-bold text-sm sm:text-base">{selectedCategoriaDetails.id}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Descrição</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-md text-sm sm:text-base">
                    {selectedCategoriaDetails.descricao}
                  </p>
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={() => setSelectedCategoriaDetails(null)}
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