'use client'

import { useEffect, useState, useMemo, useCallback } from 'react';
import { getDemandas, getSolucoes, createSolucao, getStatus, getLinguagens, getResponsaveis, getCategorias, getDesenvolvedores, getTipos, updateSolucao } from '../../actions/actions';
import { SolucaoType } from '../../types/types';



export default function FormPrincipal() {
    const [demandas, setDemandas] = useState<any[]>([]);
    const [tipos, setTipos] = useState<any[]>([]);
    const [tecnologias, setTecnologia] = useState<any[]>([]);
    const [desenvolvedores, setDesenvolvedor] = useState<any[]>([]);
    const [status, setStatus] = useState<any[]>([]);
    const [responsavel, setResponsavel] = useState<any[]>([]);
    const [categoria, setCategoria] = useState<any[]>([]);
    const [loadingSelectItems, setLoadingSelectItems] = useState(true)
    const [formData, setFormData] = useState<SolucaoType>({
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
    });




    const carregarDesenvolvedores = async () => {
        setLoadingSelectItems(true);
        try {
            const storedId = localStorage.getItem('selectedProprietarioId')
            if (storedId) {
                const response = await getDesenvolvedores()
                setDesenvolvedor(response || [])
            } else {
                alert('Proprietário não encontrado')
                return
            }
        } catch (err) {
            console.error('Erro ao carregar desenvolvedores', err);

        } finally {
            setLoadingSelectItems(false);
        }
    }

    const carregarStatus = async () => {
        setLoadingSelectItems(true);
        try {
            const storedId = localStorage.getItem('selectedProprietarioId')
            if (storedId) {
                const response = await getStatus()
                setStatus(response || [])
            } else {
                alert('Proprietário não encontrado')
                return
            }
        } catch (err) {
            console.error('Erro ao carregar status', err);

        } finally {
            setLoadingSelectItems(false);
        }
    }

    const carregarResponsaveis = async () => {
        setLoadingSelectItems(true);
        try {
            const storedId = localStorage.getItem('selectedProprietarioId')
            if (storedId) {
                const response = await getResponsaveis()
                setResponsavel(response || [])
            } else {
                alert('Proprietário não encontrado')
                return
            }
        } catch (err) {
            console.error('Erro ao carregar responsaveis', err);

        } finally {
            setLoadingSelectItems(false);
        }
    }

    const carregarCategorisa = async () => {
        setLoadingSelectItems(true);
        try {
            const storedId = localStorage.getItem('selectedProprietarioId')
            if (storedId) {
                const response = await getCategorias()
                setCategoria(response || [])
            } else {
                alert('Proprietário não encontrado')
                return
            }
        } catch (err) {
            console.error('Erro ao carregar categorias', err);

        } finally {
            setLoadingSelectItems(false);
        }
    }



    const carregarDemandas = async () => {
        setLoadingSelectItems(true);
        try {

            const storedId = localStorage.getItem('selectedProprietarioId')
            if (storedId) {
                const response = await getDemandas(storedId);
                setDemandas(response || []);
            } else {
                alert('Proprietario não encotrado');
                return;
            }
        } catch (error) {
            console.error('Erro ao carregar demandas:', error);
        } finally {
            setLoadingSelectItems(false);
        }
    };

    const carregarTecnologias = async () => {
        setLoadingSelectItems(true);
        try {

            const storedId = localStorage.getItem('selectedProprietarioId')
            if (storedId) {
                const response = await getLinguagens();
                setTecnologia(response || []);
            } else {
                alert('Proprietario não encotrado');
                return;
            }
        } catch (error) {
            console.error('Erro ao carregar tecnologias:', error);
        } finally {
            setLoadingSelectItems(false);
        }
    };


    const carregarTipos = async () => {
        setLoadingSelectItems(true);
        try {

            const storedId = localStorage.getItem('selectedProprietarioId')
            if (storedId) {
                const response = await getTipos();
                setTipos(response || []);
            } else {
                alert('Proprietario não encotrado');
                return;
            }
        } catch (error) {
            console.error('Erro ao carregar tipos:', error);
        } finally {
            setLoadingSelectItems(false);
        }
    };




    //Handlers
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, type, value } = e.target;

        const camposNumericos = [
            'tipo_id',
            'linguagem_id',
            'desenvolvedor_id',
            'categoria_id',
            'responsavel_id',
            'status_id',
            'demanda_id'
        ];


        let newValue: any;


        if (camposNumericos.includes(name)) {
            newValue = value === '' ? null : Number(value)
        } else {
            newValue = value;
        }

        setFormData((prevState) => ({
            ...prevState,
            [name]: newValue,
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
            }

            console.log('Dados finais sendo enviados:', finalData); // Debug

            const response = await createSolucao(finalData)
            console.log('enviado', response)
            alert('Enviado')
            setFormData({
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
            })
        } catch (err) {
            console.error('Error:' + err)
        }
    }


    return (
        <>
            <h1>Formulario</h1>
            <div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <label htmlFor='nome' className='block text-sm font-medium mb-1'>
                                Nome da Solução
                            </label>
                            <input
                                type='text'
                                id='nome'
                                name='nome'
                                value={formData.nome}
                                onChange={handleChange}
                                required
                                className='w-full rounded-md p-2 border border-gray-300'
                            />
                        </div>

                        <div>
                            <label htmlFor='sigla' className='block text-sm font-medium mb-1'>
                                Sigla
                            </label>
                            <input
                                type='text'
                                id='sigla'
                                name='sigla'
                                value={formData.sigla}
                                onChange={handleChange}
                                required
                                className='w-full rounded-md p-2 border border-gray-300'
                            />
                        </div>

                        <div>
                            <label htmlFor='demanda' className='block text-sm font-medium mb-1'>
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
                                className='w-full rounded-md p-2 border border-gray-300'
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

                    <div className="mb-4">
                        <label className='block text-sm font-medium mb-1'>
                            Descrição
                        </label>
                        <textarea
                            name="descricao"
                            value={formData.descricao}
                            onChange={handleChange}
                            rows={3}
                            className='w-full rounded-md p-2 border border-gray-300'
                            placeholder="Descrição da solução"
                        />
                    </div>

                    <div className='mb-4 grid grid-cols-3 gap-4'>
                        <div>
                            <label htmlFor='versao' className='block text-sm font-medium mb-1'>
                                Versão
                            </label>
                            <input
                                type='text'
                                id='versao'
                                name='versao'
                                value={formData.versao}
                                onChange={handleChange}
                                className='w-full rounded-md p-2 border border-gray-300'
                            />
                        </div>
                        <div>
                            <label htmlFor='repositorio' className='block text-sm font-medium mb-1'>
                                Repositório
                            </label>
                            <input
                                type='text'
                                id='repositorio'
                                name='repositorio'
                                value={formData.repositorio}
                                onChange={handleChange}
                                className='w-full rounded-md p-2 border border-gray-300'
                            />
                        </div>


                        <div>
                            <label htmlFor='link' className='block text-sm font-medium mb-1'>
                                Link
                            </label>
                            <input
                                type='text'
                                id='link'
                                name='link'
                                value={formData.link}
                                onChange={handleChange}
                                className='w-full rounded-md p-2 border border-gray-300'
                            />
                        </div>

                    </div>
                    <div className='mb-4 grid grid-cols-3 gap-4'>

                        <div>
                            <label htmlFor='tipo' className='block text-sm font-medium mb-1'>
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
                                className='w-full rounded-md p-2 border border-gray-300'
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
                            <label htmlFor='tecnologia' className='block text-sm font-medium mb-1'>
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

                                    // Verifica se o ID já foi selecionado
                                    if (!currentIds.includes(selectedId)) {
                                        const newIds = [...currentIds, selectedId];
                                        setFormData(prev => ({
                                            ...prev,
                                            linguagemId: newIds.join(',')
                                        }));
                                    }

                                    e.target.value = "";
                                }}
                                className='w-full rounded-md p-2 border border-gray-300'
                            >
                                <option value="">Adicionar tecnologia</option>
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
                            <label htmlFor='desenvolvedores' className='block text-sm font-medium mb-1'>
                                Desenvolvedores
                            </label>
                            <select
                                name="desenvolvedorNome"
                                value={formData.desenvolvedorId ?? ''}
                                onFocus={carregarDesenvolvedores}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const selectedTipo = tipos.find(t => t.id == selectedId);

                                    setFormData((prev) => ({
                                        ...prev,
                                        desenvolvedorId: selectedId ? Number(selectedId) : null,
                                        desenvolvedores: {
                                            ...prev.desenvolvedor!,
                                            id: selectedId ? Number(selectedId) : null,
                                            nome: selectedTipo?.nome || '',
                                        },
                                    }))
                                }}
                                className='w-full rounded-md p-2 border border-gray-300'
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

                    <div className='mb-4 grid grid-cols-3 gap-4'>
                        <div>
                            <label htmlFor='criticidade' className='block text-sm font-medium mb-1'>
                                Criticidade
                            </label>
                            <select

                                id='criticidade'
                                name='criticidade'
                                value={formData.criticidade}
                                onChange={handleChange}
                                className='w-full rounded-md p-2 border border-gray-300'
                            >
                                <option value=''>Selecione uma criticidade </option>
                                <option value='Alta'>Alta</option>
                                <option value='Média'>Média</option>
                                <option value='Baixa'>Baixa</option>
                            </select>


                        </div>

                        <div>
                            <label htmlFor='responsavel' className='block text-sm font-medium mb-1'>
                                Responsável
                            </label>
                            <select
                                name="responsavelNome"
                                value={formData.responsavelId ?? ''}
                                onFocus={carregarResponsaveis}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const selectResponsavel = responsavel.find(t => t.id == selectedId);

                                    setFormData((prev) => ({
                                        ...prev,
                                        responsavelId: selectedId ? Number(selectedId) : null,
                                        responsaveis: {
                                            ...prev.responsavel!,
                                            id: selectedId ? Number(selectedId) : null,
                                            nome: selectResponsavel?.nome || '',
                                        },
                                    }))
                                }}
                                className='w-full rounded-md p-2 border border-gray-300'
                            >
                                <option value="">Selecione um resposanvel</option>
                                {responsavel.map((responsavel) => (
                                    <option key={responsavel.id} value={responsavel.id}>
                                        {responsavel.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor='categorias' className='block text-sm font-medium mb-1'>
                                Categorias
                            </label>
                            <select
                                name="categoriasNomes"
                                value={formData.categoriaId ?? ''}
                                onFocus={carregarCategorisa}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const selectCategorias = categoria.find(t => t.id == selectedId);

                                    setFormData((prev) => ({
                                        ...prev,
                                        categoriaId: selectedId ? Number(selectedId) : null,
                                        categorias: {
                                            ...prev.categoria!,
                                            id: selectedId ? Number(selectedId) : null,
                                            nome: selectCategorias?.nome || '',
                                        },
                                    }))
                                }}
                                className='w-full rounded-md p-2 border border-gray-300'
                            >
                                <option value="">Selecione uma categoria</option>
                                {categoria.map((categoria) => (
                                    <option key={categoria.id} value={categoria.id}>
                                        {categoria.nome}
                                    </option>
                                ))}
                            </select>
                        </div>



                    </div>

                    <div className='mb-4 grid grid-cols-3 gap-4'>
                        <div>
                            <label htmlFor='status' className='block text-sm font-medium mb-1'>
                                Status
                            </label>
                            <select
                                name="statusNome"
                                value={formData.statusId ?? ''}
                                onFocus={carregarStatus}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const selectStatus = status.find(t => t.id == selectedId);

                                    setFormData((prev) => ({
                                        ...prev,
                                        statusId: selectedId ? Number(selectedId) : null,
                                        statuses: {
                                            ...prev.categoria!,
                                            id: selectedId ? Number(selectedId) : null,
                                            nome: selectStatus?.nome || '',
                                        },
                                    }))
                                }}
                                className='w-full rounded-md p-2 border border-gray-300'
                            >
                                <option value="">Selecione um status</option>
                                {status.map((status) => (
                                    <option key={status.id} value={status.id}>
                                        {status.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor='dataStatus' className='block text-sm font-medium mb-1'>
                                Data Status
                            </label>
                            <input
                                type='date'
                                id='dataStatus'
                                name='dataStatus'
                                value={formData.dataStatus}
                                onChange={handleChange}
                                className='w-full rounded-md p-2 border border-gray-300'
                            />
                        </div>

                        <div>
                            <label htmlFor='andamento' className='block text-sm font-medium mb-1'>
                                Andamento (%)
                            </label>
                            <select
                                id='andamento'
                                name='andamento'
                                value={formData.andamento}
                                onChange={handleChange}
                                className='w-full rounded-md p-2 border border-gray-300 max-h-32 overflow-y-auto'
                            >
                                <option value=''>Selecione o andamento</option>
                                <option value='0%'>0%</option>
                                <option value='5%'>5%</option>
                                <option value='10%'>10%</option>
                                <option value='15%'>15%</option>
                                <option value='20%'>20%</option>
                                <option value='25%'>25%</option>
                                <option value='30%'>30%</option>
                                <option value='35%'>35%</option>
                                <option value='40%'>40%</option>
                                <option value='45%'>45%</option>
                                <option value='50%'>50%</option>
                                <option value='55%'>55%</option>
                                <option value='60%'>60%</option>
                                <option value='65%'>65%</option>
                                <option value='70%'>70%</option>
                                <option value='75%'>75%</option>
                                <option value='80%'>80%</option>
                                <option value='85%'>85%</option>
                                <option value='90%'>90%</option>
                                <option value='95%'>95%</option>
                                <option value='100%'>100%</option>
                            </select>
                        </div>
                    </div>


                    <div>
                        <button
                            type='submit'
                            className='py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600'
                        >
                            Enviar Solução
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
}
