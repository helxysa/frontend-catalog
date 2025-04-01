'use client'

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
  getHistoricoDemandas,
  getSolucoesByDemandaId,
} from "../actions/actions";
import { Plus, Edit2, Trash2, X, Info, ExternalLink } from 'lucide-react';
import { DemandaType, ResponsavelType, AlinhamentoType, PrioridadeType, StatusType, ProprietarioType, HistoricoType, DemandaFormData } from '../types/types';
import DeleteConfirmationModal from './ModalConfirmacao/DeleteConfirmationModal';
import { useSidebar } from '../../../../../componentes/Sidebar/SidebarContext';
import Link from 'next/link';
import Form from './Form/Form';
import DataTable from './Table/Table';

export default function Demanda() {
  const [demandas, setDemandas] = useState<DemandaType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDemandDetails, setSelectedDemandDetails] = useState<DemandaType | null>(null);
  const [formData, setFormData] = useState<DemandaFormData>(() => {
    const storedId = localStorage.getItem('selectedProprietarioId');
    return {
      proprietario_id: storedId ? Number(storedId) : 0,
      nome: '',
      sigla: '',
      descricao: '',
      demandante: '',
      link: '',
      fator_gerador: '',
      alinhamento_id: 0,
      prioridade_id: 0,
      responsavel_id: 0,
      status_id: 0,
      data_status: ''
    };
  });
  const [solucoes, setSolucoes] = useState<{ [key: string]: any[] }>({});

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
  const [tempSearchTerm, setTempSearchTerm] = useState('');
  const { isCollapsed } = useSidebar();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15;
  const [formErrors, setFormErrors] = useState({});



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

  const formatDate = (dateString: string, includeTime: boolean = false) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('pt-BR');
    if (includeTime) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${formattedDate} às ${hours}:${minutes}`;
    }
    return formattedDate;
  };


  const fetchSolucoes = async (demandaId: string) => {
    const solucoesData = await getSolucoesByDemandaId(demandaId);
    setSolucoes(prev => ({ ...prev, [demandaId]: solucoesData }));
  };


  useEffect(() => {
    if (filteredDemandas) {
      filteredDemandas.forEach(demanda => {
        fetchSolucoes(demanda.id);
      });
    }
  }, [filteredDemandas]);
  


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempSearchTerm(value);

    // Aplicar filtro imediatamente enquanto o usuário digita
    if (value) {
      const searchLower = value.toLowerCase();
      const filtered = demandas.filter((d: DemandaType) =>
        d.nome?.toLowerCase().includes(searchLower) ||
        d.sigla?.toLowerCase().includes(searchLower) ||
        d.fatorGerador?.toLowerCase().includes(searchLower) ||
        d.demandante?.toLowerCase().includes(searchLower) ||
        d.alinhamento?.nome.toLowerCase().includes(searchLower) ||
        d.prioridade?.nome.toLowerCase().includes(searchLower) ||
        d.responsavel?.nome.toLowerCase().includes(searchLower) ||
        d.status?.nome.toLowerCase().includes(searchLower)
      );
      setFilteredDemandas(filtered);
    } else {
      setFilteredDemandas(demandas);
    }
  };

  const fetchDemandas = async (page = currentPage) => {
    try {
      const demandasData = await getDemandas(page, itemsPerPage);
      const storedId = localStorage.getItem('selectedProprietarioId');

      // Preservar a ordem atual das demandas existentes
      const currentOrder = new Map(demandas.map((d, index) => [String(d.id), index]));

      const demandasFiltradas = demandasData.data
        .filter((demanda: DemandaType) => demanda.proprietario?.id === Number(storedId))
        .sort((a: DemandaType, b: DemandaType) => {
          const indexA = currentOrder.get(String(a.id));
          const indexB = currentOrder.get(String(b.id));

          // Se ambos existem na ordem atual, manter a ordem relativa
          if (indexA !== undefined && indexB !== undefined) {
            return indexA - indexB;
          }
          // Se apenas um existe, colocar o novo no final
          if (indexA !== undefined) return -1;
          if (indexB !== undefined) return 1;
          // Se nenhum existe, manter a ordem como veio da API
          return 0;
        });

      setDemandas(demandasFiltradas);
      setFilteredDemandas(demandasFiltradas);

      if (demandasData?.meta) {
        const total = demandasData.meta.total || 0;
        const calculatedPages = Math.ceil(total / itemsPerPage);
        setTotalPages(calculatedPages);
      }

      return demandasData;
    } catch (error) {
      console.error('Erro ao buscar demandas:', error);
      return null;
    }
  };

  useEffect(() => {
    Promise.all([
      fetchDemandas(),
      getProprietarios(),
      getAlinhamentos(),
      getPrioridades(),
      getResponsaveis(),
      getStatus(),
    ]).then(([_, proprietariosData, alinhamentosData, prioridadesData, responsaveisData, statusData]) => {
      setProprietarios(proprietariosData);
      setAlinhamentos(alinhamentosData);
      setPrioridades(prioridadesData);
      setResponsaveis(responsaveisData);
      setStatusList(statusData);
    });
  }, [currentPage, shouldRefresh]);

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

  const handleFormSubmit = async (formDataToSubmit: DemandaFormData) => {
    if (isEditing) {
      try {
        await updateDemanda(isEditing, formDataToSubmit);
        
        // Manter a ordem atual das demandas
        const updatedDemandas = demandas.map(demanda => {
          if (String(demanda.id) === String(isEditing)) {
            // Atualizar apenas os campos da demanda editada
            return {
              ...demanda,
              nome: formDataToSubmit.nome,
              sigla: formDataToSubmit.sigla,
              descricao: formDataToSubmit.descricao,
              link: formDataToSubmit.link,
              demandante: formDataToSubmit.demandante,
              fatorGerador: formDataToSubmit.fator_gerador,
              alinhamento: alinhamentos.find(a => a.id === Number(formDataToSubmit.alinhamento_id)),
              prioridade: prioridades.find(p => p.id === Number(formDataToSubmit.prioridade_id)),
              responsavel: responsaveis.find(r => r.id === Number(formDataToSubmit.responsavel_id)),
              status: statusList.find(s => s.id === Number(formDataToSubmit.status_id)),
              dataStatus: formDataToSubmit.data_status
            };
          }
          return demanda;
        });

        setDemandas(updatedDemandas as DemandaType[]);
        setFilteredDemandas(updatedDemandas as DemandaType[]);
        
        // Atualizar soluções se necessário
        fetchSolucoes(isEditing);
        
        setIsModalOpen(false);
        setFormData({} as DemandaFormData);
        setIsEditing(null);
      } catch (error) {
        console.error('Erro ao atualizar demanda:', error);
      }
    } else {
      // Criar nova demanda
      const newDemanda = await createDemanda(formDataToSubmit);
      
      // Adicionar a nova demanda ao estado atual sem recarregar tudo
      if (newDemanda) {
        const updatedDemandas = [...demandas, newDemanda];
        setDemandas(updatedDemandas);
        setFilteredDemandas(updatedDemandas);
        
        // Buscar soluções para a nova demanda
        fetchSolucoes(newDemanda.id);
      } else {
        // Se não conseguir obter a nova demanda, recarregar tudo
        await fetchDemandas();
      }
      
      setIsModalOpen(false);
      setFormData({} as DemandaFormData);
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    // Função para formatar valores nulos
    const formatNullValue = (value: string | null) => value === null ? 'Nulo (não informado)' : value;

    // Lista de mapeamentos de campos
    const camposMapeados: { [key: string]: { nome: string, getValue: (evento: HistoricoType) => string } } = {
      'alinhamento_id': {
        nome: 'Alinhamento',
        getValue: (e) => {
          const value = e.demanda.alinhamentoId;
          if (value === null) return 'Nulo (não informado)';
          return alinhamentos.find((a: AlinhamentoType) => a.id === Number(value))?.nome || 'Desconhecido';
        }
      },
      'prioridade_id': {
        nome: 'Prioridade',
        getValue: (e) => {
          const value = e.demanda.prioridadeId;
          if (value === null) return 'Nulo (não informado)';
          return prioridades.find((p: PrioridadeType) => p.id === Number(value))?.nome || 'Desconhecido';
        }
      },
      'responsavel_id': {
        nome: 'Responsável',
        getValue: (e) => {
          const value = e.demanda.responsavelId;
          if (value === null) return 'Nulo (não informado)';
          return responsaveis.find((r: ResponsavelType) => r.id === Number(value))?.nome || 'Desconhecido';
        }
      },
      'status_id': {
        nome: 'Status',
        getValue: (e) => {
          const value = e.demanda.statusId;
          if (value === null) return 'Nulo (não informado)';
          return statusList.find((s: StatusType) => s.id === Number(value))?.nome || 'Desconhecido';
        }
      },
      'proprietario_id': {
        nome: 'Proprietário',
        getValue: (e) => {
          const value = e.demanda.proprietarioId;
          if (value === null) return 'Nulo (não informado)';
          return proprietarios.find((p: ProprietarioType) => p.id === Number(value))?.nome || 'Desconhecido';
        }
      }
    };

    // Procura por diferentes padrões possíveis
    const patterns = [
      /(\w+)_id: (\d+|null) -> (\d+|null)/g,    // padrão: campo_id: 1 -> 2 ou null -> 2
      /(\w+)_id:(\d+|null)->(\d+|null)/g,       // padrão: campo_id:1->2 ou null->2
      /(\w+): (\d+|null) -> (\d+|null)/g,       // padrão: campo: 1 -> 2 ou null -> 2
      /(\w+):(\d+|null)->(\d+|null)/g           // padrão: campo:1->2 ou null->2
    ];

    let formattedDesc = descricao;

    patterns.forEach(pattern => {
      formattedDesc = formattedDesc.replace(pattern, (match, campo, valorAntigo, valorNovo) => {
        const campoNormalizado = campo.toLowerCase().endsWith('_id') ? campo : `${campo}_id`;

        if (camposMapeados[campoNormalizado]) {
          const mapeamento = camposMapeados[campoNormalizado];
          const antigoObj: HistoricoType = {
            ...evento,
            demanda: {
              ...evento.demanda,
              [`${campoNormalizado.replace('_id', '')}Id`]: valorAntigo === 'null' ? null : Number(valorAntigo)
            }
          };
          const novoObj: HistoricoType = {
            ...antigoObj,
            demanda: {
              ...evento.demanda,
              [`${campoNormalizado.replace('_id', '')}Id`]: valorNovo === 'null' ? null : Number(valorNovo)
            }
          };

          const nomeAntigo = mapeamento.getValue(antigoObj);
          const nomeNovo = mapeamento.getValue(novoObj);

          return `${mapeamento.nome}: ${nomeAntigo} → ${nomeNovo}`;
        }
        return match;
      });
    });

    // Formata datas
    formattedDesc = formattedDesc.replace(/(data_status): (.*?) -> (.*?)(,|$)/g, (match, campo, dataAntiga, dataNova) => {
      const formatDate = (dateString: string | null) => {
        if (dateString === null || dateString === 'null') return 'Nulo (não informado)';
        return new Date(dateString).toLocaleDateString('pt-BR');
      };
      return `${campo}: ${formatDate(dataAntiga)} → ${formatDate(dataNova)}`;
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

    // Aplicar filtro de texto
    if (tempSearchTerm) {
      const searchLower = tempSearchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.nome?.toLowerCase().includes(searchLower) ||
        d.sigla?.toLowerCase().includes(searchLower) ||
        d.fatorGerador?.toLowerCase().includes(searchLower) ||
        d.demandante?.toLowerCase().includes(searchLower) ||
        d.alinhamento?.nome.toLowerCase().includes(searchLower) ||
        d.prioridade?.nome.toLowerCase().includes(searchLower) ||
        d.responsavel?.nome.toLowerCase().includes(searchLower) ||
        d.status?.nome.toLowerCase().includes(searchLower)
      );
    }

    // Aplicar outros filtros
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

  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="mt-6 flex  gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1.5 rounded-md ${currentPage === i + 1
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-200'
              } transition-colors`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    );
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Crie sua demanda</h1>
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

        
        <DataTable 
          demandas={filteredDemandas}
          isCollapsed={isCollapsed}
          onEdit={(demanda) => {
            const formattedData: DemandaFormData = {
              proprietario_id: Number(demanda.proprietario?.id) || 0,
              nome: demanda.nome || '',
              sigla: demanda.sigla || '',
              descricao: demanda.propriedade || '',
              link: demanda.link || '',
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
          onDelete={handleDeleteClick}
          onInfo={handleInfoClick}
        />

        <Form
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setIsEditing(null);
            setFormData({} as DemandaFormData);
          }}
          onSubmit={handleFormSubmit}
          isEditing={isEditing}
          formData={formData}
          setFormData={setFormData}
          alinhamentos={alinhamentos}
          prioridades={prioridades}
          responsaveis={responsaveis}
          statusList={statusList}
        />

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
                    className={`py-3 px-6 focus:outline-none transition-colors ${activeTab === 'details'
                      ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                    onClick={() => setActiveTab('details')}
                  >
                    Detalhes da Demanda
                  </button>
                  <button
                    className={`py-3 px-6 focus:outline-none transition-colors ${activeTab === 'history'
                      ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                    onClick={() => setActiveTab('history')}
                  >
                    Log
                  </button>
                </div>
              </div>

              <div className="max-h-[50vh] overflow-y-auto pr-4">
                {activeTab === 'details' ? (
               <div className="bg-white rounded-lg shadow-sm p-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                 {/* Informações Básicas */}
                 <div className="col-span-2 mb-4">
                   <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
                     Informações Básicas
                   </h3>
                 </div>
                 
                 <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                   <span className="text-sm font-medium text-gray-600">Nome:</span>
                   <span className="text-sm text-gray-800 font-medium">{selectedDemandDetails.nome}</span>
                 </div>
                 
                 <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                   <span className="text-sm font-medium text-gray-600">Sigla:</span>
                   <span className="text-sm text-gray-800 font-medium">{selectedDemandDetails.sigla}</span>
                 </div>
                 
                 <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                   <span className="text-sm font-medium text-gray-600">Demandante:</span>
                   <span className="text-sm text-gray-800 font-medium">{selectedDemandDetails.demandante}</span>
                 </div>
                 
                 <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                   <span className="text-sm font-medium text-gray-600">Fator Gerador:</span>
                   <span className="text-sm text-gray-800 font-medium">{selectedDemandDetails.fatorGerador}</span>
                 </div>
                 
                 <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                   <span className="text-sm font-medium text-gray-600">Alinhamento:</span>
                   <span className="text-sm text-gray-800 font-medium">{selectedDemandDetails.alinhamento?.nome || '-'}</span>
                 </div>
                 
                 <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                   <span className="text-sm font-medium text-gray-600">Responsável:</span>
                   <span className="text-sm text-gray-800 font-medium">{selectedDemandDetails.responsavel?.nome || '-'}</span>
                 </div>
                 
                 <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                   <span className="text-sm font-medium text-gray-600">Prioridade:</span>
                   <span className="text-sm text-gray-800 font-medium">{selectedDemandDetails.prioridade?.nome || '-'}</span>
                 </div>
                 
                 <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                   <span className="text-sm font-medium text-gray-600">Data Status:</span>
                   <span className="text-sm text-gray-800 font-medium">{formatDate(selectedDemandDetails.dataStatus, true)}</span>
                 </div>
                 
                 <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                   <span className="text-sm font-medium text-gray-600">Status:</span>
                   <span 
                     className={`rounded-md px-3 py-1 text-sm font-medium ${determinarCorTexto(selectedDemandDetails.status?.propriedade)}`}
                     style={{ backgroundColor: selectedDemandDetails.status?.propriedade }}
                   >
                     {selectedDemandDetails.status?.nome || '-'}
                   </span>
                 </div>
                 
                 {selectedDemandDetails.link && (
                   <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                     <span className="text-sm font-medium text-gray-600">Link do PGA:</span>
                     <a 
                       href={selectedDemandDetails.link} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                     >
                       Acessar <ExternalLink className="w-3 h-3" />
                     </a>
                   </div>
                 )}
                 
                 <div className="col-span-2 mt-4">
                   <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
                     <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                     </svg>
                     Descrição
                   </h3>
                   <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-2 max-h-[300px] overflow-y-auto">
                     <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                       {selectedDemandDetails.descricao || 'Nenhuma descrição fornecida'}
                     </p>
                   </div>
                 </div>
               </div>
             </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Histórico de Alterações</h3>
                      <p className="text-sm text-gray-600">Acompanhe todas as mudanças realizadas nesta demanda</p>
                    </div>
                    <div className="flow-root">
                      <ul role="list" className="-mb-8">
                        {historicoDemanda.map((evento: HistoricoType, index: number) => (
                          <li key={evento.id}>
                            <div className="relative pb-8">
                              {index !== historicoDemanda.length - 1 && (
                                <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gradient-to-b from-blue-500 via-blue-300 to-gray-200" aria-hidden="true" />
                              )}
                              <div className="relative flex items-start space-x-3">
                                <div className="relative">
                                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ring-8 ring-white shadow-md
                                    ${index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                    <span className="text-xs font-medium text-center">
                                      {formatDate(evento.createdAt).split('/').slice(0, 2).join('/')}
                                    </span>
                                  </div>
                                  {index !== historicoDemanda.length - 1 && (
                                    <span className="absolute left-6 top-12 -ml-px h-full w-0.5 bg-gradient-to-b from-blue-500 via-blue-300 to-gray-200" aria-hidden="true" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-200 border border-gray-100">
                                    <div className="flex justify-between items-center mb-4">
                                      <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                          {evento.usuario}
                                        </span>
                                        {index === 0 && (
                                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                            Mais recente
                                          </span>
                                        )}
                                      </div>
                                      <time className="text-sm text-gray-500 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                        {formatDate(evento.createdAt, true)}
                                      </time>
                                    </div>

                                    <div className="text-sm text-gray-700 mb-4">
                                      <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg border-l-4 border-blue-500">
                                        {formatHistoricoDescricao(evento.descricao, evento)}
                                      </div>
                                    </div>

                                    <div className="mt-3 text-xs space-y-3">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                                          <h4 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                                            Informações Básicas
                                          </h4>
                                          <div className="space-y-3">
                                            <p className="flex items-center justify-between group hover:bg-white hover:shadow-sm p-2 rounded-md transition-all">
                                              <span className="font-medium text-gray-600">Nome:</span>
                                              <span className="text-gray-900 font-medium group-hover:text-blue-600">{evento.demanda.nome}</span>
                                            </p>
                                            <p className="flex items-center justify-between group hover:bg-white hover:shadow-sm p-2 rounded-md transition-all">
                                              <span className="font-medium text-gray-600">Sigla:</span>
                                              <span className="text-gray-900 font-medium group-hover:text-blue-600">{evento.demanda.sigla}</span>
                                            </p>
                                            <p className="flex items-center justify-between group hover:bg-white hover:shadow-sm p-2 rounded-md transition-all">
                                              <span className="font-medium text-gray-600">Demandante:</span>
                                              <span className="text-gray-900 font-medium group-hover:text-blue-600">{evento.demanda.demandante}</span>
                                            </p>
                                          </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                                          <h4 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                                            Detalhes do Status
                                          </h4>
                                          <div className="space-y-3">
                                            <p className="flex items-center justify-between group hover:bg-white hover:shadow-sm p-2 rounded-md transition-all">
                                              <span className="font-medium text-gray-600">Fator Gerador:</span>
                                              <span className="text-gray-900 font-medium group-hover:text-blue-600">{evento.demanda.fatorGerador}</span>
                                            </p>
                                            <p className="flex items-center justify-between group hover:bg-white hover:shadow-sm p-2 rounded-md transition-all">
                                              <span className="font-medium text-gray-600">Data Status:</span>
                                              <span className="text-gray-900 font-medium group-hover:text-blue-600">{formatDate(evento.demanda.dataStatus, true)}</span>
                                            </p>
                                            <p className="flex items-center justify-between group hover:bg-white hover:shadow-sm p-2 rounded-md transition-all">
                                              <span className="font-medium text-gray-600">Atualizado:</span>
                                              <span className="text-gray-900 font-medium group-hover:text-blue-600">{formatDate(evento.updatedAt, true)}</span>
                                            </p>
                                          </div>
                                        </div>
                                      </div>
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
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName="esta demanda"
      />
    </div>
  );
}