'use client'
import { useEffect, useState, useMemo, useCallback } from 'react';
import { getSolucoes, deleteSolucao, updateSolucao } from '../../actions/actions'
import FormPrincipal from '../Form/FormPrincipal'
import { SolucaoType } from '../../types/types';
import { PaginationMeta } from '../../../configuracoes/(page)/categorias/types/types';
import ModalHistoricoForm from './HistoricoPrincipal/ModalHistoricoForm';

import { useSidebar } from '../../../../../../componentes/Sidebar/SidebarContext'
import {
    Table as ShadcnTable,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    ColumnDef,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
} from '@tanstack/react-table';
import {
    ArrowUpDown,
    Columns,
    Edit2,
    ExternalLink,
    Info,
    Plus,
    Trash2,
    FileSpreadsheet,
    Clock,
} from 'lucide-react';
import DeleteConfirmationModal from '../DeleteConfirmationModal/DeleteConfirmationModal';
import PdfGenerator from '../utils/pdfGenerator';
import ExcelGenerator from '../utils/excelGenerator';


export default function Table() {
    const { isCollapsed } = useSidebar();
    const [criarSolucao, setCriarSolucao] = useState(false)
    const [solucoes, setData] = useState<SolucaoType[]>([]);
    const [solucaoToEdit, setSolucaoToEdit] = useState<SolucaoType | null>(null);
    const [solucaoToDeleteId, setSolucaoToDeleteId] = useState<string | null>(null);
    const [historicoModalOpen, setHistoricoModalOpen] = useState(false);
    const [selectedSolucaoId, setSelectedSolucaoId] = useState<number | null>(null);

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [totalRows, setTotalRows] = useState(0);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [globalFilter, setGlobalFilter] = useState('');

    const toggleModal = () => {
        setSolucaoToEdit(null);
        setCriarSolucao(prev => !prev);
    };

    const handleFormSuccess = () => {
        toggleModal();
        fetchData();
    }

    const fetchData = useCallback(async () => {
        const proprietarioId = localStorage.getItem('selectedProprietarioId');
        if (proprietarioId) {
            try {
                const response = await getSolucoes(
                    pagination.pageIndex + 1,
                    pagination.pageSize,
                    Number(proprietarioId)
                );
                setData(response.data || []);
                setTotalRows(response.meta.total);
            } catch (error) {
                console.error('Erro ao buscar soluções:', error);
                setData([]);
            }
        }
    }, [pagination]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEdit = (solucao: SolucaoType) => {
        setSolucaoToEdit(solucao);
        setCriarSolucao(true);
    };

    const handleDeleteRequest = (id: string) => {
        setSolucaoToDeleteId(id);
    };

    const handleDeleteConfirm = async () => {
        if (solucaoToDeleteId) {
            await deleteSolucao(solucaoToDeleteId);
            setSolucaoToDeleteId(null);
            fetchData();
        }
    };

    const handleHistoricoOpen = (solucaoId: number) => {
        setSelectedSolucaoId(solucaoId);
        setHistoricoModalOpen(true);
    };

    const handleHistoricoClose = () => {
        setHistoricoModalOpen(false);
        setSelectedSolucaoId(null);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    // Mock responsáveis - você pode substituir por dados reais da API
    const responsaveis = useMemo(() => [
        // Adicione aqui os responsáveis reais ou busque da API
    ], []);

    const handleClearFilters = () => {
        setColumnFilters([]);
    };



    const columns = useMemo<ColumnDef<SolucaoType>[]>(
        () => [
            {
                id: "index",
                header: "#",
                cell: ({ row }) => <div className="text-sm text-gray-500">{row.index + 1 + pagination.pageIndex * pagination.pageSize}</div>,
            },
            {
                accessorKey: 'nome',
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent">
                        Nome <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
            },
            {
                id: 'demandante',
                accessorFn: row => row.demanda?.nome,
                header: "Demandante",
                filterFn: (row, id, value) => row.original.demanda?.nome === value,
            },
            {
                id: 'tipo',
                accessorFn: row => row.tipo?.nome,
                header: "Tipo",
                filterFn: (row, id, value) => row.original.tipo?.nome === value,
            },
            {
                id: 'linguagem',
                accessorFn: row => (row as any).linguagem?.nome,
                header: "Tecnologia",
                filterFn: (row, id, value) => (row.original as any).linguagem?.nome === value,
            },
            {
                id: 'desenvolvedor',
                accessorFn: row => row.desenvolvedor?.nome,
                header: "Desenvolvedor",
                filterFn: (row, id, value) => row.original.desenvolvedor?.nome === value,
            },
            {
                id: 'status',
                accessorFn: row => row.status?.nome,
                header: "Status",
                filterFn: (row, id, value) => row.original.status?.nome === value,
            },
            {
                id: 'categoria',
                accessorFn: row => row.categoria?.nome,
                header: "Categoria",
                filterFn: (row, id, value) => row.original.categoria?.nome === value,
            },
            {
                id: 'responsavel',
                accessorFn: row => row.responsavel?.nome,
                header: "Responsável",
                filterFn: (row, id, value) => row.original.responsavel?.nome === value,
            },
            {
                accessorKey: 'criticidade',
                header: "Criticidade"
            },
            {
                accessorKey: 'descricao',
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent">
                        Descrição <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
            },
            {
                id: 'ações',
                header: () => <div className="text-center">Ações</div>,
                cell: ({ row }) => {
                    const solucao = row.original;
                    return (
                        <div className="flex justify-end items-center space-x-1 pr-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleHistoricoOpen(solucao.id!)}
                                title="Histórico"
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                            >
                                <Clock className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(solucao)}
                                title="Editar"
                                className="text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors"
                            >
                                <Edit2 className="w-6 h-6" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteRequest(String(solucao.id))}
                                title="Deletar"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="w-6 h-6" />
                            </Button>
                        </div>
                    );
                },
            }
        ],
        [pagination]
    );

    const pageCount = Math.ceil(totalRows / pagination.pageSize);

    const table = useReactTable({
        data: solucoes,
        columns,
        manualPagination: true,
        pageCount,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            columnVisibility,
            pagination,
        },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    // Gera definição de colunas visíveis para o PDF
    const pdfColumns = useMemo(() => {
        return table
            .getAllColumns()
            .filter((col) => col.getIsVisible() && col.id !== 'ações' && col.id !== 'index')
            .map((col) => {
                const header = typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id;
                const accessor = (row: SolucaoType) => {
                    // Prioridade: accessorFn
                    if (typeof (col.columnDef as any).accessorFn === 'function') {
                        return (col.columnDef as any).accessorFn(row);
                    }
                    // Depois accessorKey – só se realmente existir e for string
                    if ('accessorKey' in col.columnDef && typeof col.columnDef.accessorKey === 'string') {
                        return (row as any)[col.columnDef.accessorKey];
                    }

                    // Fallback: id da coluna
                    return (row as any)[col.id as keyof SolucaoType];
                };

                return { header, accessor };
            });
    }, [columnVisibility]);

    const dadosFiltrados = useMemo(() => {
        return table.getFilteredRowModel().rows.map(row => row.original);
    }, [table.getFilteredRowModel().rows]);

    const filtrosAplicados = useMemo(() => {
        const filtros: string[] = [];

        columnFilters.forEach(filter => {
            const column = table.getColumn(filter.id);
            if (column && filter.value) {
                const columnName = typeof column.columnDef.header === 'string'
                    ? column.columnDef.header
                    : filter.id;
                filtros.push(`${columnName}: ${filter.value}`);
            }
        });

        if (globalFilter) {
            filtros.push(`Busca: ${globalFilter}`);
        }

        return filtros;
    }, [columnFilters, globalFilter, table]);

    return (
        <div className={`
            w-full bg-gray-50
            transition-all duration-300 ease-in-out
            ${isCollapsed
                ? '-ml-[190px] w-[calc(100%+220px)]'
                : 'ml-0'
            }
            py-6 px-6
        `}>
            {solucaoToDeleteId && (
                <DeleteConfirmationModal
                    isOpen={!!solucaoToDeleteId}
                    onClose={() => setSolucaoToDeleteId(null)}
                    onConfirm={handleDeleteConfirm}
                    message="Tem certeza que deseja excluir esta solução?"
                />
            )}

            {historicoModalOpen && selectedSolucaoId && (
                <ModalHistoricoForm
                    isOpen={historicoModalOpen}
                    onClose={handleHistoricoClose}
                    solucaoId={selectedSolucaoId}
                    formatDate={formatDate}
                    onUpdate={fetchData}
                />
            )}

            <div className="w-full">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Soluções</h1>
                    <div className="flex gap-3">
                        <Button onClick={toggleModal} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="mr-2 h-4 w-4" />
                            {criarSolucao ? 'Fechar' : 'Adicionar'}
                        </Button>
                    </div>
                </div>

                {criarSolucao && (
                    <FormPrincipal onClose={toggleModal} onSuccess={handleFormSuccess} initialData={solucaoToEdit} />
                )}

                <div className="w-full">
                    <div className="flex items-center justify-between py-4 gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Input
                                placeholder="Filtrar por nome..."
                                value={(table.getColumn("nome")?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn("nome")?.setFilterValue(event.target.value)
                                }
                                className="w-[200px] bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
                            />
                            <select
                                value={(table.getColumn("demandante")?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn("demandante")?.setFilterValue(event.target.value || undefined)
                                }
                                className="w-[180px] h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
                            >
                                <option value="">Todas as demandantes</option>
                                {Array.from(new Set(solucoes.map(s => s.demanda?.nome).filter(Boolean)))
                                    .sort()
                                    .map((demandante) => (
                                        <option key={demandante} value={demandante}>
                                            {demandante}
                                        </option>
                                    ))}
                            </select>
                            <select
                                value={(table.getColumn("tipo")?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn("tipo")?.setFilterValue(event.target.value || undefined)
                                }
                                className="w-[180px] h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
                            >
                                <option value="">Todos os tipos</option>
                                {Array.from(new Set(solucoes.map(s => s.tipo?.nome).filter(Boolean)))
                                    .sort()
                                    .map((tipo) => (
                                        <option key={tipo} value={tipo}>
                                            {tipo}
                                        </option>
                                    ))}
                            </select>
                            <select
                                value={(table.getColumn("linguagem")?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn("linguagem")?.setFilterValue(event.target.value || undefined)
                                }
                                className="w-[180px] h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
                            >
                                <option value="">Todas as tecnologias</option>
                                {Array.from(new Set(solucoes.map(s => (s as any).linguagem?.nome).filter(Boolean)))
                                    .sort()
                                    .map((linguagem) => (
                                        <option key={linguagem} value={linguagem}>
                                            {linguagem}
                                        </option>
                                    ))}
                            </select>
                            <select
                                value={(table.getColumn("desenvolvedor")?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn("desenvolvedor")?.setFilterValue(event.target.value || undefined)
                                }
                                className="w-[180px] h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
                            >
                                <option value="">Todos os desenvolvedores</option>
                                {Array.from(new Set(solucoes.map(s => s.desenvolvedor?.nome).filter(Boolean)))
                                    .sort()
                                    .map((desenvolvedor) => (
                                        <option key={desenvolvedor} value={desenvolvedor}>
                                            {desenvolvedor}
                                        </option>
                                    ))}
                            </select>
                            <select
                                value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn("status")?.setFilterValue(event.target.value || undefined)
                                }
                                className="w-[180px] h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
                            >
                                <option value="">Todos os status</option>
                                {Array.from(new Set(solucoes.map(s => s.status?.nome).filter(Boolean)))
                                    .sort()
                                    .map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                            </select>
                            <select
                                value={(table.getColumn("categoria")?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn("categoria")?.setFilterValue(event.target.value || undefined)
                                }
                                className="w-[180px] h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
                            >
                                <option value="">Todas as categorias</option>
                                {Array.from(new Set(solucoes.map(s => s.categoria?.nome).filter(Boolean)))
                                    .sort()
                                    .map((categoria) => (
                                        <option key={categoria} value={categoria}>
                                            {categoria}
                                        </option>
                                    ))}
                            </select>
                            <select
                                value={(table.getColumn("responsavel")?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn("responsavel")?.setFilterValue(event.target.value || undefined)
                                }
                                className="w-[180px] h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
                            >
                                <option value="">Todos os responsáveis</option>
                                {Array.from(new Set(solucoes.map(s => s.responsavel?.nome).filter(Boolean)))
                                    .sort()
                                    .map((responsavel) => (
                                        <option key={responsavel} value={responsavel}>
                                            {responsavel}
                                        </option>
                                    ))}
                            </select>
                            <select
                                value={(table.getColumn("criticidade")?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn("criticidade")?.setFilterValue(event.target.value || undefined)
                                }
                                className="w-[180px] h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
                            >
                                <option value="">Todas as criticidades</option>
                                {Array.from(new Set(solucoes.map(s => s.criticidade).filter(Boolean)))
                                    .sort()
                                    .map((criticidade) => (
                                        <option key={criticidade} value={criticidade}>
                                            {criticidade}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleClearFilters} className="bg-white">
                                Limpar Filtros
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <Columns className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <div className="border-b">
                                        <PdfGenerator
                                            solucoes={dadosFiltrados}
                                            columns={pdfColumns}
                                            filtrosAplicados={filtrosAplicados}
                                            totalOriginal={solucoes.length}
                                            variant="dropdown"
                                        />
                                    </div>
                                    <div className="border-b">
                                        <ExcelGenerator
                                            solucoes={dadosFiltrados}
                                            columns={pdfColumns}
                                            filtrosAplicados={filtrosAplicados}
                                            totalOriginal={solucoes.length}
                                            variant="dropdown"
                                        />
                                    </div>
                                    {table
                                        .getAllColumns()
                                        .filter((column) => column.getCanHide())
                                        .map((column) => {
                                            return (
                                                <DropdownMenuCheckboxItem
                                                    key={column.id}
                                                    className="capitalize"
                                                    checked={column.getIsVisible()}
                                                    onCheckedChange={(value) =>
                                                        column.toggleVisibility(!!value)
                                                    }
                                                    onSelect={(e) => e.preventDefault()}
                                                >
                                                    {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                                                </DropdownMenuCheckboxItem>
                                            )
                                        })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <div className={`rounded-md border bg-white transition-all duration-300 ${isCollapsed ? 'w-full' : 'w-full'}`}>
                        <ShadcnTable>
                            <TableHeader className="bg-gray-100 border-b">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id} className="text-xs font-medium text-gray-600 h-9 px-2">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody className="bg-white">
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} className="border-b hover:bg-gray-50/80 transition-colors">
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="px-2 py-2">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                                            Nenhum resultado encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </ShadcnTable>
                    </div>
                    <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                Próximo
                            </Button>
                            <select
                                className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
                                value={table.getState().pagination.pageSize}
                                onChange={e => {
                                    table.setPageSize(Number(e.target.value));
                                }}
                            >
                                {[10, 50, 100].map(pageSize => (
                                    <option key={pageSize} value={pageSize}>
                                        {pageSize} registros
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()} | Total: {totalRows} {totalRows === 1 ? 'registro' : 'registros'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}