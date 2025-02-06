'use client';

import React from 'react';
import { Sidebar } from '../componentes/Sidebar/Sidebar';
import { useState, useEffect } from 'react';
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  

  return (
        <div className="flex bg-gray-50">
          <Sidebar />
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
  );
}