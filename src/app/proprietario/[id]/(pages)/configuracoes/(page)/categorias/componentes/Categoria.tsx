'use client'

import { use, useEffect, useState } from 'react';
import {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria
} from '../actions/actions';
import { useToast } from "@/hooks/use-toast"
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
import { PaginationMeta } from '../types/types';
import Loading from '@/app/componentes/Loading/Loading';
import { useSidebar } from '../../../../../../../componentes/Sidebar/SidebarContext';
import ReusableTable from '../../../componentes/Table/ReusableTable';



export default function Categoria({ proprietarioId }: { proprietarioId?: string }) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const { toast } = useToast()

  const [currentCategoria, setCurrentCategoria] = useState<Partial<Categoria>>(() => ({
    proprietario_id: proprietarioId ? proprietarioId :
      localStorage.getItem('selectedProprietarioId') || ''
  }));
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategoriaDetails, setSelectedCategoriaDetails] = useState<Categoria | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isCollapsed } = useSidebar();

  useEffect(() => {
    const loadCategorias = async () => {
      setIsLoading(true);

      const storedId = proprietarioId || localStorage.getItem('selectedProprietarioId');
      if (storedId) {
        try {
          const data = await getCategorias(storedId, currentPage, limit);
          setCategorias(data.data);
          setPagination(data.meta);
        } catch (error) {
          console.error('Error loading categorias:', error);
          setCategorias([]);
          setPagination(null);
        }
      }
      setIsLoading(false);
    };

    loadCategorias();
  }, [proprietarioId, currentPage, limit]);

  useEffect(() => {
    if (pagination) {
      console.log('Dados de paginação:', pagination);
    }
  }, [pagination]);

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

  const handleCreate = async () => {
    if (currentCategoria.nome && currentCategoria.descricao && currentCategoria.proprietario_id) {
      const categoriaToSave = {
        nome: currentCategoria.nome,
        descricao: currentCategoria.descricao,
        proprietario_id: Number(currentCategoria.proprietario_id)
      };

      try {
        await createCategoria(categoriaToSave);
        if (currentPage !== 1) {
          setCurrentPage(1);
        } else {
          const storedId = proprietarioId || localStorage.getItem('selectedProprietarioId');
          if (storedId) {
            setIsLoading(true);
            const data = await getCategorias(storedId, 1, limit);
            setCategorias(data.data);
            setPagination(data.meta);
            setIsLoading(false);
          }
        }
        setIsModalOpen(false);
        setCurrentCategoria({});
        toast({
          title: "Categoria criada.",
          description: "A sua categoria foi registrada.",
          variant: "success",
          duration: 1700,
      });
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
      toast({
        title: "Categoria editada.",
        description: "A sua categoria foi editada.",
        variant: "success",
        duration: 1700,
    });
    }
  };

  const handleDelete = async (id: string) => {
    await deleteCategoria(id);

    if (categorias.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else {
      const storedId = proprietarioId || localStorage.getItem('selectedProprietarioId');
      if (storedId) {
        setIsLoading(true);
        const data = await getCategorias(storedId, currentPage, limit);
        setCategorias(data.data);
        setPagination(data.meta);
        setIsLoading(false);
      }
    }
  };

  const showCategoriaDetails = (categoria: Categoria) => {
    setSelectedCategoriaDetails(categoria);
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
        <div className="flex justify-between items-center mb-6 mt-[70px] lg:mt-0">
          <h1 className="text-2xl sm:text-2xl font-bold text-gray-800">
            Adicione uma categoria
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

        {isLoading ? (
          <Loading />
        ) : (
          <ReusableTable
            items={categorias}
            onDetails={showCategoriaDetails}
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
        )}

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