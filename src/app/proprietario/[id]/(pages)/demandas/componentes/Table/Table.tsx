'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { getDemandas, getSolucoesByDemandaId, deleteDemandaAction } from '../../actions/actions';
import { Demanda, PaginatedResponse } from '../../types/types';
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
import Form from '../Form/Form';
import {
  ArrowUpDown,
  Columns,
  Edit2,
  ExternalLink,
  Info,
  Plus,
  Trash2,
} from 'lucide-react';
import InfoModal from '../InfoModal/InfoModal';

export default function Table() {
  const [data, setData] = useState<Demanda[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [demandaToEdit, setDemandaToEdit] = useState<Demanda | null>(null);
  const [solucoes, setSolucoes] = useState<{ [key: number]: any[] }>({});
  const [loadingSolucoes, setLoadingSolucoes] = useState<{ [key: number]: boolean }>({});
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedDemanda, setSelectedDemanda] = useState<Demanda | null>(null);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState(0);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  const fetchData = useCallback(async () => {
    const proprietarioId = localStorage.getItem('selectedProprietarioId');
    if (proprietarioId) {
      try {
        const response: PaginatedResponse = await getDemandas(
          proprietarioId,
          pagination.pageIndex + 1,
          pagination.pageSize
        );
        const demandasData = response.data || [];
        setData(demandasData);
        setTotalRows(response.meta.total);
      } catch (error) {
        console.error('Erro ao buscar demandas:', error);
        setData([]);
      }
    }
  }, [pagination]);

  const fetchSolucoes = async (demandaId: number) => {
    if (loadingSolucoes[demandaId] || solucoes[demandaId]) return;

    setLoadingSolucoes(prev => ({ ...prev, [demandaId]: true }));
    try {
      const solucoesData = await getSolucoesByDemandaId(String(demandaId));
      setSolucoes(prev => ({ ...prev, [demandaId]: solucoesData || [] }));
    } catch (error) {
      console.error(`Erro ao buscar soluções para demanda ${demandaId}:`, error);
      setSolucoes(prev => ({ ...prev, [demandaId]: [] }));
    } finally {
      setLoadingSolucoes(prev => ({ ...prev, [demandaId]: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = () => {
    setDemandaToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = useCallback((demanda: Demanda) => {
    setDemandaToEdit(demanda);
    setIsFormOpen(true);
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta demanda?')) {
      try {
        await deleteDemandaAction(id);
        fetchData();
      } catch (error) {
        console.error('Erro ao excluir demanda', error);
        alert('Falha ao excluir a demanda.');
      }
    }
  }

  const handleInfo = (demanda: Demanda) => {
    setSelectedDemanda(demanda);
    setIsInfoModalOpen(true);
  };

  const handleCloseInfoModal = () => {
    setIsInfoModalOpen(false);
    setSelectedDemanda(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setDemandaToEdit(null);
  };

  const handleSaveForm = () => {
    handleCloseForm();
    fetchData();
  };

  const handleClearFilters = () => {
    table.resetColumnFilters();
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return new Intl.DateTimeFormat('pt-BR').format(date);
    } catch (error) {
      return '-';
    }
  };

  const determinarCorTexto = (corHex: string | undefined) => {
    if (!corHex) return 'text-gray-800';
    corHex = corHex.replace('#', '');
    const r = parseInt(corHex.substr(0, 2), 16);
    const g = parseInt(corHex.substr(2, 2), 16);
    const b = parseInt(corHex.substr(4, 2), 16);
    const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminancia > 0.5 ? 'text-gray-800' : 'text-white';
  };

  const columns = useMemo<ColumnDef<Demanda>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => <div className="text-sm text-gray-500">{row.index + 1}</div>,
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
        accessorKey: 'sigla',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent">
            Sigla <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: 'fatorGerador',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent">
            Fator Gerador <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: 'demandante',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent">
            Demandante <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        filterFn: (row, id, value) => {
          return value === row.getValue(id);
        },
      },
      {
        accessorKey: 'alinhamento.nome',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent">
            Alinhamento <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => row.original.alinhamento?.nome || 'N/A',
      },
      {
        id: 'prioridade',
        accessorFn: row => row.prioridade?.nome,
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent">
            Prioridade <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => row.original.prioridade?.nome || 'N/A',
        filterFn: (row, id, value) => {
          if (value === 'sem_prioridade') {
            return !row.original.prioridade || !row.original.prioridade.nome;
          }
          return row.original.prioridade?.nome === value;
        },
      },
      {
        id: 'solucoes',
        header: 'Soluções',
        cell: ({ row }) => {
          const demandaId = row.original.id;
          const solucoesDemanda = solucoes[demandaId];
          const isLoading = loadingSolucoes[demandaId];

          const handleMouseEnter = () => {
            fetchSolucoes(demandaId);
          };

          return (
            <div onMouseEnter={handleMouseEnter} className="text-center">
              {isLoading ? "..." : (solucoesDemanda !== undefined ? solucoesDemanda.length : <span className='text-gray-400'>-</span>)}
            </div>
          );
        }
      },
      {
        id: 'responsavel',
        accessorFn: row => row.responsavel?.nome,
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent">
            Responsável <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => row.original.responsavel?.nome || 'N/A',
        filterFn: (row, id, value) => {
          if (value === 'sem_responsavel') {
            return !row.original.responsavel || !row.original.responsavel.nome;
          }
          return row.original.responsavel?.nome === value;
        },
      },
      {
        accessorKey: 'dataStatus',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent">
            Data Status <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => formatDate(row.original.dataStatus),
      },
      {
        id: 'status',
        accessorFn: row => row.status?.nome,
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent">
            Status <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          if (!status?.nome) {
            return (
              <div className="flex items-center">
                <span className="rounded-md px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200">
                  N/A
                </span>
              </div>
            );
          }
          return (
            <div className="flex items-center">
              <span
                className={`rounded-md px-3 py-1 text-sm font-medium ${determinarCorTexto(status.propriedade)}`}
                style={{ backgroundColor: status.propriedade }}
              >
                {status.nome}
              </span>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          const statusNome = row.original.status?.nome;
          if (value === 'sem_status') {
            return !statusNome;
          }
          return statusNome === value;
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Ações</div>,
        cell: ({ row }) => {
          const demanda = row.original;
          return (
            <div className="flex justify-end space-x-2">
              {demanda.link && (
                <a
                  href={demanda.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-800 rounded-full hover:bg-purple-50 transition-colors p-1"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
              <button onClick={() => handleEdit(demanda)} className="text-green-600 hover:text-green-800 rounded-full hover:bg-green-50 transition-colors p-1">
                <Edit2 className="w-5 h-5" />
              </button>
              <button onClick={() => handleDelete(demanda.id)} className="text-red-400 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors p-1">
                <Trash2 className="w-5 h-5" />
              </button>
              <button onClick={() => handleInfo(demanda)} className="text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-50 transition-colors p-1">
                <Info className="w-5 h-5" />
              </button>

            </div>
          );
        },
      },
    ],
    [handleEdit, solucoes, loadingSolucoes]
  );

  const pageCount = Math.ceil(totalRows / pagination.pageSize);

  const table = useReactTable({
    data,
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

  return (
    <div className="w-full space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Crie sua demanda</h1>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </div>

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
            <option value="">Todos os demandantes</option>
            {Array.from(new Set(data.map(s => s.demandante).filter(Boolean)))
              .sort()
              .map((demandante) => (
                <option key={demandante} value={demandante}>
                  {demandante}
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
            <option value="sem_responsavel">Não informado</option>
            {Array.from(new Set(data.map(s => s.responsavel?.nome).filter(Boolean) as string[]))
              .sort()
              .map((responsavel) => (
                <option key={responsavel} value={responsavel}>
                  {responsavel}
                </option>
              ))}
          </select>
          <select
            value={(table.getColumn("prioridade")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("prioridade")?.setFilterValue(event.target.value || undefined)
            }
            className="w-[180px] h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
          >
            <option value="">Todas as prioridades</option>
            <option value="sem_prioridade">Não informado</option>
            {Array.from(new Set(data.map(s => s.prioridade?.nome).filter(Boolean) as string[]))
              .sort()
              .map((prioridade) => (
                <option key={prioridade} value={prioridade}>
                  {prioridade}
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
            <option value="sem_status">Não informado</option>
            {Array.from(new Set(data.map(s => s.status?.nome).filter(Boolean) as string[]))
              .sort()
              .map((status) => (
                <option key={status} value={status}>
                  {status}
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
      <div className="rounded-md border bg-white">
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
      {isInfoModalOpen && <InfoModal demanda={selectedDemanda} onClose={handleCloseInfoModal} />}
      {isFormOpen && (
        <Form
          demandaToEdit={demandaToEdit as any}
          onClose={handleCloseForm}
          onSave={handleSaveForm}
        />
      )}
    </div>
  );
}