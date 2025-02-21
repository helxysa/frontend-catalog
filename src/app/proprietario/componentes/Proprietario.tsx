"use client"
import { useState, useEffect } from "react";
import { getProprietario } from "../actions/actions";
import CriarProprietario from "./CriarProprietario";
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';

interface Proprietario {
  id: number;
  nome: string;
  sigla: string;
  descricao: string | null;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

export default function Proprietario() {
  const [escritorios, setEscritorios] = useState<Proprietario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const fetchEscritorios = async () => {
    try {
      const data = await getProprietario();
      setEscritorios(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar os escritórios");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscritorios();
  }, []);

  const handleProprietarioClick = (id: number) => {
    localStorage.removeItem('selectedProprietarioId');
    localStorage.setItem('selectedProprietarioId', id.toString());
    router.push(`/proprietario/${id}/dashboard`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchEscritorios}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Meus Escritórios</h1>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            + CRIAR ESCRITÓRIO
          </button>
        </div>

        {escritorios.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum escritório encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">Comece criando seu primeiro escritório.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                + Criar Primeiro Escritório
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {escritorios.map((escritorio) => (
              <div
                key={escritorio.id}
                onClick={() => handleProprietarioClick(escritorio.id)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  {escritorio.logo ? (
                    <img
                      src={escritorio.logo}
                      alt={`Logo ${escritorio.nome}`}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{escritorio.nome}</h2>
                    <p className="text-sm text-gray-500">{escritorio.sigla}</p>
                  </div>
                </div>
                {escritorio.descricao && (
                  <p className="mt-4 text-sm text-gray-600">{escritorio.descricao}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <CriarProprietario
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              fetchEscritorios();
              setShowModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
