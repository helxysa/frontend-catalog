"use client"
import { useState, useEffect } from "react";
import { getProprietarios, cloneProprietario, deleteProprietario } from "../actions/actions";
import CriarProprietario from "./CriarProprietario";
import { useRouter } from 'next/navigation';
import { Building2, Trash2 } from 'lucide-react';
import Navbar from './Navbar';
import { useAuth } from "../../contexts/AuthContext";
import Link from "next/link";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Footer from '@/app/componentes/Footer/Footer'

// Componente de imagem otimizado com lazy loading
const OptimizedImage = dynamic(() => import('next/image'), {
  loading: () => (
    <div className="bg-blue-50 h-full w-full flex items-center justify-center rounded-lg">
      <Building2 className="h-10 w-10 text-blue-500" />
    </div>
  ),
  ssr: false
});

interface Proprietario {
  id: number;
  nome: string;
  sigla: string;
  descricao: string | null;
  logo: string | null;
  createdAt: string;
  updatedAt: string;
  user_id?: number | null;
  user?: {
    id: number;
    email: string;
    fullName?: string;
  } | null;
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  proprietarioName: string;
}

function ConfirmCloneModal({ isOpen, onClose, onConfirm, proprietarioName }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl transform transition-all animate-slideIn">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar Clonagem</h3>
          <p className="text-gray-600 mb-6">
            Você tem certeza que deseja clonar a unidade <span className="font-semibold">{proprietarioName}</span>?
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Proprietario() {
  const [escritorios, setEscritorios] = useState<Proprietario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProprietario, setSelectedProprietario] = useState<Proprietario | null>(null);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneProprietarioData, setCloneProprietarioData] = useState<{ id: number; nome: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [proprietarioToDelete, setProprietarioToDelete] = useState<{ id: number; nome: string } | null>(null);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});
  const router = useRouter();
  const { login, user } = useAuth();
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333';

  const fetchEscritorios = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getProprietarios();

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

  const handleEdit = (proprietario: Proprietario, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    setSelectedProprietario(proprietario);
    setShowModal(true);
  };

  const handleClone = async () => {
    if (!cloneProprietarioData) return;

    try {
      await cloneProprietario(cloneProprietarioData.id.toString());
      fetchEscritorios();
    } catch (error) {
      console.error('Error cloning:', error);
    } finally {
      setShowCloneModal(false);
      setCloneProprietarioData(null);
    }
  };

  const handleDeleteClick = (proprietario: Proprietario, e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o card seja clicado
    setProprietarioToDelete({ id: proprietario.id, nome: proprietario.nome });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!proprietarioToDelete) return;

    try {
      await deleteProprietario(proprietarioToDelete.id.toString());
      fetchEscritorios(); // Recarrega a lista após excluir
      setShowDeleteModal(false);
      setProprietarioToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir proprietário:', error);
      // Aqui você pode adicionar um toast ou alerta para mostrar o erro
    }
  };

  const handleImageError = (id: number) => {
    setImageError(prev => ({ ...prev, [id]: true }));
  };

  const renderLogo = (escritorio: Proprietario) => {
    if (escritorio.logo && !imageError[escritorio.id]) {
      try {
        const logoUrl = new URL(escritorio.logo, baseURL).toString();
        return (
          <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src={logoUrl}
              alt={`Logo ${escritorio.nome}`}
              fill
              sizes="(max-width: 768px) 100vw, 80px"
              className="object-cover"
              loading="lazy"
              onError={() => handleImageError(escritorio.id)}
            />
          </div>
        );
      } catch (error) {
        console.error(`URL inválida para o logo: ${escritorio.logo}. BaseURL: ${baseURL}`);
        // Se a construção da URL falhar, aciona o erro para mostrar o ícone padrão
        handleImageError(escritorio.id);
      }
    }

    return (
      <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-blue-50 flex items-center justify-center">
        <Building2 className="h-10 w-10 text-blue-500" />
      </div>
    );
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
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
            <div className="flex flex-row gap-2">
              {user?.isAdmin && (
                <Link
                  href="/proprietario/usuarios"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  USUÁRIOS
                </Link>
              )}
              {!user?.isManager && (
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  + CRIAR UNIDADE
                </button>
              )}
            </div>
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
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-200 p-6 transition-all duration-200 transform hover:-translate-y-1 cursor-pointer relative"
                >
                  <div className="absolute top-4 right-4 flex gap-2">
                    {!user?.isManager && (
                      <>
                        <button
                          onClick={(e) => handleEdit(escritorio, e)}
                          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                          aria-label="Editar"
                        >
                          <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCloneProprietarioData({ id: escritorio.id, nome: escritorio.nome });
                            setShowCloneModal(true);
                          }}
                          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                          aria-label="Clonar"
                        >
                          <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(escritorio, e)}
                          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                          aria-label="Excluir"
                        >
                          <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="10" y1="11" x2="10" y2="17" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="14" y1="11" x2="14" y2="17" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex items-start space-x-4">
                    {renderLogo(escritorio)}
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold text-gray-900 break-words group-hover:text-blue-600 transition-colors">
                        {escritorio.nome}
                      </h2>
                      <p className="text-sm font-medium text-gray-500 mt-1">{escritorio.sigla}</p>
                      {escritorio.user && (
                        <p className="text-xs text-gray-500 mt-2">
                          <span className="font-medium">Proprietário:</span> {escritorio.user.fullName || escritorio.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  {escritorio.descricao && (
                    <p className="mt-4 text-sm text-gray-600 line-clamp-2 group-hover:text-gray-900 transition-colors">
                      {escritorio.descricao}
                    </p>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-xs text-gray-400">
                      Criado em: {new Date(escritorio.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                    {(user?.isAdmin || user?.isManager) && (
                      escritorio.user ? (
                        <p className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                          Proprietário: {escritorio.user.fullName || escritorio.user.email}
                        </p>
                      ) : (
                        <p className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-medium">
                          Não possui proprietário
                        </p>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {showModal && (
            <CriarProprietario
              onClose={() => {
                setShowModal(false);
                setSelectedProprietario(null);
              }}
              onSuccess={() => {
                fetchEscritorios();
                setShowModal(false);
                setSelectedProprietario(null);
              }}
              proprietario={selectedProprietario || undefined}
            />
          )}

          {showCloneModal && cloneProprietarioData && (
            <ConfirmCloneModal
              isOpen={showCloneModal}
              onClose={() => {
                setShowCloneModal(false);
                setCloneProprietarioData(null);
              }}
              onConfirm={handleClone}
              proprietarioName={cloneProprietarioData.nome}
            />
          )}

          {showDeleteModal && proprietarioToDelete && (
            <DeleteConfirmationModal
              isOpen={showDeleteModal}
              onClose={() => {
                setShowDeleteModal(false);
                setProprietarioToDelete(null);
              }}
              onConfirm={confirmDelete}
              itemName={proprietarioToDelete.nome}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
