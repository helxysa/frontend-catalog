'use client'

import { useState } from 'react';
import Dashboard from './Dashboard';
import DashboardDemandas from './DashboardDemandas';

export default function DashboardSwitcher() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'demandas'>('demandas');

  return (
    <div className="mt-8">
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-4">
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

      {activeTab === 'demandas' ? (
        <DashboardDemandas />
      ) : (
        <div className="dashboard-content">
          {/* Dashboard content will be rendered here */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {/* This is just a placeholder. The actual Dashboard component will be used in the page */}
          </div>
        </div>
      )}
    </div>
  );
}
