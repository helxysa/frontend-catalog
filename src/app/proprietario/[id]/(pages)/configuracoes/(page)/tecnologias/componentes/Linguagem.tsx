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

import { useSidebar } from '../../../../../../../componentes/Sidebar/SidebarContext';
import ReusableTable from '../../../componentes/Table/ReusableTable';
import { PaginationMeta } from '../../categorias/types/types';


interface Proprietario {
  id: number;
  nome: string;
}

export default function Linguagem({ proprietarioId }: { proprietarioId?: string }) {
  const [linguagens, setLinguagens] = useState<Linguagem[]>([]);
  const { isCollapsed } = useSidebar();
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [limit, setLimit] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
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
          const data = await getLinguagens(storedId, currentPage, limit);
          setLinguagens(data.data);
          setPagination(data.meta)
        } catch (error) {
          console.error('Error loading linguagens:', error);
          setLinguagens([]);
          setPagination(null);
        }
      }
    };

    loadLinguagens();

    // Carregar proprietários com logs de depuração
 
  }, [proprietarioId, currentPage, limit]);

  
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1); // Volta para a primeira página ao mudar o limite
  };

  const handleNextPage = () => {
    if (pagination?.nextPageUrl) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination?.previousPageUrl) {
      setCurrentPage((prev) => prev - 1);
    }
  };


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
        <ReusableTable
            items={linguagens}
            onDetails={showLinguagemDetails}
            onEdit={openModal}
            onDelete={(id: string | number) => handleDelete(id.toString())}
            displayField="nome"
            displayFieldHeader="Nome"
            currentPage={pagination?.currentPage || 1}
            hasNextPage={!!pagination?.nextPageUrl}
            hasPrevPage={!!pagination?.previousPageUrl}
            totalPages={pagination?.lastPage || 1}
            totalRecords={pagination?.total || 0}
            limit={limit}
            onNextPage={handleNextPage}
            onPrevPage={handlePrevPage}
            onLimitChange={handleLimitChange}
          />

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