'use client'

import { useState, useEffect } from 'react';
import { SolucaoType } from '../../types/types';
import { FileText } from 'lucide-react';

/**
 * Componente PdfGenerator - Gera PDF com as soluções fornecidas
 * 
 * IMPORTANTE: Este componente gera PDF apenas com os dados passados na prop 'solucoes'.
 * Para gerar PDF com dados filtrados:
 * 1. O componente pai deve aplicar os filtros aos dados ANTES de passar para este componente
 * 2. Passe apenas as soluções que devem aparecer no PDF na prop 'solucoes'
 * 3. Opcionalmente, passe informações sobre os filtros aplicados nas props 'filtrosAplicados' e 'totalOriginal'
 * 
 * Exemplo de uso:
 * <PdfGenerator 
 *   solucoes={solucoesFiltradasParaExibicao} // Apenas os dados filtrados!
 *   columns={colunas}
 *   filtrosAplicados={['Status: Ativo', 'Criticidade: Alta']}
 *   totalOriginal={totalDeRegistrosSemFiltro}
 * />
 */

type PdfColumn = { header: string; accessor: (row: SolucaoType) => any };

interface PdfGeneratorProps {
    solucoes: SolucaoType[];
    columns: PdfColumn[];
    filtrosAplicados?: string[]; // Novo: lista de filtros aplicados
    totalOriginal?: number; // Novo: total de registros antes dos filtros
    variant?: 'dropdown' | 'button'; // Novo: variante para diferentes estilos
}

const PdfGenerator = ({ solucoes, columns, filtrosAplicados, totalOriginal, variant = 'button' }: PdfGeneratorProps) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [pdfComponents, setPdfComponents] = useState<any>(null);

    useEffect(() => {
        setIsClient(true);

        // Carregar componentes do react-pdf apenas no cliente
        const loadPdfComponents = async () => {
            try {
                const reactPdf = await import('@react-pdf/renderer');
                setPdfComponents(reactPdf);
            } catch (error) {
                console.error('Erro ao carregar react-pdf:', error);
            }
        };

        loadPdfComponents();
    }, []);

    // Função para sanitizar valores
    const sanitizeValue = (value: any): string => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return value.toString();
        if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    const handleGeneratePdf = async () => {
        if (!pdfComponents || !solucoes || solucoes.length === 0 || !columns || columns.length === 0) {
            alert('Dados não disponíveis para gerar PDF');
            return;
        }

        setIsGenerating(true);

        try {
            const { Document, Page, Text, View, StyleSheet, pdf } = pdfComponents;

            // Criar estilos
            const styles = StyleSheet.create({
                page: {
                    fontFamily: 'Helvetica',
                    fontSize: 10,
                    paddingTop: 40,
                    paddingLeft: 40,
                    paddingRight: 40,
                    paddingBottom: 50,
                    lineHeight: 1.5,
                },
                header: {
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    height: 30,
                    paddingHorizontal: 40,
                    borderBottomWidth: 1,
                    borderBottomColor: '#e2e8f0',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#f8fafc'
                },
                footer: {
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    height: 30,
                    paddingHorizontal: 40,
                    borderTopWidth: 1,
                    borderTopColor: '#e2e8f0',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                },
                footerText: {
                    fontSize: 9,
                    color: '#a0aec0',
                },
                reportTitle: {
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginBottom: 20,
                    textAlign: 'center',
                    color: '#1a202c',
                },
                table: {
                    width: '100%',
                    borderStyle: 'solid',
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                    borderRightWidth: 0,
                    borderBottomWidth: 0,
                },
                tableRow: {
                    flexDirection: 'row',
                    backgroundColor: '#FFFFFF',
                },
                tableRowAlt: {
                    flexDirection: 'row',
                    backgroundColor: '#f7fafc',
                },
                tableHeader: {
                    flexDirection: 'row',
                    backgroundColor: '#edf2f7',
                    borderBottomWidth: 1,
                    borderBottomColor: '#e2e8f0',
                },
                tableColHeader: {
                    padding: 5,
                    borderStyle: 'solid',
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                    borderLeftWidth: 0,
                    borderTopWidth: 0,
                },
                tableCol: {
                    padding: 5,
                    borderStyle: 'solid',
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                    borderLeftWidth: 0,
                    borderTopWidth: 0,
                },
                headerText: {
                    fontSize: 10,
                    fontWeight: 'bold',
                    color: '#4a5568',
                },
                cellText: {
                    fontSize: 9,
                }
            });

            // Criar documento PDF
            const MyDocument = (
                <Document>
                    <Page size="A4" style={styles.page}>
                        {/* Cabeçalho */}
                        <View style={styles.header} fixed>
                            <Text style={styles.footerText}>Logo da Empresa</Text>
                            <Text style={styles.footerText}>Relatório de Soluções</Text>
                        </View>

                        {/* Título */}
                        <Text style={styles.reportTitle}>Relatório de Soluções</Text>

                        {/* Informações dos Filtros */}
                        {(filtrosAplicados && filtrosAplicados.length > 0) || totalOriginal ? (
                            <View style={{ marginBottom: 15, padding: 10, backgroundColor: '#f8fafc', borderRadius: 5 }}>
                                {totalOriginal && (
                                    <Text style={{ fontSize: 10, marginBottom: 5, color: '#4a5568' }}>
                                        Exibindo {solucoes.length} de {totalOriginal} registros totais
                                    </Text>
                                )}
                                {filtrosAplicados && filtrosAplicados.length > 0 && (
                                    <View>
                                        <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 3, color: '#2d3748' }}>
                                            Filtros aplicados:
                                        </Text>
                                        {filtrosAplicados.map((filtro, index) => (
                                            <Text key={index} style={{ fontSize: 9, color: '#4a5568', marginLeft: 10 }}>
                                                • {filtro}
                                            </Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ) : (
                            <Text style={{ fontSize: 10, marginBottom: 15, color: '#4a5568', textAlign: 'center' }}>
                                Exibindo todos os {solucoes.length} registros
                            </Text>
                        )}

                        {/* Tabela */}
                        <View style={styles.table}>
                            {/* Cabeçalho da Tabela */}
                            <View style={styles.tableHeader} fixed>
                                {columns.map((col, idx) => (
                                    <View key={idx} style={{ ...styles.tableColHeader, width: `${100 / columns.length}%` }}>
                                        <Text style={styles.headerText}>{sanitizeValue(col.header)}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Corpo da Tabela */}
                            {solucoes.map((item, index) => (
                                <View key={item.id || index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                                    {columns.map((col, colIdx) => {
                                        let cellValue = '-';
                                        try {
                                            if (col.accessor && typeof col.accessor === 'function') {
                                                cellValue = sanitizeValue(col.accessor(item));
                                            }
                                        } catch (error) {
                                            console.warn('Erro ao acessar valor da coluna:', error);
                                            cellValue = '-';
                                        }

                                        return (
                                            <View key={colIdx} style={{ ...styles.tableCol, width: `${100 / columns.length}%` }}>
                                                <Text style={styles.cellText}>{cellValue}</Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            ))}
                        </View>

                        {/* Rodapé */}
                        <View style={styles.footer} fixed>
                            <Text style={styles.footerText}>
                                Gerado em: {new Date().toLocaleString('pt-BR')}
                            </Text>
                            <Text style={styles.footerText} render={({ pageNumber, totalPages }: { pageNumber: number, totalPages: number }) => (
                                `Página ${pageNumber} de ${totalPages}`
                            )} />
                        </View>
                    </Page>
                </Document>
            );

            // Gerar e baixar PDF
            const blob = await pdf(MyDocument).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `relatorio_solucoes_${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Verificar se há dados válidos
    if (!isClient || !solucoes || solucoes.length === 0 || !columns || columns.length === 0) {
        if (variant === 'dropdown') {
            return (
                <div className="flex h-8 w-full cursor-not-allowed select-none items-center rounded-sm px-2 py-1.5 text-sm opacity-50 outline-none">
                    <FileText className="mr-2 h-4 w-4" />
                    {!isClient ? 'Carregando...' : 'Sem dados para PDF'}
                </div>
            );
        }

        return (
            <div>
                <button
                    disabled
                    className="bg-gray-400 text-white px-3 py-2 rounded-md flex items-center gap-2 cursor-not-allowed"
                >
                    <FileText className="w-4 h-4" />
                    {!isClient ? 'Carregando...' : 'Sem dados para PDF'}
                </button>
            </div>
        );
    }

    // Determinar texto do botão baseado nos filtros
    const temFiltros = filtrosAplicados && filtrosAplicados.length > 0;
    const textoBotao = temFiltros
        ? `Baixar PDF (${solucoes.length} registros filtrados)`
        : `Baixar Relatório em PDF (${solucoes.length} registros)`;

    // Texto mais curto para o dropdown
    const textoDropdown = temFiltros
        ? `PDF (${solucoes.length} filtrados)`
        : `PDF (${solucoes.length} registros)`;

    if (variant === 'dropdown') {
        return (
            <div
                className="flex h-8 w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
                onClick={isGenerating || !pdfComponents ? undefined : handleGeneratePdf}
            >
                {isGenerating ? (
                    <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        Gerando PDF...
                    </>
                ) : (
                    <>
                        <FileText className="mr-2 h-4 w-4" />
                        {textoDropdown}
                    </>
                )}
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={handleGeneratePdf}
                disabled={isGenerating || !pdfComponents}
                className="bg-red-600 text-white px-3 py-2 rounded-md flex items-center gap-2 hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {isGenerating ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Gerando PDF...
                    </>
                ) : (
                    <>
                        <FileText className="w-4 h-4" />
                        {textoBotao}
                    </>
                )}
            </button>
        </div>
    );
};

export default PdfGenerator;