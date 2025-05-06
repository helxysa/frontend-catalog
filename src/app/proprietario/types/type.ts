export interface CreateProprietarioData {
    nome: string;
    sigla: string;
    descricao?: string;
    logo?: File;
    user_id?: string | number | null;
  }

  // Define interface for user registration data
  export interface RegisterUserData {
    fullName: string;
    email: string;
    password: string;
    roleId: number;
  }


