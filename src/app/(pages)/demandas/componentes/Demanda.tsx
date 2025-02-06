'use client'

interface DemandaFormData {
  proprietario_id: number;
  nome: string;
  sigla: string;
  descricao: string;
  demandante: string;
  fator_gerador: string;
  alinhamento_id: number;
  prioridade_id: number;
  responsavel_id: number;
  status_id: number;
  data_status: string;
}

import { useEffect, useState } from 'react';
import { 
  getDemandas, 
  getProprietarios, 
  getAlinhamentos, 
  getPrioridades, 
  getResponsaveis, 
  getStatus,
  deleteDemanda,
  createDemanda,
  updateDemanda
} from "../actions/actions";
import { Plus, Edit2, Trash2, X, Info, ChevronRight } from 'lucide-react';
import { DemandaType } from '../types/types';
import DeleteConfirmationModal from './ModalConfirmacao/DeleteConfirmationModal';


export default function Demanda() {
  const [demandas, setDemandas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDemandDetails, setSelectedDemandDetails] = useState<DemandaType | null>(null);
  const [formData, setFormData] = useState<DemandaFormData>({} as DemandaFormData);
  const [proprietarios, setProprietarios] = useState([]);
  const [alinhamentos, setAlinhamentos] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);




  useEffect(() => {
    Promise.all([
      getDemandas(),
      getProprietarios(),
      getAlinhamentos(),
      getPrioridades(),
      getResponsaveis(),
      getStatus(),
    ]).then(([demandasData, proprietariosData, alinhamentosData, prioridadesData, responsaveisData, statusData]) => {
      setDemandas(demandasData);
      setProprietarios(proprietariosData);
      setAlinhamentos(alinhamentosData);
      setPrioridades(prioridadesData);
      setResponsaveis(responsaveisData);
      setStatusList(statusData);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const formDataToSubmit = {
        proprietario_id: Number(formData.proprietario_id),
        nome: formData.nome,
        sigla: formData.sigla,
        descricao: formData.descricao,
        demandante: formData.demandante,
        fator_gerador: formData.fator_gerador,
        alinhamento_id: Number(formData.alinhamento_id),
        prioridade_id: Number(formData.prioridade_id),
        responsavel_id: Number(formData.responsavel_id),
        status_id: Number(formData.status_id),
        data_status: formData.data_status
      };

      if (isEditing) {
        await updateDemanda(isEditing, formDataToSubmit);
      } else {
        await createDemanda(formDataToSubmit);
      }
      
      const updatedDemandas = await getDemandas();
      setDemandas(updatedDemandas);
      setIsModalOpen(false);
      setFormData({} as DemandaFormData);
      setIsEditing(null);
    } catch (error) {
      console.error('Error saving demanda:', error);
    }
  };

  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleDeleteClick = (id: string) => {
    setItemToDeleteId(id);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (itemToDeleteId) {
      try {
        await deleteDemanda(itemToDeleteId);
        const updatedDemandas = await getDemandas();
        setDemandas(updatedDemandas);
      } catch (error) {
        console.error('Error deleting demanda:', error);
      }
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Demandas</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sigla</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fator Gerador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demandante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alinhamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.isArray(demandas) && demandas.map((demanda: DemandaType) => (
                <tr key={demanda.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {demanda.sigla || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {demanda.nome || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {demanda.fatorGerador || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {demanda.demandante || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {demanda.alinhamento?.nome || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {demanda.prioridade?.nome || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {demanda.responsavel?.nome || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(demanda.dataStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {demanda.status?.nome || '-'}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => setSelectedDemandDetails(demanda)}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => {
                          const formattedData: DemandaFormData = {
                            proprietario_id: Number(demanda.proprietario?.id) || 0,
                            nome: demanda.nome || '',
                            sigla: demanda.sigla || '',
                            descricao: demanda.descricao || '',
                            demandante: demanda.demandante || '',
                            fator_gerador: demanda.fatorGerador || '',
                            alinhamento_id: Number(demanda.alinhamento?.id) || 0,
                            prioridade_id: Number(demanda.prioridade?.id) || 0,
                            responsavel_id: Number(demanda.responsavel?.id) || 0,
                            status_id: Number(demanda.status?.id) || 0,
                            data_status: demanda.dataStatus || ''
                          };
                          setFormData(formattedData);
                          setIsEditing(demanda.id);
                          setIsModalOpen(true);
                        }}
                        className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-50 transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(demanda.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                      >
                       
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <DeleteConfirmationModal 
                            isOpen={isDeleteModalOpen}
                            onClose={() => setIsDeleteModalOpen(false)}
                            onConfirm={confirmDelete}
                            itemName="esta demanda"
                        />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {isEditing ? 'Editar Demanda' : 'Nova Demanda'}
                </h2>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditing(null);
                    setFormData({} as DemandaFormData);
                  }}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Proprietário</label>
                    <select 
                      name="proprietario_id" 
                      value={formData.proprietario_id || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500"
                    >
                      <option value="">Selecione um proprietário</option>
                      {proprietarios.map((prop: any) => (
                        <option key={prop.id} value={prop.id}>{prop.nome}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                    <input 
                      type="text" 
                      name="nome" 
                      value={formData.nome || ''} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sigla</label>
                    <input 
                      type="text" 
                      name="sigla" 
                      value={formData.sigla || ''} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Demandante</label>
                    <input 
                      type="text" 
                      name="demandante" 
                      value={formData.demandante || ''} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500" 
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                    <textarea 
                      name="descricao" 
                      value={formData.descricao || ''} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fator Gerador</label>
                    <input 
                      type="text" 
                      name="fator_gerador" 
                      value={formData.fator_gerador || ''} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alinhamento</label>
                    <select 
                      name="alinhamento_id" 
                      value={formData.alinhamento_id || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500"
                    >
                      <option value="">Selecione um alinhamento</option>
                      {alinhamentos.map((align: any) => (
                        <option key={align.id} value={align.id}>{align.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
                    <select 
                      name="prioridade_id" 
                      value={formData.prioridade_id || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500"
                    >
                      <option value="">Selecione uma prioridade</option>
                      {prioridades.map((prior: any) => (
                        <option key={prior.id} value={prior.id}>{prior.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Responsável</label>
                    <select 
                      name="responsavel_id" 
                      value={formData.responsavel_id || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500"
                    >
                      <option value="">Selecione um responsável</option>
                      {responsaveis.map((resp: any) => (
                        <option key={resp.id} value={resp.id}>{resp.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select 
                      name="status_id" 
                      value={formData.status_id || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500"
                    >
                      <option value="">Selecione um status</option>
                      {statusList.map((status: any) => (
                        <option key={status.id} value={status.id}>{status.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data Status</label>
                    <input 
                      type="date" 
                      name="data_status" 
                      value={formData.data_status || ''} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500" 
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}