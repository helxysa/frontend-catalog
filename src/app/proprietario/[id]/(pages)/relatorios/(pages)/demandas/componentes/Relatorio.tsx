'use client'

import { useState, useEffect } from 'react';
import { getDemandas } from '../actions/action';
import { DemandaType } from '../types/type';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { FileText, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

// Estilos para o PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a365d',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#4a5568',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
    color: '#2d3748',
    fontWeight: 'bold',
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 12,
  },
  headerCell: {
    backgroundColor: '#f7fafc',
    fontWeight: 'bold',
    color: '#4a5568',
  },
  metricContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricBox: {
    width: '30%',
    padding: 15,
    backgroundColor: '#f7fafc',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4a5568',
    marginBottom: 5,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
    textAlign: 'center',
  },
});

// Função para calcular métricas
const calculateMetrics = (demandas: DemandaType[]) => {
  const totalDemandas = demandas.length;
  
  const statusCount = demandas.reduce((acc, demanda) => {
    const status = demanda.status?.nome || 'Sem status';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const prioridadeCount = demandas.reduce((acc, demanda) => {
    const prioridade = demanda.prioridade?.nome || 'Sem prioridade';
    acc[prioridade] = (acc[prioridade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return { totalDemandas, statusCount, prioridadeCount };
};

// Componente PDF
const DemandasPDF = ({ demandas }: { demandas: DemandaType[] }) => {
  const { totalDemandas, statusCount, prioridadeCount } = calculateMetrics(demandas);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Relatório de Demandas</Text>
        <Text style={styles.subtitle}>Relatório gerado em {new Date().toLocaleDateString()}</Text>

        {/* Seção de Métricas */}
        <View style={styles.metricContainer}>
          <View style={styles.metricBox}>
            <Text style={styles.metricTitle}>Total de Demandas</Text>
            <Text style={styles.metricValue}>{totalDemandas}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricTitle}>Status</Text>
            {Object.entries(statusCount).map(([status, count]) => (
              <Text key={status} style={styles.metricValue}>
                {status}: {count}
              </Text>
            ))}
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricTitle}>Prioridades</Text>
            {Object.entries(prioridadeCount).map(([prioridade, count]) => (
              <Text key={prioridade} style={styles.metricValue}>
                {prioridade}: {count}
              </Text>
            ))}
          </View>
        </View>

        {/* Tabela de Demandas */}
        <Text style={styles.sectionTitle}>Detalhes das Demandas</Text>
        <View style={styles.table}>
          {/* Cabeçalho da tabela */}
          <View style={[styles.tableRow, styles.headerCell]}>
            <Text style={styles.tableCell}>Sigla</Text>
            <Text style={styles.tableCell}>Nome</Text>
            <Text style={styles.tableCell}>Status</Text>
            <Text style={styles.tableCell}>Prioridade</Text>
            <Text style={styles.tableCell}>Responsável</Text>
          </View>
          {/* Dados das demandas */}
          {demandas.map((demanda) => (
            <View key={demanda.id} style={styles.tableRow}>
              <Text style={styles.tableCell}>{demanda.sigla}</Text>
              <Text style={styles.tableCell}>{demanda.nome}</Text>
              <Text style={styles.tableCell}>{demanda.status?.nome || 'N/A'}</Text>
              <Text style={styles.tableCell}>{demanda.prioridade?.nome || 'N/A'}</Text>
              <Text style={styles.tableCell}>{demanda.responsavel?.nome || 'N/A'}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

// Função para normalizar os dados
const normalizeDemandas = (demandas: DemandaType[]) => {
  return demandas.map(demanda => ({
    ...demanda,
    status: demanda.status || { nome: 'Sem status' },
    prioridade: demanda.prioridade || { nome: 'Sem prioridade' },
    responsavel: demanda.responsavel || { nome: 'Sem responsável' },
  }));
};

export default function DemandasComponent() {
  const [demandas, setDemandas] = useState<DemandaType[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Carrega as demandas ao montar o componente
  useEffect(() => {
    const fetchDemandas = async () => {
      const data = await getDemandas();
      const storedId = localStorage.getItem('selectedProprietarioId'); 
      if (storedId) {
        const demandasFiltradas = data.filter(
          (demanda: DemandaType) => demanda.proprietario?.id === Number(storedId)
        );
        setDemandas(demandasFiltradas); 
      }
    };
    fetchDemandas();
  }, []);

  const normalizedDemandas = normalizeDemandas(demandas);

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      // Prepara os dados para o Excel
      const excelData = normalizedDemandas.map(demanda => ({
        Sigla: demanda.sigla,
        Nome: demanda.nome,
        Status: demanda.status.nome,
        Prioridade: demanda.prioridade.nome,
        Responsável: demanda.responsavel.nome
      }));

      // Cria uma nova planilha
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Demandas");

      // Gera e faz download do arquivo
      XLSX.writeFile(wb, "relatorio_demandas.xlsx");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center  bg-gray-50 pt-4 pb-20">
      <div className="w-full max-w-6xl p-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Relatório de Demandas</h1>
          <div className="flex gap-4">
            <button
              onClick={exportToExcel}
              disabled={isExporting}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-green-400"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {isExporting ? 'Gerando Excel...' : 'Exportar Excel'}
            </button>
            <PDFDownloadLink
              document={<DemandasPDF demandas={normalizedDemandas} />}
              fileName="relatorio_demandas.pdf"
            >
              {({ loading }) => (
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-blue-400"
                  disabled={loading}
                >
                  <FileText className="w-4 h-4" />
                  {loading ? 'Gerando PDF...' : 'Gerar PDF'}
                </button>
              )}
            </PDFDownloadLink>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Sigla</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Nome</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Prioridade</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Responsável</th>
              </tr>
            </thead>
            <tbody>
              {normalizedDemandas.map((demanda) => (
                <tr key={demanda.id} className="hover:bg-gray-50 transition-colors even:bg-gray-50">
                  <td className="py-4 px-6 text-sm text-gray-700">{demanda.sigla}</td>
                  <td className="py-4 px-6 text-sm text-gray-700">{demanda.nome}</td>
                  <td className="py-4 px-6 text-sm text-gray-700">{demanda.status.nome}</td>
                  <td className="py-4 px-6 text-sm text-gray-700">{demanda.prioridade.nome}</td>
                  <td className="py-4 px-6 text-sm text-gray-700">{demanda.responsavel.nome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}