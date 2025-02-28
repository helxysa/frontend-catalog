'use client'

import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { FileText } from 'lucide-react';

// Definindo os estilos do PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff'
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold'
  },
  section: {
    margin: 10,
    padding: 10
  },
  title: {
    fontSize: 18,
    marginBottom: 10
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginVertical: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minHeight: 25,
    alignItems: 'center'
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold'
  },
  tableCell: {
    width: '20%',
    padding: 5,
    fontSize: 10
  },
  metricsSection: {
    marginTop: 20,
    padding: 10
  },
  metricsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5
  },
  metricsItem: {
    fontSize: 10,
    marginBottom: 3
  }
});

interface DemandasPDFProps {
  demandas: Array<{
    sigla: string;
    nome: string;
    status: string;
    prioridade: string;
    responsavel: string;
  }>;
  metrics: {
    totalDemandas: number;
    statusCount: Record<string, number>;
    prioridadeCount: Record<string, number>;
  };
}

const DemandasPDF = ({ demandas, metrics }: DemandasPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text>Relatório de Demandas</Text>
      </View>

      {/* Seção de Métricas */}
      <View style={styles.metricsSection}>
        <Text style={styles.metricsTitle}>Resumo</Text>
        <Text style={styles.metricsItem}>Total de Demandas: {metrics.totalDemandas}</Text>
        
        <Text style={styles.metricsTitle}>Status</Text>
        {Object.entries(metrics.statusCount).map(([status, count]) => (
          <Text key={status} style={styles.metricsItem}>
            {status}: {count}
          </Text>
        ))}

        <Text style={styles.metricsTitle}>Prioridades</Text>
        {Object.entries(metrics.prioridadeCount).map(([prioridade, count]) => (
          <Text key={prioridade} style={styles.metricsItem}>
            {prioridade}: {count}
          </Text>
        ))}
      </View>

      {/* Tabela de Demandas */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCell}>Sigla</Text>
          <Text style={styles.tableCell}>Nome</Text>
          <Text style={styles.tableCell}>Status</Text>
          <Text style={styles.tableCell}>Prioridade</Text>
          <Text style={styles.tableCell}>Responsável</Text>
        </View>

        {demandas.map((demanda, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{demanda.sigla}</Text>
            <Text style={styles.tableCell}>{demanda.nome}</Text>
            <Text style={styles.tableCell}>{demanda.status}</Text>
            <Text style={styles.tableCell}>{demanda.prioridade}</Text>
            <Text style={styles.tableCell}>{demanda.responsavel}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default function PDFComponent({ demandas, metrics }: DemandasPDFProps) {
  return (
    <PDFDownloadLink
      document={<DemandasPDF demandas={demandas} metrics={metrics} />}
      fileName="relatorio_demandas.pdf"
    >
      {({ loading, error }) => (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-blue-400"
          disabled={loading || !!error}
        >
          <FileText className="w-4 h-4" />
          {loading ? 'Gerando PDF...' : 'Gerar PDF'}
        </button>
      )}
    </PDFDownloadLink>
  );
}
