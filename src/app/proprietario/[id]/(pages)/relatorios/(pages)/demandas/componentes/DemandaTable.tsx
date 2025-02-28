'use client'

interface Demanda {
  sigla: string;
  nome: string;
  status: string;
  prioridade: string;
  responsavel: string;
}

interface DemandaTableProps {
  demandas: Demanda[];
}

export default function DemandaTable({ demandas }: DemandaTableProps) {
  return (
    <div className="px-1">
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md w-full">
        <table className="min-w-full table-fixed">
          <thead className="bg-gray-50">
            <tr>
              {['Sigla', 'Nome', 'Status', 'Prioridade', 'Responsável'].map((header) => (
                <th key={header} className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {demandas.map((demanda: Demanda, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 text-sm text-gray-700 whitespace-nowrap">{demanda.sigla}</td>
                <td className="py-4 px-6 text-sm text-gray-700">{demanda.nome}</td>
                <td className="py-4 px-6 text-sm text-gray-700 whitespace-nowrap">{demanda.status}</td>
                <td className="py-4 px-6 text-sm text-gray-700 whitespace-nowrap">{demanda.prioridade}</td>
                <td className="py-4 px-6 text-sm text-gray-700 whitespace-nowrap">{demanda.responsavel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}