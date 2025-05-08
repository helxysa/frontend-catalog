'use client';

import React, { JSX } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { SolucaoType, HistoricoType, BaseType } from '../../types/types'; // Adjust path as needed

interface SolucaoInfoModalProps {
  isOpen: boolean;
  solucao: SolucaoType;
  onClose: () => void;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  historicoSolucao: HistoricoType[];
  formatHistoricoDescricao: (descricao: string, evento: HistoricoType) => string;
  formatDate: (dateString?: string | null) => string;
  renderDetalhesLinguagens: (solucao: SolucaoType) => JSX.Element | string;
  formatRepositoryLink: (repo: string) => JSX.Element | string;
  ProgressBar: ({ progress }: { progress: number }) => JSX.Element;
  determinarCorTexto: (corHex: string | undefined) => string;
  // Props needed for formatHistoricoDescricao if its dependencies are not self-contained
  tipos: BaseType[];
  linguagens: BaseType[];
  desenvolvedores: BaseType[];
  categorias: BaseType[];
  responsaveis: BaseType[];
  statusList: (BaseType & { propriedade: string })[];
  demanda: BaseType[];
}

export default function SolucaoInfoModal({
  isOpen,
  solucao,
  onClose,
  activeTab,
  setActiveTab,
  historicoSolucao,
  formatHistoricoDescricao,
  formatDate,
  renderDetalhesLinguagens,
  formatRepositoryLink,
  ProgressBar,
  determinarCorTexto,
  tipos,
  linguagens,
  desenvolvedores,
  categorias,
  responsaveis,
  statusList,
  demanda,
}: SolucaoInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
      <div className="relative bg-white rounded-lg shadow-2xl p-8 w-full max-w-4xl m-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {solucao.nome}
            </h2>
            <p className="text-sm text-gray-500">
              Sigla: {solucao.sigla || '-'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              className={`py-3 px-2 focus:outline-none transition-colors ${activeTab === 'details'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('details')}
            >
              Detalhes da Solução
            </button>
            <button
              className={`py-3 px-6 focus:outline-none transition-colors ${activeTab === 'history'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('history')}
            >
              Log de Alterações
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto pr-4">
          {activeTab === 'details' ? (
            <div className="bg-white rounded-lg p-2"> {/* Simplified padding */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <div className="col-span-2 mb-3">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2 pb-2 border-b border-gray-200">
                    Informações da Solução
                  </h3>
                </div>

                {[
                  { label: "Nome", value: solucao.nome },
                  { label: "Sigla", value: solucao.sigla },
                  { label: "Versão", value: solucao.versao },
                  { label: "Repositório", value: formatRepositoryLink(solucao.repositorio) },
                  { label: "Link Externo", value: solucao.link ? (
                      <a href={solucao.link} target="_blank" rel="noopener noreferrer"
                         className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                        Acessar <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : '-'
                  },
                  { label: "Tipo", value: solucao.tipo?.nome },
                  { label: "Categoria", value: solucao.categoria?.nome },
                  { label: "Demanda", value: solucao.demanda?.nome },
                  { label: "Status", value: solucao.status?.nome ? (
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-medium ${determinarCorTexto(solucao.status?.propriedade)}`}
                        style={{ backgroundColor: solucao.status?.propriedade }}
                      >
                        {solucao.status.nome}
                      </span>
                    ) : '-'
                  },
                  { label: "Responsável", value: solucao.responsavel?.nome },
                  { label: "Desenvolvedor", value: solucao.desenvolvedor?.nome },
                  { label: "Criticidade", value: solucao.criticidade },
                  { label: "Data Status", value: formatDate(solucao.data_status || solucao.dataStatus) },
                  { label: "Andamento", value: (
                      <div className="flex flex-col w-full items-start">
                        <span className="text-sm text-gray-800 font-medium mb-1">{solucao.andamento || '0'}%</span>
                        <ProgressBar progress={Number(solucao.andamento) || 0} />
                      </div>
                    )
                  },
                  { label: "Tecnologias", value: renderDetalhesLinguagens(solucao), fullWidth: true },
                ].map((item, index) => (
                  <div key={index}
                       className={`p-2.5 rounded-md bg-gray-50/70 border border-gray-100 ${item.fullWidth ? 'md:col-span-2' : ''}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-500">{item.label}:</span>
                      <span className="text-xs text-gray-700 font-semibold text-right break-all">{item.value || '-'}</span>
                    </div>
                  </div>
                ))}
                
                <div className="col-span-2 mt-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1 pb-1 border-b border-gray-200">
                    Descrição
                  </h3>
                  <div className="p-3 bg-gray-50/70 rounded-md border border-gray-100 mt-1 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap break-words min-h-[60px]">
                    {solucao.descricao || 'Nenhuma descrição fornecida.'}
                  </div>
                </div>
              </div>
            </div>
          ) : ( // activeTab === 'history'
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Histórico de Alterações</h3>
                <p className="text-xs text-gray-500">Acompanhe todas as mudanças realizadas nesta solução.</p>
              </div>
              <div className="flow-root">
                {historicoSolucao && historicoSolucao.length > 0 ? (
                  <ul role="list" className="-mb-8">
                    {historicoSolucao.map((evento: HistoricoType, index: number) => (
                      <li key={evento.id}>
                        <div className="relative pb-6">
                          {index !== historicoSolucao.length - 1 && (
                            <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                          )}
                          <div className="relative flex items-start space-x-3">
                            <div className="relative">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-gray-50
                                ${index === 0 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                                <span className="text-xs font-medium">
                                  {formatDate(evento.createdAt).split('/')[0]}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="text-xs text-gray-500 mb-0.5">
                                <span className="font-medium text-gray-700">{evento.usuario}</span> alterou em{' '}
                                <time dateTime={evento.createdAt}>{formatDate(evento.createdAt)}</time>
                                {index === 0 && (
                                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                                    Mais recente
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-700 bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                                {formatHistoricoDescricao(evento.descricao, evento)}
                              </div>
                              {/* Detalhes do estado da solução no momento do histórico (opcional, pode ser verboso) */}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                   <p className="text-center text-sm text-gray-500 py-8">Nenhum histórico de alterações encontrado para esta solução.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}