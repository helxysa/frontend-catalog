import React from 'react';
import { Edit2, Trash2, Info, ChevronLeft, ChevronRight } from 'lucide-react';

// Define a generic item type that must have an id
// and can have 'nome' or other properties for display.
export interface TableItem {
  id: string | number;
  nome?: string;
  [key: string]: any;
}


// ... suas interfaces

interface ReusableTableProps<T extends TableItem> {
  items: T[];
  onDetails: (item: T) => void;
  onEdit: (item: T) => void;
  onDelete: (id: string | number) => void;
  isLoading?: boolean;
  displayField: keyof T | string;
  displayFieldHeader: string;

  // Props de paginação
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  totalPages?: number;
  currentPage?: number;
  totalRecords?: number;
  limit?: number;

  // Callbacks para paginação e limite
  onNextPage?: () => void;
  onPrevPage?: () => void;
  onLimitChange?: (newLimit: number) => void;
}

export default function ReusableTable<T extends TableItem>({
  items,
  onDetails,
  onEdit,
  onDelete,
  isLoading,
  displayField,
  displayFieldHeader,
  hasNextPage,
  hasPrevPage,
  totalPages,
  currentPage,
  totalRecords,
  limit = 10,
  onNextPage,
  onPrevPage,
  onLimitChange,
}: ReusableTableProps<T>) {

  const getDisplayValue = (item: T) => {
    const value = item[displayField as keyof T];
    return value !== undefined && value !== null ? String(value) : '';
  };

  return (
    <div className="space-y-2">
      {/* Container da Tabela - Card separado */}
      <div className="rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">#</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{displayFieldHeader}</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-500">
                  Carregando...
                </td>
              </tr>
            ) : !isLoading && items.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-500">
                  Nenhum item encontrado.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={item.id} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                    {/* O cálculo do índice agora considera a página e o limite */}
                    {currentPage && currentPage > 1 ? ((currentPage - 1) * limit) + index + 1 : index + 1}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getDisplayValue(item)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                    <div className="flex justify-end space-x-1">
                      <button
                        onClick={() => onDetails(item)}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
                        title="Detalhes"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-50 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
          </tbody>
        </table>
      </div>

      {/* Container dos Controles de Paginação - Sem fundo */}
      <div className="px-4 py-2">
        <div className="flex justify-start items-center">

          {/* Lado esquerdo: Botões de navegação e seletor de limite */}
          <div className="flex items-center space-x-2 mr-8">
            <button
              onClick={onPrevPage}
              disabled={!hasPrevPage}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 transition-colors"
            >
              Anterior
            </button>

            <button
              onClick={onNextPage}
              disabled={!hasNextPage}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 transition-colors"
            >
              Próximo
            </button>

            {onLimitChange && (
              <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value={10}>10 registros</option>
                <option value={15}>15 registros</option>
                <option value={50}>50 registros</option>
                <option value={100}>100 registros</option>
              </select>
            )}
          </div>

          {/* Lado direito: Informações de paginação */}
          <div className="text-sm text-gray-600">
            <span className="font-medium">Página {currentPage || 1} de {totalPages || 1}</span>
            <span className="text-gray-400 mx-2">|</span>
            <span>Total: <span className="font-medium text-gray-900">{totalRecords || 0}</span> registros</span>
          </div>
        </div>
      </div>
    </div>
  );
}