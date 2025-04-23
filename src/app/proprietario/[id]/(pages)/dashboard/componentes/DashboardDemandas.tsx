'use client'

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut, Pie, Bar } from 'react-chartjs-2';
import { getDemandas, getAlinhamentos, getStatus, getPrioridades } from "../actions/actions";
import type { DemandaType } from '../../demandas/types/types';
import { useSidebar } from '../../../../../componentes/Sidebar/SidebarContext';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ensureArray = <T,>(data: T | T[] | null | undefined): T[] => {
  if (Array.isArray(data)) {
    return data;
  }
  return [];
};

export default function DashboardDemandas() {
  const [demandas, setDemandas] = useState<DemandaType[]>([]);
  const [alinhamentos, setAlinhamentos] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);
  const [prioridades, setPrioridades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isCollapsed } = useSidebar();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [demandasData, alinhamentosData, statusData, prioridadesData] = await Promise.all([
          getDemandas(),
          getAlinhamentos(),
          getStatus(),
          getPrioridades()
        ]);

        setDemandas(demandasData);
        setAlinhamentos(alinhamentosData);
        setStatusList(statusData);
        setPrioridades(prioridadesData);
        console.log('Dados carregados:', { demandasData, alinhamentosData, statusData, prioridadesData });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Função para processar dados de alinhamento das demandas
  const processAlinhamentoData = () => {
    const counts: { [key: string]: number } = {};

    ensureArray(demandas).forEach(demanda => {
      const alinhamentoNome = demanda.alinhamento?.nome || 'Não definido';
      counts[alinhamentoNome] = (counts[alinhamentoNome] || 0) + 1;
    });

    const sortedEntries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const labels = sortedEntries.map(([label]) => label);
    const data = sortedEntries.map(([, count]) => count);

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#673AB7', '#FF4081'],
        borderWidth: 1,
      }],
    };
  };

  // Função para processar dados de status das demandas
  const processStatusData = () => {
    const counts: { [key: string]: number } = {};

    ensureArray(demandas).forEach(demanda => {
      const statusNome = demanda.status?.nome || 'Não definido';
      counts[statusNome] = (counts[statusNome] || 0) + 1;
    });

    return {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#673AB7', '#FF4081'],
        borderWidth: 1,
      }],
    };
  };

  // Função para processar dados de prioridade das demandas
  const processPrioridadeData = () => {
    const counts: { [key: string]: number } = {};

    ensureArray(demandas).forEach(demanda => {
      const prioridadeNome = demanda.prioridade?.nome || 'Não definido';
      counts[prioridadeNome] = (counts[prioridadeNome] || 0) + 1;
    });

    return {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#673AB7', '#FF4081'],
        borderWidth: 1,
      }],
    };
  };

  // Função para agrupar demandas por responsável
  const getDemandasPorResponsavel = () => {
    // Criar um mapa de responsáveis para suas demandas
    const responsavelMap: { [key: string]: DemandaType[] } = {};

    ensureArray(demandas).forEach(demanda => {
      const responsavelNome = demanda.responsavel?.nome || 'Não definido';
      if (!responsavelMap[responsavelNome]) {
        responsavelMap[responsavelNome] = [];
      }
      responsavelMap[responsavelNome].push(demanda);
    });

    // Converter para array e ordenar por quantidade de demandas (decrescente)
    const responsavelArray = Object.entries(responsavelMap)
      .map(([nome, demandas]) => ({ nome, demandas }))
      .sort((a, b) => b.demandas.length - a.demandas.length);

    // Limitar a 10 responsáveis para melhor visualização
    return responsavelArray.slice(0, 10);
  };

  // Função para processar dados de evolução anual das demandas
  const processEvolucaoAnualData = () => {
    const currentYear = new Date().getFullYear();
    const monthlyData: { [month: string]: number } = {};

    // Inicializa todos os meses do ano atual com zero
    const monthNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    monthNames.forEach(month => {
      monthlyData[month] = 0;
    });

    // Conta as demandas por mês do ano atual
    ensureArray(demandas).forEach(demanda => {
      if (!demanda.createdAt) return;

      const createdDate = new Date(demanda.createdAt);
      if (createdDate.getFullYear() === currentYear) {
        const monthIndex = createdDate.getMonth();
        const monthName = monthNames[monthIndex];
        monthlyData[monthName] = (monthlyData[monthName] || 0) + 1;
      }
    });

    return {
      labels: monthNames,
      datasets: [{
        label: 'Demandas Criadas',
        data: monthNames.map(month => monthlyData[month]),
        backgroundColor: '#4285F4',
        borderColor: '#4285F4',
        borderWidth: 1,
      }],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { size: 12 }
        }
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 12 }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Gráficos */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Charts Grid - Gráficos de pizza e rosca */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
              <h3 className="text-gray-800 text-base font-semibold mb-4">Alinhamentos das Demandas</h3>
              <div className="h-[300px] w-full flex items-center justify-center">
                <Pie
                  data={processAlinhamentoData()}
                  options={{
                    ...chartOptions,
                    maintainAspectRatio: false,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        ...chartOptions.plugins.legend,
                        position: 'bottom' as const,
                        labels: {
                          boxWidth: 12,
                          padding: 8,
                          font: {
                            size: 12
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
              <h3 className="text-gray-800 text-base font-semibold mb-4">Status das Demandas</h3>
              <div className="h-[300px] w-full flex items-center justify-center">
                <Doughnut
                  data={processStatusData()}
                  options={{
                    ...chartOptions,
                    maintainAspectRatio: false,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        ...chartOptions.plugins.legend,
                        position: 'bottom' as const,
                        labels: {
                          boxWidth: 12,
                          padding: 8,
                          font: {
                            size: 12
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
              <h3 className="text-gray-800 text-base font-semibold mb-4">Prioridades das Demandas</h3>
              <div className="h-[300px] w-full flex items-center justify-center">
                <Pie
                  data={processPrioridadeData()}
                  options={{
                    ...chartOptions,
                    maintainAspectRatio: false,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        ...chartOptions.plugins.legend,
                        position: 'bottom' as const,
                        labels: {
                          boxWidth: 12,
                          padding: 8,
                          font: {
                            size: 12
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Gráfico de Evolução Anual */}
          <div className="mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
              <h3 className="text-gray-800 text-base font-semibold mb-4">Evolução Mensal de Demandas ({new Date().getFullYear()})</h3>
              <div className="h-[400px] w-full">
                <Bar
                  data={processEvolucaoAnualData()}
                  options={barChartOptions}
                />
              </div>
            </div>
          </div>

          {/* Tabela de Distribuição por Responsável */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-8">
            <h3 className="text-gray-800 text-base font-semibold mb-4">Distribuição de Demandas por Responsável</h3>
            <div className="overflow-x-auto" style={{ maxHeight: demandas.length <= 3 ? 'auto' : '300px' }}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                      Responsável
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Quantidade
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Demanda
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getDemandasPorResponsavel().length > 0 ? (
                    getDemandasPorResponsavel().map((item, index) => {
                      // Gerar uma cor para cada responsável
                      const hue = (index * 137.5) % 360;
                      const color = `hsl(${hue}, 70%, 60%)`;

                      return (
                        <React.Fragment key={item.nome}>
                          {item.demandas.map((demanda, dIndex) => (
                            <tr key={`${item.nome}-${demanda.id}-${dIndex}`} className="hover:bg-gray-50">
                              {dIndex === 0 ? (
                                <td className="px-4 py-2 whitespace-nowrap" rowSpan={item.demandas.length}>
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-6 w-6 rounded-full" style={{ backgroundColor: color }}></div>
                                    <div className="ml-3">
                                      <div className="text-sm font-medium text-gray-900">{item.nome}</div>
                                    </div>
                                  </div>
                                </td>
                              ) : null}
                              {dIndex === 0 ? (
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500" rowSpan={item.demandas.length}>
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {item.demandas.length}
                                  </span>
                                </td>
                              ) : null}
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {demanda.nome || '-'}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-center text-sm text-gray-500">
                        Nenhuma demanda encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabela de Demandas */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Lista de Demandas</h2>
            <div className="overflow-x-auto">
              {demandas && demandas.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sigla
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prioridade
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Responsável
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {demandas.map((demanda) => (
                      <tr key={demanda.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {demanda.sigla || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {demanda.nome || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {demanda.status?.nome || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {demanda.prioridade?.nome || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {demanda.responsavel?.nome || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="bg-blue-50 p-4 rounded-md text-center">
                  <p className="text-blue-700">Nenhuma demanda encontrada. As demandas aparecerão aqui quando forem criadas.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
