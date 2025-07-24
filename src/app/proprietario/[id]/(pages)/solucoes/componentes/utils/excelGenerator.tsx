'use client'

import { useState, useEffect } from 'react';
import { SolucaoType } from '../../types/types';
import { FileSpreadsheet } from 'lucide-react';

/**
 * Componente ExcelGenerator - Gera Excel com as soluções fornecidas
 * 
 * IMPORTANTE: Este componente gera Excel apenas com os dados passados na prop 'solucoes'.
 * Para gerar Excel com dados filtrados:
 * 1. O componente pai deve aplicar os filtros aos dados ANTES de passar para este componente
 * 2. Passe apenas as soluções que devem aparecer no Excel na prop 'solucoes'
 * 3. Opcionalmente, passe informações sobre os filtros aplicados nas props 'filtrosAplicados' e 'totalOriginal'
 */

type ExcelColumn = { header: string; accessor: (row: SolucaoType) => any };

interface ExcelGeneratorProps {
    solucoes: SolucaoType[];
    columns: ExcelColumn[];
    filtrosAplicados?: string[];
    totalOriginal?: number;
    variant?: 'dropdown' | 'button';
}

const ExcelGenerator = ({ solucoes, columns, filtrosAplicados, totalOriginal, variant = 'button' }: ExcelGeneratorProps) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
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

    const handleGenerateExcel = async () => {
        if (!solucoes || solucoes.length === 0 || !columns || columns.length === 0) {
            alert('Dados não disponíveis para gerar Excel');
            return;
        }

        setIsGenerating(true);

        try {
            // Importação dinâmica do xlsx apenas quando necessário
            const XLSX = await import('xlsx');

            // Preparar dados para o Excel
            const dadosParaExcel = solucoes.map(item => {
                const linha: { [key: string]: any } = {};

                columns.forEach(col => {
                    let cellValue = '-';
                    try {
                        if (col.accessor && typeof col.accessor === 'function') {
                            cellValue = sanitizeValue(col.accessor(item));
                        }
                    } catch (error) {
                        console.warn('Erro ao acessar valor da coluna:', error);
                        cellValue = '-';
                    }
                    linha[col.header] = cellValue;
                });

                return linha;
            });

            // Criar planilha
            const worksheet = XLSX.utils.json_to_sheet(dadosParaExcel);
            const workbook = XLSX.utils.book_new();

            // Nome da aba com informação sobre filtros
            let nomeAba = 'Soluções';
            if (filtrosAplicados && filtrosAplicados.length > 0) {
                nomeAba = `Soluções (${solucoes.length} filtrados)`;
            }

            XLSX.utils.book_append_sheet(workbook, worksheet, nomeAba);

            // Nome do arquivo com timestamp
            const fileName = `relatorio_solucoes_${Date.now()}.xlsx`;

            // Baixar arquivo
            XLSX.writeFile(workbook, fileName);

        } catch (error) {
            console.error('Erro ao gerar Excel:', error);
            alert('Erro ao gerar Excel. Verifique o console para mais detalhes.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Verificar se há dados válidos
    if (!isClient || !solucoes || solucoes.length === 0 || !columns || columns.length === 0) {
        if (variant === 'dropdown') {
            return (
                <div className="flex h-8 w-full cursor-not-allowed select-none items-center rounded-sm px-2 py-1.5 text-sm opacity-50 outline-none">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    {!isClient ? 'Carregando...' : 'Sem dados para Excel'}
                </div>
            );
        }

        return (
            <div>
                <button
                    disabled
                    className="bg-gray-400 text-white px-3 py-2 rounded-md flex items-center gap-2 cursor-not-allowed"
                >
                    <FileSpreadsheet className="w-4 h-4" />
                    {!isClient ? 'Carregando...' : 'Sem dados para Excel'}
                </button>
            </div>
        );
    }

    // Determinar texto do botão baseado nos filtros
    const temFiltros = filtrosAplicados && filtrosAplicados.length > 0;
    const textoBotao = temFiltros
        ? `Baixar Excel (${solucoes.length} registros filtrados)`
        : `Baixar Relatório em Excel (${solucoes.length} registros)`;

    // Texto mais curto para o dropdown
    const textoDropdown = temFiltros
        ? `Excel (${solucoes.length} filtrados)`
        : `Excel (${solucoes.length} registros)`;

    if (variant === 'dropdown') {
        return (
            <div
                className="flex h-8 w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
                onClick={isGenerating ? undefined : handleGenerateExcel}
            >
                {isGenerating ? (
                    <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        Gerando Excel...
                    </>
                ) : (
                    <>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        {textoDropdown}
                    </>
                )}
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={handleGenerateExcel}
                disabled={isGenerating}
                className="bg-green-600 text-white px-3 py-2 rounded-md flex items-center gap-2 hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {isGenerating ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Gerando Excel...
                    </>
                ) : (
                    <>
                        <FileSpreadsheet className="w-4 h-4" />
                        {textoBotao}
                    </>
                )}
            </button>
        </div>
    );
};

export default ExcelGenerator;