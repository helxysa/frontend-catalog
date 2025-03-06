'use client'

interface SolucaoFormData {
  nome: string;
  demanda_id: number;
  sigla: string;
  descricao: string;
  versao: string;
  tipo_id: number;
  linguagem_id: number | string | null;
  desenvolvedor_id: number;
  categoria_id: number;
  responsavel_id: number;
  status_id: number;
  data_status: string;
}

interface HistoricoType {
  id: number;
  solucaoId: number;
  usuario: string;
  descricao: string;
  createdAt: string;
  updatedAt: string;
  solucao: {
    id: number;
    nome: string;
    sigla: string;
    versao: string;
    descricao: string;
    tipoId: number;
    linguagemId: number;
    desenvolvedorId: number;
    categoriaId: number;
    responsavelId: number;
    statusId: number;
    demandaId: number;
    dataStatus: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface BaseType {
  id: number;
  nome: string;
  sigla?: string;
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
  getDemandas,
  getHistoricoSolucoes
} from "../actions/actions";
import { Plus, Edit2, Trash2, X, Info, ChevronRight } from 'lucide-react';
import { SolucaoType } from '../types/types';
import DeleteConfirmationModal from './ModalConfirmacao/DeleteConfirmationModal';
import { useSidebar } from '../../../../../componentes/Sidebar/SidebarContext';

type CustomChangeEvent = {
  target: {
    name: string;
    value: string;
  };
};

export default function Solucao() {
  const [solucoes, setSolucoes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDemandDetails, setSelectedDemandDetails] = useState<SolucaoType | null>(null);
  const [formData, setFormData] = useState<SolucaoFormData>({} as SolucaoFormData);
  const [tipos, setTipos] = useState<BaseType[]>([]);
  const [linguagens, setLinguagens] = useState<BaseType[]>([]);
  const [desenvolvedores, setDesenvolvedores] = useState<BaseType[]>([]);
  const [categorias, setCategorias] = useState<BaseType[]>([]);
  const [responsaveis, setResponsaveis] = useState<BaseType[]>([]);
  const [statusList, setStatusList] = useState<(BaseType & { propriedade: string })[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const [demanda, setDemanda] = useState<BaseType[]>([]);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [historicoSolucao, setHistoricoSolucao] = useState([]);
  const [filters, setFilters] = useState({
    demanda_id: '',
    tipo_id: '',
    linguagem_id: '',
    desenvolvedor_id: '',
    categoria_id: '',
    responsavel_id: '',
    status_id: ''
  });
  const [filteredSolucoes, setFilteredSolucoes] = useState<SolucaoType[]>([]);
  const [search, setSearch] = useState('');
  const [tempSearchTerm, setTempSearchTerm] = useState('');
  const [shouldRefresh, setShouldRefresh] = useState(0);
  const [formErrors, setFormErrors] = useState({
    nome: false,
    demanda_id: false
  });
  const [selectedLanguages, setSelectedLanguages] = useState<number[]>([]);
  const { isCollapsed } = useSidebar();

  const determinarCorTexto = (corHex: string | undefined) => {
    if (!corHex) return 'text-gray-800'; 
   
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
      console.log('Dados recebidos:');
      console.log('Soluções:', solucoesData);
      console.log('Linguagens:', linguagensData);
      
      const storedId = localStorage.getItem('selectedProprietarioId');
      
      const demandasFiltradas = demandasData.filter(
        (demanda: any) => demanda?.proprietario?.id === Number(storedId)
      );

      const solucoesFiltradas = solucoesData.filter((solucao: SolucaoType) =>
        demandasFiltradas.some((demanda: any) => demanda.id === solucao.demanda?.id)
      );
      
      setSolucoes(solucoesFiltradas);
      setFilteredSolucoes(solucoesFiltradas);
      setTipos(tiposData);
      setLinguagens(linguagensData || []);
      setDesenvolvedores(desenvolvedoresData);
      setCategorias(categoriasData);
      setResponsaveis(responsaveisData);
      setStatusList(statusData);
      setDemanda(demandasFiltradas);
    });
  }, [shouldRefresh]);

  useEffect(() => {
    if (isEditing && formData.linguagem_id) {
      const ids = String(formData.linguagem_id).split(',').map(Number);
      setSelectedLanguages(ids);
    }
  }, [isEditing, formData.linguagem_id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset dos erros
    setFormErrors({
      nome: false,
      demanda_id: false
    });

    // Validação dos campos obrigatórios
    const errors = {
      nome: !formData.nome,
      demanda_id: !formData.demanda_id
    };

    if (errors.nome || errors.demanda_id) {
      setFormErrors(errors);
      return;
    }

    try {
      // Converte o array de linguagens para string
      const linguagemValue = selectedLanguages.length > 0 ? selectedLanguages.join(',') : null;

      const formDataToSubmit = {
        ...formData,
        nome: formData.nome || '-',
        sigla: formData.sigla || '-',
        descricao: formData.descricao || '-',
        versao: formData.versao || '-',
        tipo_id: formData.tipo_id ? Number(formData.tipo_id) : null,
        linguagem_id: linguagemValue,  // String com IDs separados por vírgula
        desenvolvedor_id: formData.desenvolvedor_id ? Number(formData.desenvolvedor_id) : null,
        categoria_id: formData.categoria_id ? Number(formData.categoria_id) : null,
        responsavel_id: formData.responsavel_id ? Number(formData.responsavel_id) : null,
        status_id: formData.status_id ? Number(formData.status_id) : null,
        demanda_id: Number(formData.demanda_id),
        data_status: formData.data_status || new Date().toISOString().split('T')[0]
      };

      console.log('Dados sendo enviados:', formDataToSubmit); // Para debug

      if (isEditing) {
        await updateSolucao(isEditing, formDataToSubmit);
      } else {
        await createSolucao(formDataToSubmit);
      }
      
      setShouldRefresh(prev => prev + 1);
      setIsModalOpen(false);
      setFormData({} as SolucaoFormData);
      setSelectedLanguages([]);
      setIsEditing(null);
    } catch (error: any) {
      console.error('Error details:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        alert(`Erro ao salvar a solução: ${error.response.data.message || 'Erro desconhecido'}`);
      } else if (error.request) {
        alert('Erro de conexão com o servidor. Verifique sua internet.');
      } else {
        alert('Erro ao processar a solicitação. Por favor, tente novamente.');
      }
    }
  };

  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | CustomChangeEvent) => {
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
        setShouldRefresh(prev => prev + 1);
      } catch (error) {
        console.error('Error deleting solucao:', error);
      }
      setIsDeleteModalOpen(false);
    }
  };

  const handleInfoClick = async (solucao: SolucaoType) => {
    setSelectedDemandDetails(solucao);
    setIsInfoModalOpen(true);
    setActiveTab('details');
    try {
      const historicoCompleto = await getHistoricoSolucoes();
      const historicoFiltrado = historicoCompleto
        .filter((historico: HistoricoType) => historico.solucaoId === Number(solucao.id))
        .sort((a: HistoricoType, b: HistoricoType) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      setHistoricoSolucao(historicoFiltrado);
    } catch (error) {
      console.error('Error fetching histórico:', error);
    }
  };

  const formatHistoricoDescricao = (descricao: string, evento: HistoricoType) => {
    // Função para formatar valores nulos
    const formatNullValue = (value: string | null) => value === null ? 'Nulo (não informado)' : value;

    // Lista de mapeamentos de campos
    const camposMapeados: { [key: string]: { nome: string, getValue: (evento: HistoricoType) => string } } = {
        'tipo_id': {
            nome: 'Tipo',
            getValue: (e) => {
                const value = e.solucao.tipoId;
                if (value === null) return 'Nulo (não informado)';
                return tipos.find((t: BaseType) => t.id === Number(value))?.nome || 'Desconhecido';
            }
        },
        'linguagem_id': {
            nome: 'Linguagem',
            getValue: (e) => {
                const value = e.solucao.linguagemId;
                if (!value) return 'Nulo (não informado)';
                return String(value).split(',')
                    .map(id => linguagens.find((l: BaseType) => l.id === Number(id))?.nome)
                    .filter(Boolean)
                    .join(', ') || 'Desconhecido';
            }
        },
        'desenvolvedor_id': {
            nome: 'Desenvolvedor',
            getValue: (e) => {
                const value = e.solucao.desenvolvedorId;
                if (value === null) return 'Nulo (não informado)';
                return desenvolvedores.find((d: BaseType) => d.id === Number(value))?.nome || 'Desconhecido';
            }
        },
        'categoria_id': {
            nome: 'Categoria',
            getValue: (e) => {
                const value = e.solucao.categoriaId;
                if (value === null) return 'Nulo (não informado)';
                return categorias.find((c: BaseType) => c.id === Number(value))?.nome || 'Desconhecido';
            }
        },
        'responsavel_id': {
            nome: 'Responsável',
            getValue: (e) => {
                const value = e.solucao.responsavelId;
                if (value === null) return 'Nulo (não informado)';
                return responsaveis.find((r: BaseType) => r.id === Number(value))?.nome || 'Desconhecido';
            }
        },
        'status_id': {
            nome: 'Status',
            getValue: (e) => {
                const value = e.solucao.statusId;
                if (value === null) return 'Nulo (não informado)';
                return statusList.find((s: BaseType) => s.id === Number(value))?.nome || 'Desconhecido';
            }
        },
        'demanda_id': {
            nome: 'Demanda',
            getValue: (e) => {
                const value = e.solucao.demandaId;
                if (value === null) return 'Nulo (não informado)';
                return demanda.find((d: any) => d.id === Number(value))?.nome || 'Desconhecido';
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
                    solucao: { 
                        ...evento.solucao, 
                        [`${campoNormalizado.replace('_id', '')}Id`]: valorAntigo === 'null' ? null : Number(valorAntigo)
                    }
                };
                const novoObj: HistoricoType = {
                    ...antigoObj,
                    solucao: {
                        ...evento.solucao,
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

  const handleEditClick = (solucao: SolucaoType) => {
    const formDataToSet = {
      ...formData,
      tipo_id: Number(solucao.tipo?.id),
      linguagem_id: solucao.linguagemId,
      desenvolvedor_id: Number(solucao.desenvolvedor?.id),
      categoria_id: Number(solucao.categoria?.id),
      nome: solucao.nome,
      sigla: solucao.sigla,
      descricao: solucao.descricao,
      versao: solucao.versao,
      responsavel_id: Number(solucao.responsavel?.id),
      status_id: Number(solucao.status?.id),
      demanda_id: Number(solucao.demanda?.id),
      data_status: solucao.dataStatus
    };

    // Pré-selecionar as linguagens
    if (solucao.linguagemId) {
      const selectedIds = typeof solucao.linguagemId === 'string' 
        ? solucao.linguagemId.split(',').map(Number)
        : [Number(solucao.linguagemId)];
      setSelectedLanguages(selectedIds);
    } else {
      setSelectedLanguages([]);
    }

    setFormData(formDataToSet);
    setIsEditing(solucao.id.toString());
    setIsModalOpen(true);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempSearchTerm(value);
    
    // Aplicar filtro imediatamente enquanto o usuário digita
    if (value) {
      const searchLower = value.toLowerCase();
      const filtered = solucoes?.filter((s: SolucaoType) => {
        return (
          s.status?.nome.toLowerCase().includes(searchLower) ||
          s.nome?.toLowerCase().includes(searchLower) ||
          s.sigla?.toLowerCase().includes(searchLower) ||
          (s.linguagemId && typeof s.linguagemId === 'string' 
            ? s.linguagemId.split(',').some(id => linguagens.find(l => l.id === Number(id))?.nome.toLowerCase().includes(searchLower)) 
          : false) ||
          s.desenvolvedor?.nome.toLowerCase().includes(searchLower) ||
          s.categoria?.nome.toLowerCase().includes(searchLower) ||
          s.responsavel?.nome.toLowerCase().includes(searchLower) ||
          s.status?.nome.toLowerCase().includes(searchLower)
        );
      }) || [];
      setFilteredSolucoes(filtered);
    } else {
      setFilteredSolucoes(solucoes);
    }
  };

  const clearFilters = () => {
    setFilters({
      demanda_id: '',
      tipo_id: '',
      linguagem_id: '',
      desenvolvedor_id: '',
      categoria_id: '',
      responsavel_id: '',
      status_id: ''
    });
    setTempSearchTerm('');
    setSearch('');
    setFilteredSolucoes(solucoes);
  };

  const filterSolucoes = () => {
    let filtered = [...solucoes] as SolucaoType[];
    
    // Aplicar filtro de texto
    if (tempSearchTerm) {
      const searchLower = tempSearchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.nome?.toLowerCase().includes(searchLower) ||
        s.sigla?.toLowerCase().includes(searchLower) ||
        s.descricao?.toLowerCase().includes(searchLower) ||
        s.versao?.toLowerCase().includes(searchLower) ||
        s.tipo?.nome.toLowerCase().includes(searchLower) ||
        (s.linguagemId && typeof s.linguagemId === 'string' 
          ? s.linguagemId.split(',').some(id => linguagens.find(l => l.id === Number(id))?.nome.toLowerCase().includes(searchLower)) 
          : false) ||
        s.desenvolvedor?.nome.toLowerCase().includes(searchLower) ||
        s.categoria?.nome.toLowerCase().includes(searchLower) ||
        s.responsavel?.nome.toLowerCase().includes(searchLower) ||
        s.status?.nome.toLowerCase().includes(searchLower)
      );
    }
    
    // Aplicar outros filtros
    if (filters.demanda_id) {
      filtered = filtered.filter(s => s.demanda?.id === Number(filters.demanda_id));
    }
    if (filters.tipo_id) {
      filtered = filtered.filter(s => s.tipo?.id === Number(filters.tipo_id));
    }
    if (filters.linguagem_id) {
      filtered = filtered.filter(s => String(s.linguagemId).split(',').includes(filters.linguagem_id));
    }
    if (filters.desenvolvedor_id) {
      filtered = filtered.filter(s => s.desenvolvedor?.id === Number(filters.desenvolvedor_id));
    }
    if (filters.categoria_id) {
      filtered = filtered.filter(s => s.categoria?.id === Number(filters.categoria_id));
    }
    if (filters.responsavel_id) {
      filtered = filtered.filter(s => s.responsavel?.id === Number(filters.responsavel_id));
    }
    if (filters.status_id) {
      filtered = filtered.filter(s => s.status?.id === Number(filters.status_id));
    }
    
    setSearch(tempSearchTerm);
    setFilteredSolucoes(filtered);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (!selectedLanguages.includes(value)) {
      const newSelected = [...selectedLanguages, value];
      setSelectedLanguages(newSelected);
      handleInputChange({
        target: {
          name: 'linguagem_id',
          value: newSelected.join(',')
        }
      });
    }
  };

  const removeLanguage = (langId: number) => {
    const newSelected = selectedLanguages.filter(id => id !== langId);
    setSelectedLanguages(newSelected);
    handleInputChange({
      target: {
        name: 'linguagem_id',
        value: newSelected.join(',')
      }
    });
  };

  // Função auxiliar para renderizar as linguagens
  const renderLinguagensChips = (linguagemIds: string | null) => {
    if (!linguagemIds) return '-';
    
    return (
      <div className="flex flex-wrap gap-1">
        {linguagemIds.split(',').map(id => {
          const linguagem = linguagens.find(l => l.id === Number(id.trim()));
          if (!linguagem) return null;
          
          return (
            <span 
              key={(linguagem as {id: number; nome: string}).id}
              className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full"
            >
              {(linguagem as {id: number; nome: string}).nome}
            </span>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    if (search) {
      const searchLower = search.toLowerCase();
      const filtered = solucoes?.filter((s: SolucaoType) => {
        return (
          s.status?.nome.toLowerCase().includes(searchLower) ||
          s.nome?.toLowerCase().includes(searchLower) ||
          s.sigla?.toLowerCase().includes(searchLower) ||
          (s.linguagemId && typeof s.linguagemId === 'string' 
            ? s.linguagemId.split(',').some(id => linguagens.find(l => l.id === Number(id))?.nome.toLowerCase().includes(searchLower)) 
            : false) ||
          s.desenvolvedor?.nome.toLowerCase().includes(searchLower) ||
          s.categoria?.nome.toLowerCase().includes(searchLower) ||
          s.responsavel?.nome.toLowerCase().includes(searchLower) ||
          s.status?.nome.toLowerCase().includes(searchLower)
        );
      }) || [];

      setFilteredSolucoes(filtered);
    } else {
      setFilteredSolucoes(solucoes);
    }
  }, [search, solucoes, linguagens]);

  // Função auxiliar para renderizar as linguagens na tabela
  const renderTableLinguagens = (solucao: any) => {
    // Verifica se temos o array de linguagens da nova estrutura
    if (solucao.linguagens && Array.isArray(solucao.linguagens)) {
      return (
        <div className="flex flex-wrap gap-1">
          {solucao.linguagens.map((linguagem: any) => (
            <span
              key={linguagem.id}
              className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full"
            >
              {linguagem.nome}
            </span>
          ))}
        </div>
      );
    }

    // Fallback para o formato antigo (string de IDs)
    if (solucao.linguagemId) {
      const ids = String(solucao.linguagemId).split(',').map(id => Number(id.trim()));
      
      const linguagensEncontradas = ids
        .map(id => linguagens.find(l => l.id === id))
        .filter(Boolean);

      if (linguagensEncontradas.length > 0) {
        return (
          <div className="flex flex-wrap gap-1">
            {linguagensEncontradas.map(linguagem => (
              <span
                key={(linguagem as {id: number; nome: string}).id}
                className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full"
              >
                {(linguagem as {id: number; nome: string}).nome}
              </span>
            ))}
          </div>
        );
      }
    }

    return '-';
  };

  const renderDetalhesLinguagens = (solucao: SolucaoType) => {
    if (solucao.linguagemId) {
      const ids = String(solucao.linguagemId).split(',').map(id => Number(id.trim()));
      const linguagensEncontradas = ids
        .map(id => linguagens.find(l => l.id === id))
        .filter(Boolean);

      return (
        <div className="flex flex-wrap gap-1">
          {linguagensEncontradas.map(linguagem => (
            <span
              key={(linguagem as {id: number; nome: string}).id}
              className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full"
            >
              {(linguagem as {id: number; nome: string}).nome}
            </span>
          ))}
        </div>
      );
    }
    return '-';
  };

  return (
    <div className={`
      min-h-screen bg-gray-50
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'ml-20 absolute right-0 top-16 bottom-0' : ''}
      flex-grow
      w-auto
      
    `}>
      <div className={`
        
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-[98%] mx-auto' : ''}
        py-6
      `}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Crie sua solução</h1>
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
          <div className="mb-3">
            <h2 className="text-base font-semibold text-gray-800">Filtros</h2>
          </div>

         
          <div className={`
            grid gap-2
            transition-all duration-300
            ${isCollapsed 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-7 xl:grid-cols-7' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-7 xl:grid-cols-7'}
          `}>
            <select
              name="demanda_id"
              value={filters.demanda_id}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
            >
              <option value="">Demanda</option>
              {demanda.map((d) => (
                <option key={d.id} value={d.id}>{d.sigla || d.nome}</option>
              ))}
            </select>

            <select
              name="tipo_id"
              value={filters.tipo_id}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
            >
              <option value="">Tipo</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>

            <select
              name="linguagem_id"
              value={filters.linguagem_id}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
            >
              <option value="">Linguagem</option>
              {linguagens.map((l) => (
                <option key={l.id} value={l.id}>{l.nome}</option>
              ))}
            </select>

            <select
              name="desenvolvedor_id"
              value={filters.desenvolvedor_id}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
            >
              <option value="">Desenvolvedor</option>
              {desenvolvedores.map((d) => (
                <option key={d.id} value={d.id}>{d.nome}</option>
              ))}
            </select>

            <select
              name="categoria_id"
              value={filters.categoria_id}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
            >
              <option value="">Categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>

            <select
              name="responsavel_id"
              value={filters.responsavel_id}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
            >
              <option value="">Responsável</option>
              {responsaveis.map((r) => (
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
              {statusList.map((s) => (
                <option key={s.id} value={s.id}>{s.nome}</option>
              ))}
            </select>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar soluções..."
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
                onClick={filterSolucoes}
                className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Aplicar
              </button>
            </div>
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
              {Array.isArray(filteredSolucoes) && filteredSolucoes.map((solucao: SolucaoType, index: number) => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {renderTableLinguagens(solucao)}
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
                        onClick={() => handleInfoClick(solucao)}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleEditClick(solucao)}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(String(solucao.id))}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="nome" 
                      value={formData.nome || ''} 
                      onChange={handleInputChange}
                      className={`w-full px-2 py-1.5 text-sm border ${
                        formErrors.nome ? 'border-red-500' : 'border-gray-300'
                      } rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors`}
                    />
                    {formErrors.nome && (
                      <p className="mt-1 text-sm text-red-500">
                        Este campo é obrigatório
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sigla</label>
                    <input 
                      type="text" 
                      name="sigla" 
                      value={formData.sigla || ''} 
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors" 
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                    <textarea 
                      name="descricao" 
                      value={formData.descricao || ''} 
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Versão</label>
                    <input 
                      type="text" 
                      name="versao" 
                      value={formData.versao || ''} 
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                    <select 
                      name="tipo_id" 
                      value={formData.tipo_id || ''}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
                    >
                      <option value="">Selecione um tipo</option>
                      {tipos.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Linguagens
                    </label>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 bg-gray-50 border border-gray-200 rounded-md">
                        {selectedLanguages.map((langId) => {
                          const language = linguagens.find(l => l.id === langId);
                          return (
                            <div
                              key={langId}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                            >
                              <span>{language?.nome}</span>
                              <button
                                type="button"
                                onClick={() => removeLanguage(langId)}
                                className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-blue-200 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="relative">
                        <select
                          onChange={handleLanguageChange}
                          value=""
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors appearance-none"
                        >
                          <option value="">Adicionar linguagem...</option>
                          {linguagens
                            .filter(lang => !selectedLanguages.includes(lang.id))
                            .map((lang) => (
                              <option key={lang.id} value={lang.id}>
                                {lang.nome}
                              </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-1">
                        Selecione uma ou mais linguagens para esta solução
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Desenvolvedor</label>
                    <select 
                      name="desenvolvedor_id" 
                      value={formData.desenvolvedor_id || ''}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
                    >
                      <option value="">Selecione um desenvolvedor</option>
                      {desenvolvedores.map((desenvolvedor) => (
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
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Demanda <span className="text-red-500">*</span>
                    </label>
                    <select 
                      name="demanda_id" 
                      value={formData.demanda_id || ''}
                      onChange={handleInputChange}
                      className={`w-full px-2 py-1.5 text-sm border ${
                        formErrors.demanda_id ? 'border-red-500' : 'border-gray-300'
                      } rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors`}
                    >
                      <option value="">Selecione uma demanda</option>
                      {demanda.map((demanda) => (
                        <option key={demanda.id} value={demanda.id}>{demanda.sigla || demanda.nome}</option>
                      ))}
                    </select>
                    {formErrors.demanda_id && (
                      <p className="mt-1 text-sm text-red-500">
                        Este campo é obrigatório
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Responsável</label>
                    <select 
                      name="responsavel_id" 
                      value={formData.responsavel_id || ''}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
                    >
                      <option value="">Selecione um responsável</option>
                      {responsaveis.map((resp) => (
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
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
                    >
                      <option value="">Selecione um status</option>
                      {statusList.map((status) => (
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
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors" 
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
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
                    Detalhes da Solução
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Informações Básicas */}
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
                          <span className="text-sm text-gray-800 font-medium group-hover:text-blue-600">{selectedDemandDetails.nome}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <span className="text-sm font-medium text-gray-600">Sigla:</span>
                          <span className="text-sm text-gray-800 font-medium group-hover:text-blue-600">{selectedDemandDetails.sigla}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <span className="text-sm font-medium text-gray-600">Versão:</span>
                          <span className="text-sm text-gray-800 font-medium group-hover:text-blue-600">{selectedDemandDetails.versao}</span>
                        </div>
                      </div>
                    </div>

                    {/* Detalhes da Solução */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 w-full h-[300px]">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Detalhes da Solução
                      </h3>
                      <div className="space-y-3 overflow-y-auto h-[200px]">
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

                    {/* Configurações Técnicas */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 w-full h-[300px]">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        Configurações Técnicas
                      </h3>
                      <div className="space-y-3 overflow-y-auto h-[200px]">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <span className="text-sm font-medium text-gray-600">Tipo:</span>
                          <span className="text-sm text-gray-800 font-medium">
                            {tipos.find(tipo => tipo.id === selectedDemandDetails.tipo?.id)?.nome || '-'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <span className="text-sm font-medium text-gray-600">Linguagem:</span>
                          <span className="text-sm text-gray-800 font-medium">
                            {renderDetalhesLinguagens(selectedDemandDetails)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <span className="text-sm font-medium text-gray-600">Status:</span>
                          <span 
                            className={`rounded-md px-3 py-1 text-sm font-medium ${determinarCorTexto(selectedDemandDetails.status?.propriedade)}`}
                            style={{ backgroundColor: selectedDemandDetails.status?.propriedade }}
                          >
                            {selectedDemandDetails.status?.nome || '-'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Responsabilidades */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 w-full h-[300px]">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Responsabilidades
                      </h3>
                      <div className="space-y-3 overflow-y-auto h-[200px]">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <span className="text-sm font-medium text-gray-600">Categoria:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedDemandDetails.categoria?.nome || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <span className="text-sm font-medium text-gray-600">Responsável:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedDemandDetails.responsavel?.nome || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <span className="text-sm font-medium text-gray-600">Status:</span>
                          <span 
                            className={`rounded-md px-3 py-1 text-sm font-medium ${determinarCorTexto(selectedDemandDetails.status?.propriedade)}`}
                            style={{ backgroundColor: selectedDemandDetails.status?.propriedade }}
                          >
                            {selectedDemandDetails.status?.nome || '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Histórico de Alterações</h3>
                      <p className="text-sm text-gray-600">Acompanhe todas as mudanças realizadas nesta solução</p>
                    </div>
                    <div className="flow-root">
                      <ul role="list" className="-mb-8">
                        {historicoSolucao.map((evento: HistoricoType, index: number) => (
                          <li key={evento.id}>
                            <div className="relative pb-8">
                              {index !== historicoSolucao.length - 1 && (
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
                                  {index !== historicoSolucao.length - 1 && (
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
                                        {formatDate(evento.createdAt)}
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
                                              <span className="text-gray-900 font-medium group-hover:text-blue-600">{evento.solucao.nome}</span>
                                            </p>
                                            <p className="flex items-center justify-between group hover:bg-white hover:shadow-sm p-2 rounded-md transition-all">
                                              <span className="font-medium text-gray-600">Sigla:</span>
                                              <span className="text-gray-900 font-medium group-hover:text-blue-600">{evento.solucao.sigla}</span>
                                            </p>
                                            <p className="flex items-center justify-between group hover:bg-white hover:shadow-sm p-2 rounded-md transition-all">
                                              <span className="font-medium text-gray-600">Versão:</span>
                                              <span className="text-gray-900 font-medium group-hover:text-blue-600">{evento.solucao.versao}</span>
                                            </p>
                                          </div>
                                        </div>
                                        
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                                          <h4 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                                            Detalhes Técnicos
                                          </h4>
                                          <div className="space-y-3">
                                            <p className="flex items-center justify-between group hover:bg-white hover:shadow-sm p-2 rounded-md transition-all">
                                              <span className="font-medium text-gray-600">Tipo:</span>
                                              <span className="text-gray-900 font-medium group-hover:text-blue-600">
                                                {tipos.find(tipo => tipo.id === evento.solucao.tipoId)?.nome || '-'}
                                              </span>
                                            </p>
                                            <p className="flex items-center justify-between group hover:bg-white hover:shadow-sm p-2 rounded-md transition-all">
                                              <span className="font-medium text-gray-600">Linguagem:</span>
                                              <span className="text-gray-900 font-medium group-hover:text-blue-600">
                                                {renderDetalhesLinguagens(evento.solucao)}
                                              </span>
                                            </p>
                                            <p className="flex items-center justify-between group hover:bg-white hover:shadow-sm p-2 rounded-md transition-all">
                                              <span className="font-medium text-gray-600">Status:</span>
                                              <span className="text-gray-900 font-medium group-hover:text-blue-600">{evento.solucao.statusId || '-'}</span>
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