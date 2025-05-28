'use client'

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
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
  getHistoricoSolucoes,
  getAllDemandas,
} from "../actions/actions";
import { Plus, Edit2, Trash2, X, Info, ChevronRight, ExternalLink, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { SolucaoFormData, BaseType, HistoricoType, SolucaoType, } from '../types/types';
import { useSidebar } from '../../../../../componentes/Sidebar/SidebarContext';
import dynamic from 'next/dynamic';
import Loading from '../../../../../componentes/Loading/Loading';

const DynamicTable = dynamic(() => import('./Table/Table'), {
  loading: () => <Loading />,
  ssr: false // Evita carregar no servidor
});

const SolucaoFormModal = dynamic(() => import('./SolucaoFormModal.tsx/SolucaoFormModa'), {
  loading: () => <Loading />,
  ssr: false
});
const SolucaoInfoModal = dynamic(() => import('./SolucaoInfoModal/SolucaoInfoModal'), {
  loading: () => <Loading />,
  ssr: false
});

// Adicione um componente específico para exportação Excel
const ExcelExporter = dynamic(
  () => import('./ExcelExporter'), // Crie este componente separadamente
  { ssr: false, loading: () => <Loading /> }
);

// Componente separado para PDF
const PDFViewer = dynamic(
  () => import('./PDFViewer'), // Crie este componente separadamente
  { ssr: false, loading: () => <Loading /> }
);

type CustomChangeEvent = {
  target: {
    name: string;
    value: string;
  };
};

const DeleteConfirmationModal = dynamic(() => import('./ModalConfirmacao/DeleteConfirmationModal'));

export default function Solucao() {
  const params = useParams();
  const [solucoes, setSolucoes] = useState<SolucaoType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDemandDetails, setSelectedDemandDetails] = useState<SolucaoType | null>(null);
  const [formData, setFormData] = useState<SolucaoFormData>({} as SolucaoFormData);
  const [tipos, setTipos] = useState<BaseType[]>([]);
  const [repositorio, setRepositorio] = useState<BaseType[]>([]);
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15;
  const [atualizacoes, setAtualizacoes] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filters, setFilters] = useState({
    demanda_id: '',
    tipo_id: '',
    linguagem_id: '',
    desenvolvedor_id: '',
    categoria_id: '',
    responsavel_id: '',
    status_id: '',
  });
  const [filteredSolucoes, setFilteredSolucoes] = useState<SolucaoType[]>([]);
  const [search, setSearch] = useState('');
  const [shouldRefresh, setShouldRefresh] = useState(0);
  const [formErrors, setFormErrors] = useState({
    nome: false,
    demanda_id: false
  });
  const [selectedLanguages, setSelectedLanguages] = useState<number[]>([]);
  const [activeFormTab, setActiveFormTab] = useState('ficha-tecnica');
  const [times, setTimes] = useState<any[]>([]);
  const [selectedAtualizacaoId, setSelectedAtualizacaoId] = useState<string | null>(null);
  const { isCollapsed } = useSidebar();

  useEffect(() => {
    const proprietarioId = params.id;
    if (proprietarioId) {
      localStorage.setItem('selectedProprietarioId', String(proprietarioId));
    }
  }, [params.id]);

  const determinarCorTexto = (corHex: string | undefined) => {
    if (!corHex) return 'text-gray-800'; 
   
    corHex = corHex.replace('#', '');
    
    const r = parseInt(corHex.substr(0, 2), 16);
    const g = parseInt(corHex.substr(2, 2), 16);
    const b = parseInt(corHex.substr(4, 2), 16);
    
    const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
    return luminancia > 0.5 ? 'text-gray-800' : 'text-white';
  };

  

  const carregarDemandasParaSelect = async () => {
    try {
      const storedId = localStorage.getItem('selectedProprietarioId');
      const demandasData = await getAllDemandas();
      
      if (demandasData) {
        const demandasFiltradas = demandasData.filter(
          (demanda: any) => demanda?.proprietario?.id === Number(storedId)
        );
        setDemanda(demandasFiltradas); 
      }
    } catch (error) {
      console.error('Erro ao carregar demandas para select:', error);
    }
  };
 


  // Modifique a função que busca as soluções para atualizar o totalPages
  const fetchSolucoes = async (page = currentPage) => {
    try {
      const storedId = localStorage.getItem('selectedProprietarioId');
      if (!storedId) {
        console.error('proprietario_id não encontrado no localStorage');
        return null;
      }

      const solucoesData = await getSolucoes(page, itemsPerPage, Number(storedId));
      const solucoesArray = solucoesData || []; // Removi o .data, pois o backend já retorna o array diretamente
      setSolucoes(solucoesArray);
    } catch (error) {
      console.error('Erro ao buscar soluções:', error);
      return null;
    }
  };

  // Efeito para carregar as soluções paginadas e outros dados
  useEffect(() => {
    Promise.all([
      fetchSolucoes(),
      getTipos(),
      getLinguagens(),
      getDesenvolvedores(),
      getCategorias(),
      getResponsaveis(),
      getStatus(),
    ]).then(([solucoesData, tiposData, linguagensData, desenvolvedoresData, categoriasData, responsaveisData, statusData]) => {
      // Atualiza os outros dados
      setTipos(tiposData || []);
      setLinguagens(linguagensData || []);
      setDesenvolvedores(desenvolvedoresData || []);
      setCategorias(categoriasData || []);
      setResponsaveis(responsaveisData || []);
      setStatusList(statusData || []);
      // Certifique-se de que o total de páginas seja calculado corretamente
      if (solucoesData && typeof solucoesData === 'object' && 'meta' in solucoesData) {
        const total = (solucoesData as { meta: { total: number } }).meta.total || 0;
        setTotalPages(Math.ceil(total / itemsPerPage));
      }
    }).catch(error => {
      console.error('Error loading data:', error);
    });
  }, [currentPage, shouldRefresh]);

  // Efeito separado para carregar as demandas do select
  useEffect(() => {
    carregarDemandasParaSelect();
  }, []);

  // Quando abrir o modal de criar/editar solução
  const handleOpenModal = () => {
    carregarDemandasParaSelect(); // Recarrega as demandas para o select
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (isEditing && formData.linguagem_id) {
      const ids = String(formData.linguagem_id).split(',').map(Number);
      setSelectedLanguages(ids);
    }
  }, [isEditing, formData.linguagem_id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    try {
      const storedId = localStorage.getItem('selectedProprietarioId');
      
      if (!storedId) {
        console.error('proprietario_id não encontrado no localStorage');
        return;
      }

      // Format times data as JSON with the specified structure
      const formattedTimes = formData.times?.map(time => ({
        id: time.id,
        responsavel_id: Number(time.responsavel_id),
        funcao: time.funcao || '',
        data_inicio: time.dataInicio || '',
        data_fim: time.dataFim || ''
      })) || [];

      // Format updates data as JSON with the specified structure
      const formattedAtualizacoes = formData.atualizacoes?.map(atualizacao => ({
        id: atualizacao.id,
        nome: atualizacao.nome || '',
        descricao: atualizacao.descricao || '',
        data_atualizacao: atualizacao.data_atualizacao || ''
      })) || [];

      const linguagemValue = selectedLanguages.length > 0 ? selectedLanguages.join(',') : null;
      
      // Garantir que todos os campos estejam no formato correto
      const formDataToSubmit = {
        ...formData,
        proprietario_id: Number(storedId),
        nome: formData.nome || '-',
        sigla: formData.sigla || '-',
        descricao: formData.descricao || '-',
        versao: formData.versao || '-',
        repositorio: formData.repositorio || null,
        link: formData.link || null,
        andamento: formData.andamento || '0',
        criticidade: formData.criticidade || '', // Enviar string vazia em vez de null
        tipo_id: formData.tipo_id ? Number(formData.tipo_id) : null,
        linguagem_id: linguagemValue,
        desenvolvedor_id: formData.desenvolvedor_id ? Number(formData.desenvolvedor_id) : null,
        categoria_id: formData.categoria_id ? Number(formData.categoria_id) : null,
        responsavel_id: formData.responsavel_id ? Number(formData.responsavel_id) : null,
        status_id: formData.status_id ? Number(formData.status_id) : null,
        demanda_id: formData.demanda_id ? Number(formData.demanda_id) : null,
        data_status: formData.data_status || new Date().toISOString().split('T')[0],
        // Send times as JSON string with the new structure
        times: JSON.stringify(formattedTimes),
        // Send updates as JSON string with the new structure
        atualizacoes: JSON.stringify(formattedAtualizacoes)
      };

      if (isEditing) {
        try {
          // Atualizar solução existente
          const updatedSolucao = await updateSolucao(isEditing, formDataToSubmit);
          
          // Criar uma cópia do estado atual das soluções
          const currentSolucoes = [...solucoes];
          
          // Encontrar o índice da solução editada
          const editedIndex = currentSolucoes.findIndex(s => String(s.id) === String(isEditing));
          
          if (editedIndex !== -1) {
            // Buscar a solução atualizada da API
            const updatedData = await getSolucoes(currentPage, itemsPerPage, Number(storedId));
            const updatedSolucaoFromAPI = updatedData.find((s: SolucaoType) => String(s.id) === String(isEditing));
            
            if (updatedSolucaoFromAPI) {
              // Atualizar a solução mantendo sua posição original
              currentSolucoes[editedIndex] = updatedSolucaoFromAPI;
              setSolucoes(currentSolucoes);
            }
          }

          setIsModalOpen(false);
          setFormData({} as SolucaoFormData);
          setSelectedLanguages([]);
          setIsEditing(null);
        } catch (error) {
          console.error('Erro ao atualizar solução:', error);
        }
      } else {
        // Criar nova solução
        await createSolucao(formDataToSubmit);
        await fetchSolucoes();
        
        setIsModalOpen(false);
        setFormData({} as SolucaoFormData);
        setSelectedLanguages([]);
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | CustomChangeEvent) => {
    const { name, value } = e.target;

    if (name === 'andamento') {
      // Garante que o valor está entre 0 e 100
      const numValue = Math.min(Math.max(Number(value) || 0, 0), 100);
      setFormData(prev => ({
        ...prev,
        [name]: numValue.toString()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };


  
  const formatDate = (dateString?: string | null) => {
   
    
    if (!dateString) {
      return '-';
    }
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return '-';
      }
      
      const formattedDate = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
      
      return formattedDate;
    } catch (error) {
      return '-';
    }
  };

  const handleDeleteClick = useCallback((id: string) => {
    setItemToDeleteId(id);
    setIsDeleteModalOpen(true);
  }, [setItemToDeleteId, setIsDeleteModalOpen]);
  
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

  const handleInfoClick = useCallback(async (solucao: SolucaoType) => {
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
  }, [setSelectedDemandDetails, setIsInfoModalOpen, setActiveTab, getHistoricoSolucoes]);

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

  const handleEditClick = useCallback((solucao: SolucaoType) => {
    const formDataToSet = {
      nome: solucao.nome || '',
      sigla: solucao.sigla || '',
      descricao: solucao.descricao || '',
      versao: solucao.versao || '',
      repositorio: solucao.repositorio || '',
      link: solucao.link || '',
      andamento: solucao.andamento || '',
      criticidade: solucao.criticidade || '',
      tipo_id: solucao.tipo?.id || null,
      linguagem_id: solucao.linguagemId || null,
      desenvolvedor_id: solucao.desenvolvedor?.id || null,
      categoria_id: solucao.categoria?.id || null,
      responsavel_id: solucao.responsavel?.id || null,
      status_id: solucao.status?.id || null,
      demanda_id: solucao.demandaId || null,
      data_status: solucao.data_status || solucao.dataStatus || '',
      // Parse the times JSON string if it exists and ensure it has IDs
      times: solucao.times ? (typeof solucao.times === 'string' ? JSON.parse(solucao.times) : solucao.times).map((time: any) => ({
        id: time.id,
        responsavel_id: time.responsavel_id,
        funcao: time.funcao || '',
        dataInicio: time.data_inicio || '',
        dataFim: time.data_fim || ''
      })) : [],
      // Parse the updates JSON string if it exists and ensure it has IDs
      atualizacoes: solucao.atualizacoes ? (typeof solucao.atualizacoes === 'string' ? JSON.parse(solucao.atualizacoes) : solucao.atualizacoes).map((atualizacao: any) => ({
        id: atualizacao.id,
        nome: atualizacao.nome || '',
        descricao: atualizacao.descricao || '',
        data_atualizacao: atualizacao.data_atualizacao || ''
      })) : []
    } as SolucaoFormData;

    setFormData(formDataToSet);
    setIsEditing(String(solucao.id));
    setIsModalOpen(true);
  }, []);

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

  

  const renderDetalhesLinguagens = (solucao: SolucaoType) => {
    if (solucao.linguagemId) {
      const ids = String(solucao.linguagemId).split(',').map(id => Number(id.trim()));
      const linguagemEncontradas = ids
        .map(id => linguagens.find(l => l.id === id))
        .filter(Boolean);

      return (
        <div className="flex flex-wrap gap-1">
          {linguagemEncontradas.map(linguagens => (
            <span
              key={(linguagens as {id: number; nome: string}).id}
              className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full"
            >
              {(linguagens as {id: number; nome: string}).nome}
            </span>
          ))}
        </div>
      );
    }
    return '-';
  };

  const formatRepositoryLink = (repo: string) => {
    if (!repo || repo === '') return '';
    if (repo.includes('github.com')) {
      return (
        <a 
          href={repo}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
          </svg>
          GitHub
        </a>
      );
    }
    return (
        <div>
          <Link
                          href={repo}
                          target="_blank"
                          className="text-purple-500 hover:text-purple-700 rounded-full hover:bg-purple-50 transition-colors"
                        >
                          
                          <ExternalLink className="w-5 h-5" />
                        </Link>
        </div>
      
    );
  };


  const getProgressColor = (progress: number) => {
    if (progress < 25) return 'bg-red-500';
    if (progress < 50) return 'bg-orange-500';
    if (progress < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const ProgressBar = ({ progress }: { progress: number }) => {
    const progressColor = getProgressColor(progress);
    
    return (
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${progressColor} transition-all duration-300 ease-in-out`}
          style={{ width: `${progress}%` }}
        />
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
          <h1 className="text-2xl font-bold text-gray-800">Crie sua solução</h1>
          <div className="flex gap-2">
            {/* <UpdateSolucoesButton /> */}
            <button 
              onClick={handleOpenModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>
        </div>

        

        {/* Substitua a seção da tabela pelo componente Table */}
        <DynamicTable 
          solucoes={solucoes}
          linguagens={linguagens}
          isCollapsed={isCollapsed}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onInfo={handleInfoClick}
        />
        
        {/* <Pagination /> */}
        
        {isModalOpen && (
            <SolucaoFormModal
            isOpen={isModalOpen}
            isEditing={isEditing}
            formData={{
              ...formData,
              repositorio: formData.repositorio || '',
              linguagem_id: formData.linguagem_id?.toString() || null,
              link: formData.link || '',
              criticidade: formData.criticidade || '',
            }}
            setFormData={setFormData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            onClose={() => {
              setIsModalOpen(false);
              setIsEditing(null);
              setFormData({} as SolucaoFormData);
              setSelectedLanguages([]);
            }}
            tipos={tipos}
            linguagens={linguagens}
            desenvolvedores={desenvolvedores}
            categorias={categorias}
            responsaveis={responsaveis}
            statusList={statusList}
            demanda={demanda}
            formErrors={formErrors}
            selectedLanguages={selectedLanguages}
            setSelectedLanguages={setSelectedLanguages}
            handleLanguageChange={(e: React.ChangeEvent<HTMLSelectElement> | { target: { value: string } }) => {
              if ('target' in e && typeof e.target.value === 'string') {
                handleLanguageChange({ target: { value: e.target.value } } as React.ChangeEvent<HTMLSelectElement>);
              } else {
                handleLanguageChange(e as React.ChangeEvent<HTMLSelectElement>);
              }
            }}
            removeLanguage={removeLanguage}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            activeFormTab={activeFormTab}
            setActiveFormTab={setActiveFormTab}
            formatDate={formatDate}
            times={times}
            atualizacoes={atualizacoes}
            selectedAtualizacaoId={selectedAtualizacaoId}
            setSelectedAtualizacaoId={setSelectedAtualizacaoId}
          />
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
                    className={`py-3 px-2 focus:outline-none transition-colors ${
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

              <div className="max-h-[50vh] overflow-y-auto pr-4">
                {activeTab === 'details' ? (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      {/* Informações Básicas */}
                      <div className="col-span-2 mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
                          Informações da Solução
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
                        <span className="text-sm font-medium text-gray-600">Versão:</span>
                        <span className="text-sm text-gray-800 font-medium">{selectedDemandDetails.versao}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <span className="text-sm font-medium text-gray-600">Repositório:</span>
                        <span className="text-sm text-gray-800 font-medium">
                          {formatRepositoryLink(selectedDemandDetails.repositorio)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <span className="text-sm font-medium text-gray-600">Link:</span>
                        {selectedDemandDetails.link ? (
                          <a 
                            href={selectedDemandDetails.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                          >
                            Acessar <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-sm text-gray-800 font-medium">-</span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <span className="text-sm font-medium text-gray-600">Tipo:</span>
                        <span className="text-sm text-gray-800 font-medium">{selectedDemandDetails.tipo?.nome || '-'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <span className="text-sm font-medium text-gray-600">Categoria:</span>
                        <span className="text-sm text-gray-800 font-medium">{selectedDemandDetails.categoria?.nome || '-'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <span className="text-sm font-medium text-gray-600">Demanda:</span>
                        <span className="text-sm text-gray-800 font-medium">{selectedDemandDetails.demanda?.nome || '-'}</span>
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
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <span className="text-sm font-medium text-gray-600">Responsável:</span>
                        <span className="text-sm text-gray-800 font-medium">{selectedDemandDetails.responsavel?.nome || '-'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <span className="text-sm font-medium text-gray-600">Desenvolvedor:</span>
                        <span className="text-sm text-gray-800 font-medium">{selectedDemandDetails.desenvolvedor?.nome || '-'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <span className="text-sm font-medium text-gray-600">Criticidade:</span>
                        <span className="text-sm text-gray-800 font-medium">{selectedDemandDetails.criticidade || '-'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <span className="text-sm font-medium text-gray-600">Data Status:</span>
                        <span className="text-sm text-gray-800 font-medium">{formatDate(selectedDemandDetails.data_status || selectedDemandDetails.dataStatus)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <span className="text-sm font-medium text-gray-600">Andamento:</span>
                        <div className="flex flex-col w-1/2 items-end">
                          <span className="text-sm text-gray-800 font-medium mb-1">{selectedDemandDetails.andamento || '0'}%</span>
                          <ProgressBar progress={Number(selectedDemandDetails.andamento) || 0} />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <span className="text-sm font-medium text-gray-600">Linguagens:</span>
                        <div className="text-right">
                          {renderDetalhesLinguagens(selectedDemandDetails)}
                        </div>
                      </div>
                      
                      <div className="col-span-2 mt-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                          Descrição
                        </h3>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-2">
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
                                    
                                            <div className="flex items-center justify-between group hover:bg-white hover:shadow-sm p-2 rounded-md transition-all">
                                              <span className="font-medium text-gray-600">Nome:</span>
                                              <span className="text-gray-900 font-medium group-hover:text-blue-600">{evento.solucao.nome}</span>
                                            </div>
                                            <div className="flex items-center justify-between group hover:bg-white hover:shadow-sm p-2 rounded-md transition-all">
                                              <span className="font-medium text-gray-600">Sigla:</span>
                                              <span className="text-gray-900 font-medium group-hover:text-blue-600">{evento.solucao.sigla}</span>
                                            </div>
                                            <div className="flex items-center justify-between group hover:bg-white hover:shadow-sm p-2 rounded-md transition-all">
                                              <span className="font-medium text-gray-600">Versão:</span>
                                              <span className="text-gray-900 font-medium group-hover:text-blue-600">{evento.solucao.versao}</span>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                                          <h4 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                                            Detalhes Técnicos
                                          </h4>
                                          <div className="space-y-3">
                                            <div className="flex items-center justify-between group hover:bg-white hover:shadow-sm p-2 rounded-md transition-all">
                                              <span className="font-medium text-gray-600">Tipo:</span>
                                              <span className="text-gray-900 font-medium group-hover:text-blue-600">
                                                {tipos.find(tipo => tipo.id === evento.solucao.tipoId)?.nome || '-'}
                                              </span>
                                            </div>
                                            <div className="flex items-center justify-between group hover:bg-white hover:shadow-sm p-2 rounded-md transition-all">
                                                <span className="font-medium text-gray-600">Linguagem:</span>
                                                <span className="text-gray-900 font-medium group-hover:text-blue-600">
                                                  {renderDetalhesLinguagens({
                                                    ...evento.solucao,
                                                    timeId: evento.solucao.timesId
                                                  })}
                                                </span>
                                              </div>
                                            <div className="flex items-center justify-between group hover:bg-white hover:shadow-sm p-2 rounded-md transition-all">
                                              <span className="font-medium text-gray-600">Status:</span>
                                              <span className="text-gray-900 font-medium group-hover:text-blue-600">{evento.solucao.statusId || '-'}</span>
                                            </div>
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
        {isDeleteModalOpen && (
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmDelete}
          />
        )}
      </div>
    </div>
  );
}
