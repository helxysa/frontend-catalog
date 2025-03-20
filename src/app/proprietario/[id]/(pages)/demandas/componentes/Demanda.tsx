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
  const itemsPerPage = 6;
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    try {
      // Validar campos obrigatórios
      const errors = {
        nome: !formData.nome,
        proprietario_id: !formData.proprietario_id
      };
  
      setFormErrors(errors);
  
      if (errors.nome || errors.proprietario_id) {
        return;
      }
  
      // Preparar dados para envio
      const formDataToSubmit = {
        ...formData,
        nome: formData.nome || '-',
        sigla: formData.sigla || '-',
        descricao: formData.descricao || '-',
        link: formData.link || '', // Aqui está o problema
        fator_gerador: formData.fator_gerador || '-',
        demandante: formData.demandante || '-',
        alinhamento_id: formData.alinhamento_id ? Number(formData.alinhamento_id) : null,
        prioridade_id: formData.prioridade_id ? Number(formData.prioridade_id) : null,
        responsavel_id: formData.responsavel_id ? Number(formData.responsavel_id) : null,
        status_id: formData.status_id ? Number(formData.status_id) : null,
        data_status: formData.data_status || new Date().toISOString().split('T')[0]
      };

      console.log(formDataToSubmit)

      if (isEditing) {
        try {
          // Atualizar demanda existente
          await updateDemanda(isEditing, formDataToSubmit);
          console.log('Demanda atualizada com sucesso');

          // Criar uma cópia do estado atual das demandas
          const currentDemandas = [...demandas];

          // Encontrar o índice da demanda editada
          const editedIndex = currentDemandas.findIndex(d => String(d.id) === String(isEditing));

          // Buscar a demanda atualizada
          const updatedData = await getDemandas();
          const updatedDemanda = updatedData.data.find((d: DemandaType) => String(d.id) === String(isEditing));

          if (editedIndex !== -1 && updatedDemanda) {
            // Atualizar a demanda mantendo sua posição original
            currentDemandas[editedIndex] = updatedDemanda;
            setDemandas(currentDemandas);
            setFilteredDemandas(currentDemandas);
          }

          // Limpar formulário e fechar modal
          setIsModalOpen(false);
          setFormData({} as DemandaFormData);
          setIsEditing(null);
        } catch (error) {
          console.error('Erro ao atualizar demanda:', error);
        }
      } else {
        // Criar nova demanda
        await createDemanda(formDataToSubmit);
        await fetchDemandas();
        setIsModalOpen(false);
        setFormData({} as DemandaFormData);
      }

    } catch (error) {
      console.error('Submit error:', error);
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

        {/* Filters Section */}
        <div className={` bg-white rounded-lg shadow-md p-4 mb-6`}>
          <div className="mb-3">
            <h2 className="text-base font-semibold text-gray-800">Filtros</h2>
          </div>

          <div className={`
            grid gap-2
            transition-all duration-300
            ${isCollapsed
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'}
          `}>
            <select
              name="demandante"
              value={filters.demandante}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
            >
              <option value="">Demandante</option>
              {[...new Set(demandas.map((d: DemandaType) => d.demandante))]
                .filter(Boolean)
                .sort()
                .map((demandante: string) => (
                  <option key={demandante} value={demandante}>{demandante}</option>
                ))}
            </select>

            <select
              name="fator_gerador"
              value={filters.fator_gerador}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
            >
              <option value="">Fator Gerador</option>
              {[...new Set(demandas.map((d: DemandaType) => d.fatorGerador))]
                .filter(Boolean)
                .sort()
                .map((fator: string) => (
                  <option key={fator} value={fator}>{fator}</option>
                ))}
            </select>

            <select
              name="alinhamento_id"
              value={filters.alinhamento_id}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
            >
              <option value="">Alinhamento</option>
              {alinhamentos
                .sort((a, b) => a.nome.localeCompare(b.nome))
                .map(a => (
                  <option key={a.id} value={a.id}>{a.nome}</option>
                ))}
            </select>

            <select
              name="prioridade_id"
              value={filters.prioridade_id}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
            >
              <option value="">Prioridade</option>
              {prioridades
                .sort((a, b) => a.nome.localeCompare(b.nome))
                .map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
            </select>

            <select
              name="responsavel_id"
              value={filters.responsavel_id}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
            >
              <option value="">Responsável</option>
              {responsaveis
                .sort((a, b) => a.nome.localeCompare(b.nome))
                .map(r => (
                  <option key={r.id} value={r.id}>{r.nome}</option>
                ))}
            </select>

            <select
              name="status_id"
              value={filters.status_id}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
            >
              <option value="">Status</option>
              {statusList
                .sort((a, b) => a.nome.localeCompare(b.nome))
                .map(s => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
            </select>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar demandas..."
                  value={tempSearchTerm}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-700 placeholder-gray-400"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Limpar
              </button>
              <button
                onClick={applyFilters}
                className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className={`
              w-full
              transition-all duration-300
              ${isCollapsed ? 'table-auto' : ''}
            `}>
            <thead className="bg-gray-200">
              <tr>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 text-xs uppercase  ">#</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 text-xs uppercase ">Sigla</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 text-xs uppercase ">Nome</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 text-xs uppercase ">Fator Gerador</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 text-xs uppercase ">Demandante</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 text-xs uppercase ">Alinhamento</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 text-xs uppercase ">Prioridade</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 text-xs uppercase ">Soluções</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 text-xs uppercase ">Responsável</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 text-xs uppercase ">Data Status</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 text-xs uppercase ">Status</th>
                <th className="px-3 py-3 text-right text-sm font-medium text-gray-500 text-xs uppercase ">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.isArray(filteredDemandas) && filteredDemandas.map((demanda: DemandaType, index: number) => (
                <tr key={demanda.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 break-words max-w-[150px]">
                    {demanda.sigla || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800 break-words max-w-[200px]">
                    {demanda.nome || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 break-words max-w-[200px]">
                    {demanda.fatorGerador || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 break-words max-w-[150px]">
                    {demanda.demandante || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 break-words max-w-[150px]">
                    {demanda.alinhamento?.nome || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 break-words max-w-[150px]">
                    {demanda.prioridade?.nome || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 break-words max-w-[150px] relative group">
                    <span className="cursor-pointer hover:text-blue-500">
                      {solucoes[demanda.id]?.length || 0}
                    </span>
                    {solucoes[demanda.id]?.length > 0 && (
                      <div className="absolute left-full top-0 ml-2 z-20 hidden group-hover:block bg-white shadow-xl rounded-lg p-4 w-80 border border-gray-200">
                        <div className="max-h-80 overflow-y-auto">
                          <h4 className="font-medium text-gray-800 mb-2 pb-2 border-b border-gray-200">Soluções</h4>
                          {solucoes[demanda.id]?.map(solucao => (
                            <div key={solucao.id} className="mb-3 pb-3 border-b border-gray-100 last:border-0">
                              <p className="font-medium text-gray-700">{solucao.nome}</p>
                              <p className="text-sm text-gray-500 mt-1">{solucao.descricao}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 break-words max-w-[150px]">
                    {demanda.responsavel?.nome || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-normal">
                    {formatDate(demanda.dataStatus)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {demanda.status?.propriedade ? (
                      <span
                        className={`rounded-md px-2 py-1 break-words max-w-[150px] inline-block ${determinarCorTexto(demanda.status.propriedade)}`}
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
                        className="text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-50 transition-colors"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                      {demanda.link && (
                        <Link
                          href={demanda.link}
                          target="_blank"
                          className="text-purple-500 hover:text-purple-700 rounded-full hover:bg-purple-50 transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </Link>
                      )}
                      <button
                        onClick={() => {
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
                        className="text-green-600 hover:text-green-800 rounded-full hover:bg-green-50 transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(demanda.id)}
                        className="text-red-400 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
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

        <Pagination />

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
                  <input
                    type="hidden"
                    name="proprietario_id"
                    value={formData.proprietario_id || ''}
                  />

                  <div className="col-span-2">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Link</label>
                    <input
                      type="text"
                      name="link"
                      value={formData.link || ''}
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

              <div className="max-h-[60vh] overflow-y-auto pr-4">
                {activeTab === 'details' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 w-full h-[300px]">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Informações Básicas
                      </h3>
                      <div className="space-y-3 overflow-y-auto h-[200px]">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <span className="text-sm font-medium text-gray-600">Nome:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedDemandDetails.nome}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <span className="text-sm font-medium text-gray-600">Sigla:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedDemandDetails.sigla}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <span className="text-sm font-medium text-gray-600">Demandante:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedDemandDetails.demandante}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 w-full h-[300px]">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Detalhes do Projeto
                      </h3>
                      <div className="space-y-3 overflow-y-auto h-[200px]">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <span className="text-sm font-medium text-gray-600">Fator Gerador:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedDemandDetails.fatorGerador}</span>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <span className="text-sm font-medium text-gray-600">Descrição:</span>
                          <div className="mt-2 p-3 bg-white rounded-md border border-gray-200">
                            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                              {selectedDemandDetails.descricao || 'Nenhuma descrição fornecida'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 w-full h-[300px]">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Status e Prioridade
                      </h3>
                      <div className="space-y-3 overflow-y-auto h-[200px]">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <span className="text-sm font-medium text-gray-600">Status:</span>
                          <span
                            className={`rounded-md px-3 py-1 text-sm font-medium ${determinarCorTexto(selectedDemandDetails.status?.propriedade)}`}
                            style={{ backgroundColor: selectedDemandDetails.status?.propriedade }}
                          >
                            {selectedDemandDetails.status?.nome}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <span className="text-sm font-medium text-gray-600">Data Status:</span>
                          <span className="text-sm text-gray-800 font-medium">{formatDate(selectedDemandDetails.dataStatus, true)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <span className="text-sm font-medium text-gray-600">Prioridade:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedDemandDetails.prioridade?.nome}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 w-full h-[300px]">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Responsabilidades
                      </h3>
                      <div className="space-y-3 overflow-y-auto h-[200px]">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <span className="text-sm font-medium text-gray-600">Responsável:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedDemandDetails.responsavel?.nome}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <span className="text-sm font-medium text-gray-600">Alinhamento:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedDemandDetails.alinhamento?.nome}</span>
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
    </div>
  );
}