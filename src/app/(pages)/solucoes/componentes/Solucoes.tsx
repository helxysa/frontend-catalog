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
  const [searchTerm, setSearchTerm] = useState('');

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
      setSolucoes(solucoesData);
      setFilteredSolucoes(solucoesData);
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
      const requiredFields = {
        nome: 'Nome',
        tipo_id: 'Tipo',
        linguagem_id: 'Linguagem',
        desenvolvedor_id: 'Desenvolvedor',
        categoria_id: 'Categoria',
        responsavel_id: 'Responsável',
        status_id: 'Status'
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([field]) => !formData[field as keyof SolucaoFormData])
        .map(([, label]) => label);

      if (missingFields.length > 0) {
        alert(`Por favor, preencha os seguintes campos obrigatórios: ${missingFields.join(', ')}`);
        return;
      }

      const formDataToSubmit = {
        nome: formData.nome,
        sigla: formData.sigla,
        descricao: formData.descricao,
        versao: formData.versao,
        tipo_id: Number(formData.tipo_id),
        linguagem_id: Number(formData.linguagem_id),
        desenvolvedor_id: Number(formData.desenvolvedor_id),
        categoria_id: Number(formData.categoria_id),
        responsavel_id: Number(formData.responsavel_id),
        status_id: Number(formData.status_id)
      };

      if (isEditing) {
        await updateSolucao(isEditing, formDataToSubmit);
      } else {
        await createSolucao({
          ...formDataToSubmit,
          demanda_id: Number(formData.demanda_id)
        });
      }
      
      const updatedSolucoes = await getSolucoes();
      setSolucoes(updatedSolucoes);
      setIsModalOpen(false);
      setFormData({} as SolucaoFormData);
      setIsEditing(null);
    } catch (error: any) {
      alert('Erro ao salvar a solução. Por favor, tente novamente.');
      console.error('Error details:', error);
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
    const patterns = [
      /tipo_id: (null|\d+) -> (\d+)/g,
      /categoria_id: (null|\d+) -> (\d+)/g,
      /status_id: (null|\d+) -> (\d+)/g
    ];

    let formattedDesc = descricao;

    patterns.forEach(pattern => {
      formattedDesc = formattedDesc.replace(pattern, (match, oldId, newId) => {
        if (match.startsWith('tipo_id')) {
          const oldTipo = oldId === 'null' ? '-' : tipos.find(t => t.id === Number(oldId))?.nome || oldId;
          const newTipo = tipos.find(t => t.id === Number(newId))?.nome || newId;
          return `Tipo: ${oldTipo} → ${newTipo}`;
        }
        if (match.startsWith('categoria_id')) {
          const oldCategoria = oldId === 'null' ? '-' : categorias.find(c => c.id === Number(oldId))?.nome || oldId;
          const newCategoria = categorias.find(c => c.id === Number(newId))?.nome || newId;
          return `Categoria: ${oldCategoria} → ${newCategoria}`;
        }
        if (match.startsWith('status_id')) {
          const oldStatus = oldId === 'null' ? '-' : statusList.find(s => s.id === Number(oldId))?.nome || oldId;
          const newStatus = statusList.find(s => s.id === Number(newId))?.nome || newId;
          return `Status: ${oldStatus} → ${newStatus}`;
        }
        return match;
      });
    });

    return formattedDesc;
  };

  const handleEditClick = (solucao: SolucaoType) => {
    console.log('Solução para editar:', solucao); // Debug

    // Garantir que todos os IDs sejam números
    const formDataToSet = {
      nome: solucao.nome,
      sigla: solucao.sigla,
      descricao: solucao.descricao,
      versao: solucao.versao,
      tipo_id: Number(solucao.tipo?.id),
      linguagem_id: Number(solucao.linguagem?.id),
      desenvolvedor_id: Number(solucao.desenvolvedor?.id),
      categoria_id: Number(solucao.categoria?.id),
      responsavel_id: Number(solucao.responsavel?.id),
      status_id: Number(solucao.status?.id),
      demanda_id: Number(solucao.demanda?.id),
      data_status: solucao.dataStatus
    };

    console.log('Form data sendo setado:', formDataToSet); // Debug
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
    setFilteredSolucoes(solucoes);
  };

  const filterSolucoes = () => {
    let filtered = [...solucoes] as SolucaoType[];
    
    // Aplicar filtro de texto
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.nome?.toLowerCase().includes(searchLower) ||
        s.sigla?.toLowerCase().includes(searchLower) ||
        s.descricao?.toLowerCase().includes(searchLower) ||
        s.versao?.toLowerCase().includes(searchLower) ||
        s.tipo?.nome.toLowerCase().includes(searchLower) ||
        s.linguagem?.nome.toLowerCase().includes(searchLower) ||
        s.desenvolvedor?.nome.toLowerCase().includes(searchLower) ||
        s.categoria?.nome.toLowerCase().includes(searchLower) ||
        s.responsavel?.nome.toLowerCase().includes(searchLower) ||
        s.status?.nome.toLowerCase().includes(searchLower)
      );
    }
    
    // Aplicar outros filtros existentes
    if (filters.demanda_id) {
      filtered = filtered.filter(s => s.demanda?.id === Number(filters.demanda_id));
    }
    if (filters.tipo_id) {
      filtered = filtered.filter(s => s.tipo?.id === Number(filters.tipo_id));
    }
    if (filters.linguagem_id) {
      filtered = filtered.filter(s => s.linguagem?.id === Number(filters.linguagem_id));
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
    
    setFilteredSolucoes(filtered);
  };

  useEffect(() => {
    filterSolucoes();
  }, [searchTerm, solucoes, filters]);

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

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-7 gap-4">
            <select
              name="demanda_id"
              value={filters.demanda_id}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-bold text-gray-800"
            >
              <option value="">Demanda</option>
              {demanda.map((d) => (
                <option key={d.id} value={d.id}>{d.nome}</option>
              ))}
            </select>

            <select
              name="tipo_id"
              value={filters.tipo_id}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-bold text-gray-800"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-bold text-gray-800"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-bold text-gray-800"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-bold text-gray-800"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-bold text-gray-800"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-bold text-gray-800"
            >
              <option value="">Status</option>
              {statusList.map((s) => (
                <option key={s.id} value={s.id}>{s.nome}</option>
              ))}
            </select>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar soluções..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500 transition duration-200 ease-in-out"
                style={{ backgroundColor: 'white', color: 'black' }}
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Limpar Filtros
              </button>
              <button
                onClick={filterSolucoes}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Aplicar Filtros
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
                            <span className="font-medium text-gray-700">Versão:</span>{' '}
                            <span className="text-gray-900">{selectedDemandDetails.versao}</span>
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Detalhes Técnicos</h3>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">Tipo:</span>{' '}
                            <span className="text-gray-900">{selectedDemandDetails.tipo?.nome}</span>
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">Linguagem:</span>{' '}
                            <span className="text-gray-900">{selectedDemandDetails.linguagem?.nome}</span>
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
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Status e Categoria</h3>
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
                            <span className="font-medium text-gray-700">Categoria:</span>{' '}
                            <span className="text-gray-900">{selectedDemandDetails.categoria?.nome}</span>
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Responsabilidades</h3>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">Desenvolvedor:</span>{' '}
                            <span className="text-gray-900">{selectedDemandDetails.desenvolvedor?.nome}</span>
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">Responsável:</span>{' '}
                            <span className="text-gray-900">{selectedDemandDetails.responsavel?.nome}</span>
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">Demanda:</span>{' '}
                            <span className="text-gray-900">{selectedDemandDetails.demanda?.nome}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flow-root">
                      <ul role="list" className="-mb-8">
                        {historicoSolucao.map((evento: HistoricoType, index: number) => (
                          <li key={evento.id}>
                            <div className="relative pb-8">
                              {index !== historicoSolucao.length - 1 && (
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