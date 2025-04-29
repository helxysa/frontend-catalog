'use client'

import Proprietario from "./componentes/Proprietario";
import Navbar from "../componentes/Sidebar/Navbar";
import ProtectedRoute from "../componentes/ProtectedRoute/ProtectedRoute";

export default function ProprietarioPage() {
  return (
    <ProtectedRoute>
      <div>
        <Proprietario />
      </div>
    </ProtectedRoute>
  )
}

