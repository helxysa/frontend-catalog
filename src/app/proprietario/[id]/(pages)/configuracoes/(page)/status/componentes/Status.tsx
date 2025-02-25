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

  useEffect(() => {
    const loadStatus = async () => {
      setStatus([]); 
      
      const storedId = proprietarioId || localStorage.getItem('selectedProprietarioId');
      if (storedId) {
        try {
          console.log('Fetching categories for proprietarioId:', storedId);
          const data = await getStatus(storedId);
          console.log('Received data:', data);
          
          setStatus(data);
        } catch (error) {
          console.error('Error loading status:', error);
          setStatus([]);
        }
      }
    };
    
    loadStatus();
    
    if (!proprietarioId) {
      const loadProprietarios = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/proprietarios`);
        const data = await response.json();
        setProprietarios(data);
      };
      loadProprietarios();
    }
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
        console.log('Dados sendo enviados:', statusToSave); // Debug
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
    <div className="min-h-screen">
      <div className="p-4 sm:p-6">
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
          <table className="min-w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">Nome</th>
                <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">Propriedade</th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 ">
              {Array.isArray(status) && status.map((statusItem, index) => (
                <tr key={statusItem.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                    {index + 1}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {statusItem.nome}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 text-center">
                    <span 
                      className={`rounded-md px-2 py-1 ${determinarCorTexto(statusItem.propriedade)}`} 
                      style={{ backgroundColor: statusItem.propriedade }}
                    >
                      {statusItem.nome || 'Não informado'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => showStatusDetails(statusItem)}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
                        title="Detalhes"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => openModal(statusItem)}
                        className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-50 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(statusItem.id)}
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
                  <select
                    value={currentStatus.proprietario_id || ''}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  >
                    <option value={currentStatus.proprietario_id}>
                      {proprietarios.find(p => p.id === Number(currentStatus.proprietario_id))?.nome || 'Carregando...'}
                    </option>
                  </select>
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
                              onChangeComplete={(color: any) => {
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