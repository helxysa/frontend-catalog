'use client'

import React from 'react';
import { Sidebar } from '../../../componentes/Sidebar/Sidebar';
import Navbar from '../../../componentes/Sidebar/Navbar';
import ProtectedRoute from '../../../componentes/ProtectedRoute/ProtectedRoute';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Sidebar />
        <main className="ml-[250px] pt-16 p-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}