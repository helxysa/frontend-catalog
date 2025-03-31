'use client'

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, Edit2, Trash2, Info, ExternalLink, Columns } from "lucide-react"
import Link from 'next/link';

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DemandaType } from "../../types/types";


interface TableProps {
  demandas: DemandaType[];
  isCollapsed: boolean;
  onEdit: (solucao: DemandaType) => void;
  onDelete: (id: string) => void;
  onInfo: (solucao: DemandaType) => void;
}

export default function DataTable({
  demandas,
  isCollapsed,
  onEdit,
  onDelete,
  onInfo
}: TableProps) {
  // Helper functions
  const formatDate = (dateString?: string | null) => {
    if (!dateString) {
      return '-';
    }
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return '-';
      }
      
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
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

  const formatRepositoryLink = (repo: string) => {
    if (!repo || repo === '') return '';
    if (repo.includes('github.com')) {
      return (
        <a 
          href={repo}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
          </svg>
          GitHub
        </a>
      );
    }
    return (
      <div>
        <Link
          href={repo}
          target="_blank"
          className="text-purple-500 hover:text-purple-700 rounded-full hover:bg-purple-50 transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
        </Link>
      </div>
    );
  };

  const handleClearFilters = () => {
    table.resetColumnFilters();
  };

  const columns: ColumnDef<DemandaType>[] = [
    {
        id: "index",
        header: "#",
        cell: ({ row }) => <div className="text-sm text-gray-500">{row.index + 1}</div>,
      },
    {
      accessorKey: "nome",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent"
          >
            Nome
            <ArrowUpDown className="" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="w-[150px] truncate font-medium">{row.getValue("nome") || '-'}</div>,
    },
    {
      accessorKey: "sigla",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent"
          >
            Sigla
            <ArrowUpDown className="" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="truncate">{row.getValue("sigla") || '-'}</div>,
    },
    {
      accessorKey: "fatorGerador",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent"

          >
            Fator Gerador
            <ArrowUpDown className="" />
          </Button>
        )
      },
      cell: ({ row }) => <div className=" ">{row.original.fatorGerador || '-'}</div>,
    },
    {
      accessorKey: "demandante",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent"

          >
            Demandante
            <ArrowUpDown className="" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="w-[120px] truncate">{row.original.demandante || '-'}</div>,
    },
    {
      accessorKey: "alinhamento",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent"

          >
            Alinhamento
            <ArrowUpDown className="" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="w-[120px] truncate">{row.original.alinhamento?.nome || '-'}</div>,
    },
    {
      accessorKey: "prioridade",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent"
          >
            Prioridade
            <ArrowUpDown className="" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="w-[120px] truncate">{row.original.prioridade?.nome || '-'}</div>,
      filterFn: (row, id, value) => {
        return row.original.prioridade?.nome.toLowerCase() === value.toLowerCase();
      },
    },
    {
      accessorKey: "solucoes",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent"

          >
            Soluções
            <ArrowUpDown className="" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="truncate">teste</div>,
    },
    {
      accessorKey: "responsavel",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent"
          >
            Responsável
            <ArrowUpDown className="" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="w-[120px] truncate">{row.original.responsavel?.nome || '-'}</div>,
      filterFn: (row, id, value) => {
        return row.original.responsavel?.nome === value;
      },
    },
    {
      accessorKey: "data_status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent"

          >
            Data Status
            <ArrowUpDown className="" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="truncate">{formatDate(row.original.dataStatus || row.original.dataStatus)}</div>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent"
          >
            Status
            <ArrowUpDown className="" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const status = row.original.status;
        return status?.propriedade ? (
          <div className="w-[100px]">
            <span
              className={`rounded-md px-2 py-1 inline-block truncate ${determinarCorTexto(status.propriedade)}`}
              style={{ backgroundColor: status.propriedade }}
            >
              {status.nome || '-'}
            </span>
          </div>
        ) : (
          <span className="text-gray-500">-</span>
        );
      },
      filterFn: (row, id, value) => {
        return row.original.status?.nome === value;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Ações</div>,
      cell: ({ row }) => {
        const solucao = row.original;
        return (
          <div className="w-[120px] flex justify-end space-x-2">
            {formatRepositoryLink(solucao.link)}
            <button
              onClick={() => onEdit(solucao)}
              className="text-green-600 hover:text-green-800 rounded-full hover:bg-green-50 transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(solucao.id.toString())}
              className="text-red-400 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => onInfo(solucao)}
              className="text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-50 transition-colors"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        );
      },
    },
  ];

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "index", desc: false }
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const table = useReactTable({
    data: demandas,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    initialState: {
      sorting: [{ id: "index", desc: false }],
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4 gap-4">
        <div className="flex gap-2 items-center flex-1 flex-wrap">
          <Input
            placeholder="Filtrar por nome..."
            value={(table.getColumn("nome")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("nome")?.setFilterValue(event.target.value)
            }
            className="w-[200px] bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
          />
          
          {/* Filtro de Tipo */}
          <select
            value={(table.getColumn("demandante")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("demandante")?.setFilterValue(event.target.value)
            }
            className="w-[180px] h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
          >
            <option value="">Todos os tipos</option>
            {Array.from(new Set(demandas.map(s => s.demandante)))
              .filter(Boolean)
              .sort()
              .map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
          </select>

         
         

          <select
            value={(table.getColumn("responsavel")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("responsavel")?.setFilterValue(event.target.value)
            }
            className="w-[180px] h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
          >
            <option value="">Todos os responsáveis</option>
            {Array.from(new Set(demandas.map(s => s.responsavel?.nome)))
              .filter(Boolean)
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
              table.getColumn("prioridade")?.setFilterValue(event.target.value)
            }
            className="w-[180px] h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
          >
            <option value="">Todos as prioridades</option>
            {Array.from(new Set(demandas.map(s => s.prioridade?.nome)))
              .filter(Boolean)
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
              table.getColumn("status")?.setFilterValue(event.target.value)
            }
            className="w-[180px] h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
          >
            <option value="">Todos os status</option>
            {Array.from(new Set(demandas.map(s => s.status?.nome)))
              .filter(Boolean)
              .sort()
              .map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
          </select>

          <select
            value={(table.getColumn("fatorGerador")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("fatorGerador")?.setFilterValue(event.target.value)
            }
            className="w-[180px] h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
          >
            <option value="">Todos os fatores geradores</option>
            {Array.from(new Set(demandas.map(s => s.fatorGerador)))
              .filter(Boolean)
              .sort()
              .map((fator) => (
                <option key={fator} value={fator}>
                  {fator}
                </option>
              ))}
          </select>

          
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="bg-white h-10"
          >
            Limpar Filtros
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="bg-white h-10 w-10 shrink-0"
              >
                <Columns className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-gray-100 border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    className="text-xs font-medium text-gray-600 h-9 px-2"
                  >
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
                <TableRow
                  key={row.id}
                  className="border-b hover:bg-gray-50/80 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      className="px-2 py-2"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-500"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="bg-white"
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="bg-white"
          >
            Próximo
          </Button>

          <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value))
            }}
            className="h-8 rounded-md border border-gray-300 bg-white px-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
          >
            {[10, 50, 100].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize} registros
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div>
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </div>
          <div>
            | Total: {table.getFilteredRowModel().rows.length} registros
          </div>
        </div>
      </div>
    </div>
  )
}
