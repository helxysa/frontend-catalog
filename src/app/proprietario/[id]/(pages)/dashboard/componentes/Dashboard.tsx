'use client'

import { useEffect, useState } from 'react';
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
import { Doughnut, Bar, Pie } from 'react-chartjs-2';
import { getDemandas, getSolucoes, getAlinhamentos, getStatus, getCategorias, getDesenvolvedores, getTipos, getResponsaveis } from "../actions/actions";
import type { DemandaType } from '../../demandas/types/types';
import type { SolucaoType } from '../../solucoes/types/types';
import type { Desenvolvedor } from '../../configuracoes/(page)/desenvolvedores/types/types';
import type { Status } from '../../configuracoes/(page)/status/types/types';
import { ClipboardList, Lightbulb, CheckCircle2, XCircle } from 'lucide-react';
import { useSidebar } from '../../../../../componentes/Sidebar/SidebarContext';
import DashboardDemandas from './DashboardDemandas';
import React from 'react';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type MonthlyCategoriaData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderWidth: number;
  }[];
};

// Tipo não utilizado atualmente
/*
type MonthlyDemandasData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderWidth: number;
  }[];
};
*/

const ensureArray = <T,>(data: T | T[] | null | undefined): T[] => {
  if (Array.isArray(data)) {
    return data;
  }
  return [];
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<{
    demandas: DemandaType[];
    solucoes: SolucaoType[];
    alinhamentos: any[];
    status: Status[];
    categorias: any[];
    desenvolvedores: Desenvolvedor[];
    tipos: any[];
    responsaveis: any[];
  }>({
    demandas: [],
    solucoes: [],
    alinhamentos: [],
    status: [],
    categorias: [],
    desenvolvedores: [],
    tipos: [],
    responsaveis: []
  });
  const { isCollapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'demandas'>('demandas');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [demandas, solucoes, alinhamentos, status, categorias, desenvolvedores, tipos, responsaveis] = await Promise.all([
          getDemandas(),
          getSolucoes(),
          getAlinhamentos(),
          getStatus(),
          getCategorias(),
          getDesenvolvedores(),
          getTipos(),
          getResponsaveis()
        ]);

        // Garantir que solucoes seja um array
        const solucoesArray = Array.isArray(solucoes) ? solucoes : [];

        setDashboardData({
          demandas,
          solucoes: solucoesArray,
          alinhamentos,
          status,
          categorias,
          desenvolvedores,
          tipos,
          responsaveis
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  // Função para processar dados de alinhamento - comentada pois não está sendo usada atualmente
  /*
  const processAlinhamentoData = () => {
    const counts: { [key: string]: number } = {};

    ensureArray(dashboardData.solucoes).forEach(solucao => {
      const alinhamentoNome = solucao.demanda?.alinhamento?.nome || 'Sem alinhamento';
      counts[alinhamentoNome] = (counts[alinhamentoNome] || 0) + 1;
    });

    const sortedEntries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const labels = sortedEntries.map(([label]) => label);
    const data = sortedEntries.map(([, count]) => count);

    const colors = labels.map((_, index) => {
      const hue = (index * 137.5) % 360;
      return `hsl(${hue}, 70%, 60%)`;
    });

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#673AB7', '#FF4081', `${colors}`],
        borderWidth: 1,
      }],
    };
  };
  */

  const processSolucaoData = () => {
    const counts: { [key: string]: number } = {};
    ensureArray(dashboardData.solucoes).forEach(solucao => {
      const tipoId = solucao.tipoId ? Number(solucao.tipoId) : null;
      const tipo = tipoId ? dashboardData.tipos?.find(t => t.id === tipoId) : null;
      const tipoNome = tipo?.nome || 'Não informado';
      counts[tipoNome] = (counts[tipoNome] || 0) + 1;
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

  const processStatusData = () => {
    const counts: { [key: string]: number } = {};
    ensureArray(dashboardData.solucoes).forEach(solucao => {
      const statusId = solucao.statusId ? solucao.statusId.toString() : null;
      const status = statusId ? dashboardData.status?.find(s => s.id.toString() === statusId) : null;
      const statusNome = status?.nome || 'Não informado';
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

  const processCategoriaData = () => {
    const counts: { [key: string]: number } = {};
    ensureArray(dashboardData.solucoes).forEach(solucao => {
      const categoriaId = solucao.categoriaId ? Number(solucao.categoriaId) : null;
      const categoria = categoriaId ? dashboardData.categorias?.find(c => c.id === categoriaId) : null;
      const categoriaNome = categoria?.nome || 'Não informado';
      counts[categoriaNome] = (counts[categoriaNome] || 0) + 1;
    });

    // Ordenar categorias por contagem e pegar as top 5
    const sortedCategories = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      labels: [''],
      datasets: sortedCategories.map(([label, value], index) => ({
        label,
        data: [value],
        backgroundColor: ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#673AB7', '#FF4081'][index % 6],
        borderWidth: 1,
      })),
    };
  };

  const processMonthlyCategoriaData = (): MonthlyCategoriaData => {
    const monthlyData: { [month: string]: { [tipo: string]: number } } = {};

    ensureArray(dashboardData.solucoes).forEach(solucao => {
      const statusDate = solucao.data_status || solucao.dataStatus;

      if (!statusDate) {
        console.log('Solução sem data de status:', solucao);
        return;
      }

      try {
        const date = new Date(statusDate);
        const monthYear = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
        const tipoId = solucao.tipoId ? Number(solucao.tipoId) : null;
        const tipo = tipoId ? dashboardData.tipos?.find(t => t.id === tipoId) : null;
        const tipoNome = tipo?.nome || 'Não informado';

        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {};
        }

        monthlyData[monthYear][tipoNome] = (monthlyData[monthYear][tipoNome] || 0) + 1;
      } catch (error) {
        console.error('Erro ao processar data:', statusDate, error);
      }
    });

    const labels = Object.keys(monthlyData).sort((a, b) => {
      const [monthA, yearA] = a.split('/').map(Number);
      const [monthB, yearB] = b.split('/').map(Number);
      return yearA - yearB || monthA - monthB;
    });

    const tipos = Array.from(new Set(
      Object.values(monthlyData).flatMap(month => Object.keys(month))
    ));

    const datasets = tipos.map((tipo, index) => ({
      label: tipo,
      data: labels.map(month => monthlyData[month][tipo] || 0),
      backgroundColor: ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#673AB7', '#FF4081'][index % 6],
      borderWidth: 1,
      barPercentage: tipos.length <= 3 ? 0.5 : 0.9,
      categoryPercentage: tipos.length <= 3 ? 0.7 : 0.8
    }));

    return { labels, datasets };
  };

  const processYearlyCategoriaData = () => {
    const currentYear = new Date().getFullYear();
    const monthlyData: { [month: string]: { [tipo: string]: number } } = {};

    // Processa apenas os meses que têm dados
    ensureArray(dashboardData.solucoes).forEach(solucao => {
      const statusDate = solucao.data_status || solucao.dataStatus;
      if (!statusDate) return;

      const date = new Date(statusDate);
      if (date.getFullYear() !== currentYear) return;

      const monthName = date.toLocaleString('pt-BR', { month: 'short' });
      const tipoId = solucao.tipoId ? Number(solucao.tipoId) : null;
      const tipo = tipoId ? dashboardData.tipos?.find(t => t.id === tipoId) : null;
      const tipoNome = tipo?.nome || 'Não informado';

      if (!monthlyData[monthName]) {
        monthlyData[monthName] = {};
      }
      monthlyData[monthName][tipoNome] = (monthlyData[monthName][tipoNome] || 0) + 1;
    });

    const labels = Object.keys(monthlyData);
    const tipos = Array.from(new Set(
      Object.values(monthlyData).flatMap(month => Object.keys(month))
    ));

    const datasets = tipos.map((tipo, index) => ({
      label: tipo,
      data: labels.map(month => monthlyData[month][tipo] || 0),
      backgroundColor: ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#673AB7', '#FF4081'][index % 6],
      borderWidth: 1,
      barPercentage: tipos.length <= 3 ? 0.5 : 0.9,
      categoryPercentage: tipos.length <= 3 ? 0.7 : 0.8
    }));

    return { labels, datasets };
  };

  // Função para processar dados mensais de demandas - comentada pois não está sendo usada atualmente
  /*
  const processMonthlyDemandasData = (): MonthlyDemandasData => {
    const monthlyData: { [month: string]: number } = {};

    ensureArray(dashboardData.demandas).forEach(demanda => {
      const date = new Date(demanda.createdAt);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
    });

    const labels = Object.keys(monthlyData).sort((a, b) => {
      const [monthA, yearA] = a.split('/').map(Number);
      const [monthB, yearB] = b.split('/').map(Number);
      return yearA - yearB || monthA - monthB;
    });

    const data = labels.map(month => monthlyData[month]);

    return {
      labels,
      datasets: [{
        label: 'Demandas Criadas',
        data,
        backgroundColor: '#4285F4',
        borderWidth: 1,
      }]
    };
  };
  */

  const getSolucoesPorResponsavel = () => {
    // Criar um mapa de responsáveis para suas soluções
    const responsavelMap: { [key: string]: SolucaoType[] } = {};

    ensureArray(dashboardData.solucoes).forEach(solucao => {
      // Usar o nome do responsável como chave, exatamente como no DashboardDemandas
      const responsavelNome = solucao.responsavel?.nome || 'Não informado';

      // Inicializar o array se não existir
      if (!responsavelMap[responsavelNome]) {
        responsavelMap[responsavelNome] = [];
      }

      // Adicionar a solução ao grupo do responsável
      responsavelMap[responsavelNome].push(solucao);
    });

    // Converter para array e ordenar por quantidade de soluções (decrescente)
    const responsavelArray = Object.entries(responsavelMap)
      .map(([nome, solucoes]) => ({ nome, solucoes }))
      .sort((a, b) => b.solucoes.length - a.solucoes.length);

    return responsavelArray;
  };

  // Estatísticas que podem ser usadas em futuras implementações
  // const ativos = ensureArray(dashboardData.solucoes).filter(s => s.status?.propriedade === 'ativo').length;
  // const inativos = ensureArray(dashboardData.solucoes).filter(s => s.status?.propriedade === 'inativo').length;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const solucoesComDemanda = ensureArray(dashboardData.solucoes).filter(s => s.demandaId !== null);
  const solucoesSemDemanda = ensureArray(dashboardData.solucoes).filter(s => s.demandaId === null);
  const totalSolucoes = ensureArray(dashboardData.solucoes).length;

  return (
    <div className={`
      w-full bg-gray-50
      transition-all duration-300 ease-in-out
      ${isCollapsed
        ? 'ml-20 pr-[90px] w-[calc(100%-5rem)] fixed left-1 top-13 h-screen overflow-y-auto pb-20'
        : 'w-full'
      }
      py-6 px-6
    `}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Card Demanda */}
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Demandas</h3>
              <p className="text-2xl font-bold text-gray-800">{dashboardData.demandas.length}</p>
            </div>
            <ClipboardList className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        {/* Card Total de Soluções */}
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Total de Soluções</h3>
              <p className="text-2xl font-bold text-gray-800">{totalSolucoes}</p>
            </div>
            <Lightbulb className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* Card Soluções Sem Demanda */}
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Soluções Sem Demanda</h3>
              <p className="text-2xl font-bold text-orange-600">{solucoesSemDemanda.length}</p>
            </div>
            <XCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        {/* Card Soluções Com Demanda */}
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Soluções Com Demanda</h3>
              <p className="text-2xl font-bold text-blue-600">{solucoesComDemanda.length}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Dashboard Switcher - Posicionado logo abaixo dos cards */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            className={`py-3 px-6 focus:outline-none transition-colors ${
              activeTab === 'demandas'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('demandas')}
          >
            Demandas
          </button>
          <button
            className={`py-3 px-6 focus:outline-none transition-colors ${
              activeTab === 'dashboard'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            Soluções
          </button>
        </div>
      </div>

      {/* Indicador de conteúdo ativo */}
      <div className="text-sm text-gray-500 mb-4 px-2">
        <p>Visualizando: <span className="font-medium text-blue-600">{activeTab === 'dashboard' ? 'Soluções' : 'Demandas'}</span></p>
      </div>

      {activeTab === 'demandas' ? (
        <DashboardDemandas key="dashboard-demandas" />
      ) : (
        <>
          {/* Charts Grid - Single column on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {/* <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
              <h3 className="text-gray-800 text-base font-semibold mb-4">Alinhamento da Solução</h3>
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
            </div> */}

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
              <h3 className="text-gray-800 text-base font-semibold mb-4">Tipos de Soluções</h3>
              <div className="h-[300px] w-full flex items-center justify-center">
                <Pie
                  data={processSolucaoData()}
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
              <h3 className="text-gray-800 text-base font-semibold mb-4">Status das Soluções</h3>
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
              <h3 className="text-gray-800 text-base font-semibold mb-4">Categorias das Soluções</h3>
              <div className="h-[300px] w-full">
                <Bar
                  data={processCategoriaData()}
                  options={{
                    ...chartOptions,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                          font: {
                            size: 12
                          }
                        }
                      },
                      x: {
                        display: false
                      }
                    },
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
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

          {/* Monthly Evolution Charts - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Evolução Mensal */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
              <h3 className="text-gray-800 text-base font-semibold mb-4">Evolução Anual por Tipos</h3>
              <div className="h-[400px] w-full">
                <Bar
                  data={processMonthlyCategoriaData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                          font: { size: 14 }
                        },
                        suggestedMax: Math.max(...processMonthlyCategoriaData().datasets.flatMap(d => d.data)) + 1
                      },
                      x: {
                        grid: { display: false },
                        ticks: {
                          font: { size: 13 },
                          maxRotation: 0,
                          minRotation: 0
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                        labels: {
                          boxWidth: 15,
                          padding: 10,
                          font: { size: 13 }
                        }
                      }
                    },
                  }}
                />
              </div>
            </div>

            {/* Evolução Anual */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
              <h3 className="text-gray-800 text-base font-semibold mb-4">
                Evolução Mensal dos Tipos ({new Date().getFullYear()})
              </h3>
              <div className="h-[400px] w-full">
                <Bar
                  data={processYearlyCategoriaData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                          font: { size: 14 }
                        },
                        suggestedMax: Math.max(...processYearlyCategoriaData().datasets.flatMap(d => d.data)) + 1
                      },
                      x: {
                        grid: { display: false },
                        ticks: {
                          font: { size: 13 },
                          maxRotation: 0,
                          minRotation: 0
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                        labels: {
                          boxWidth: 15,
                          padding: 10,
                          font: { size: 13 }
                        }
                      }
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tabela de Soluções por Responsável */}
          <div className="mt-6 bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-20">
            <h3 className="text-gray-800 text-lg font-semibold mb-4">Distribuição de Soluções por Responsável</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responsável
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantidade
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detalhes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getSolucoesPorResponsavel().length > 0 ? (
                    getSolucoesPorResponsavel().map((item, index) => {
                      // Gerar uma cor para cada responsável
                      const hue = (index * 137.5) % 360;
                      const color = `hsl(${hue}, 70%, 60%)`;

                      return (
                        <React.Fragment key={item.nome}>
                          {item.solucoes.map((solucao, sIndex) => (
                            <tr key={`${item.nome}-${solucao.id}-${sIndex}`} className="hover:bg-gray-50">
                              {sIndex === 0 ? (
                                <td className="px-4 py-2 whitespace-nowrap" rowSpan={item.solucoes.length}>
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-6 w-6 rounded-full" style={{ backgroundColor: color }}></div>
                                    <div className="ml-3">
                                      <div className="text-sm font-medium text-gray-900">{item.nome}</div>
                                    </div>
                                  </div>
                                </td>
                              ) : null}
                              {sIndex === 0 ? (
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500" rowSpan={item.solucoes.length}>
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {item.solucoes.length}
                                  </span>
                                </td>
                              ) : null}
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {solucao.nome || '-'}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-center text-sm text-gray-500">
                        Nenhuma solução encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}


    </div>
  );
}
