'use client'

import { useEffect, useState } from 'react';
import {
  getStatus,
  createStatus,
  updateStatus,
  deleteStatus
} from '../actions/actions';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Info,
  ChevronRight
} from 'lucide-react';
import type { Status } from '../types/types';
import { ChromePicker } from 'react-color';
import { useSidebar } from '../../../../../../../componentes/Sidebar/SidebarContext';
import ReusableTable from '../../../componentes/Table/ReusableTable';

interface Proprietario {
  id: number;
  nome: string;
}

const determinarCorTexto = (corHex: string) => {
  corHex = corHex.replace('#', '');
  const r = parseInt(corHex.substr(0, 2), 16);
  const g = parseInt(corHex.substr(2, 2), 16);
  const b = parseInt(corHex.substr(4, 2), 16);
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminancia > 0.5 ? 'text-gray-800' : 'text-white';
};

const statusPresets = [
  {
    nome: 'Em andamento',
    cor: '#3498db'     // Azul confiável - transmite progresso e atividade
  },
  {
    nome: 'Cancelado',
    cor: '#e74c3c'     // Vermelho - indica parada, erro ou cancelamento
  },
  {
    nome: 'Concluído',
    cor: '#2ecc71'     // Verde - sucesso, conclusão positiva
  },
  {
    nome: 'Backlog',
    cor: '#95a5a6'     // Cinza neutro - indica estado de espera/neutro
  },
  {
    nome: 'Em análise',
    cor: '#f1c40f'     // Amarelo - atenção, em processo de avaliação
  },
  {
    nome: 'Bloqueado',
    cor: '#9b59b6'     // Roxo - indica impedimento, situação que requer atenção
  },
  {
    nome: 'Pendente',
    cor: '#e67e22'     // Laranja - estado de alerta, aguardando ação
  },
  {
    nome: 'Planejado',
    cor: '#34495e'     // Azul escuro - indica organização, planejamento
  }
];

export default function Status({ proprietarioId }: { proprietarioId?: string }) {
  const [status, setStatus] = useState<Status[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStatusDetails, setSelectedStatusDetails] = useState<Status | null>(null);
  const [color, setColor] = useState<string>('#ffffff');
  const [currentStatus, setCurrentStatus] = useState<Partial<Status>>(() => ({
    proprietario_id: proprietarioId ? proprietarioId :
                    localStorage.getItem('selectedProprietarioId') || ''
  }));
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const { isCollapsed } = useSidebar();
  useEffect(() => {
    const loadStatus = async () => {
      setStatus([]);

      const storedId = proprietarioId || localStorage.getItem('selectedProprietarioId');
      if (storedId) {
        try {
          const data = await getStatus(storedId);

          setStatus(data);
        } catch (error) {
          console.error('Error loading status:', error);
          setStatus([]);
        }
      }
    };

    loadStatus();

    // Carregar proprietários
    const loadProprietarios = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333'}/proprietarios`, {
          method: 'GET',
          credentials: 'include',
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
          setProprietarios([]);
        }
      } catch (error) {
        setProprietarios([]);
      }
    };

    loadProprietarios();
  }, [proprietarioId]);


  useEffect(() => {
    if (isModalOpen) {
      const storedId = proprietarioId || localStorage.getItem('selectedProprietarioId') || undefined;
      if (storedId) {
        setCurrentStatus(prev => ({
          ...prev,
          proprietario_id: storedId
        }));
      }
    }
  }, [isModalOpen, proprietarioId]);

  const openModal = (status?: Status) => {
    if (status) {
      setCurrentStatus(status);
      setIsEditMode(true);
    } else {
      setCurrentStatus({});
      setIsEditMode(false);
    }
    setIsModalOpen(true);
  };

  const handleCreate = async () => {
    if (currentStatus.nome && currentStatus.propriedade && currentStatus.proprietario_id) {
      const statusToSave = {
        nome: currentStatus.nome,
        propriedade: currentStatus.propriedade,
        proprietario_id: Number(currentStatus.proprietario_id)
      };

      try {
        const created = await createStatus(statusToSave);
        setStatus([...status, created]);
        setIsModalOpen(false);
        setCurrentStatus({});
      } catch (error: any) {
        console.error('Erro ao criar status:', error);
        console.error('Dados do erro:', error.response?.data);
      }
    }
  };

  const handleUpdate = async () => {
    if (currentStatus.id && currentStatus.nome && currentStatus.propriedade) {
      const statusToUpdate = {
        nome: currentStatus.nome,
        propriedade: currentStatus.propriedade
      };

      const updated = await updateStatus(currentStatus.id, statusToUpdate);
      setStatus(status.map(s => (s.id === currentStatus.id ? updated : s)));
      setIsModalOpen(false);
      setCurrentStatus({});
    }
  };
  const handleDelete = async (id: string) => {
    await deleteStatus(id);
    setStatus(status.filter(s => s.id !== id));
  };

  const showStatusDetails = (status: Status) => {
    setSelectedStatusDetails(status);
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
           Adicione um status
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

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <ReusableTable
            items={status}
            onDetails={showStatusDetails}
            onEdit={openModal}
            onDelete={(id: string | number) => handleDelete(id.toString())}
            displayField="nome"
            displayFieldHeader="Nome"
          />
        </div>


        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {isEditMode ? 'Editar Status' : 'Novo Status'}
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

                  {/* Substituindo o dropdown por um campo de texto estático */}
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                    {(() => {
                      // Função para buscar o nome do proprietário
                      if (!Array.isArray(proprietarios)) {
                        return `Proprietário #${currentStatus.proprietario_id}`;
                      }

                      if (proprietarios.length === 0) {
                        return `Proprietário #${currentStatus.proprietario_id}`;
                      }

                      const prop = proprietarios.find(p => p.id === Number(currentStatus.proprietario_id));

                      return prop?.nome || `Proprietário #${currentStatus.proprietario_id}`;
                    })()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">ID: {currentStatus.proprietario_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                  <input
                    type="text"
                    placeholder="Digite o nome do status"
                    value={currentStatus.nome || ''}
                    onChange={(e) => setCurrentStatus({ ...currentStatus, nome: e.target.value })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status predefinidos</label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {statusPresets.map((preset) => (
                      <button
                        key={preset.nome}
                        onClick={() => {
                          setCurrentStatus({
                            ...currentStatus,
                            nome: preset.nome,
                            propriedade: preset.cor
                          });
                          setColor(preset.cor);
                        }}
                        className="flex items-center gap-2 p-2 rounded-md border hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: preset.cor }}
                        />
                        <span className="text-sm text-gray-700">{preset.nome}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Propriedade</label>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <input
                        placeholder="Selecione a cor"
                        value={currentStatus.propriedade || ''}
                        onChange={(e) => setCurrentStatus({ ...currentStatus, propriedade: e.target.value })}
                        className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500 text-sm sm:text-base"
                      />
                      <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className="w-6 h-6 rounded-md border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm text-gray-700">
                          {showColorPicker ? 'Fechar' : 'Escolher cor'}
                        </span>
                      </button>
                    </div>

                    {showColorPicker && (
                      <div className="relative">
                        <div className="absolute z-10 right-0">
                          <div className="p-4 bg-white rounded-lg shadow-lg border border-gray-200">
                            <ChromePicker
                              color={color}
                              onChange={(color: any) => {
                                setColor(color.hex);
                                setCurrentStatus({ ...currentStatus, propriedade: color.hex });
                              }}
                              disableAlpha={true}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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


        {selectedStatusDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Detalhes do Status</h2>
                <button
                  onClick={() => setSelectedStatusDetails(null)}
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
                      <p className="text-gray-800 font-bold text-sm sm:text-base">{selectedStatusDetails.nome}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">ID</p>
                      <p className="text-gray-800 font-bold text-sm sm:text-base">{selectedStatusDetails.id}</p>
                    </div>
                  </div>
                </div>
               not
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}