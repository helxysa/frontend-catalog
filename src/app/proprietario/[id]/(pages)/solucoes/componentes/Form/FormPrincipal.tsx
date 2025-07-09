'use client'

import { useEffect, useState, useMemo, useCallback } from 'react';
import { getDemandas, getSolucoes, createSolucao, getStatus, getLinguagens, getResponsaveis, getCategorias, getDesenvolvedores, getTipos, updateSolucao, getSolucaoById } from '../../actions/actions';
import { SolucaoType } from '../../types/types';

interface FormPrincipalProps {
    onClose: () => void;
    onSuccess: () => void;
    initialData: SolucaoType | null;
}

const emptyFormState: SolucaoType = {
    id: null,
    proprietario_id: null,
    nome: '',
    sigla: '',
    descricao: '',
    versao: '',
    repositorio: '',
    tipoId: null,
    link: '',
    andamento: '',
    criticidade: '',
    linguagemId: null,
    timeId: null,
    desenvolvedorId: null,
    categoriaId: null,
    responsavelId: null,
    statusId: null,
    demandaId: null,
    dataStatus: '',
    createdAt: '',
    updatedAt: '',
    tipo: { id: null, nome: '' },
    desenvolvedor: { id: null, nome: '' },
    categoria: { id: null, nome: '' },
    responsavel: { id: null, nome: '' },
    status: { id: null, nome: '', propriedade: '' },
    demanda: {
        id: null,
        nome: '',
        fatorGerador: '',
        alinhamento: { id: null, nome: '' },
    },
    times: [
        {
            responsavel_id: null,
            funcao: '',
            dataInicio: '',
            dataFim: '',
        },
    ],
    atualizacoes: {
        nome: '',
        descricao: '',
        data_atualizacao: '',
    },
};

export default function FormPrincipal({ onClose, onSuccess, initialData }: FormPrincipalProps) {
    const [demandas, setDemandas] = useState<any[]>([]);
    const [tipos, setTipos] = useState<any[]>([]);
    const [tecnologias, setTecnologia] = useState<any[]>([]);
    const [desenvolvedores, setDesenvolvedor] = useState<any[]>([]);
    const [status, setStatus] = useState<any[]>([]);
    const [responsavel, setResponsavel] = useState<any[]>([]);
    const [categoria, setCategoria] = useState<any[]>([]);
    const [loadingSelectItems, setLoadingSelectItems] = useState(true);
    const [formData, setFormData] = useState<SolucaoType>(emptyFormState);

    const isEditing = useMemo(() => !!initialData, [initialData]);

    const carregarDemandas = useCallback(async () => {
        if ((isEditing && demandas.length > 1) || (!isEditing && demandas.length > 0)) return;
        const storedId = localStorage.getItem('selectedProprietarioId');
        if (storedId) setDemandas(await getDemandas(storedId) || []);
    }, [isEditing, demandas.length]);

    const carregarTipos = useCallback(async () => {
        if ((isEditing && tipos.length > 1) || (!isEditing && tipos.length > 0)) return;
        setTipos(await getTipos() || []);
    }, [isEditing, tipos.length]);

    const carregarTecnologias = useCallback(async () => {
        if ((isEditing && tecnologias.length > 1) || (!isEditing && tecnologias.length > 0)) return;
        setTecnologia(await getLinguagens() || []);
    }, [isEditing, tecnologias.length]);

    const carregarDesenvolvedores = useCallback(async () => {
        if ((isEditing && desenvolvedores.length > 1) || (!isEditing && desenvolvedores.length > 0)) return;
        setDesenvolvedor(await getDesenvolvedores() || []);
    }, [isEditing, desenvolvedores.length]);

    const carregarStatus = useCallback(async () => {
        if ((isEditing && status.length > 1) || (!isEditing && status.length > 0)) return;
        setStatus(await getStatus() || []);
    }, [isEditing, status.length]);

    const carregarResponsaveis = useCallback(async () => {
        if ((isEditing && responsavel.length > 1) || (!isEditing && responsavel.length > 0)) return;
        setResponsavel(await getResponsaveis() || []);
    }, [isEditing, responsavel.length]);

    const carregarCategorias = useCallback(async () => {
        if ((isEditing && categoria.length > 1) || (!isEditing && categoria.length > 0)) return;
        setCategoria(await getCategorias() || []);
    }, [isEditing, categoria.length]);


    useEffect(() => {
        const loadInitialData = async () => {
            if (isEditing && initialData?.id) {
                setLoadingSelectItems(true);
                try {
                    const fullSolucao = await getSolucaoById(String(initialData.id));
                    if (fullSolucao) {
                        setFormData({
                            ...fullSolucao,
                            linguagemId: fullSolucao.linguagens?.map((l: any) => l.id).join(',') || null,
                            dataStatus: fullSolucao.dataStatus ? new Date(fullSolucao.dataStatus).toISOString().split('T')[0] : '',
                        });
                        // Pré-popula os selects com os dados da solução para exibição
                        if (fullSolucao.demanda) setDemandas([fullSolucao.demanda]);
                        if (fullSolucao.tipo) setTipos([fullSolucao.tipo]);
                        if (fullSolucao.linguagens) setTecnologia(fullSolucao.linguagens);
                        if (fullSolucao.desenvolvedor) setDesenvolvedor([fullSolucao.desenvolvedor]);
                        if (fullSolucao.status) setStatus([fullSolucao.status]);
                        if (fullSolucao.responsavel) setResponsavel([fullSolucao.responsavel]);
                        if (fullSolucao.categoria) setCategoria([fullSolucao.categoria]);
                    }
                } catch (error) {
                    console.error("Erro ao carregar dados da solução para edição", error);
                } finally {
                    setLoadingSelectItems(false);
                }
            } else {
                setFormData(emptyFormState);
                setDemandas([]);
                setTipos([]);
                setTecnologia([]);
                setDesenvolvedor([]);
                setStatus([]);
                setResponsavel([]);
                setCategoria([]);
            }
        };
        loadInitialData();
    }, [initialData, isEditing]);


    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            const storedId = localStorage.getItem('selectedProprietarioId')
            if (!storedId) {
                alert('Proprietário não encontrado')
                return;
            }

            const finalData = {
                ...formData,
                proprietario_id: Number(storedId),
                demanda_id: formData.demandaId,
                tipo_id: formData.tipoId,
                linguagem_id: formData.linguagemId,
                desenvolvedor_id: formData.desenvolvedorId,
                categoria_id: formData.categoriaId,
                responsavel_id: formData.responsavelId,
                status_id: formData.statusId,
                times: JSON.stringify(formData.times),
                atualizacoes: JSON.stringify(formData.atualizacoes)
            };

            delete (finalData as any).tipo;
            delete (finalData as any).desenvolvedor;
            delete (finalData as any).categoria;
            delete (finalData as any).responsavel;
            delete (finalData as any).status;
            delete (finalData as any).demanda;
            delete (finalData as any).createdAt;
            delete (finalData as any).updatedAt;

            if (isEditing) {
                await updateSolucao(String(formData.id), finalData);
                alert('Solução atualizada com sucesso!');
            } else {
                await createSolucao(finalData);
                alert('Solução criada com sucesso!');
            }
            onSuccess();

        } catch (err) {
            console.error('Error:' + err)
            alert(`Falha ao ${isEditing ? 'atualizar' : 'criar'} a solução.`);
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">{isEditing ? 'Editar Solução' : 'Nova Solução'}</h2>
                        <div className="flex space-x-6">
                            <button className="text-blue-600 font-medium border-b-2 border-blue-600 pb-2">
                                Dados da Solução
                            </button>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-light">
                        ×
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor='nome' className='block text-sm font-medium text-gray-700 mb-2'>
                                    Nome <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type='text'
                                    id='nome'
                                    name='nome'
                                    value={formData.nome || ''}
                                    onChange={handleChange}
                                    required
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>

                            <div>
                                <label htmlFor='sigla' className='block text-sm font-medium text-gray-700 mb-2'>
                                    Sigla
                                </label>
                                <input
                                    type='text'
                                    id='sigla'
                                    name='sigla'
                                    value={formData.sigla || ''}
                                    onChange={handleChange}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>

                            <div>
                                <label htmlFor='demanda' className='block text-sm font-medium text-gray-700 mb-2'>
                                    Demanda
                                </label>
                                <select
                                    name="demandaNome"
                                    value={formData.demandaId ?? ''}
                                    onFocus={carregarDemandas}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const selectedDemanda = demandas.find(d => d.id == selectedId);

                                        setFormData((prev) => ({
                                            ...prev,
                                            demandaId: selectedId ? Number(selectedId) : null,
                                            demanda: {
                                                ...prev.demanda!,
                                                id: selectedId ? Number(selectedId) : null,
                                                nome: selectedDemanda?.nome || '',
                                            },
                                        }))
                                    }}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white'
                                >
                                    <option value="">Selecione uma demanda</option>
                                    {demandas?.map((demanda) => (
                                        <option key={demanda.id} value={demanda.id}>
                                            {demanda.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Descrição - Largura total */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Descrição
                            </label>
                            <textarea
                                name="descricao"
                                value={formData.descricao || ''}
                                onChange={handleChange}
                                rows={4}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical'
                                placeholder="Descrição da solução"
                            />
                        </div>

                        {/* Segunda linha - Versão, Repositório, Link */}
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                            <div>
                                <label htmlFor='versao' className='block text-sm font-medium text-gray-700 mb-2'>
                                    Versão
                                </label>
                                <input
                                    type='text'
                                    id='versao'
                                    name='versao'
                                    value={formData.versao || ''}
                                    onChange={handleChange}
                                    placeholder="URL do repositório"
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>
                            <div>
                                <label htmlFor='repositorio' className='block text-sm font-medium text-gray-700 mb-2'>
                                    Repositório
                                </label>
                                <input
                                    type='text'
                                    id='repositorio'
                                    name='repositorio'
                                    value={formData.repositorio || ''}
                                    onChange={handleChange}
                                    placeholder="URL do repositório"
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>

                            <div>
                                <label htmlFor='link' className='block text-sm font-medium text-gray-700 mb-2'>
                                    Link
                                </label>
                                <input
                                    type='text'
                                    id='link'
                                    name='link'
                                    value={formData.link || ''}
                                    onChange={handleChange}
                                    placeholder="URL do link"
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>
                        </div>

                        {/* Terceira linha - Tipo, Tecnologias, Desenvolvedor */}
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                            <div>
                                <label htmlFor='tipo' className='block text-sm font-medium text-gray-700 mb-2'>
                                    Tipo
                                </label>
                                <select
                                    name="tipoNome"
                                    value={formData.tipoId ?? ''}
                                    onFocus={carregarTipos}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const selectedTipo = tipos.find(t => t.id == selectedId);

                                        setFormData((prev) => ({
                                            ...prev,
                                            tipoId: selectedId ? Number(selectedId) : null,
                                            tipo: {
                                                ...prev.tipo!,
                                                id: selectedId ? Number(selectedId) : null,
                                                nome: selectedTipo?.nome || '',
                                            },
                                        }))
                                    }}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white'
                                >
                                    <option value="">Selecione um tipo</option>
                                    {tipos?.map((tipo) => (
                                        <option key={tipo.id} value={tipo.id}>
                                            {tipo.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor='tecnologia' className='block text-sm font-medium text-gray-700 mb-2'>
                                    Tecnologias
                                </label>

                                <div className="flex flex-wrap gap-2 mb-2 min-h-[2rem]">
                                    {formData.linguagemId &&
                                        formData.linguagemId.toString().split(',').filter(id => id.trim()).map((id) => {
                                            const tecnologia = tecnologias.find(t => t.id.toString() === id.trim());
                                            if (!tecnologia) return null;

                                            return (
                                                <span
                                                    key={id}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
                                                >
                                                    {tecnologia.nome}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const currentIds = formData.linguagemId?.toString().split(',').filter(existingId => existingId.trim()) || [];
                                                            const newIds = currentIds.filter(existingId => existingId.trim() !== id.trim());
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                linguagemId: newIds.length > 0 ? newIds.join(',') : null
                                                            }));
                                                        }}
                                                        className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            );
                                        })
                                    }
                                </div>

                                <select
                                    name="linguagemNome"
                                    value=""
                                    onFocus={carregarTecnologias}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        if (!selectedId) return;

                                        const currentIds = formData.linguagemId?.toString().split(',').filter(id => id.trim()) || [];

                                        if (!currentIds.includes(selectedId)) {
                                            const newIds = [...currentIds, selectedId];
                                            setFormData(prev => ({
                                                ...prev,
                                                linguagemId: newIds.join(',')
                                            }));
                                        }

                                        e.target.value = "";
                                    }}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white'
                                >
                                    <option value="">Selecionar...</option>
                                    {tecnologias?.map((tecnologia) => {
                                        const isSelected = formData.linguagemId?.toString().split(',').includes(tecnologia.id.toString());
                                        return (
                                            <option
                                                key={tecnologia.id}
                                                value={tecnologia.id}
                                                disabled={isSelected}
                                                className={isSelected ? 'text-gray-400' : ''}
                                            >
                                                {tecnologia.nome} {isSelected ? '(selecionado)' : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div>
                                <label htmlFor='desenvolvedores' className='block text-sm font-medium text-gray-700 mb-2'>
                                    Desenvolvedor
                                </label>
                                <select
                                    name="desenvolvedorNome"
                                    value={formData.desenvolvedorId ?? ''}
                                    onFocus={carregarDesenvolvedores}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const selectedDev = desenvolvedores.find(d => d.id == selectedId);

                                        setFormData((prev) => ({
                                            ...prev,
                                            desenvolvedorId: selectedId ? Number(selectedId) : null,
                                            desenvolvedor: {
                                                ...prev.desenvolvedor!,
                                                id: selectedId ? Number(selectedId) : null,
                                                nome: selectedDev?.nome || '',
                                            },
                                        }))
                                    }}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white'
                                >
                                    <option value="">Selecione um desenvolvedor</option>
                                    {desenvolvedores?.map((dev) => (
                                        <option key={dev.id} value={dev.id}>
                                            {dev.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Quarta linha - Criticidade, Responsável, Categoria */}
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                            <div>
                                <label htmlFor='criticidade' className='block text-sm font-medium text-gray-700 mb-2'>
                                    Criticidade
                                </label>
                                <select
                                    id='criticidade'
                                    name='criticidade'
                                    value={formData.criticidade || ''}
                                    onChange={handleChange}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white'
                                >
                                    <option value=''>Selecione a criticidade</option>
                                    <option value='Alta'>Alta</option>
                                    <option value='Média'>Média</option>
                                    <option value='Baixa'>Baixa</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor='responsavel' className='block text-sm font-medium text-gray-700 mb-2'>
                                    Responsável
                                </label>
                                <select
                                    name="responsavelNome"
                                    value={formData.responsavelId ?? ''}
                                    onFocus={carregarResponsaveis}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const selectResponsavel = responsavel.find(r => r.id == selectedId);

                                        setFormData((prev) => ({
                                            ...prev,
                                            responsavelId: selectedId ? Number(selectedId) : null,
                                            responsavel: {
                                                ...prev.responsavel!,
                                                id: selectedId ? Number(selectedId) : null,
                                                nome: selectResponsavel?.nome || '',
                                            },
                                        }))
                                    }}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white'
                                >
                                    <option value="">Selecione um responsável</option>
                                    {responsavel.map((resp) => (
                                        <option key={resp.id} value={resp.id}>
                                            {resp.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor='categorias' className='block text-sm font-medium text-gray-700 mb-2'>
                                    Categoria
                                </label>
                                <select
                                    name="categoriasNomes"
                                    value={formData.categoriaId ?? ''}
                                    onFocus={carregarCategorias}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const selectCategorias = categoria.find(c => c.id == selectedId);

                                        setFormData((prev) => ({
                                            ...prev,
                                            categoriaId: selectedId ? Number(selectedId) : null,
                                            categoria: {
                                                ...prev.categoria!,
                                                id: selectedId ? Number(selectedId) : null,
                                                nome: selectCategorias?.nome || '',
                                            },
                                        }))
                                    }}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white'
                                >
                                    <option value="">Selecione uma categoria</option>
                                    {categoria.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Quinta linha - Status, Data Status, Andamento */}
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                            <div>
                                <label htmlFor='status' className='block text-sm font-medium text-gray-700 mb-2'>
                                    Status
                                </label>
                                <select
                                    name="statusNome"
                                    value={formData.statusId ?? ''}
                                    onFocus={carregarStatus}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const selectStatus = status.find(s => s.id == selectedId);

                                        setFormData((prev) => ({
                                            ...prev,
                                            statusId: selectedId ? Number(selectedId) : null,
                                            status: {
                                                ...prev.status!,
                                                id: selectedId ? Number(selectedId) : null,
                                                nome: selectStatus?.nome || '',
                                                propriedade: selectStatus?.propriedade || '',
                                            },
                                        }))
                                    }}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white'
                                >
                                    <option value="">Selecione um status</option>
                                    {status.map((stat) => (
                                        <option key={stat.id} value={stat.id}>
                                            {stat.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor='dataStatus' className='block text-sm font-medium text-gray-700 mb-2'>
                                    Data Status
                                </label>
                                <div className="relative">
                                    <input
                                        type='date'
                                        id='dataStatus'
                                        name='dataStatus'
                                        value={formData.dataStatus || ''}
                                        onChange={handleChange}
                                        placeholder="dd/mm/aaaa"
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor='andamento' className='block text-sm font-medium text-gray-700 mb-2'>
                                    Andamento (%)
                                </label>
                                <div className="space-y-3">
                                    <select
                                        id='andamento'
                                        name='andamento'
                                        value={formData.andamento || ''}
                                        onChange={handleChange}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white'
                                    >
                                        <option value=''>Não iniciado</option>
                                        <option value='0%'>0%</option>
                                        <option value='25%'>25%</option>
                                        <option value='50%'>50%</option>
                                        <option value='75%'>75%</option>
                                        <option value='100%'>100%</option>
                                    </select>

                                    {/* Slider customizado */}
                                    <div className="px-1">
                                        <div className="relative">
                                            <div className="h-2 bg-gray-200 rounded-full">
                                                <div
                                                    className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: formData.andamento ?
                                                            `${parseInt(formData.andamento.replace('%', '')) || 0}%` :
                                                            '0%'
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="absolute top-0 left-0 w-full h-2 flex items-center">
                                                <div
                                                    className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-sm transform -translate-x-2"
                                                    style={{
                                                        left: formData.andamento ?
                                                            `${parseInt(formData.andamento.replace('%', '')) || 0}%` :
                                                            '0%'
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0%</span>
                                            <span>25%</span>
                                            <span>50%</span>
                                            <span>75%</span>
                                            <span>100%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                            <button
                                type='button'
                                onClick={onClose}
                                className='px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                            >
                                Cancelar
                            </button>
                            <button
                                type='submit'
                                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                            >
                                {isEditing ? 'Salvar Alterações' : 'Salvar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
