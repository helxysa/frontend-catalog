"use client"
import { useState, useEffect } from "react";
import { getProprietario, baseURL } from "../actions/actions";
import CriarProprietario from "./CriarProprietario";
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import Navbar from './Navbar';

interface Proprietario {
  id: number;
  nome: string;
  sigla: string;
  descricao: string | null;
  logo: string | null;
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
      setLoading(true);
      setError(null);
      const result = await getProprietario();
      
      // Verifica se o resultado é um objeto de erro
      if (result && 'error' in result) {
        setError(result.message);
        setEscritorios([]);
      } else {
        // Se não for erro, é um array de escritórios
        setEscritorios(result || []);
      }
    } catch (err) {
      console.error('Erro ao carregar escritórios:', err);
      setError('Ocorreu um erro ao carregar os escritórios. Por favor, tente novamente.');
      setEscritorios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscritorios();
  }, []);

  // Adicione um handler para retry com delay
  const handleRetry = () => {
    setTimeout(fetchEscritorios, 1000); // Adiciona um delay de 1 segundo antes de tentar novamente
  };

  const handleProprietarioClick = (id: number) => {
    localStorage.removeItem('selectedProprietarioId');
    localStorage.setItem('selectedProprietarioId', id.toString());
    router.push(`/proprietario/${id}/dashboard`);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Carregando unidades...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ops! Algo deu errado</h3>
              <p className="text-red-500 mb-6">{error}</p>
              <button
                onClick={handleRetry}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
        <div className="max-w-[2000px] mx-auto px-8 lg:px-12 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Unidades</h1>
              <p className="mt-2 text-gray-600">Gerencie as unidades</p>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              + CRIAR UNIDADE
            </button>
          </div>

          {escritorios.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-2xl mx-auto border border-gray-100">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma unidade encontrada</h3>
              <p className="text-gray-600 mb-8">Comece sua jornada criando sua primeira unidade de negócio.</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                + Criar Primeira Unidade
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {escritorios.map((escritorio) => (
                <div
                  key={escritorio.id}
                  onClick={() => handleProprietarioClick(escritorio.id)}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-200 p-6 transition-all duration-200 transform hover:-translate-y-1 cursor-pointer"
                >
                  <div className="flex items-start space-x-4">
                    <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden">
                      {escritorio.logo ? (
                        <img
                          src={`${baseURL}${escritorio.logo}`}
                          alt={`Logo ${escritorio.nome}`}
                          className="object-cover h-full w-full transform transition-transform group-hover:scale-110"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent) {
                              const fallback = parent.querySelector('.fallback-icon');
                              if (fallback) {
                                fallback.classList.remove('hidden');
                              }
                            }
                          }}
                        />
                      ) : null}
                      <div className={`fallback-icon ${escritorio.logo ? 'hidden' : ''} absolute inset-0 bg-blue-50 flex items-center justify-center`}>
                        <Building2 className="h-8 w-8 text-blue-500" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 break-words group-hover:text-blue-600 transition-colors">
                        {escritorio.nome}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">{escritorio.sigla}</p>
                    </div>
                  </div>
                  {escritorio.descricao && (
                    <p className="mt-4 text-sm text-gray-600 line-clamp-2 group-hover:text-gray-900 transition-colors">
                      {escritorio.descricao}
                    </p>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      Criado em: {new Date(escritorio.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
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
      </main>
    </div>
  );
}
