import React from 'react'
import Login from './Login'
import { AuthProvider } from '../../contexts/AuthContext'
import { MemoryRouterProvider } from 'next-router-mock/MemoryRouterProvider'

describe('<Login />', () => {
  it('renders', () => {
    cy.mount(
      <MemoryRouterProvider>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouterProvider>
    )

    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('contain.text', 'Entrar')
  })

  it('exibe mensagem de erro com credenciais inválidas', () => {
    const loginStub = cy.stub().resolves(false)

    cy.mount(
      <MemoryRouterProvider>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouterProvider>
    )

    cy.get('input[type="email"]').type('email@errado.com')
    cy.get('input[type="password"]').type('senhaerrada')
    cy.get('button[type="submit"]').click()

    if(cy.get('.bg-red-50').should('contain.text', 'Credenciais inválidas')) {
      
    cy.get('input[type="email"]').clear()
    cy.get('input[type="password"]').clear()
    
    }

    cy.get('input[type="email"]').type('admin@admin.mp.br')
    cy.get('input[type="password"]').type('catalog@2025')
    cy.get('button[type="submit"]').click()
    
    

    
  })
})