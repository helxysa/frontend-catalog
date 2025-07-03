"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Settings2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta?: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    firstPage: number;
    firstPageUrl: string;
    lastPageUrl: string;
    nextPageUrl: string;
    previousPageUrl: string | null;
  };
  onPageChange?: (page: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  meta,
  onPageChange,
}: DataTableProps<TData, TValue>) {
  // Use useRef para evitar logs duplicados
  const renderCount = React.useRef(0);

  React.useEffect(() => {
    renderCount.current += 1;
    console.log('Renderização número:', renderCount.current);
    console.log('Dados na tabela:', {
      quantidade: data.length,
      primeiroRegistro: data[0],
      ultimoRegistro: data[data.length - 1]
    });
  }, [data]); // Só vai executar quando data mudar

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  console.log('data' + data)
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    filterFns: {
      custom: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const value = row.getValue(columnId);
        if (typeof value === 'object' && value !== null && 'nome' in value) {
          return value.nome === filterValue;
        }
        return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center gap-4 flex-wrap">
        <Input
          placeholder="Filtrar por nome..."
          value={(table.getColumn("nome")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("nome")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        <select
          value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            table.getColumn("status")?.setFilterValue(value);
          }}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none"
        >
          <option value="">Todos os status</option>
          {Array.from(
            new Set(
              data
                .filter((item: any) => item.status?.nome)
                .map((item: any) => item.status.nome)
            )
          )
            .sort()
            .map((statusNome) => (
              <option key={statusNome} value={statusNome}>
                {statusNome}
              </option>
            ))}
        </select>

        {/* Filtro de Prioridade */}
        <select
          value={(table.getColumn("prioridade")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("prioridade")?.setFilterValue(event.target.value)
          }
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none"
        >
          <option value="">Todas as prioridades</option>
          {Array.from(new Set(data.map((item: any) => item.prioridade?.nome)))
            .filter(Boolean)
            .sort()
            .map((prioridade) => (
              <option key={prioridade} value={prioridade}>
                {prioridade}
              </option>
            ))}
        </select>

        {/* Botão para visualização de colunas */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Settings2 className="mr-2 h-4 w-4" />
              Colunas
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
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabela */}
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
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "flex items-center gap-1 cursor-pointer select-none"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
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
                    <TableCell key={cell.id} className="px-2 py-2">
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

      {/* Paginação */}
      {meta && (
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {`Mostrando ${(meta.currentPage - 1) * meta.perPage + 1} até ${Math.min(
              meta.currentPage * meta.perPage,
              meta.total
            )} de ${meta.total} registros`}
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => onPageChange?.(1)}
                disabled={meta.currentPage === 1}
              >
                <span className="sr-only">Primeira página</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => onPageChange?.(meta.currentPage - 1)}
                disabled={meta.currentPage === 1}
              >
                <span className="sr-only">Página anterior</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center justify-center text-sm font-medium">
                Página {meta.currentPage} de {meta.lastPage}
              </div>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => onPageChange?.(meta.currentPage + 1)}
                disabled={meta.currentPage === meta.lastPage}
              >
                <span className="sr-only">Próxima página</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => onPageChange?.(meta.lastPage)}
                disabled={meta.currentPage === meta.lastPage}
              >
                <span className="sr-only">Última página</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}