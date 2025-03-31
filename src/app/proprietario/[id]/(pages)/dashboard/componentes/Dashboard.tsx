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
import { getDemandas, getSolucoes, getAlinhamentos, getStatus, getCategorias, getDesenvolvedores, getTipos } from "../actions/actions";
import type { DemandaType } from '../../demandas/types/types';
import type { SolucaoType } from '../../solucoes/types/types';
import type { Desenvolvedor } from '../../configuracoes/(page)/desenvolvedores/types/types';
import type { Status } from '../../configuracoes/(page)/status/types/types';
import { ClipboardList, Lightbulb, CheckCircle2, XCircle } from 'lucide-react';
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

type MonthlyCategoriaData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderWidth: number;
  }[];
};

type MonthlyDemandasData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderWidth: number;
  }[];
};

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
  }>({
    demandas: [],
    solucoes: [],
    alinhamentos: [],
    status: [],
    categorias: [],
    desenvolvedores: [],
    tipos: []
  });
  const { isCollapsed } = useSidebar();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [demandas, solucoes, alinhamentos, status, categorias, desenvolvedores, tipos] = await Promise.all([
          getDemandas(),
          getSolucoes(),
          getAlinhamentos(),
          getStatus(),
          getCategorias(),
          getDesenvolvedores(),
          getTipos()
        ]);

        console.log('Soluções recebidas:', solucoes);
        
        // Garantir que solucoes seja um array
        const solucoesArray = Array.isArray(solucoes) ? solucoes : [];
        
        setDashboardData({
          demandas,
          solucoes: solucoesArray,
          alinhamentos,
          status,
          categorias,
          desenvolvedores,
          tipos
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

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

  const processSolucaoData = () => {
    const counts: { [key: string]: number } = {};
    ensureArray(dashboardData.solucoes).forEach(solucao => {
      const tipoId = solucao.tipoId ? Number(solucao.tipoId) : null;
      const tipo = tipoId ? dashboardData.tipos?.find(t => t.id === tipoId) : null;
      const tipoNome = tipo?.nome || 'Não definido';
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
      const statusNome = status?.nome || 'Não definido';
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
      const categoriaNome = categoria?.nome || 'Não definido';
      counts[categoriaNome] = (counts[categoriaNome] || 0) + 1;
    });

    return {
      labels: [''],
      datasets: Object.entries(counts).map(([label, value], index) => ({
        label,
        data: [value],
        backgroundColor: ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#673AB7', '#FF4081'][index % 6],
        borderWidth: 1,
      })),
    };
  };

  const processMonthlyCategoriaData = (): MonthlyCategoriaData => {
    const monthlyData: { [month: string]: { [categoria: string]: number } } = {};

    ensureArray(dashboardData.solucoes).forEach(solucao => {
      const statusDate = solucao.data_status || solucao.dataStatus;
      
      if (!statusDate) {
        console.log('Solução sem data de status:', solucao);
        return;
      }

      try {
        const date = new Date(statusDate);
        const monthYear = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
        const categoriaId = solucao.categoriaId ? Number(solucao.categoriaId) : null;
        const categoria = categoriaId ? dashboardData.categorias?.find(c => c.id === categoriaId) : null;
        const categoriaNome = categoria?.nome || 'Não definido';

        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {};
        }

        monthlyData[monthYear][categoriaNome] = (monthlyData[monthYear][categoriaNome] || 0) + 1;
      } catch (error) {
        console.error('Erro ao processar data:', statusDate, error);
      }
    });

    const labels = Object.keys(monthlyData).sort((a, b) => {
      const [monthA, yearA] = a.split('/').map(Number);
      const [monthB, yearB] = b.split('/').map(Number);
      return yearA - yearB || monthA - monthB;
    });

    const categorias = Array.from(new Set(
      Object.values(monthlyData).flatMap(month => Object.keys(month))
    ));

    const datasets = categorias.map((categoria, index) => ({
      label: categoria,
      data: labels.map(month => monthlyData[month][categoria] || 0),
      backgroundColor: ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#673AB7', '#FF4081'][index % 6],
      borderWidth: 1,
      barPercentage: categorias.length <= 3 ? 0.5 : 0.9,
      categoryPercentage: categorias.length <= 3 ? 0.7 : 0.8
    }));

    return { labels, datasets };
  };

  const processYearlyCategoriaData = () => {
    const currentYear = new Date().getFullYear();
    const monthlyData: { [month: string]: { [categoria: string]: number } } = {};

    // Processa apenas os meses que têm dados
    ensureArray(dashboardData.solucoes).forEach(solucao => {
      const statusDate = solucao.data_status || solucao.dataStatus;
      if (!statusDate) return;
      
      const date = new Date(statusDate);
      if (date.getFullYear() !== currentYear) return;
      
      const monthName = date.toLocaleString('pt-BR', { month: 'short' });
      const categoriaId = solucao.categoriaId ? Number(solucao.categoriaId) : null;
      const categoria = categoriaId ? dashboardData.categorias?.find(c => c.id === categoriaId) : null;
      const categoriaNome = categoria?.nome || 'Não definido';

      if (!monthlyData[monthName]) {
        monthlyData[monthName] = {};
      }
      monthlyData[monthName][categoriaNome] = (monthlyData[monthName][categoriaNome] || 0) + 1;
    });

    const labels = Object.keys(monthlyData);
    const categorias = Array.from(new Set(
      Object.values(monthlyData).flatMap(month => Object.keys(month))
    ));

    const datasets = categorias.map((categoria, index) => ({
      label: categoria,
      data: labels.map(month => monthlyData[month][categoria] || 0),
      backgroundColor: ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#673AB7', '#FF4081'][index % 6],
      borderWidth: 1,
      barPercentage: categorias.length <= 3 ? 0.5 : 0.9,
      categoryPercentage: categorias.length <= 3 ? 0.7 : 0.8
    }));

    return { labels, datasets };
  };

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

  const processSolucoesPorDesenvolvedor = () => {
    const solucoesPorDesenvolvedor: { [key: number]: SolucaoType[] } = {};

    ensureArray(dashboardData.solucoes).forEach(solucao => {
      const desenvolvedorId = solucao.desenvolvedorId ? Number(solucao.desenvolvedorId) : null;
      if (desenvolvedorId) {
        if (!solucoesPorDesenvolvedor[desenvolvedorId]) {
          solucoesPorDesenvolvedor[desenvolvedorId] = [];
        }
        solucoesPorDesenvolvedor[desenvolvedorId].push(solucao);
      }
    });

    return Object.entries(solucoesPorDesenvolvedor).map(([desenvolvedorIdStr, solucoes]) => {
      const desenvolvedorId = Number(desenvolvedorIdStr);
      const desenvolvedor = dashboardData.desenvolvedores.find(d => d.id.toString() === desenvolvedorIdStr);
      return {
        desenvolvedor: desenvolvedor ? desenvolvedor.nome : 'Desenvolvedor não encontrado',
        solucoes
      };
    });
  };

  const ativos = ensureArray(dashboardData.solucoes).filter(s => s.status?.propriedade === 'ativo').length;
  const inativos = ensureArray(dashboardData.solucoes).filter(s => s.status?.propriedade === 'inativo').length;

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      {/* Charts Grid - Single column on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
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
        </div>

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
          <h3 className="text-gray-800 text-base font-semibold mb-4">Evolução Anual das Categorias</h3>
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
            Evolução Mensal das Categorias ({new Date().getFullYear()})
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

    

      {/* Tabela de Soluções por Desenvolvedor */}
      <div className="mt-6 bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-20">
        <h3 className="text-gray-800 text-lg font-semibold mb-4">Distribuição de Soluções por Desenvolvedor</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Desenvolvedor
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
              {processSolucoesPorDesenvolvedor().map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {item.desenvolvedor[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.desenvolvedor}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-sm font-semibold text-blue-800 bg-blue-100 rounded-full">
                      {item.solucoes.length}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-2">
                      {item.solucoes.map((solucao, idx) => (
                        <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {solucao.nome}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}