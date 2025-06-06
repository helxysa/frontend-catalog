"use client"
import { useState, useEffect } from "react";
import api from "../../../lib/api";
import { createProprietario, updateProprietario } from "../actions/actions";
import { useAuth } from "../../contexts/AuthContext";

// Fix the baseURL issue
const baseURL = process.env.NEXT_PUBLIC_BASE_URL

interface CriarProprietarioProps {
  onClose: () => void;
  onSuccess: () => void;
  proprietario?: {
    id: number;
    nome: string;
    sigla: string;
    descricao: string | null;
    logo: string | null;
    user_id?: number | null;
  };
}

export default function CriarProprietario({ onClose, onSuccess, proprietario }: CriarProprietarioProps) {
  const [formData, setFormData] = useState({
    nome: proprietario?.nome || '',
    sigla: proprietario?.sigla || '',
    descricao: proprietario?.descricao || '',
    user_id: proprietario?.user_id ? proprietario.user_id.toString() : ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    proprietario?.logo ? `${baseURL}${proprietario.logo}` : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dentro do componente, adicione um estado para armazenar os usuários
  const [users, setUsers] = useState<Array<{id: number, email: string, fullName?: string}>>([]);

  const { user } = useAuth();
  const isAdmin = user?.isAdmin;

  useEffect(() => {
    if (proprietario?.logo) {
      setPreviewUrl(`${baseURL}${proprietario.logo}`);
    }
  }, [proprietario]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      setLogoFile(file);
      if (previewUrl && typeof previewUrl === 'string' && baseURL && !previewUrl.startsWith(baseURL)) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl && typeof previewUrl === 'string' && baseURL && !previewUrl.startsWith(baseURL)) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleRemoveLogo = () => {
    if (previewUrl && typeof previewUrl === 'string' && baseURL && !previewUrl.startsWith(baseURL)) {
      URL.revokeObjectURL(previewUrl);
    }
    setLogoFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.nome.trim() || !formData.sigla.trim()) {
        throw new Error('Nome e sigla são campos obrigatórios');
      }

      console.log('Logo file before submit:', logoFile);

      const submitData = {
        ...formData,
        logo: logoFile || undefined,
        // Incluir user_id apenas se o usuário for administrador
        ...(isAdmin ? { user_id: formData.user_id ? Number(formData.user_id) : null } : {})
      };

      console.log('Submit data:', submitData);

      if (proprietario) {
        console.log('Updating proprietario with ID:', proprietario.id.toString());
        await updateProprietario(proprietario.id.toString(), submitData);
      } else {
        console.log('Creating new proprietario');
        await createProprietario(submitData);
      }
      onSuccess();
    } catch (err: any) {
      console.error('Error details:', err);
      setError(
        err instanceof Error
          ? err.message
          : err.response?.data?.message || `Erro ao ${proprietario ? 'atualizar' : 'criar'} proprietário`
      );
    } finally {
      setLoading(false);
    }
  };

  // Adicione um useEffect para buscar os usuários
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Apenas administradores podem ver a lista de usuários
        if (isAdmin) {
          const response = await api.get(`${baseURL}/auth/list-users`);
          setUsers(response.data || []);
        }
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
      }
    };

    fetchUsers();
  }, [isAdmin]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl transform transition-all animate-slideIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {proprietario ? 'Editar Unidade' : 'Criar Nova Unidade'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Unidade</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m4 0v-2a1 1 0 011-1h2a1 1 0 011 1v2m-5 0h5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Ex: Divisão de Sistema de Informação"
                className="pl-10 pr-3 py-2.5 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 placeholder:text-gray-500 bg-gray-50 hover:bg-gray-50/80"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sigla</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                name="sigla"
                value={formData.sigla}
                onChange={handleChange}
                required
                placeholder="Ex: DSIS"
                className="pl-10 pr-3 py-2.5 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 placeholder:text-gray-500 bg-gray-50 hover:bg-gray-50/80"
                maxLength={10}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Ex: Unidade responsável pelo desenvolvimento tecnológico..."
              rows={3}
              className="block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none py-2.5 px-3 text-gray-900 placeholder:text-gray-500 bg-gray-50 hover:bg-gray-50/80"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
            <div className="space-y-2">
              {previewUrl && (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => {
                      console.log('Image failed to load, removing logo');
                      handleRemoveLogo();
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
              <div className="flex items-center justify-center w-full">
                <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500 hover:bg-gray-50/80 transition-colors">
                  <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="mt-2 text-sm text-gray-500">
                    {logoFile ? 'Trocar imagem' : 'Carregar logo'}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              {logoFile && (
                <p className="text-sm text-gray-500">
                  Arquivo selecionado: {logoFile.name}
                </p>
              )}
            </div>
          </div>

          {/* Campo de seleção de usuário apenas para administradores */}
          {isAdmin && (
            <div className="mb-4">
              <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-1">
                Proprietário
              </label>
              <select
                id="user_id"
                name="user_id"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione um proprietário</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName || user.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {proprietario ? 'Atualizando...' : 'Criando...'}
                </span>
              ) : (
                proprietario ? "Atualizar Unidade" : "Criar Unidade"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
