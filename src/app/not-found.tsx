'use client';

import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Ilustração de Erro */}
        <div className="relative mx-auto w-64 h-64">
          <div className="absolute inset-0 bg-blue-100 rounded-full opacity-50 animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-9xl font-bold text-blue-600">4</span>
            <div className="w-24 h-24 bg-blue-600 rounded-full mx-1 "></div>
            <span className="text-9xl font-bold text-blue-600">4</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-800">Página não encontrada</h1>
          <p className="text-gray-600">
            Desculpe, não conseguimos encontrar a página que você está procurando.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button 
            onClick={() => window.history.back()} 
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={18} />
            <span>Voltar</span>
          </button>
          
          <Link 
            href="/proprietario"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Home size={18} />
            <span>Ir para proprietários</span>
          </Link>
        </div>
      </div>
      
      <div className="mt-16 text-sm text-gray-500">
        <p>Se o problema persistir, entre em contato com o suporte.</p>
      </div>
    </div>
  );
}