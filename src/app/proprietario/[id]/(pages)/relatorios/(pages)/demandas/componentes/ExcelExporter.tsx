'use client'

import { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';

interface ExcelExporterProps {
  demandas: Array<{
    sigla: string;
    nome: string;
    status: string;
    prioridade: string;
    responsavel: string;
  }>;
}

export default function ExcelExporter({ demandas }: ExcelExporterProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const XLSX = (await import('xlsx')).default;
      const ws = XLSX.utils.json_to_sheet(demandas);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Demandas");
      XLSX.writeFile(wb, "relatorio_demandas.xlsx");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={exportToExcel}
      disabled={isExporting}
      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-green-400"
    >
      <FileSpreadsheet className="w-4 h-4" />
      {isExporting ? 'Exportando...' : 'Exportar Excel'}
    </button>
  );
}