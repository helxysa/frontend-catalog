'use client'

import { useEffect, useState } from 'react';
import {
  getAlinhamentos,
  createAlinhamento,
  updateAlinhamento,
  deleteAlinhamento
} from '../actions/actions';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Info,
  ChevronRight
} from 'lucide-react';
import type { Alinhamento } from '../types/types';
import { useSidebar } from '../../../../../../../componentes/Sidebar/SidebarContext';
import ReusableTable from '../../../componentes/Table/ReusableTable';

interface Proprietario {
  id: number;
  nome: string;
}

export default function Alinhamento({ proprietarioId }: { proprietarioId?: string }) {
  const [alinhamentos, setAlinhamentos] = useState<Alinhamento[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAlinhamento, setCurrentAlinhamento] = useState<Partial<Alinhamento>>(() => ({
    proprietario_id: proprietarioId ? proprietarioId :
                    localStorage.getItem('selectedProprietarioId') || ''
  }));
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAlinhamentoDetails, setSelectedAlinhamentoDetails] = useState<Alinhamento | null>(null);
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const { isCollapsed } = useSidebar();

  useEffect(() => {
    const loadAlinhamentos = async () => {
      setAlinhamentos([]);

      const storedId = proprietarioId || localStorage.getItem('selectedProprietarioId');
      if (storedId) {
        try {
          const data = await getAlinhamentos(storedId);

          setAlinhamentos(data);
        } catch (error) {
          console.error('Error loading alinhamentos:', error);
          setAlinhamentos([]);
        }
      }
    };

    loadAlinhamentos();

    // Carregar proprietários com logs de depuração
    const loadProprietarios = async () => {
      try {
        

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333'}/proprietarios`, {
          method: 'GET',
          credentials: 'include', // Importante para enviar cookies de autenticação
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });


        if (!response.ok) {
          throw new Error(`Erro ao carregar proprietários: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setProprietarios(data);
        } else {
          console.error('Dados de proprietários não são um array:', data);
          setProprietarios([]);
        }
      } catch (error) {
        console.error('Erro ao carregar proprietários:', error);
        setProprietarios([]);
      }
    };

    loadProprietarios();
  }, [proprietarioId]);

  // When modal is opened, ensure proprietarioId is set
  useEffect(() => {
    if (isModalOpen) {
      const storedId = proprietarioId || localStorage.getItem('selectedProprietarioId') || undefined;
      if (storedId) {
        setCurrentAlinhamento(prev => ({
          ...prev,
          proprietario_id: storedId
        }));
      }
    }
  }, [isModalOpen, proprietarioId]);

  const openModal = (alinhamento?: Alinhamento) => {
    if (alinhamento) {
      setCurrentAlinhamento(alinhamento);
      setIsEditMode(true);
    } else {
      setCurrentAlinhamento({});
      setIsEditMode(false);
    }
    setIsModalOpen(true);
  };

  const handleCreate = async () => {
    if (currentAlinhamento.nome && currentAlinhamento.descricao && currentAlinhamento.proprietario_id) {
      const alinhamentoToSave = {
        nome: currentAlinhamento.nome,
        descricao: currentAlinhamento.descricao,
        proprietario_id: Number(currentAlinhamento.proprietario_id)
      };

      try {
        const created = await createAlinhamento(alinhamentoToSave);
        setAlinhamentos([...alinhamentos, created]);
        setIsModalOpen(false);
        setCurrentAlinhamento({});
      } catch (error: any) {
        console.error('Erro ao criar alinhamento:', error);
        console.error('Dados do erro:', error.response?.data);
      }
    }
  };

  const handleUpdate = async () => {
    if (currentAlinhamento.id && currentAlinhamento.nome && currentAlinhamento.descricao) {
      const alinhamentoToUpdate = {
        nome: currentAlinhamento.nome,
        descricao: currentAlinhamento.descricao
      };

      const updated = await updateAlinhamento(currentAlinhamento.id, alinhamentoToUpdate);
      setAlinhamentos(alinhamentos.map(c => (c.id === currentAlinhamento.id ? updated : c)));
      setIsModalOpen(false);
      setCurrentAlinhamento({});
    }
  };

  const handleDelete = async (id: string) => {
    await deleteAlinhamento(id);
    setAlinhamentos(alinhamentos.filter(c => c.id !== id));
  };

  const showAlinhamentoDetails = (categoria: Alinhamento) => {
    setSelectedAlinhamentoDetails(categoria);
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
          <h1 className="text-md sm:text-2xl font-bold text-gray-800">
            Adicione um alinhamento
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
          items={alinhamentos}
          onDetails={showAlinhamentoDetails}
          onEdit={openModal}
          onDelete={(id: string | number) => handleDelete(id.toString())}
          displayField="nome"
          displayFieldHeader="Nome"
        />

        {/* Modal for Create/Edit - Responsive */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {isEditMode ? 'Editar Alinhamento' : 'Novo Alinhamento'}
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
                  {/* Adicionando logs para depuração */}
                  

                  {/* Substituindo o dropdown por um campo de texto estático */}
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                    {(() => {
                      // Função para buscar o nome do proprietário com logs detalhados
                      if (!Array.isArray(proprietarios)) {
                        return `Proprietário #${currentAlinhamento.proprietario_id}`;
                      }

                      if (proprietarios.length === 0) {
                        return `Proprietário #${currentAlinhamento.proprietario_id}`;
                      }

                      const prop = proprietarios.find(p => p.id === Number(currentAlinhamento.proprietario_id));

                      return prop?.nome || `Proprietário #${currentAlinhamento.proprietario_id}`;
                    })()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">ID: {currentAlinhamento.proprietario_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                  <input
                    type="text"
                    placeholder="Digite o nome do alinhamento"
                    value={currentAlinhamento.nome || ''}
                    onChange={(e) => setCurrentAlinhamento({ ...currentAlinhamento, nome: e.target.value })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <textarea
                    placeholder="Descreva os detalhes do alinhamento"
                    value={currentAlinhamento.descricao || ''}
                    onChange={(e) => setCurrentAlinhamento({ ...currentAlinhamento, descricao: e.target.value })}
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
        {selectedAlinhamentoDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Detalhes do Alinhamento</h2>
                <button
                  onClick={() => setSelectedAlinhamentoDetails(null)}
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
                      <p className="text-gray-800 font-bold text-sm sm:text-base">{selectedAlinhamentoDetails.nome}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">ID</p>
                      <p className="text-gray-800 font-bold text-sm sm:text-base">{selectedAlinhamentoDetails.id}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Descrição</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-md text-sm sm:text-base">
                    {selectedAlinhamentoDetails.descricao}
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedAlinhamentoDetails(null)}
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