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

export default function Responsavel() {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentResponsavel, setCurrentResponsavel] = useState<Partial<Responsavel>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedResponsavelDetails, setSelectedResponsavelDetails] = useState<Responsavel | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [emailError, setEmailError] = useState<string>('');

  useEffect(() => {
    getResponsaveis().then(setResponsaveis);
  }, []);

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

  const validateEmail = (email: string) => {
    // Regex that allows standard emails and institutional domains
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleCreate = async () => {
    if (currentResponsavel.nome && currentResponsavel.email) {
      if (!validateEmail(currentResponsavel.email)) {
        setEmailError('Por favor, insira um email válido');
        return;
      }
      
      const responsavelToSave = {
        nome: currentResponsavel.nome,
        email: currentResponsavel.email
      };

      const created = await createResponsavel(responsavelToSave);
      setResponsaveis([...responsaveis, created]);
      setIsModalOpen(false);
      setCurrentResponsavel({});
      setEmailError('');
    }
  };

  const handleUpdate = async () => {
    if (currentResponsavel.id && currentResponsavel.nome && currentResponsavel.email) {
      if (!validateEmail(currentResponsavel.email)) {
        setEmailError('Por favor, insira um email válido');
        return;
      }

      const responsavelToUpdate = {
        nome: currentResponsavel.nome,
        email: currentResponsavel.email
      };

      const updated = await updateResponsavel(currentResponsavel.id, responsavelToUpdate);
      setResponsaveis(responsaveis.map(r => (r.id === currentResponsavel.id ? updated : r)));
      setIsModalOpen(false);
      setCurrentResponsavel({});
      setEmailError('');
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
    <div className="min-h-screen ">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 mt-[70px] lg:mt-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Responsáveis</h1>
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
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">#</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.isArray(responsaveis) && responsaveis.map((responsavel) => (
                <tr key={responsavel.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                    {responsavel.id}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {responsavel.nome}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {responsavel.email}
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
                    onChange={(e) => {
                      setCurrentResponsavel({ ...currentResponsavel, email: e.target.value });
                      setEmailError('');
                    }}
                    className={`w-full px-3 py-2 sm:px-4 sm:py-3 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500 text-sm sm:text-base`}
                  />
                  {emailError && (
                    <p className="mt-1 text-sm text-red-600">{emailError}</p>
                  )}
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
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Detalhes do Responsável</h2>
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