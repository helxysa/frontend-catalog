'use client'

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { SolucaoType } from '../../../types/types';
import { updateSolucao, getSolucaoById, getResponsaveis } from '../../../actions/actions';
import { useToast } from "@/hooks/use-toast"


interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    solucaoId: number;
    formatDate: (date: string) => string;
    onUpdate?: () => void;
}

interface TimeFormData {
    responsavel_id: number | null;
    funcao: string;
    dataInicio: string;
    dataFim: string;
}

interface AtualizacaoFormData {
    nome: string;
    descricao: string;
    data_atualizacao: string;
}

export default function HistoricoModal({ isOpen, onClose, solucaoId, formatDate, onUpdate }: ModalProps) {
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast()
    const [activeFormTab, setActiveFormTab] = useState<'times' | 'atualizacoes'>('times');
    const [formData, setFormData] = useState<SolucaoType | null>(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [responsaveis, setResponsaveis] = useState<Array<{ id: number; nome: string }>>([]);
    const [responsaveisLoaded, setResponsaveisLoaded] = useState(false);

    const [timeFormData, setTimeFormData] = useState<TimeFormData>({
        responsavel_id: null,
        funcao: '',
        dataInicio: '',
        dataFim: ''
    });

    const [atualizacaoFormData, setAtualizacaoFormData] = useState<AtualizacaoFormData>({
        nome: '',
        descricao: '',
        data_atualizacao: new Date().toISOString().split('T')[0]
    });

    // Função para carregar responsáveis
    const loadResponsaveis = async () => {
        if (responsaveisLoaded) return;

        try {
            const data = await getResponsaveis();
            if (data) {
                setResponsaveis(data);
                setResponsaveisLoaded(true);
            }
        } catch (error) {
            console.error('Erro ao carregar responsáveis:', error);
        }
    };

    // Função para carregar dados da solução
    const loadSolucaoData = async () => {
        if (!solucaoId || isDataLoaded) return;

        try {
            setIsLoading(true);
            const solucao = await getSolucaoById(solucaoId.toString());

            // Filtrar times válidos (que tenham responsavel_id)
            const timesValidos = solucao.times ?
                solucao.times.filter((time: { responsavel_id: null | undefined; }) => time.responsavel_id !== null && time.responsavel_id !== undefined) :
                [];

            // Filtrar atualizações válidas (que tenham nome)
            const atualizacoesValidas = Array.isArray(solucao.atualizacoes) ?
                solucao.atualizacoes.filter((atualizacao: { nome: string; }) => atualizacao.nome && atualizacao.nome.trim() !== '') :
                [];

            setFormData({
                ...solucao,
                times: timesValidos,
                atualizacoes: atualizacoesValidas
            });
            setIsDataLoaded(true);
        } catch (error) {
            console.error('Erro ao carregar dados da solução:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Carregar dados quando o modal abrir
    useEffect(() => {
        if (isOpen && solucaoId) {
            loadSolucaoData();
        }
    }, [isOpen, solucaoId]);

    // Reset quando modal fechar
    useEffect(() => {
        if (!isOpen) {
            setIsDataLoaded(false);
            setFormData(null);
            setResponsaveisLoaded(false);
            setResponsaveis([]);
            setTimeFormData({
                responsavel_id: null,
                funcao: '',
                dataInicio: '',
                dataFim: ''
            });
            setAtualizacaoFormData({
                nome: '',
                descricao: '',
                data_atualizacao: new Date().toISOString().split('T')[0]
            });
        }
    }, [isOpen]);

    // Função para adicionar time
    const handleTimeSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!timeFormData.responsavel_id || !timeFormData.funcao || !timeFormData.dataInicio) {
            alert('Por favor, preencha todos os campos obrigatórios do time.');
            return;
        }

        if (!formData) return;

        const newTime = {
            id: Date.now(), // ID temporário
            responsavel_id: timeFormData.responsavel_id,
            funcao: timeFormData.funcao,
            dataInicio: timeFormData.dataInicio,
            dataFim: timeFormData.dataFim
        };

        setFormData({
            ...formData,
            times: [...(formData.times || []), newTime]
        });

        // Reset form
        setTimeFormData({
            responsavel_id: null,
            funcao: '',
            dataInicio: '',
            dataFim: ''
        });
 
    };

    // Função para adicionar atualização
    const handleAtualizacaoSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!atualizacaoFormData.nome || !atualizacaoFormData.data_atualizacao) {
            alert('Por favor, preencha todos os campos obrigatórios da atualização.');
            return;
        }

        if (!formData) return;

        const newAtualizacao = {
            id: Date.now(), // ID temporário
            nome: atualizacaoFormData.nome,
            descricao: atualizacaoFormData.descricao,
            data_atualizacao: atualizacaoFormData.data_atualizacao
        };

        const currentAtualizacoes = Array.isArray(formData.atualizacoes)
            ? formData.atualizacoes
            : [];

        setFormData({
            ...formData,
            atualizacoes: [...currentAtualizacoes, newAtualizacao]
        });

        // Reset form
        setAtualizacaoFormData({
            nome: '',
            descricao: '',
            data_atualizacao: new Date().toISOString().split('T')[0]
        });

        
    };

    // Função para remover time
    const handleTimeDelete = (index: number) => {
        if (!formData || !formData.times) return;

        const updatedTimes = formData.times.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            times: updatedTimes
        });
    };

    // Função para remover atualização
    const handleAtualizacaoDelete = (index: number) => {
        if (!formData || !Array.isArray(formData.atualizacoes)) return;

        const updatedAtualizacoes = formData.atualizacoes.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            atualizacoes: updatedAtualizacoes
        });
    };

    // Função para salvar histórico
    const handleSaveHistorico = async () => {
        if (!formData || !solucaoId) return;

        try {
            setIsLoading(true);

            const dataToUpdate = {
                times: JSON.stringify(formData.times || []),
                atualizacoes: JSON.stringify(formData.atualizacoes || [])
            };

            await updateSolucao(String(solucaoId), dataToUpdate);

            if (onUpdate) {
                onUpdate();
            }

            onClose();
            toast({
                title: "Histórico Registrado.",
                description: "O histórico foi registrado com sucesso.",
                variant: "success",
                duration: 1700,
              });    
        } catch (error) {
            console.error('Erro ao salvar histórico:', error);
            alert('Erro ao salvar histórico. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    // Função para carregar dados quando o select receber foco
    const handleSelectFocus = async () => {
        if (!isDataLoaded) {
            await loadSolucaoData();
        }
        if (!responsaveisLoaded) {
            await loadResponsaveis();
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
                            className={`py-3 px-6 focus:outline-none transition-colors ${activeFormTab === 'times'
                                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveFormTab('times')}
                        >
                            Times
                        </button>
                        <button
                            className={`py-3 px-6 focus:outline-none transition-colors ${activeFormTab === 'atualizacoes'
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
                                        Responsável *
                                    </label>
                                    <select
                                        value={timeFormData.responsavel_id || ''}
                                        onChange={(e) => setTimeFormData({ ...timeFormData, responsavel_id: Number(e.target.value) || null })}
                                        onFocus={handleSelectFocus}
                                        className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                                        required
                                    >
                                        <option value="">
                                            {responsaveisLoaded ? 'Selecione um responsável' : 'Carregando...'}
                                        </option>
                                        {responsaveis.map((responsavel) => (
                                            <option key={responsavel.id} value={responsavel.id}>
                                                {responsavel.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Função *
                                    </label>
                                    <input
                                        type="text"
                                        value={timeFormData.funcao}
                                        onChange={(e) => setTimeFormData({ ...timeFormData, funcao: e.target.value })}
                                        className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                                        placeholder="Ex: Desenvolvedor, Tech Lead"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Data Início *
                                    </label>
                                    <input
                                        type="date"
                                        value={timeFormData.dataInicio}
                                        onChange={(e) => setTimeFormData({ ...timeFormData, dataInicio: e.target.value })}
                                        className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                                        required
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
                                {formData?.times && formData.times.length > 0 ? (
                                    formData.times
                                        .sort((a, b) => new Date(a.dataInicio || '').getTime() - new Date(b.dataInicio || '').getTime())
                                        .map((time, index) => {
                                            const responsavel = responsaveis.find(r => r.id === time.responsavel_id);
                                            return (
                                                <div
                                                    key={time.id || index}
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
                                        Nenhum time registrado para esta solução ainda.
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
                                        Nome da Atualização *
                                    </label>
                                    <input
                                        type="text"
                                        value={atualizacaoFormData.nome}
                                        onChange={(e) => setAtualizacaoFormData({ ...atualizacaoFormData, nome: e.target.value })}
                                        className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                                        placeholder="Ex: Correção de bug, Nova funcionalidade"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Data da Atualização *
                                    </label>
                                    <input
                                        type="date"
                                        value={atualizacaoFormData.data_atualizacao}
                                        onChange={(e) => setAtualizacaoFormData({ ...atualizacaoFormData, data_atualizacao: e.target.value })}
                                        className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                                        required
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
                                {formData?.atualizacoes && Array.isArray(formData.atualizacoes) && formData.atualizacoes.length > 0 ? (
                                    formData.atualizacoes
                                        .sort((a, b) => new Date(b.data_atualizacao || '').getTime() - new Date(a.data_atualizacao || '').getTime())
                                        .map((atualizacao, index) => (
                                            <div
                                                key={atualizacao.id || index}
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
                            disabled={isLoading}
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Salvando...' : 'Registrar Histórico'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}