'use client'

import { useState, useEffect, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { getDemandas } from '../actions/action';
import { DemandaType } from '../types/type';
import { FileSpreadsheet } from 'lucide-react';
import MetricsDisplay from './MetricsDisplay';
import Header from './Header';
import Loading from '@/app/componentes/Loading/Loading';

// Lazy load components with smaller chunks
const PDFComponent = dynamic(
  () => import('./PDFComponent').then(mod => mod.default),
  { 
    loading: () => <ButtonSkeleton />,
    ssr: false 
  }
);

// Separate the Excel functionality
const ExcelExporter = dynamic(
  () => import('./ExcelExporter'),
  {
    loading: () => <Loading />,
    ssr: false
  }
);

// Lightweight loading component
const ButtonSkeleton = () => (
  <div className="bg-gray-200 h-10 w-32 rounded-md animate-pulse" />
);

// Separate table component for better performance
const DemandaTable = dynamic(
  () => import('./DemandaTable'),
  {
    loading: () => <Loading />
  }
);

// Função para normalizar os dados com memoization
const useNormalizedDemandas = (demandas: DemandaType[]) => {
  return useMemo(() => {
    return demandas.map(demanda => ({
      sigla: demanda.sigla || '',
      nome: demanda.nome || '',
      status: demanda.status?.nome || 'Sem status',
      prioridade: demanda.prioridade?.nome || 'Sem prioridade',
      responsavel: demanda.responsavel?.nome || 'Sem responsável',
    }));
  }, [demandas]);
};

// Função para calcular métricas com memoization
const useMetrics = (demandas: DemandaType[]) => {
  return useMemo(() => {
    const totalDemandas = demandas.length;
    
    const statusCount = demandas.reduce((acc, demanda) => {
      const status = demanda.status?.nome || 'Sem status';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const prioridadeCount = demandas.reduce((acc, demanda) => {
      const prioridade = demanda.prioridade?.nome || 'Sem prioridade';
      acc[prioridade] = (acc[prioridade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalDemandas, statusCount, prioridadeCount };
  }, [demandas]);
};

// Componente principal
export default function DemandasComponent() {
  const [demandas, setDemandas] = useState<DemandaType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Prefetch data
  useEffect(() => {
    const storedId = localStorage.getItem('selectedProprietarioId');
    if (storedId) {
      const prefetchDemandas = async () => {
        const data = await getDemandas();
        return data.filter(
          (demanda: DemandaType) => demanda.proprietario?.id === Number(storedId)
        );
      };

      prefetchDemandas()
        .then(setDemandas)
        .finally(() => setIsLoading(false));
    }
  }, []);

  const normalizedDemandas = useNormalizedDemandas(demandas);
  const metrics = useMetrics(demandas);

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 pt-10 pb-20">
      <div className="w-full max-w-[97%] p-8 bg-white rounded-lg shadow-md">
        <Header />
        
        <MetricsDisplay metrics={metrics} />

        <Suspense fallback={<Loading />}>
          <DemandaTable demandas={normalizedDemandas} />
        </Suspense>

        <div className="flex gap-4 mt-4">
          <ExcelExporter demandas={normalizedDemandas} />
          <PDFComponent demandas={normalizedDemandas} metrics={metrics} />
        </div>
      </div>
    </div>
  );
}