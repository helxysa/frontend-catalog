"use client"
import { useState, useEffect } from "react";
import { registerUser, updateUser, deleteUser, checkIsAdmin, listUsers } from "../actions/actions";
import { UserPlus, Mail, User, Lock, Eye, EyeOff, Users, Calendar, X, Shield, ShieldCheck, Trash2, Edit2, ChevronLeft } from 'lucide-react';
import { UserRegister } from "../types/type";
import api from "../../../lib/api";
import DeleteConfirmationModal from "../../../proprietario/[id]/(pages)/solucoes/componentes/ModalConfirmacao/DeleteConfirmationModal";
import Link from "next/link";



export default function RegistrarUsuario() {
  const [users, setUsers] = useState<UserRegister[]>([]);
  const [loading, setLoading] = useState(false); // Iniciar como false
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Novos estados para edição e exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{id: number, fullName: string} | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Resto dos estados existentes
  const [formData, setFormData] = useState<{
    id?: number;
    fullName: string;
    email: string;
    password: string;
    roleId: number;
  }>({
    fullName: '',
    email: '',
    password: '',
    roleId: 1,
  });
  const [showPassword, setShowPassword] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 

  const Roles = {
    USER: 1,
    ADMIN: 2
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const isAdmin = await checkIsAdmin();
      
      if (isAdmin) {
        try {
          const usersData = await listUsers();
          setUsers(usersData);
          setError(null);
        } catch (listError: any) {
          console.error('Erro ao buscar lista de usuários:', listError);
          setError('Endpoint de listagem de usuários não disponível. Contate o administrador do sistema.');
          setUsers([]);
        }
      } else {
        setError('Você não tem permissão para visualizar a lista de usuários.');
        setUsers([]);
      }
    } catch (err: any) {
      console.error('Erro ao verificar usuário:', err);
      setError('Não foi possível verificar suas permissões. Por favor, faça login novamente.');
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'roleId' ? parseInt(value) : value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.fullName.trim() || !formData.email.trim()) {
        throw new Error('Nome completo e email são campos obrigatórios');
      }

      if (isEditing) {
        if (!formData.id) {
          throw new Error('ID do usuário é necessário para edição');
        }
        
        await updateUser({...formData, id: formData.id!});
      } else {
        if (!formData.password.trim()) {
          throw new Error('Senha é obrigatória para novos usuários');
        }
        await registerUser(formData);
      }
      
      setShowModal(false);
      setFormData({
        fullName: '',
        email: '',
        password: '',
        roleId: 1,
      });
      setIsEditing(false);
      fetchUsers();
    } catch (err: any) {
      console.error('Error details:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Erro ao processar usuário'
      );
    } finally {
      setLoading(false);
    }
  };

  // Função para obter o nome do papel do usuário
  const getRoleName = (roleId: number | undefined) => {
    return roleId === Roles.ADMIN ? 'Administrador' : 'Usuário';
  };

  // Função para obter o ícone do papel do usuário
  const getRoleIcon = (roleId: number | undefined) => {
    return roleId === Roles.ADMIN ? 
      <ShieldCheck className="w-4 h-4 text-blue-600" /> : 
      <Shield className="w-4 h-4 text-gray-500" />;
  };

  // Nova função para excluir usuário
  const handleDeleteClick = (user: UserRegister) => {
    setUserToDelete({ id: user.id, fullName: user.fullName || 'Usuário' });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setLoading(true);
      await deleteUser(userToDelete.id);
      fetchUsers();
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err: any) {
      console.error('Erro ao excluir usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir usuário');
    } finally {
      setLoading(false);
    }
  };

  // Nova função para editar usuário
  const handleEditClick = (user: UserRegister) => {
    setFormData({
      id: user.id, // Adicionar o ID do usuário ao formData
      fullName: user.fullName || '',
      email: user.email || '',
      password: '', // Não preencher senha por segurança
      roleId: user.roleId || 1,
    });
    setIsEditing(true);
    setShowModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb para voltar */}
      <div className="mb-6">
        <Link 
          href="/proprietario" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span>Voltar para Unidades</span>
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          <p className="text-gray-600">Administre os usuários do sistema</p>
        </div>
        <button
          onClick={() => {
            setIsEditing(false);
            setFormData({
              fullName: '',
              email: '',
              password: '',
              roleId: 1,
            });
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Novo Usuário
        </button>
      </div>

      {error && error.includes('desenvolvimento') ? (
        <div className="mb-6 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 rounded-lg">
          <p>{error}</p>
          <p className="mt-2">Enquanto isso, você ainda pode registrar novos usuários.</p>
        </div>
      ) : error ? (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
          {error}
        </div>
      ) : null}

      {loadingUsers ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
          <div className="flex items-center p-4 bg-gray-50 border-b">
            <Users className="w-5 h-5 text-blue-500 mr-2" />
            <span className="font-medium text-gray-700">Total de usuários: {users.length}</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Papel
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Criação
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-medium">
                            {user.fullName?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.fullName || 'Sem nome'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRoleIcon(user.roleId)}
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          user.roleId === Roles.ADMIN 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {getRoleName(user.roleId)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-50 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {users.length === 0 && !loadingUsers && (
            <div className="py-12 text-center text-gray-500 flex flex-col items-center">
              <Users className="w-12 h-12 text-gray-300 mb-3" />
              <p>Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      )}

      {/* Modal para registrar/editar usuário */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl transform transition-all border border-gray-200 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Editar Usuário' : 'Registrar Novo Usuário'}
              </h2>
              <p className="text-gray-500 mt-1">
                {isEditing 
                  ? 'Atualize as informações do usuário' 
                  : 'Apenas administradores podem registrar novos usuários'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Nome completo do usuário"
                    className="pl-10 pr-3 py-2.5 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 placeholder:text-gray-500 bg-gray-50 hover:bg-gray-50/80"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="email@exemplo.com"
                    className="pl-10 pr-3 py-2.5 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 placeholder:text-gray-500 bg-gray-50 hover:bg-gray-50/80"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha {isEditing && <span className="text-xs text-gray-500">(deixe em branco para manter a atual)</span>}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!isEditing}
                    placeholder={isEditing ? "Nova senha (opcional)" : "Senha"}
                    className="pl-10 pr-10 py-2.5 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 placeholder:text-gray-500 bg-gray-50 hover:bg-gray-50/80"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Papel do Usuário</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleChange}
                    className="pl-10 pr-3 py-2.5 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 bg-gray-50 hover:bg-gray-50/80"
                  >
                    <option value={Roles.USER}>Usuário</option>
                    <option value={Roles.ADMIN}>Administrador</option>
                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {formData.roleId === Roles.ADMIN ? 
                    "Administradores têm acesso a todas as funcionalidades do sistema." : 
                    "Usuários têm acesso limitado às suas próprias unidades."}
                </p>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registrando...
                    </>
                  ) : (
                    'Registrar Usuário'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal de confirmação de exclusão */}
      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          itemName={userToDelete?.fullName}
        />
      )}
    </div>
  );
}
