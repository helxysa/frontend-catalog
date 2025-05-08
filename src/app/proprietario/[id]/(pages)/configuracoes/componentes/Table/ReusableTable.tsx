import React from 'react';
import { Edit2, Trash2, Info } from 'lucide-react';

// Define a generic item type that must have an id
// and can have 'nome' or other properties for display.
export interface TableItem {
  id: string | number;
  nome?: string; // Common field
  [key: string]: any; // Allows other properties like 'propriedade'
}

interface ReusableTableProps<T extends TableItem> {
  items: T[];
  onDetails: (item: T) => void;
  onEdit: (item: T) => void;
  onDelete: (id: string | number) => void;
  isLoading?: boolean;
  // Specifies the key in your data object for the main display column (e.g., 'nome', 'propriedade')
  displayField: keyof T | string;
  // The header text for the main display column (e.g., "Nome", "Propriedade")
  displayFieldHeader: string;
}

export default function ReusableTable<T extends TableItem>({
  items,
  onDetails,
  onEdit,
  onDelete,
  isLoading,
  displayField,
  displayFieldHeader,
}: ReusableTableProps<T>) {

  const getDisplayValue = (item: T) => {
    const value = item[displayField as keyof T];
    return value !== undefined && value !== null ? String(value) : '';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">#</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{displayFieldHeader}</th>
            <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {isLoading && items.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-4 text-gray-500">
                Carregando...
              </td>
            </tr>
          ) : !isLoading && items.length === 0 ? (
             <tr>
              <td colSpan={3} className="text-center py-4 text-gray-500">
                Nenhum item encontrado.
              </td>
            </tr>
          ) : (
            items.map((item, index) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                {index + 1}
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                {getDisplayValue(item)}
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => onDetails(item)}
                    className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
                    title="Detalhes"
                  >
                    <Info className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onEdit(item)}
                    className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-50 transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          )))}
        </tbody>
      </table>
    </div>
  );
}