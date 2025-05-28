'use client'

import { useState } from 'react';
import { SolucaoType } from '../types/types';

// Função que carrega xlsx apenas quando necessário
const exportToExcel = async (data: SolucaoType[]) => {
  try {
    // Importação dinâmica do xlsx apenas quando a função é chamada
    const XLSX = await import('xlsx');
    
    // Preparar dados para exportação
    const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
      Nome: item.nome,
      Sigla: item.sigla,
      Versão: item.versao,
      Status: item.status?.nome || '-',
      // Adicione outros campos conforme necessário
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Soluções");
    
    // Gerar e baixar o arquivo
    XLSX.writeFile(workbook, "solucoes.xlsx");
  } catch (error) {
    console.error("Erro ao exportar para Excel:", error);
  }
};

export default function ExcelExporter({ data }: { data: SolucaoType[] }) {
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    setIsExporting(true);
    await exportToExcel(data);
    setIsExporting(false);
  };
  
  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="bg-green-600 text-white px-3 py-2 rounded-md flex items-center gap-2 hover:bg-green-700 transition-colors"
    >
      {isExporting ? 'Exportando...' : 'Exportar Excel'}
    </button>
  );
}