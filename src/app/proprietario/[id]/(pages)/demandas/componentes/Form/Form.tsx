'use client'

import { useEffect, useState } from 'react'
import { createDemanda, updateDemanda } from '../../actions/actions'
import { getAlinhamentos, getPrioridades, getResponsaveis } from '../../actions/actions'
import { getStatus } from '../../../solucoes/actions/actions'

interface SelectOption {
    id: number | string
    nome: string
}

interface FormProps {
    demandaToEdit?: any;
    onClose: () => void;
    onSave: () => void;
}

export default function Form({ demandaToEdit, onClose, onSave }: FormProps) {
    const [formData, setFormData] = useState({
        nome: '',
        sigla: '',
        descricao: '',
        demandante: '',
        fator_gerador: '',
        link: '',
        data_status: '',
        proprietario_id: null as number | null,
        alinhamento_id: null as number | string | null,
        prioridade_id: null as number | string | null,
        responsavel_id: null as number | string | null,
        status_id: null as number | string | null,
    });

    useEffect(() => {
        if (demandaToEdit) {
            setFormData({
                ...demandaToEdit,
                data_status: demandaToEdit.data_status ? demandaToEdit.data_status.split('T')[0] : '',
            });
        }
    }, [demandaToEdit]);

    const [alinhamentos, setAlinhamentos] = useState<SelectOption[]>([])
    const [prioridades, setPrioridades] = useState<SelectOption[]>([])
    const [responsaveis, setResponsaveis] = useState<SelectOption[]>([])
    const [status, setStatus] = useState<SelectOption[]>([])
    const [loading, setLoading] = useState<Record<string, boolean>>({})

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            if (demandaToEdit) {
                await updateDemanda(demandaToEdit.id, formData);
            } else {
                await createDemanda(formData)
            }
            onSave();
        } catch (error) {
            console.error("Erro ao salvar demanda:", error)

        } finally {
            setIsSubmitting(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isIdSelect = name.endsWith('_id') && name !== 'proprietario_id';
        const finalValue = isIdSelect ? (value ? Number(value) : null) : value;

        setFormData({
            ...formData,
            [name]: finalValue,
            proprietario_id: localStorage.getItem('selectedProprietarioId') ? Number(localStorage.getItem('selectedProprietarioId')) : null
        });
    }

    const loadSelectOptions = async (
        loader: () => Promise<SelectOption[] | null>,
        setter: React.Dispatch<React.SetStateAction<SelectOption[]>>,
        options: SelectOption[],
        key: string
    ) => {
        if (options.length === 0 && !loading[key]) {
            setLoading(prev => ({ ...prev, [key]: true }))
            try {
                const data = await loader()
                if (data) {
                    setter(data)
                }
            } catch (error) {
                console.error(`Erro ao carregar ${key}:`, error)
            } finally {
                setLoading(prev => ({ ...prev, [key]: false }))
            }
        }
    }

    const title = demandaToEdit ? "Editar Demanda" : "Nova Demanda";
    const submitButtonText = demandaToEdit ? "Salvar" : "Salvar";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-light w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                    >
                        ×
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6 bg-white">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nome - campo completo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nome
                            </label>
                            <input
                                type="text"
                                name="nome"
                                value={formData.nome || ''}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                placeholder="Nome da demanda"
                            />
                        </div>

                        {/* Sigla e Demandante lado a lado */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sigla
                                </label>
                                <input
                                    type="text"
                                    name="sigla"
                                    value={formData.sigla || ''}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    placeholder="Sigla"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Demandante
                                </label>
                                <input
                                    type="text"
                                    name="demandante"
                                    value={formData.demandante || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    placeholder="Nome do demandante"
                                />
                            </div>
                        </div>

                        {/* Descrição - campo completo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descrição
                            </label>
                            <textarea
                                name="descricao"
                                value={formData.descricao || ''}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white resize-none"
                                placeholder="Descrição detalhada da demanda"
                            />
                        </div>

                        {/* Fator Gerador e Link do PCA lado a lado */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fato Gerador
                                </label>
                                <input
                                    type="text"
                                    name="fator_gerador"
                                    value={formData.fator_gerador || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    placeholder="Fator gerador"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Link do PCA
                                </label>
                                <input
                                    type="url"
                                    name="link"
                                    value={formData.link || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    placeholder="https://exemplo.com"
                                />
                            </div>
                        </div>

                        {/* Alinhamento e Prioridade lado a lado */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Alinhamento
                                </label>
                                <select
                                    name="alinhamento_id"
                                    value={formData.alinhamento_id || ''}
                                    onChange={handleChange}
                                    onFocus={() => loadSelectOptions(getAlinhamentos, setAlinhamentos, alinhamentos, 'alinhamentos')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                >
                                    <option value="">{loading['alinhamentos'] ? 'Carregando...' : 'Selecione um alinhamento'}</option>
                                    {alinhamentos.map((item) => (
                                        <option key={item.id} value={item.id}>{item.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Prioridade
                                </label>
                                <select
                                    name="prioridade_id"
                                    value={formData.prioridade_id || ''}
                                    onChange={handleChange}
                                    onFocus={() => loadSelectOptions(getPrioridades, setPrioridades, prioridades, 'prioridades')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                >
                                    <option value="">{loading['prioridades'] ? 'Carregando...' : 'Selecione uma prioridade'}</option>
                                    {prioridades.map((item) => (
                                        <option key={item.id} value={item.id}>{item.nome}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Responsável e Status lado a lado */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Responsável
                                </label>
                                <select
                                    name="responsavel_id"
                                    value={formData.responsavel_id || ''}
                                    onChange={handleChange}
                                    onFocus={() => loadSelectOptions(getResponsaveis, setResponsaveis, responsaveis, 'responsaveis')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                >
                                    <option value="">{loading['responsaveis'] ? 'Carregando...' : 'Selecione um responsável'}</option>
                                    {responsaveis.map((item) => (
                                        <option key={item.id} value={item.id}>{item.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    name="status_id"
                                    value={formData.status_id || ''}
                                    onChange={handleChange}
                                    onFocus={() => loadSelectOptions(getStatus, setStatus, status, 'status')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                >
                                    <option value="">{loading['status'] ? 'Carregando...' : 'Selecione um status'}</option>
                                    {status.map((item) => (
                                        <option key={item.id} value={item.id}>{item.nome}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Data Status */}
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data Status
                            </label>
                            <input
                                type="date"
                                name="data_status"
                                value={formData.data_status || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            />
                        </div>

                        {/* Botões */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 bg-white">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed font-medium"
                            >
                                {isSubmitting ? 'Salvando...' : submitButtonText}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}