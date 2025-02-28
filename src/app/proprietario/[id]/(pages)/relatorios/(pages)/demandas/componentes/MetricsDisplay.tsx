interface MetricsDisplayProps {
    metrics: {
      totalDemandas: number;
      statusCount: Record<string, number>;
      prioridadeCount: Record<string, number>;
    };
  }
  
  export default function MetricsDisplay({ metrics }: MetricsDisplayProps) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-2">
        <div className="bg-blue-50 p-6 rounded-lg shadow-md w-full">
          <h3 className="font-semibold text-blue-800 text-lg mb-4">Total de Demandas</h3>
          <p className="text-3xl font-bold text-blue-600">{metrics.totalDemandas}</p>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg shadow-md w-full">
          <h3 className="font-semibold text-green-800 text-lg mb-4">Status</h3>
          <div className="space-y-3">
            {Object.entries(metrics.statusCount).map(([status, count]) => (
              <div key={status} className="flex justify-between text-green-600 items-center">
                <span className="font-medium">{status}:</span>
                <span className="text-xl font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg shadow-md w-full">
          <h3 className="font-semibold text-purple-800 text-lg mb-4">Prioridades</h3>
          <div className="space-y-3">
            {Object.entries(metrics.prioridadeCount).map(([prioridade, count]) => (
              <div key={prioridade} className="flex justify-between text-purple-600 items-center">
                <span className="font-medium">{prioridade}:</span>
                <span className="text-xl font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }