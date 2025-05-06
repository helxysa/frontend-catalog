'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../componentes/ProtectedRoute/ProtectedRoute";
import RegistrarUsuario from "./componentes/RegistrarUsuario";
import { checkIsAdmin } from "./actions/actions";

export default function UsuariosPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAdminAccess = async () => {
      try {
        const isAdmin = await checkIsAdmin();
        
        if (!isAdmin) {
          router.replace('/proprietario');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        router.replace('/proprietario');
      }
    };

    verifyAdminAccess();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <RegistrarUsuario />
    </ProtectedRoute>
  );
}

