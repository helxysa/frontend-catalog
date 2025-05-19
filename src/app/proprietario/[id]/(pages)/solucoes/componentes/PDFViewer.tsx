'use client'

import { useState } from 'react';
import { SolucaoType } from '../types/types';
import { FileText } from 'lucide-react';
import { createRoot } from 'react-dom/client';

const PDFViewer = ({ solucao }: { solucao: SolucaoType }) => {
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isPdfReady, setIsPdfReady] = useState(false);
  
  const handleGeneratePDF = async () => {
    setIsPdfLoading(true);
    
    try {
      // Importação dinâmica apenas quando o botão é clicado
      const ReactPDF = await import('@react-pdf/renderer');
      const { Document, Page, Text, View, StyleSheet, PDFDownloadLink } = ReactPDF;
      
      // Definir estilos
      const styles = StyleSheet.create({
        page: { padding: 30 },
        title: { fontSize: 24, marginBottom: 20 },
        section: { margin: 10, padding: 10 },
        label: { fontSize: 12, marginBottom: 5, color: '#666' },
        value: { fontSize: 14, marginBottom: 10 }
      });
      
      // Criar documento PDF
      const MyDocument = () => (
        <Document>
          <Page size="A4" style={styles.page}>
            <Text style={styles.title}>{solucao.nome}</Text>
            {/* Adicione mais conteúdo conforme necessário */}
          </Page>
        </Document>
      );
      
      // Renderizar link de download
      const pdfLink = (
        <PDFDownloadLink 
          document={<MyDocument />} 
          fileName={`solucao-${solucao.id}.pdf`}
          className="bg-red-600 text-white px-3 py-2 rounded-md flex items-center gap-2 hover:bg-red-700 transition-colors"
        >
          {({ loading }) => 
            loading ? 'Gerando PDF...' : (
              <>
                <FileText className="w-4 h-4" />
                Baixar PDF
              </>
            )
          }
        </PDFDownloadLink>
      );
      
      // Adicionar o link ao DOM
      const container = document.getElementById('pdf-container');
      if (container) {
        // Limpar conteúdo anterior
        container.innerHTML = '';
        
        // Renderizar o link de download
        const root = createRoot(container);
        root.render(pdfLink);
      }
      
      setIsPdfReady(true);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsPdfLoading(false);
    }
  };
  
  return (
    <div>
      {!isPdfReady ? (
        <button
          onClick={handleGeneratePDF}
          disabled={isPdfLoading}
          className="bg-red-600 text-white px-3 py-2 rounded-md flex items-center gap-2 hover:bg-red-700 transition-colors"
        >
          {isPdfLoading ? 'Carregando...' : (
            <>
              <FileText className="w-4 h-4" />
              Gerar PDF
            </>
          )}
        </button>
      ) : (
        <div id="pdf-container"></div>
      )}
    </div>
  );
};

export default PDFViewer;




