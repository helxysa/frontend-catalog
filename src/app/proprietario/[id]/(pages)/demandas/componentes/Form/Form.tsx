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
                alert('Demanda atualizada com sucesso!');
            } else {
                await createDemanda(formData)
                alert('Demanda criada')
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
    const submitButtonText = demandaToEdit ? "Salvar Alterações" : "Criar Demanda";

    return (
        <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>

            <form onSubmit={handleSubmit} className="space-y-3">
                {/* Grid para campos principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Nome e Sigla na mesma linha */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Nome *
                        </label>
                        <input
                            type="text"
                            name="nome"
                            value={formData.nome || ''}
                            onChange={handleChange}
                            required
                            className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Nome da demanda"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Sigla *
                        </label>
                        <input
                            type="text"
                            name="sigla"
                            value={formData.sigla || ''}
                            onChange={handleChange}
                            required
                            className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Sigla"
                        />
                    </div>

                    {/* Demandante e Fator Gerador */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Demandante
                        </label>
                        <input
                            type="text"
                            name="demandante"
                            value={formData.demandante || ''}
                            onChange={handleChange}
                            className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Nome do demandante"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Fator Gerador
                        </label>
                        <input
                            type="text"
                            name="fator_gerador"
                            value={formData.fator_gerador || ''}
                            onChange={handleChange}
                            className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Fator gerador"
                        />
                    </div>

                    {/* Alinhamento e Prioridade */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Alinhamento
                        </label>
                        <select
                            name="alinhamento_id"
                            value={formData.alinhamento_id || ''}
                            onChange={handleChange}
                            onFocus={() => loadSelectOptions(getAlinhamentos, setAlinhamentos, alinhamentos, 'alinhamentos')}
                            className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                            <option value="">{loading['alinhamentos'] ? 'Carregando...' : 'Selecione'}</option>
                            {alinhamentos.map((item) => (
                                <option key={item.id} value={item.id}>{item.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Prioridade
                        </label>
                        <select
                            name="prioridade_id"
                            value={formData.prioridade_id || ''}
                            onChange={handleChange}
                            onFocus={() => loadSelectOptions(getPrioridades, setPrioridades, prioridades, 'prioridades')}
                            className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                            <option value="">{loading['prioridades'] ? 'Carregando...' : 'Selecione'}</option>
                            {prioridades.map((item) => (
                                <option key={item.id} value={item.id}>{item.nome}</option>
                            ))}
                        </select>
                    </div>

                    {/* Responsável e Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Responsável
                        </label>
                        <select
                            name="responsavel_id"
                            value={formData.responsavel_id || ''}
                            onChange={handleChange}
                            onFocus={() => loadSelectOptions(getResponsaveis, setResponsaveis, responsaveis, 'responsaveis')}
                            className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                            <option value="">{loading['responsaveis'] ? 'Carregando...' : 'Selecione'}</option>
                            {responsaveis.map((item) => (
                                <option key={item.id} value={item.id}>{item.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            name="status_id"
                            value={formData.status_id || ''}
                            onChange={handleChange}
                            onFocus={() => loadSelectOptions(getStatus, setStatus, status, 'status')}
                            className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                            <option value="">{loading['status'] ? 'Carregando...' : 'Selecione'}</option>
                            {status.map((item) => (
                                <option key={item.id} value={item.id}>{item.nome}</option>
                            ))}
                        </select>
                    </div>

                    {/* Data Status e Link */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Data Status
                        </label>
                        <input
                            type="date"
                            name="data_status"
                            value={formData.data_status || ''}
                            onChange={handleChange}
                            className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Link
                        </label>
                        <input
                            type="url"
                            name="link"
                            value={formData.link || ''}
                            onChange={handleChange}
                            className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="https://exemplo.com"
                        />
                    </div>
                </div>

                {/* Descrição em largura completa */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Descrição
                    </label>
                    <textarea
                        name="descricao"
                        value={formData.descricao || ''}
                        onChange={handleChange}
                        rows={2}
                        className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Descrição detalhada da demanda"
                    />
                </div>

                {/* Botões */}
                <div className="flex justify-end gap-2 pt-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 focus:ring-1 focus:ring-gray-500 focus:ring-offset-1 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Salvando...' : submitButtonText}
                    </button>
                </div>
            </form>
        </div>
    )
}