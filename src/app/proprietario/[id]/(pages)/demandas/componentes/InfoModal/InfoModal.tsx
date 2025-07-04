'use client';

import { Demanda } from '../../types/types';
import { X, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getHistoricoByDemandaId } from '../../actions/actions';

interface Log {
  id: number;
  usuario: string;
  descricao: string;
  createdAt: string;
}

const determinarCorTexto = (corHex: string | undefined) => {
  if (!corHex) return 'text-gray-800';
  corHex = corHex.replace('#', '');
  const r = parseInt(corHex.substr(0, 2), 16);
  const g = parseInt(corHex.substr(2, 2), 16);
  const b = parseInt(corHex.substr(4, 2), 16);
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminancia > 0.5 ? 'text-gray-800' : 'text-white';
};

export default function InfoModal({ demanda, onClose }: { demanda: Demanda | null; onClose: () => void; }) {
  const [activeTab, setActiveTab] = useState('details');
  const [log, setLog] = useState<Log[]>([]);
  const [isLoadingLog, setIsLoadingLog] = useState(false);

  useEffect(() => {
    if (activeTab === 'history' && demanda && log.length === 0 && !isLoadingLog) {
      const fetchLog = async () => {
        setIsLoadingLog(true);
        const historyData = await getHistoricoByDemandaId(demanda.id);
        if (historyData) {
          setLog(historyData);
        }
        setIsLoadingLog(false);
      };
      fetchLog();
    }
  }, [activeTab, demanda, log.length, isLoadingLog]);

  if (!demanda) return null;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date).replace(',', ' às');
    } catch (error) {
      return '-';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
      <div className="relative bg-white rounded-lg shadow-2xl p-8 w-full max-w-4xl m-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {demanda.nome}
            </h2>
            <p className="text-sm text-gray-500">
              Sigla: {demanda.sigla || '-'}
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
              Detalhes da Demanda
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
            <div className="bg-white rounded-lg p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <div className="col-span-2 mb-3">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2 pb-2 border-b border-gray-200">
                    Informações Básicas
                  </h3>
                </div>

                {[
                  { label: "Nome", value: demanda.nome },
                  { label: "Sigla", value: demanda.sigla },
                  { label: "Demandante", value: demanda.demandante },
                  { label: "Fator Gerador", value: demanda.fatorGerador },
                  { label: "Alinhamento", value: demanda.alinhamento?.nome },
                  { label: "Responsável", value: demanda.responsavel?.nome },
                  { label: "Prioridade", value: demanda.prioridade?.nome },
                  { label: "Data Status", value: formatDate(demanda.dataStatus) },
                  { label: "Status", value: demanda.status?.nome ? (
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-medium ${determinarCorTexto(demanda.status?.propriedade)}`}
                        style={{ backgroundColor: demanda.status?.propriedade }}
                      >
                        {demanda.status.nome}
                      </span>
                    ) : '-'
                  },
                ].map((item, index) => (
                  <div key={index}
                       className="p-2.5 rounded-md bg-gray-50/70 border border-gray-100">
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
                    {demanda.descricao || 'Nenhuma descrição fornecida.'}
                  </div>
                </div>
              </div>
            </div>
          ) : ( // activeTab === 'history'
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Histórico de Alterações</h3>
                <p className="text-xs text-gray-500">Acompanhe todas as mudanças realizadas nesta demanda.</p>
              </div>
              <div className="flow-root">
                {isLoadingLog ? (
                  <p className="text-center text-sm text-gray-500 py-8">Carregando histórico...</p>
                ) : log && log.length > 0 ? (
                  <ul role="list" className="-mb-8">
                    {log.map((evento: Log, index: number) => (
                      <li key={evento.id}>
                        <div className="relative pb-6">
                          {index !== log.length - 1 && (
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
                                {evento.descricao}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                   <p className="text-center text-sm text-gray-500 py-8">Nenhum histórico de alterações encontrado para esta demanda.</p>
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
