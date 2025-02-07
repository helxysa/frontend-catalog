'use client'

interface SolucaoFormData {
  nome: string;
  demanda_id: number;
  sigla: string;
  descricao: string;
  versao: string;
  tipo_id: number;
  linguagem_id: number;
  desenvolvedor_id: number;
  categoria_id: number;
  responsavel_id: number;
  status_id: number;
  data_status: string;
}

import { useEffect, useState } from 'react';
import { 
  getSolucoes, 
  getTipos, 
  getLinguagens, 
  getDesenvolvedores, 
  getCategorias, 
  getResponsaveis, 
  getStatus,
  deleteSolucao,
  createSolucao,
  updateSolucao,
  getDemandas
} from "../actions/actions";
import { Plus, Edit2, Trash2, X, Info, ChevronRight } from 'lucide-react';
import { SolucaoType } from '../types/types';
import DeleteConfirmationModal from './ModalConfirmacao/DeleteConfirmationModal';


export default function Solucao() {
  const [solucoes, setSolucoes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDemandDetails, setSelectedDemandDetails] = useState<SolucaoType | null>(null);
  const [formData, setFormData] = useState<SolucaoFormData>({} as SolucaoFormData);
  const [tipos, setTipos] = useState([]);
  const [linguagens, setLinguagens] = useState([]);
  const [desenvolvedores, setDesenvolvedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const [demanda, setDemanda] = useState([]);

  const determinarCorTexto = (corHex: string) => {
   
    corHex = corHex.replace('#', '');
    

    const r = parseInt(corHex.substr(0, 2), 16);
    const g = parseInt(corHex.substr(2, 2), 16);
    const b = parseInt(corHex.substr(4, 2), 16);
    

    const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
    return luminancia > 0.5 ? 'text-gray-800' : 'text-white';
  };


  useEffect(() => {
    Promise.all([
      getSolucoes(),
      getTipos(),
      getLinguagens(),
      getDesenvolvedores(),
      getCategorias(),
      getResponsaveis(),
      getStatus(),
      getDemandas(),
    ]).then(([solucoesData, tiposData, linguagensData, desenvolvedoresData, categoriasData, responsaveisData, statusData, demandasData]) => {
      setSolucoes(solucoesData);
      setTipos(tiposData);
      setLinguagens(linguagensData);
      setDesenvolvedores(desenvolvedoresData);
      setCategorias(categoriasData);
      setResponsaveis(responsaveisData);
      setStatusList(statusData);
      setDemanda(demandasData);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const formDataToSubmit = {
        demanda_id: Number(formData.demanda_id),
        nome: formData.nome,
        sigla: formData.sigla,
        descricao: formData.descricao,
        versao: formData.versao,
        tipo_id: Number(formData.tipo_id),
        linguagem_id: Number(formData.linguagem_id),
        desenvolvedor_id: Number(formData.desenvolvedor_id),
        categoria_id: Number(formData.categoria_id),
        responsavel_id: Number(formData.responsavel_id),
        status_id: Number(formData.status_id),
        data_status: formData.data_status
      };

      if (isEditing) {
        await updateSolucao(isEditing, formDataToSubmit);
      } else {
        await createSolucao(formDataToSubmit);
      }
      
      const updatedSolucoes = await getSolucoes();
      setSolucoes(updatedSolucoes);
      setIsModalOpen(false);
      setFormData({} as SolucaoFormData);
      setIsEditing(null);
    } catch (error) {
      console.error('Error saving solucao:', error);
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
        await deleteSolucao(itemToDeleteId);
        const updatedSolucoes = await getSolucoes();
        setSolucoes(updatedSolucoes);
      } catch (error) {
        console.error('Error deleting solucao:', error);
      }
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Soluções</h1>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sigla</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VERSÃO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TIPO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LINGUAGEM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DESENVOLVEDOR</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DEMANDA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CATEGORIA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RESPONSAVEL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.isArray(solucoes) && solucoes.map((solucao: SolucaoType, index: number) => (
                <tr key={solucao.id} className="hover:bg-gray-50 transition-colors">
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {solucao.nome || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {solucao.sigla || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {solucao.versao || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {solucao.tipo?.nome || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {solucao.linguagem?.nome || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {solucao.desenvolvedor?.nome || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {solucao.demanda?.nome || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {solucao.categoria?.nome || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {solucao.responsavel?.nome || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span 
                      className={`rounded-md px-2 py-1 ${determinarCorTexto(solucao.status?.propriedade)}`} 
                      style={{ backgroundColor: solucao.status?.propriedade }}
                    >
                      {solucao.status?.nome || '-'}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => setSelectedDemandDetails(solucao)}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => {
                          const formattedData: SolucaoFormData = {
                            demanda_id: Number(solucao.demanda?.id) || 0,
                            nome: solucao.nome || '',
                            sigla: solucao.sigla || '',
                            descricao: solucao.descricao || '',
                            versao: solucao.versao || '',
                            tipo_id: Number(solucao.tipo?.id) || 0,
                            linguagem_id: Number(solucao.linguagem?.id) || 0,
                            desenvolvedor_id: Number(solucao.desenvolvedor?.id) || 0,
                            categoria_id: Number(solucao.categoria?.id) || 0,
                            responsavel_id: Number(solucao.responsavel?.id) || 0,
                            status_id: Number(solucao.status?.id) || 0,
                            data_status: solucao.dataStatus || ''
                          };
                          setFormData(formattedData);
                          setIsEditing(solucao.id);
                          setIsModalOpen(true);
                        }}
                        className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-50 transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(solucao.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                      >
                       
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <DeleteConfirmationModal 
                            isOpen={isDeleteModalOpen}
                            onClose={() => setIsDeleteModalOpen(false)}
                            onConfirm={confirmDelete}
                            itemName="esta solução"
                        />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] overflow-y-auto">
            <div className="relative bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl m-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {isEditing ? 'Editar Solução' : 'Nova Solução'}
                </h2>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditing(null);
                    setFormData({} as SolucaoFormData);
                  }}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>


              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Versão</label>
                    <input 
                      type="text" 
                      name="versao" 
                      value={formData.versao || ''} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500"
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                    <select 
                      name="tipo_id" 
                      value={formData.tipo_id || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500"
                    >
                      <option value="">Selecione um tipo</option>
                      {tipos.map((tipo: any) => (
                        <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Linguagem</label>
                    <select 
                      name="linguagem_id" 
                      value={formData.linguagem_id || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500"
                    >
                      <option value="">Selecione uma linguagem</option>
                      {linguagens.map((linguagem: any) => (
                        <option key={linguagem.id} value={linguagem.id}>{linguagem.nome}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Desenvolvedor</label>
                    <select 
                      name="desenvolvedor_id" 
                      value={formData.desenvolvedor_id || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500"
                    >
                      <option value="">Selecione um desenvolvedor</option>
                      {desenvolvedores.map((desenvolvedor: any) => (
                        <option key={desenvolvedor.id} value={desenvolvedor.id}>{desenvolvedor.nome}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                    <select 
                      name="categoria_id" 
                      value={formData.categoria_id || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categorias.map((categoria: any) => (
                        <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Demanda</label>
                    <select 
                      name="demanda_id" 
                      value={formData.demanda_id || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500"
                    >
                      <option value="">Selecione uma demanda</option>
                      {demanda.map((demanda: any) => (
                        <option key={demanda.id} value={demanda.id}>{demanda.sigla}</option>
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