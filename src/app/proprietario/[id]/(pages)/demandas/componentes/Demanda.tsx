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

interface HistoricoType {
  id: number;
  demandaId: number;
  usuario: string;
  descricao: string;
  createdAt: string;
  updatedAt: string;
  demanda: {
    id: number;
    nome: string;
    proprietarioId: number;
    sigla: string;
    descricao: string;
    demandante: string;
    fatorGerador: string;
    alinhamentoId: number;
    prioridadeId: number;
    responsavelId: number;
    statusId: number;
    dataStatus: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface AlinhamentoType {
  id: number;
  nome: string;
}

interface PrioridadeType {
  id: number;
  nome: string;
}

interface StatusType {
  id: number;
  nome: string;
}

interface ProprietarioType {
  id: number;
  nome: string;
}

interface ResponsavelType {
  id: number;
  nome: string;
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
  updateDemanda,
  getHistoricoDemandas
} from "../actions/actions";
import { Plus, Edit2, Trash2, X, Info, ChevronRight } from 'lucide-react';
import { DemandaType } from '../types/types';
import DeleteConfirmationModal from './ModalConfirmacao/DeleteConfirmationModal';


export default function Demanda() {
  const [demandas, setDemandas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDemandDetails, setSelectedDemandDetails] = useState<DemandaType | null>(null);
  const [formData, setFormData] = useState<DemandaFormData>(() => {
    // Inicializa o formData com o proprietario_id do localStorage
    const storedId = localStorage.getItem('selectedProprietarioId');
    return {
      proprietario_id: storedId ? Number(storedId) : 0,
      nome: '',
      sigla: '',
      descricao: '',
      demandante: '',
      fator_gerador: '',
      alinhamento_id: 0,
      prioridade_id: 0,
      responsavel_id: 0,
      status_id: 0,
      data_status: ''
    };
  });
  const [proprietarios, setProprietarios] = useState<ProprietarioType[]>([]);
  const [alinhamentos, setAlinhamentos] = useState<AlinhamentoType[]>([]);
  const [prioridades, setPrioridades] = useState<PrioridadeType[]>([]);
  const [responsaveis, setResponsaveis] = useState<ResponsavelType[]>([]);
  const [statusList, setStatusList] = useState<StatusType[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [historicoDemanda, setHistoricoDemanda] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  const [filters, setFilters] = useState({
    demandante: '',
    fator_gerador: '',
    alinhamento_id: '',
    prioridade_id: '',
    responsavel_id: '',
    status_id: ''
  });
  const [filteredDemandas, setFilteredDemandas] = useState<DemandaType[]>([]);
  const [shouldRefresh, setShouldRefresh] = useState(0);


  const determinarCorTexto = (corHex: string | undefined) => {
    if (!corHex) return 'text-gray-800'; // cor padrão se não houver cor hex
   
    const hexSemHash = corHex.replace('#', '');
    
    try {
      const r = parseInt(hexSemHash.substr(0, 2), 16);
      const g = parseInt(hexSemHash.substr(2, 2), 16);
      const b = parseInt(hexSemHash.substr(4, 2), 16);
      
      const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
      return luminancia > 0.5 ? 'text-gray-800' : 'text-white';
    } catch (error) {
      return 'text-gray-800'; // cor padrão em caso de erro
    }
  };

  useEffect(() => {
    Promise.all([
      getDemandas(),
      getProprietarios(),
      getAlinhamentos(),
      getPrioridades(),
      getResponsaveis(),
      getStatus(),
    ]).then(([demandasData, proprietariosData, alinhamentosData, prioridadesData, responsaveisData, statusData]) => {
      const storedId = localStorage.getItem('selectedProprietarioId');
      const demandasFiltradas = demandasData.filter(
        (demanda: DemandaType) => demanda.proprietario?.id === Number(storedId)
      );
      
      setDemandas(demandasFiltradas);
      setFilteredDemandas(demandasFiltradas);
      setProprietarios(proprietariosData);
      setAlinhamentos(alinhamentosData);
      setPrioridades(prioridadesData);
      setResponsaveis(responsaveisData);
      setStatusList(statusData);
    });
  }, [shouldRefresh]);

  // Quando o modal for aberto, atualiza o proprietario_id
  useEffect(() => {
    if (isModalOpen) {
      const storedId = localStorage.getItem('selectedProprietarioId');
      if (storedId) {
        setFormData(prev => ({
          ...prev,
          proprietario_id: Number(storedId)
        }));
      }
    }
  }, [isModalOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // Format the date to ISO string if it exists
      const formattedDate = formData.data_status ? new Date(formData.data_status).toISOString() : null;

      const formDataToSubmit = {
        proprietario_id: Number(formData.proprietario_id) || null,
        nome: formData.nome || null,
        sigla: formData.sigla || null,
        descricao: formData.descricao || null,
        demandante: formData.demandante || null,
        fator_gerador: formData.fator_gerador || null,
        alinhamento_id: Number(formData.alinhamento_id) || null,
        prioridade_id: Number(formData.prioridade_id) || null,
        responsavel_id: Number(formData.responsavel_id) || null,
        status_id: Number(formData.status_id) || null,
        data_status: formattedDate
      };

      // Remove any null values from the object
      const cleanedFormData = Object.fromEntries(
        Object.entries(formDataToSubmit).filter(([_, value]) => value !== null)
      );

      if (isEditing) {
        await updateDemanda(isEditing, cleanedFormData);
      } else {
        await createDemanda(cleanedFormData);
      }
      
      setShouldRefresh(prev => prev + 1);
      setIsModalOpen(false);
      setFormData({} as DemandaFormData);
      setIsEditing(null);
    } catch (error) {
      console.error('Error saving demanda:', error);
      // Optionally add user feedback here
      alert('Erro ao salvar demanda. Por favor, verifique os dados e tente novamente.');
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
        setShouldRefresh(prev => prev + 1);
      } catch (error) {
        console.error('Error deleting demanda:', error);
      }
      setIsDeleteModalOpen(false);
    }
  };

  const handleInfoClick = async (demanda: DemandaType) => {
    setSelectedDemandDetails(demanda);
    setIsInfoModalOpen(true);
    setActiveTab('details');
    try {
      const historicoCompleto = await getHistoricoDemandas();
      const historicoFiltrado = historicoCompleto
        .filter((historico: HistoricoType) => historico.demandaId === Number(demanda.id))
        .sort((a: HistoricoType, b: HistoricoType) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      setHistoricoDemanda(historicoFiltrado);
    } catch (error) {
      console.error('Error fetching histórico:', error);
    }
  };

  const formatHistoricoDescricao = (descricao: string, evento: HistoricoType) => {
    console.log('Descrição original:', descricao); // Para debug

    // Lista de mapeamentos de campos
    const camposMapeados: { [key: string]: { nome: string, getValue: (evento: HistoricoType) => string } } = {
      'alinhamento_id': {
        nome: 'Alinhamento',
        getValue: (e) => alinhamentos.find((a: AlinhamentoType) => a.id === Number(e.demanda.alinhamentoId))?.nome || ''
      },
      'prioridade_id': {
        nome: 'Prioridade',
        getValue: (e) => prioridades.find((p: PrioridadeType) => p.id === Number(e.demanda.prioridadeId))?.nome || ''
      },
      'responsavel_id': {
        nome: 'Responsável',
        getValue: (e) => responsaveis.find((r: ResponsavelType) => r.id === Number(e.demanda.responsavelId))?.nome || ''
      },
      'status_id': {
        nome: 'Status',
        getValue: (e) => statusList.find((s: StatusType) => s.id === Number(e.demanda.statusId))?.nome || ''
      },
      'proprietario_id': {
        nome: 'Proprietário',
        getValue: (e) => proprietarios.find((p: ProprietarioType) => p.id === Number(e.demanda.proprietarioId))?.nome || ''
      }
    };

    // Procura por diferentes padrões possíveis
    const patterns = [
      /(\w+)_id: (\d+) -> (\d+)/g,    // padrão: campo_id: 1 -> 2
      /(\w+)_id:(\d+)->(\d+)/g,       // padrão: campo_id:1->2
      /(\w+): (\d+) -> (\d+)/g,       // padrão: campo: 1 -> 2
      /(\w+):(\d+)->(\d+)/g           // padrão: campo:1->2
    ];

    let formattedDesc = descricao;
    
    patterns.forEach(pattern => {
      formattedDesc = formattedDesc.replace(pattern, (match, campo, valorAntigo, valorNovo) => {
        console.log('Match encontrado:', { campo, valorAntigo, valorNovo }); // Para debug
        
        const campoNormalizado = campo.toLowerCase().endsWith('_id') ? campo : `${campo}_id`;
        
        if (camposMapeados[campoNormalizado]) {
          const mapeamento = camposMapeados[campoNormalizado];
          const antigoObj: HistoricoType = { 
            id: evento.id,
            demandaId: evento.demandaId,
            usuario: evento.usuario,
            descricao: evento.descricao,
            createdAt: evento.createdAt,
            updatedAt: evento.updatedAt,
            demanda: { 
              ...evento.demanda, 
              [`${campoNormalizado.replace('_id', '')}Id`]: Number(valorAntigo) 
            }
          };
          const novoObj: HistoricoType = {
            ...antigoObj,
            demanda: {
              ...evento.demanda,
              [`${campoNormalizado.replace('_id', '')}Id`]: Number(valorNovo)
            }
          };
          
          const nomeAntigo = mapeamento.getValue(antigoObj);
          const nomeNovo = mapeamento.getValue(novoObj);
          
          console.log('Nomes encontrados:', { nomeAntigo, nomeNovo }); // Para debug
          
          return `${mapeamento.nome}: ${nomeAntigo} → ${nomeNovo}`;
        }
        return match;
      });
    });

    return formattedDesc;
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      demandante: '',
      fator_gerador: '',
      alinhamento_id: '',
      prioridade_id: '',
      responsavel_id: '',
      status_id: ''
    });
    setFilteredDemandas(demandas);
  };

  const applyFilters = () => {
    let filtered = [...demandas] as DemandaType[];
    
    if (filters.demandante) {
      filtered = filtered.filter(d => d.demandante === filters.demandante);
    }
    if (filters.fator_gerador) {
      filtered = filtered.filter(d => d.fatorGerador === filters.fator_gerador);
    }
    if (filters.alinhamento_id) {
      filtered = filtered.filter(d => d.alinhamento?.id === Number(filters.alinhamento_id));
    }
    if (filters.prioridade_id) {
      filtered = filtered.filter(d => d.prioridade?.id === Number(filters.prioridade_id));
    }
    if (filters.responsavel_id) {
      filtered = filtered.filter(d => d.responsavel?.id === Number(filters.responsavel_id));
    }
    if (filters.status_id) {
      filtered = filtered.filter(d => d.status?.id === Number(filters.status_id));
    }
    
    setFilteredDemandas(filtered);
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

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-6 gap-4">
            <select
              name="demandante"
              value={filters.demandante}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-bold text-gray-800"
            >
              <option value="">Demandante</option>
              {[...new Set(demandas.map((d: DemandaType) => d.demandante))].map((demandante: string) => (
                <option key={demandante} value={demandante}>{demandante}</option>
              ))}
            </select>

            <select
              name="fator_gerador"
              value={filters.fator_gerador}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-bold text-gray-800"
            >
              <option value="">Fator Gerador</option>
              {[...new Set(demandas.map((d: DemandaType) => d.fatorGerador))].map((fator: string) => (
                <option key={fator} value={fator}>{fator}</option>
              ))}
            </select>

            <select
              name="alinhamento_id"
              value={filters.alinhamento_id}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-bold text-gray-800"
            >
              <option value="">Alinhamento</option>
              {alinhamentos.map(a => (
                <option key={a.id} value={a.id}>{a.nome}</option>
              ))}
            </select>

            <select
              name="prioridade_id"
              value={filters.prioridade_id}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-bold text-gray-800"
            >
              <option value="">Prioridade</option>
              {prioridades.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>

            <select
              name="responsavel_id"
              value={filters.responsavel_id}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-bold text-gray-800"
            >
              <option value="">Responsável</option>
              {responsaveis.map(r => (
                <option key={r.id} value={r.id}>{r.nome}</option>
              ))}
            </select>

            <select
              name="status_id"
              value={filters.status_id}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-bold text-gray-800"
            >
              <option value="">Status</option>
              {statusList.map(s => (
                <option key={s.id} value={s.id}>{s.nome}</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Limpar Filtros
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
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
              {Array.isArray(filteredDemandas) && filteredDemandas.map((demanda: DemandaType, index: number) => (
                <tr key={demanda.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {index + 1}
                  </td>
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
                  <td className="px-6 py-4 rounded-md px-2 whitespace-nowrap text-sm text-gray-600">
                    {demanda.status?.propriedade ? (
                      <span 
                        className={`rounded-md px-2 py-1 ${determinarCorTexto(demanda.status.propriedade)}`} 
                        style={{ backgroundColor: demanda.status.propriedade }}
                      >
                        {demanda.status.nome || '-'}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleInfoClick(demanda)}
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
                            descricao: demanda.propriedade || '',
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
                        className="text-blue-600 hover:text-green-700 p-1 rounded-full hover:bg-green-50 transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(demanda.id)}
                        className="text-red-400 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] overflow-y-auto">
            <div className="relative bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl m-4">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Proprietário</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Nome</label>
                    <input 
                      type="text" 
                      name="nome" 
                      value={formData.nome || ''} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Sigla</label>
                    <input 
                      type="text" 
                      name="sigla" 
                      value={formData.sigla || ''} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Demandante</label>
                    <input 
                      type="text" 
                      name="demandante" 
                      value={formData.demandante || ''} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500" 
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Descrição</label>
                    <textarea 
                      name="descricao" 
                      value={formData.descricao || ''} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Fator Gerador</label>
                    <input 
                      type="text" 
                      name="fator_gerador" 
                      value={formData.fator_gerador || ''} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Alinhamento</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Prioridade</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Responsável</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Status</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Data Status</label>
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

        {isInfoModalOpen && selectedDemandDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] overflow-y-auto">
            <div className="relative bg-white rounded-lg shadow-2xl p-8 w-full max-w-4xl m-4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedDemandDetails.nome}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Sigla: {selectedDemandDetails.sigla}
                  </p>
                </div>
                <button 
                  onClick={() => setIsInfoModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex space-x-4 border-b border-gray-200">
                  <button
                    className={`py-3 px-6 focus:outline-none transition-colors ${
                      activeTab === 'details'
                        ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('details')}
                  >
                    Detalhes da Demanda
                  </button>
                  <button
                    className={`py-3 px-6 focus:outline-none transition-colors ${
                      activeTab === 'history'
                        ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('history')}
                  >
                    Log
                  </button>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto pr-4">
                {activeTab === 'details' ? (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Informações Básicas</h3>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">Nome:</span>{' '}
                            <span className="text-gray-900">{selectedDemandDetails.nome}</span>
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">Sigla:</span>{' '}
                            <span className="text-gray-900">{selectedDemandDetails.sigla}</span>
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">Demandante:</span>{' '}
                            <span className="text-gray-900">{selectedDemandDetails.demandante}</span>
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Detalhes do Projeto</h3>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">Fator Gerador:</span>{' '}
                            <span className="text-gray-900">{selectedDemandDetails.fatorGerador}</span>
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">Descrição:</span>{' '}
                            <span className="text-gray-900">{selectedDemandDetails.descricao}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Status e Prioridade</h3>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">Status:</span>{' '}
                            <span 
                              className={`rounded-md px-2 py-1 ${determinarCorTexto(selectedDemandDetails.status?.propriedade)}`}
                              style={{ backgroundColor: selectedDemandDetails.status?.propriedade }}
                            >
                              {selectedDemandDetails.status?.nome}
                            </span>
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">Data Status:</span>{' '}
                            <span className="text-gray-900">{formatDate(selectedDemandDetails.dataStatus)}</span>
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">Prioridade:</span>{' '}
                            <span className="text-gray-900">{selectedDemandDetails.prioridade?.nome}</span>
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Responsabilidades</h3>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">Responsável:</span>{' '}
                            <span className="text-gray-900">{selectedDemandDetails.responsavel?.nome}</span>
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">Alinhamento:</span>{' '}
                            <span className="text-gray-900">{selectedDemandDetails.alinhamento?.nome}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flow-root">
                      <ul role="list" className="-mb-8">
                        {historicoDemanda.map((evento: HistoricoType, index: number) => (
                          <li key={evento.id}>
                            <div className="relative pb-8">
                              {index !== historicoDemanda.length - 1 && (
                                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-blue-200" aria-hidden="true" />
                              )}
                              <div className="relative flex items-start space-x-3">
                                <div className="relative">
                                  <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                    <ChevronRight className="h-5 w-5 text-white" />
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0 bg-white rounded-lg shadow-sm p-4">
                                  <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-900">
                                        {evento.usuario}
                                      </span>
                                      {index === 0 && (
                                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                          Recente
                                        </span>
                                      )}
                                    </div>
                                    <time className="text-sm text-gray-500">
                                      {formatDate(evento.createdAt)}
                                    </time>
                                  </div>
                                  <p className="text-sm text-gray-500 mb-2">
                                    {formatHistoricoDescricao(evento.descricao, evento)}
                                  </p>
                                  <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">
                                    <div className="grid grid-cols-2 gap-2">
                                      <p><span className="font-medium">Nome:</span> {evento.demanda.nome}</p>
                                      <p><span className="font-medium">Sigla:</span> {evento.demanda.sigla}</p>
                                      <p><span className="font-medium">Demandante:</span> {evento.demanda.demandante}</p>
                                      <p><span className="font-medium">Fator Gerador:</span> {evento.demanda.fatorGerador}</p>
                                      <p><span className="font-medium">Data Status:</span> {formatDate(evento.demanda.dataStatus)}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setIsInfoModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}