'use client'

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { BaseType } from '../../types/types';
import { updateSolucao, getSolucaoById } from '../../actions/actions';

interface HistoricoModalProps {
  isOpen: boolean;
  onClose: () => void;
  solucaoId: number;
  responsaveis: BaseType[];
  formatDate: (date: string) => string;
}

interface TimeFormData {
  responsavel_id: number;
  funcao: string;
  dataInicio: string;
  dataFim: string;
}

interface AtualizacaoFormData {
  nome: string;
  descricao: string;
  data_atualizacao: string;
}

interface FormData {
  times: Array<TimeFormData & { id: number }>;
  atualizacoes: Array<AtualizacaoFormData & { id: number }>;
}

export default function HistoricoModal({ isOpen, onClose, solucaoId, responsaveis, formatDate }: HistoricoModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    times: [],
    atualizacoes: []
  });

  const [timeFormData, setTimeFormData] = useState<TimeFormData>({
    responsavel_id: 0,
    funcao: '',
    dataInicio: '',
    dataFim: ''
  });
    
  const [atualizacaoFormData, setAtualizacaoFormData] = useState<AtualizacaoFormData>({
    nome: '',
    descricao: '',
    data_atualizacao: ''
  });

  const [activeFormTab, setActiveFormTab] = useState<'times' | 'atualizacoes'>('times');

  useEffect(() => {
    const loadExistingData = async () => {
      if (isOpen && solucaoId) {
        try {
          setIsLoading(true);
          const solucao = await getSolucaoById(String(solucaoId));
          
          if (solucao) {
            // Parse dos dados existentes
            const existingTimes = solucao.times ? 
              (typeof solucao.times === 'string' ? JSON.parse(solucao.times) : solucao.times) : [];
            const existingAtualizacoes = solucao.atualizacoes ? 
              (typeof solucao.atualizacoes === 'string' ? JSON.parse(solucao.atualizacoes) : solucao.atualizacoes) : [];

            // Adicionar IDs locais se não existirem
            const timesWithIds = existingTimes.map((time: any, index: number) => ({
              id: time.id || index + 1,
              responsavel_id: time.responsavel_id,
              funcao: time.funcao,
              dataInicio: time.data_inicio || time.dataInicio,
              dataFim: time.data_fim || time.dataFim
            }));

            const atualizacoesWithIds = existingAtualizacoes.map((atualizacao: any, index: number) => ({
              id: atualizacao.id || index + 1,
              nome: atualizacao.nome,
              descricao: atualizacao.descricao,
              data_atualizacao: atualizacao.data_atualizacao
            }));

            setFormData({
              times: timesWithIds,
              atualizacoes: atualizacoesWithIds
            });
          }
        } catch (error) {
          console.error('Erro ao carregar dados existentes:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadExistingData();
  }, [isOpen, solucaoId]);

  const handleTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
        
    // Get the current highest ID from existing times
    const currentHighestId = formData.times?.length 
      ? Math.max(...formData.times.map(time => time.id))
      : 0;
        
    // Create new time entry with incremented ID
    const newTime = {
      id: currentHighestId + 1,
      ...timeFormData
    };
    
    setFormData(prev => ({
      ...prev,
      times: [...prev.times, newTime]
    }));
        
    setTimeFormData({
      responsavel_id: 0,
      funcao: '',
      dataInicio: '',
      dataFim: ''
    });
  };
    
  const handleAtualizacaoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
        
    // Get the current highest ID from existing updates
    const currentHighestId = formData.atualizacoes?.length 
      ? Math.max(...formData.atualizacoes.map(atualizacao => atualizacao.id))
      : 0;
        
    // Create new update entry with incremented ID
    const newAtualizacao = {
      id: currentHighestId + 1,
      ...atualizacaoFormData
    };
    
    setFormData(prev => ({
      ...prev,
      atualizacoes: [...prev.atualizacoes, newAtualizacao]
    }));
        
    setAtualizacaoFormData({
      nome: '',
      descricao: '',
      data_atualizacao: ''
    });
  };
    
  const handleTimeDelete = (index: number) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };
    
  const handleAtualizacaoDelete = (index: number) => {
    setFormData(prev => ({
      ...prev,
      atualizacoes: prev.atualizacoes.filter((_, i) => i !== index)
    }));
  };
    
  const handleSaveHistorico = async () => {
    try {
      // Formatar os times
      const formattedTimes = formData.times.map(({ id, ...time }) => ({
        responsavel_id: Number(time.responsavel_id),
        funcao: time.funcao,
        data_inicio: time.dataInicio,
        data_fim: time.dataFim
      }));

      // Formatar as atualizações
      const formattedAtualizacoes = formData.atualizacoes.map(({ id, ...atualizacao }) => ({
        nome: atualizacao.nome,
        descricao: atualizacao.descricao,
        data_atualizacao: atualizacao.data_atualizacao
      }));

      // Importante: Converter para string JSON
      const historicoData = {
        times: JSON.stringify(formattedTimes),
        atualizacoes: JSON.stringify(formattedAtualizacoes)
      };

      console.log('Dados sendo enviados:', {
        solucaoId,
        historicoData
      });

      await updateSolucao(String(solucaoId), historicoData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-lg p-6">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] overflow-y-auto">
      <div className="relative bg-white rounded-lg shadow-2xl p-8 w-full max-w-4xl m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Histórico da Solução
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              className={`py-3 px-6 focus:outline-none transition-colors ${
                activeFormTab === 'times'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveFormTab('times')}
            >
              Times
            </button>
            <button
              className={`py-3 px-6 focus:outline-none transition-colors ${
                activeFormTab === 'atualizacoes'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveFormTab('atualizacoes')}
            >
              Atualizações
            </button>
          </div>
        </div>

        {activeFormTab === 'times' ? (
          <div>
            <form onSubmit={handleTimeSubmit} className="space-y-4 mb-6 p-5 border rounded-md bg-gray-50">
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                Adicionar Novo Time
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Responsável
                  </label>
                  <select
                    value={timeFormData.responsavel_id}
                    onChange={(e) => setTimeFormData({ ...timeFormData, responsavel_id: Number(e.target.value) })}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                  >
                    <option value="">Selecione um responsável</option>
                    {responsaveis.map((responsavel) => (
                      <option key={responsavel.id} value={responsavel.id}>
                        {responsavel.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Função
                  </label>
                  <input
                    type="text"
                    value={timeFormData.funcao}
                    onChange={(e) => setTimeFormData({ ...timeFormData, funcao: e.target.value })}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                    placeholder="Ex: Desenvolvedor, Tech Lead"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={timeFormData.dataInicio}
                    onChange={(e) => setTimeFormData({ ...timeFormData, dataInicio: e.target.value })}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={timeFormData.dataFim}
                    onChange={(e) => setTimeFormData({ ...timeFormData, dataFim: e.target.value })}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Time
                </button>
              </div>
            </form>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Histórico de Times da Solução</h3>
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                {formData.times && formData.times.length > 0 ? (
                  formData.times
                    .sort((a, b) => new Date(a.dataInicio || '').getTime() - new Date(b.dataInicio || '').getTime())
                    .map((time, index) => {
                      const responsavel = responsaveis.find(r => r.id === time.responsavel_id);
                      return (
                        <div
                          key={time.id}
                          className="p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium text-gray-800 text-sm">
                                {responsavel?.nome || `ID: ${time.responsavel_id}`}
                              </h4>
                              <p className="text-xs text-gray-500 mt-0.5">{time.funcao || '-'}</p>
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              {formatDate(time.dataInicio)}
                              <span className="mx-1.5">→</span>
                              <span className={time.dataFim ? 'text-gray-600' : 'text-green-600 font-medium'}>
                                {time.dataFim ? formatDate(time.dataFim) : 'Atual'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleTimeDelete(index)}
                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                title="Excluir time"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                    Nenhum time adicionado a esta solução ainda.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <form onSubmit={handleAtualizacaoSubmit} className="space-y-4 mb-6 p-5 border rounded-md bg-gray-50">
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                Adicionar Nova Atualização
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nome da Atualização
                  </label>
                  <input
                    type="text"
                    value={atualizacaoFormData.nome}
                    onChange={(e) => setAtualizacaoFormData({ ...atualizacaoFormData, nome: e.target.value })}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                    placeholder="Ex: Correção de bug, Nova funcionalidade"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Data da Atualização
                  </label>
                  <input
                    type="date"
                    value={atualizacaoFormData.data_atualizacao}
                    onChange={(e) => setAtualizacaoFormData({ ...atualizacaoFormData, data_atualizacao: e.target.value })}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Descrição
                  </label>
                  <textarea
                    value={atualizacaoFormData.descricao}
                    onChange={(e) => setAtualizacaoFormData({ ...atualizacaoFormData, descricao: e.target.value })}
                    rows={3}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                    placeholder="Descreva as alterações realizadas..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Atualização
                </button>
              </div>
            </form>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Histórico de Atualizações da Solução</h3>
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                {formData.atualizacoes && formData.atualizacoes.length > 0 ? (
                  formData.atualizacoes
                    .sort((a, b) => new Date(b.data_atualizacao || '').getTime() - new Date(a.data_atualizacao || '').getTime())
                    .map((atualizacao, index) => (
                      <div
                        key={atualizacao.id}
                        className="p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-800 text-sm">
                              {atualizacao.nome}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">{atualizacao.descricao}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-xs text-gray-600">
                              {formatDate(atualizacao.data_atualizacao)}
                            </div>
                            <button
                              onClick={() => handleAtualizacaoDelete(index)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                              title="Excluir atualização"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                    Nenhuma atualização registrada para esta solução ainda.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveHistorico}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm transition-colors"
            >
              Registrar Histórico
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
