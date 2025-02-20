import { Metadata } from 'next';
import { Suspense } from 'react';
import Categoria from '@/app/proprietario/[id]/(pages)/configuracoes/(page)/categorias/componentes/Categoria';

interface Proprietario {
  id: number;
  nome: string;
  sigla: string;
  descricao: string | null;
  logo: string;
}

async function getProprietario(id: string): Promise<Proprietario | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/proprietarios/${id}`);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Error fetching proprietario:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const proprietario = await getProprietario(params.id);
  return {
    title: proprietario ? `Escritório: ${proprietario.nome}` : 'Escritório não encontrado',
  };
}

export default async function ProprietarioDetails({ params }: { params: { id: string } }) {
  const proprietario = await getProprietario(params.id);

  if (!proprietario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Escritório não encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Proprietário Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{proprietario.nome}</h1>
              <p className="text-gray-600">{proprietario.sigla}</p>
              {proprietario.descricao && (
                <p className="text-gray-600 mt-2">{proprietario.descricao}</p>
              )}
            </div>
            {proprietario.logo && (
              <img 
                src={proprietario.logo} 
                alt={`Logo ${proprietario.nome}`} 
                className="w-20 h-20 object-contain"
              />
            )}
          </div>
        </div>

        {/* Categories Section */}
        <Suspense fallback={<div>Carregando categorias...</div>}>
          <Categoria proprietarioId={params.id} />
        </Suspense>
      </div>
    </div>
  );
}
