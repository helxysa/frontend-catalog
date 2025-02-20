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
import { Doughnut, Bar } from 'react-chartjs-2';
import { getDemandas, getSolucoes, getAlinhamentos, getStatus, getCategorias } from "../actions/actions";
import type { DemandaType } from '../../demandas/types/types';
import type { SolucaoType } from '../../solucoes/types/types';
import type { Status } from '../../configuracoes/(page)/status/types/types';

// Registrar componentes do Chart.js
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<{
    demandas: DemandaType[];
    solucoes: SolucaoType[];
    alinhamentos: any[];
    status: Status[];
    categorias: any[];
  }>({
    demandas: [],
    solucoes: [],
    alinhamentos: [],
    status: [],
    categorias: []
  });

  useEffect(() => {
    const fetchData = async () => {
      const [demandas, solucoes, alinhamentos, status, categorias] = await Promise.all([
        getDemandas(),
        getSolucoes(),
        getAlinhamentos(),
        getStatus(),
        getCategorias()
      ]);

      setDashboardData({
        demandas,
        solucoes,
        alinhamentos,
        status,
        categorias
      });
    };

    fetchData();
  }, []);

  // Processamento dos dados reais
  const processAlinhamentoData = () => {
    const counts: { [key: string]: number } = {
      
    };

    dashboardData.demandas.forEach(demanda => {
      const alinhamentoNome = demanda.alinhamento?.nome || 'Não alinhada';
      counts[alinhamentoNome] = (counts[alinhamentoNome] || 0) + 1;
    });

    return {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: ['#4285F4', '#34A853', '#FBBC05', '#EA4335', ],
        borderWidth: 1,
      }],
    };
  };

  const processSolucaoData = () => {
    const counts: { [key: string]: number } = {};
    dashboardData.solucoes.forEach(solucao => {
      const tipoNome = solucao.tipo?.nome || 'Outros';
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
    dashboardData.solucoes.forEach(solucao => {
      const statusNome = solucao.status?.nome || 'Não definido';
      counts[statusNome] = (counts[statusNome] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const colors = labels.map(statusName => {
      const status = dashboardData.status.find(s => s.nome === statusName);
      return status?.propriedade || '#999999'; 
    });

    return {
      labels,
      datasets: [{
        data: Object.values(counts),
        backgroundColor: colors,
        borderWidth: 1,
      }],
    };
  };

  const processCategoriaData = () => {
    const counts: { [key: string]: number } = {};
    dashboardData.solucoes.forEach(solucao => {
      const categoriaNome = solucao.categoria?.nome || 'Outros';
      counts[categoriaNome] = (counts[categoriaNome] || 0) + 1;
    });

    return {
      labels: Object.keys(counts),
      datasets: [{
        label: 'Quantidade',
        data: Object.values(counts),
        backgroundColor: '#4285F4',
      }],
    };
  };

  const ativos = dashboardData.solucoes.filter(s => s.status?.propriedade === 'ativo').length;
  const inativos = dashboardData.solucoes.filter(s => s.status?.propriedade === 'inativo').length;

  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="grid grid-cols-3 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-gray-500 text-sm font-medium">Demanda</h3>
          <p className="text-3xl font-bold text-gray-800">{dashboardData.demandas.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-gray-500 text-sm font-medium">Soluções</h3>
          <p className="text-3xl font-bold text-gray-800">{dashboardData.solucoes.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-gray-500 text-sm font-medium">Ativos</h3>
          <p className="text-3xl font-bold text-gray-800">{ativos}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-gray-500 text-sm font-medium">Inativos</h3>
          <p className="text-3xl font-bold text-gray-800">{inativos}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-gray-800 font-semibold mb-4">Alinhamentos</h3>
          <div className="h-[300px] flex items-center justify-center">
            <Doughnut data={processAlinhamentoData()} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-gray-800 font-semibold mb-4">Tipos de Soluções</h3>
          <div className="h-[300px] flex items-center justify-center">
            <Doughnut data={processSolucaoData()} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-gray-800 font-semibold mb-4">Status</h3>
          <div className="h-[300px] flex items-center justify-center">
            <Doughnut data={processStatusData()} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-gray-800 font-semibold mb-4">Categorias</h3>
        <div className="h-[300px]">
          <Bar 
            data={processCategoriaData()} 
            options={{
              ...chartOptions,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }} 
          />
        </div>
      </div>
      </div>

      {/* Gráfico de barras em linha separada */}
     
    </div>
  );
}