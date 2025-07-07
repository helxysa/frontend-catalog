'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getProprietarios as fetchProprietariosAction } from '../proprietario/actions/actions';

// 1. Definir a interface para um único proprietário (você já tem isso, mas é bom ter aqui)
interface Proprietario {
  user: any;
  id: number;
  nome: string;
  sigla: string;
  logo: string | null;
  // Adicione outros campos se necessário
}

// 2. Definir a interface para o valor do nosso contexto
interface ProprietariosContextType {
  proprietarios: Proprietario[];
  isLoading: boolean;
  error: string | null;
  refetchProprietarios: () => void;
}

// 3. Criar o Contexto com um valor padrão
const ProprietariosContext = createContext<ProprietariosContextType | undefined>(undefined);

// 4. Criar o componente Provedor (Provider)
export function ProprietariosProvider({ children }: { children: ReactNode }) {
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProprietarios = useCallback(async () => {
    // Evita chamadas duplicadas se já estiver carregando
    if (!isLoading) setIsLoading(true);
    setError(null);

    try {
      const result = await fetchProprietariosAction();
      if (result && result.error) {
        setError(result.message);
        setProprietarios([]);
      } else {
        setProprietarios(result || []);
      }
    } catch (err) {
      setError('Falha ao carregar os dados dos proprietários.');
      setProprietarios([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // useCallback para memoizar a função

  // Efeito para buscar os dados quando o provedor é montado
  useEffect(() => {
    fetchProprietarios();
  }, [fetchProprietarios]);

  const value = {
    proprietarios,
    isLoading,
    error,
    refetchProprietarios: fetchProprietarios, // Função para recarregar os dados
  };

  return (
    <ProprietariosContext.Provider value={value}>
      {children}
    </ProprietariosContext.Provider>
  );
}

// 5. Criar um Hook customizado para facilitar o uso do contexto
export function useProprietarios() {
  const context = useContext(ProprietariosContext);
  if (context === undefined) {
    throw new Error('useProprietarios deve ser usado dentro de um ProprietariosProvider');
  }
  return context;
}