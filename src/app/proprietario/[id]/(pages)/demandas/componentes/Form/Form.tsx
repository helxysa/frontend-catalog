'use client'

import { useEffect, useState } from 'react'
import { createDemanda, updateDemanda } from '../../actions/actions'
import { getAlinhamentos, getPrioridades, getResponsaveis } from '../../actions/actions'
import { getStatus } from '../../../solucoes/actions/actions'
import { useToast } from "@/hooks/use-toast"
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
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        nome: '',
        sigla: '',
        descricao: '',
        demandante: '',
        fator_gerador: '',
        link: '',
        dataStatus: '',
        proprietario_id: null as number | null,
        alinhamento_id: null as number | string | null,
        prioridade_id: null as number | string | null,
        responsavel_id: null as number | string | null,
        status_id: null as number | string | null,
    });

    const [alinhamentos, setAlinhamentos] = useState<SelectOption[]>([])
    const [prioridades, setPrioridades] = useState<SelectOption[]>([])
    const [responsaveis, setResponsaveis] = useState<SelectOption[]>([])
    const [status, setStatus] = useState<SelectOption[]>([])
    const [loading, setLoading] = useState<Record<string, boolean>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const proprietarioId = localStorage.getItem('selectedProprietarioId') ? Number(localStorage.getItem('selectedProprietarioId')) : null;

        if (demandaToEdit) {
            setFormData({
                ...demandaToEdit,
                proprietario_id: proprietarioId,
                alinhamento_id: demandaToEdit.alinhamento?.id ?? demandaToEdit.alinhamento_id,
                prioridade_id: demandaToEdit.prioridade?.id ?? demandaToEdit.prioridade_id,
                responsavel_id: demandaToEdit.responsavel?.id ?? demandaToEdit.responsavel_id,
                status_id: demandaToEdit.status?.id ?? demandaToEdit.status_id,
                dataStatus: (() => {
                    const dateStr = demandaToEdit.dataStatus || demandaToEdit.data_status;
                    if (!dateStr) return '';

                    // Tratamento de data para evitar problemas de fuso horário
                    const date = new Date(dateStr);
                    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
                    return date.toISOString().split('T')[0];
                })(),
            });

            if (demandaToEdit.alinhamento) setAlinhamentos([demandaToEdit.alinhamento]);
            if (demandaToEdit.prioridade) setPrioridades([demandaToEdit.prioridade]);
            if (demandaToEdit.responsavel) setResponsaveis([demandaToEdit.responsavel]);
            if (demandaToEdit.status) setStatus([demandaToEdit.status]);

        } else {
            setFormData(prev => ({ ...prev, proprietario_id: proprietarioId }));
        }
    }, [demandaToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const payload = {
            ...formData,
            data_status: formData.dataStatus || null
        };
        delete (payload as any).dataStatus;

        try {
            if (demandaToEdit) {
                await updateDemanda(demandaToEdit.id, payload);
                toast({
                    title: "Demanda editada.",
                    description: "A sua demanda foi editada.",
                    variant: "success",
                    duration: 1700,
                });
            } else {
                await createDemanda(payload)
                toast({
                    title: "Demanda criada.",
                    description: "A sua demanda foi criada.",
                    variant: "success",
                    duration: 1700,
                });
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
        const isIdSelect = name.endsWith('_id');
        const finalValue = isIdSelect ? (value ? Number(value) : null) : value;

        setFormData(prev => ({
            ...prev,
            [name]: finalValue,
        }));
    }

    const loadSelectOptions = async (
        loader: () => Promise<SelectOption[] | null>,
        setter: React.Dispatch<React.SetStateAction<SelectOption[]>>,
        key: string
    ) => {
        if (!loading[key]) {
            setLoading(prev => ({ ...prev, [key]: true }))
            try {
                const data = await loader()
                if (data) setter(data);
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
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    <button type="button" onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-light w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
                        ×
                    </button>
                </div>

                <div className="p-6 bg-white">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                            <input
                                type="text" name="nome" value={formData.nome || ''} onChange={handleChange} required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nome da demanda"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sigla</label>
                                <input
                                    type="text" name="sigla" value={formData.sigla || ''} onChange={handleChange} required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Sigla"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Demandante</label>
                                <input
                                    type="text" name="demandante" value={formData.demandante || ''} onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nome do demandante"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                            <textarea
                                name="descricao" value={formData.descricao || ''} onChange={handleChange} rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Descrição detalhada da demanda"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fator Gerador</label>
                                <input
                                    type="text" name="fator_gerador" value={formData.fator_gerador || ''} onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Fator gerador"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Link do PCA</label>
                                <input
                                    type="url" name="link" value={formData.link || ''} onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://exemplo.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alinhamento</label>
                                <select name="alinhamento_id" value={formData.alinhamento_id || ''} onChange={handleChange}
                                    onFocus={() => {
                                        const proprietarioId = localStorage.getItem('selectedProprietarioId');
                                        if (proprietarioId) {
                                            loadSelectOptions(() => getAlinhamentos(Number(proprietarioId)), setAlinhamentos, 'alinhamentos')
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">{loading['alinhamentos'] ? 'Carregando...' : 'Selecione'}</option>
                                    {alinhamentos.map((item) => (<option key={item.id} value={item.id}>{item.nome}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                                <select name="prioridade_id" value={formData.prioridade_id || ''} onChange={handleChange}
                                    onFocus={() => loadSelectOptions(getPrioridades, setPrioridades, 'prioridades')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">{loading['prioridades'] ? 'Carregando...' : 'Selecione'}</option>
                                    {prioridades.map((item) => (<option key={item.id} value={item.id}>{item.nome}</option>))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                                <select name="responsavel_id" value={formData.responsavel_id || ''} onChange={handleChange}
                                    onFocus={() => loadSelectOptions(getResponsaveis, setResponsaveis, 'responsaveis')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">{loading['responsaveis'] ? 'Carregando...' : 'Selecione'}</option>
                                    {responsaveis.map((item) => (<option key={item.id} value={item.id}>{item.nome}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select name="status_id" value={formData.status_id || ''} onChange={handleChange}
                                    onFocus={() => loadSelectOptions(getStatus, setStatus, 'status')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">{loading['status'] ? 'Carregando...' : 'Selecione'}</option>
                                    {status.map((item) => (<option key={item.id} value={item.id}>{item.nome}</option>))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data Status</label>
                            <input type="date" name="dataStatus" value={formData.dataStatus || ''} onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium">
                                Cancelar
                            </button>
                            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 font-medium">
                                {isSubmitting ? 'Salvando...' : submitButtonText}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}