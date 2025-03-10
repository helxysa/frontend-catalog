'use client'

import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { FileText } from 'lucide-react';

// Definindo os estilos do PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    paddingBottom: 10,
    borderBottom: '2px solid #e5e7eb'
  },
  // Cards layout
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30
  },
  card: {
    width: '31%',
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 5,
    borderLeft: '4px solid #3b82f6',
    minHeight: 120
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e40af',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 5
  },
  cardItem: {
    fontSize: 11,
    marginBottom: 5,
    color: '#4b5563'
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginVertical: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 5,
    overflow: 'hidden'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 35,
    alignItems: 'center'
  },
  tableHeader: {
    backgroundColor: '#2563eb',
    fontWeight: 'bold'
  },
  tableHeaderCell: {
    width: '20%',
    padding: 8,
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'left'
  },
  tableCell: {
    width: '20%',
    padding: 8,
    fontSize: 10,
    color: '#374151'
  },
  alternateRow: {
    backgroundColor: '#f3f4f6'
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

      {/* Cards em layout horizontal */}
      <View style={styles.cardsContainer}>
        {/* Card de Resumo */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumo</Text>
          <Text style={styles.cardItem}>Total de Demandas: {metrics.totalDemandas}</Text>
        </View>

        {/* Card de Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status</Text>
          {Object.entries(metrics.statusCount).map(([status, count]) => (
            <Text key={status} style={styles.cardItem}>
              {status}: {count}
            </Text>
          ))}
        </View>

        {/* Card de Prioridades */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Prioridades</Text>
          {Object.entries(metrics.prioridadeCount).map(([prioridade, count]) => (
            <Text key={prioridade} style={styles.cardItem}>
              {prioridade}: {count}
            </Text>
          ))}
        </View>
      </View>

      {/* Tabela de Demandas */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableHeaderCell}>Sigla</Text>
          <Text style={styles.tableHeaderCell}>Nome</Text>
          <Text style={styles.tableHeaderCell}>Status</Text>
          <Text style={styles.tableHeaderCell}>Prioridade</Text>
          <Text style={styles.tableHeaderCell}>Responsável</Text>
        </View>

        {demandas.map((demanda, index) => (
          <View key={index} style={[
            styles.tableRow, 
            index % 2 !== 0 ? styles.alternateRow : {}
          ]}>
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