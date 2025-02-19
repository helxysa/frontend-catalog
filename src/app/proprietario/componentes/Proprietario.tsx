"use client"
import { useState, useEffect } from "react";
import { getProprietario } from "../actions/actions";
import CriarProprietario from "./CriarProprietario";

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

  const fetchEscritorios = async () => {
    try {
      const data = await getProprietario();
      setEscritorios(data);
    } catch (err) {
      setError("Erro ao carregar os escritórios");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscritorios();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-blue-700">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {escritorios.map((escritorio) => (
            <div 
              key={escritorio.id}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{escritorio.nome}</h2>
                {escritorio.logo && (
                  <img 
                    src={escritorio.logo} 
                    alt={`Logo ${escritorio.nome}`} 
                    className="w-10 h-10 object-contain"
                  />
                )}
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Sigla: {escritorio.sigla}</p>
                {escritorio.descricao && <p>{escritorio.descricao}</p>}
                <p className="text-xs text-gray-400">
                  Criado em: {new Date(escritorio.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <button className="text-blue-700 hover:text-blue-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

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
