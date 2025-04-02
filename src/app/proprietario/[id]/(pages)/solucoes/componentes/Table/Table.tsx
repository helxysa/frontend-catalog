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
import { ArrowUpDown, ChevronDown, Edit2, Trash2, Info, ExternalLink, Columns, FileText, FileSpreadsheet } from "lucide-react"
import Link from 'next/link';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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

import { SolucaoType, BaseType } from '../../types/types';

interface TableProps {
  solucoes: SolucaoType[];
  linguagens: BaseType[];
  isCollapsed: boolean;
  onEdit: (solucao: SolucaoType) => void;
  onDelete: (id: string) => void;
  onInfo: (solucao: SolucaoType) => void;
}

// Estilos para o PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
  },
  tableHeader: {
    backgroundColor: '#f2f2f2',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    fontSize: 10,
  },
});

interface TablePDFProps {
  columns: any[];
  data: any[];
}

// Componente PDF Document modificado
const TablePDF = ({ columns, data }: TablePDFProps) => {
  // Função para extrair o valor de exibição seguro de um objeto complexo
  const getSafeDisplayValue = (row: any, columnId: string): string => {
    // Handle special cases by column ID
    switch (columnId) {
      case 'index':
        return String(row.index || '-');
      case 'nome':
      case 'sigla':
      case 'versao':
      case 'criticidade':
      case 'andamento':
        return String(row[columnId] || '-');
      case 'tipo':
        return row.tipo?.nome || '-';
      case 'desenvolvedor':
        return row.desenvolvedor?.nome || '-';
      case 'demanda':
        return row.demanda?.nome || '-';
      case 'categoria':
        return row.categoria?.nome || '-';
      case 'responsavel':
        return row.responsavel?.nome || '-';
      case 'status':
        return row.status?.nome || '-';
      case 'repositorio':
        return String(row.repositorio || '-');
      case 'data_status':
        if (!row.data_status && !row.dataStatus) return '-';
        try {
          const date = new Date(row.data_status || row.dataStatus);
          return date.toLocaleDateString('pt-BR');
        } catch (e) {
          return '-';
        }
      case 'linguagens':
        if (row.linguagens && Array.isArray(row.linguagens)) {
          return row.linguagens.map((l: { nome: string }) => l.nome).join(', ');
        }
        if (row.linguagemId) {
          return String(row.linguagemId).split(',').join(', ');
        }
        return '-';
      default:
        return '-';
    }
  };

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>Relatório de Soluções</Text>
        <View style={styles.table}>
          {/* Cabeçalho da tabela */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            {columns.map((column) => (
              <View key={column.id} style={[styles.tableCell, { width: `${100 / columns.length}%` }]}>
                <Text>{String(column.id)}</Text>
              </View>
            ))}
          </View>
          
          {/* Linhas de dados */}
          {data.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              {columns.map((column) => (
                <View key={column.id} style={[styles.tableCell, { width: `${100 / columns.length}%` }]}>
                  <Text>{getSafeDisplayValue(row, column.id)}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

// Função para gerar e baixar o PDF
const generatePDF = async (columns: { id: string, accessorKey: string }[], data: any[]) => {
  try {
    // Criar o documento PDF
    const pdfDoc = <TablePDF columns={columns} data={data} />;
    
    // Gerar o blob do PDF
    const blob = await pdf(pdfDoc).toBlob();
    
    // Salvar o arquivo
    saveAs(blob, 'solucoes.pdf');
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert('Houve um erro ao gerar o PDF. Por favor, tente novamente.');
  }
};

// Função para exportar para Excel
const exportToExcel = (columns: { id: string, accessorKey: string }[], data: any[]) => {
  // Preparar dados para o Excel
  const wsData = [
    // Cabeçalho
    columns.map((column: { id: string }) => column.id),
    
    // Linhas de dados
    ...data.map(row => 
      columns.map(column => {
        // Simplificar o valor para texto no Excel
        let cellValue = row[column.accessorKey] || '-';
        
        // Tratamento especial para alguns tipos de colunas
        if (column.id === 'status' && row.status) {
          cellValue = row.status.nome || '-';
        } else if (column.id === 'tipo' && row.tipo) {
          cellValue = row.tipo.nome || '-';
        } else if (column.id === 'desenvolvedor' && row.desenvolvedor) {
          cellValue = row.desenvolvedor.nome || '-';
        } else if (column.id === 'categoria' && row.categoria) {
          cellValue = row.categoria.nome || '-';
        } else if (column.id === 'responsavel' && row.responsavel) {
          cellValue = row.responsavel.nome || '-';
        } else if (column.id === 'linguagens') {
          // Simplificação para linguagens
          if (row.linguagens && Array.isArray(row.linguagens)) {
            cellValue = row.linguagens.map((l: { nome: string }) => l.nome).join(', ');
          }
        }
        
        return cellValue;
      })
    )
  ];
  
  // Criar planilha
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Soluções");
  
  // Gerar arquivo e baixar
  XLSX.writeFile(wb, "solucoes.xlsx");
};

export default function DataTable({
  solucoes,
  linguagens,
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

  const renderTableLinguagens = (solucao: any) => {
    if (solucao.linguagens && Array.isArray(solucao.linguagens)) {
      return (
        <div className="flex flex-wrap gap-1">
          {solucao.linguagens.map((linguagem: any) => (
            <span
              key={linguagem.id}
              className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full"
            >
              {linguagem.nome}
            </span>
          ))}
        </div>
      );
    }

    if (solucao.linguagemId) {
      const ids = String(solucao.linguagemId).split(',').map(id => Number(id.trim()));
      
      const linguagensEncontradas = ids
        .map(id => linguagens.find(l => l.id === id))
        .filter(Boolean);

      if (linguagensEncontradas.length > 0) {
        return (
          <div className="flex flex-wrap gap-1">
            {linguagensEncontradas.map(linguagem => (
              <span
                key={(linguagem as {id: number; nome: string}).id}
                className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full"
              >
                {(linguagem as {id: number; nome: string}).nome}
              </span>
            ))}
          </div>
        );
      }
    }

    return '-';
  };

  const getProgressColor = (progress: number) => {
    if (progress < 25) return 'bg-red-500';
    if (progress < 50) return 'bg-orange-500';
    if (progress < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const ProgressBar = React.memo(({ progress }: { progress: number }) => {
    const progressColor = getProgressColor(progress);
    
    return (
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${progressColor} transition-all duration-300 ease-in-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  });

  const columns: ColumnDef<SolucaoType>[] = [
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
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("nome") || '-'}</div>,
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
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("sigla") || '-'}</div>,
    },
    {
      accessorKey: "versao",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent"

          >
            Versão
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("versao") || '-'}</div>,
    },
    {
      accessorKey: "tipo",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent"

          >
            Tipo
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.original.tipo?.nome || '-'}</div>,
      filterFn: (row, id, value) => {
        return row.original.tipo?.nome === value;
      },
    },
    {
      accessorKey: "linguagens",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent"

          >
            Tecnologia
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => renderTableLinguagens(row.original),
      filterFn: (row, id, value) => {
        if (!value) return true;
        const linguagemIds = String(row.original.linguagemId || '').split(',').map(Number);
        return linguagemIds.includes(Number(value));
      },
    },
    {
      accessorKey: "desenvolvedor",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent"

          >
            Desenvolvedor
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.original.desenvolvedor?.nome || '-'}</div>,
      filterFn: (row, id, value) => {
        return row.original.desenvolvedor?.nome === value;
      },
    },
    {
      accessorKey: "demanda",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent"

          >
            Demanda
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.original.demanda?.nome || '-'}</div>,
      filterFn: (row, id, value) => {
        return row.original.demanda?.nome === value;
      },
    },
    {
      accessorKey: "categoria",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent"

          >
            Categoria
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.original.categoria?.nome || '-'}</div>,
      filterFn: (row, id, value) => {
        return row.original.categoria?.nome === value;
      },
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
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.original.responsavel?.nome || '-'}</div>,
      filterFn: (row, id, value) => {
        return row.original.responsavel?.nome === value;
      },
    },
    {
      accessorKey: "repositorio",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent"

          >
            Repositório
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => formatRepositoryLink(row.original.repositorio),
    },
    {
      accessorKey: "criticidade",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent"

          >
            Criticidade
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("criticidade") || '-'}</div>,
      filterFn: (row, id, value) => {
        return row.getValue("criticidade") === value;
      },
    },
    {
      accessorKey: "andamento",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium text-gray-600 w-full justify-start p-0 hover:bg-transparent"

          >
            Andamento
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => {
        const progress = Number(row.getValue("andamento")) || 0;
        return (
          <div className="flex flex-col space-y-1">
            <div className="flex justify-between items-center gap-2">
              <span className="font-medium">{progress}%</span>
              <span className={`text-xs ${
                progress === 100 
                  ? 'text-green-600' 
                  : progress > 0 
                    ? 'text-blue-600' 
                    : 'text-gray-500'
              }`}>
                {progress === 100 
                  ? 'Concluído' 
                  : progress > 0 
                    ? 'Em andamento' 
                    : 'Não iniciado'}
              </span>
            </div>
            <ProgressBar progress={progress} />
          </div>
        );
      },
    },
    {
      accessorKey: "data_status",
      header: () => {
        return (
          <div className="text-xs font-medium text-gray-600 w-full justify-start p-0">
            Data Status
          </div>
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
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => {
        const status = row.original.status;
        return status?.propriedade ? (
          <span
            className={`rounded-md px-2 py-1 inline-block ${determinarCorTexto(status.propriedade)}`}
            style={{ backgroundColor: status.propriedade }}
          >
            {status.nome || '-'}
          </span>
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
          <div className="flex justify-end space-x-2">
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

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [isLoading, setIsLoading] = React.useState(false);
  const [filterValue, setFilterValue] = React.useState("");

  const table = useReactTable({
    data: solucoes,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
  })

  const handleClearFilters = () => {
    table.resetColumnFilters();
  };

  // Adicione um estado para controlar se o dropdown está aberto
  const [isColumnMenuOpen, setIsColumnMenuOpen] = React.useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Sua lógica de busca de dados aqui
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      table.getColumn("nome")?.setFilterValue(filterValue);
    }, 300);

    return () => clearTimeout(timeout);
  }, [filterValue]);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3">
        {/* Área de filtros */}
        <div className="flex gap-2 items-center flex-wrap">
          <Input
            placeholder="Filtrar por nome..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="w-[200px] bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
          />
          
          {/* Filtro de Demanda */}
          <select
            value={(table.getColumn("demanda")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("demanda")?.setFilterValue(event.target.value)
            }
            className="w-[180px] h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
          >
            <option value="">Todas as demandas</option>
            {Array.from(new Set(solucoes.map(s => s.demanda?.nome)))
              .filter(Boolean)
              .sort()
              .map((demanda) => (
                <option key={demanda} value={demanda}>
                  {demanda}
                </option>
              ))}
          </select>

          {/* Filtro de Tipo */}
          <select
            value={(table.getColumn("tipo")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("tipo")?.setFilterValue(event.target.value)
            }
            className="w-[180px] h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
          >
            <option value="">Todos os tipos</option>
            {Array.from(new Set(solucoes.map(s => s.tipo?.nome)))
              .filter(Boolean)
              .sort()
              .map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
          </select>

          {/* Filtro de Linguagem */}
          <select
            value={(table.getColumn("linguagens")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("linguagens")?.setFilterValue(event.target.value)
            }
            className="w-[200px] h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
          >
            <option value="">Todas as tecnologias</option>
            {linguagens
              .sort((a, b) => a.nome.localeCompare(b.nome))
              .map((linguagem) => (
                <option key={linguagem.id} value={linguagem.id}>
                  {linguagem.nome}
                </option>
              ))}
          </select>

          {/* Filtro de Desenvolvedor */}
          <select
            value={(table.getColumn("desenvolvedor")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("desenvolvedor")?.setFilterValue(event.target.value)
            }
            className="w-[220px] h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
          >
            <option value="">Todos os desenvolvedores</option>
            {Array.from(new Set(solucoes.map(s => s.desenvolvedor?.nome)))
              .filter(Boolean)
              .sort()
              .map((dev) => (
                <option key={dev} value={dev}>
                  {dev}
                </option>
              ))}
          </select>

          {/* Filtro de Status */}
          <select
            value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("status")?.setFilterValue(event.target.value)
            }
            className="w-[180px] h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
          >
            <option value="">Todos os status</option>
            {Array.from(new Set(solucoes.map(s => s.status?.nome)))
              .filter(Boolean)
              .sort()
              .map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
          </select>

          {/* Filtro de Categoria */}
          <select
            value={(table.getColumn("categoria")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("categoria")?.setFilterValue(event.target.value)
            }
            className="w-[180px] h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
          >
            <option value="">Todas as categorias</option>
            {Array.from(new Set(solucoes.map(s => s.categoria?.nome)))
              .filter(Boolean)
              .sort()
              .map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
          </select>

          {/* Filtro de Responsável */}
          <select
            value={(table.getColumn("responsavel")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("responsavel")?.setFilterValue(event.target.value)
            }
            className="w-[180px] h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
          >
            <option value="">Todos os responsáveis</option>
            {Array.from(new Set(solucoes.map(s => s.responsavel?.nome)))
              .filter(Boolean)
              .sort()
              .map((responsavel) => (
                <option key={responsavel} value={responsavel}>
                  {responsavel}
                </option>
              ))}
          </select>

          {/* Filtro de Criticidade */}
          <select
            value={(table.getColumn("criticidade")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("criticidade")?.setFilterValue(event.target.value)
            }
            className="w-[180px] h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
          >
            <option value="">Todas as criticidades</option>
            {Array.from(new Set(solucoes.map(s => s.criticidade)))
              .filter(Boolean)
              .sort()
              .map((criticidade) => (
                <option key={criticidade} value={criticidade}>
                  {criticidade}
                </option>
              ))}
          </select>
        </div>
        
        {/* Barra de ações - mais próxima da tabela */}
        <div className="flex justify-end gap-2 mt-1 mb-2">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="bg-white h-8 text-sm font-medium"
          >
            Limpar Filtros
          </Button>

          <DropdownMenu open={isColumnMenuOpen} onOpenChange={setIsColumnMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="bg-white h-8 w-8 shrink-0"
              >
                <Columns className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2 text-xs font-semibold text-gray-700 border-b">
                Colunas visíveis
              </div>
              
              <div className="flex gap-1 px-2 py-1.5 border-b">
                <Button
                  onClick={() => generatePDF(
                    table.getVisibleFlatColumns().map((col) => ({
                      id: col.id,
                      accessorKey: col.id
                    })), 
                    table.getFilteredRowModel().rows.map(row => row.original)
                  )}
                  className="flex-1 inline-flex items-center justify-center gap-1 text-xs px-2 py-1 bg-white text-red-600 border border-red-200 font-medium rounded hover:bg-red-50 transition-colors"
                >
                  <FileText className="w-3 h-3" />
                  PDF
                </Button>
                
                <Button
                  onClick={() => exportToExcel(
                    table.getVisibleFlatColumns().map((col) => ({
                      id: col.id,
                      accessorKey: col.id
                    })),
                    table.getFilteredRowModel().rows.map(row => row.original)
                  )}
                  className="flex-1 inline-flex items-center justify-center gap-1 text-xs px-2 py-1 bg-white text-green-600 border border-green-200 font-medium rounded hover:bg-green-50 transition-colors"
                >
                  <FileSpreadsheet className="w-3 h-3" />
                  Excel
                </Button>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto py-1">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize py-1.5"
                        checked={column.getIsVisible()}
                        // Importante: modificar para não fechar o menu ao clicar
                        // Usamos stopPropagation para impedir que o clique se propague
                        onSelect={(e) => e.preventDefault()}
                        onCheckedChange={(value) => 
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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
      
      {/* Paginação */}
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
