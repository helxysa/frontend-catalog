'use client'
import { useState } from "react";
import { Trash2, Mail, Lock, AlertCircle } from 'lucide-react';

interface DeleteAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (email: string, password: string) => Promise<boolean>;
  proprietarioName: string;
  error?: string;
}

export function DeleteAuthModal({ isOpen, onClose, onConfirm, proprietarioName, error: propError }: DeleteAuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Usar o erro da prop se estiver disponível
  const displayError = propError || error;

  // Limpar campos e erros quando o modal for fechado
  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setError(''); // Limpar erro anterior
    setIsSubmitting(true);

    // Chamar a função de confirmação e verificar o resultado
    const success = await onConfirm(email, password);

    // Se for bem-sucedido, o modal será fechado pelo componente pai
    // Caso contrário, apenas desabilitar o estado de submissão
    if (!success) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="DeleteAuthModal bg-white rounded-xl p-8 w-full max-w-md shadow-2xl transform transition-all animate-slideIn border border-gray-200 relative">
        {/* Botão de fechar no canto superior direito */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Fechar"
        >
          <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <Trash2 className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirmar Exclusão</h3>
          <p className="text-gray-600">
            Para excluir a unidade <span className="font-semibold text-red-600">{proprietarioName}</span>,
            por favor confirme suas credenciais:
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu email"
                  className="pl-10 pr-3 py-3 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-gray-900 bg-gray-50 hover:bg-gray-50/80"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="pl-10 pr-3 py-3 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-gray-900 bg-gray-50 hover:bg-gray-50/80"
                />
              </div>
            </div>

            {(displayError) && (
              <div className="flex items-center p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 shadow-sm animate-pulse">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 text-red-600" />
                <p className="text-sm font-medium error-message">{displayError}</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando...
                </span>
              ) : "Confirmar Exclusão"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}