'use client'

import ProtectedRoute from "../../componentes/ProtectedRoute/ProtectedRoute";
import RegistrarUsuario from "./componentes/RegistrarUsuario";

export default function ProprietarioPage() {
  return (
    <ProtectedRoute>
        <RegistrarUsuario />
    </ProtectedRoute>
  )
}

