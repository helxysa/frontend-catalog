describe('Página de Proprietários', () => {
  it('não deve permitir o acesso sem login', () => {
    cy.visit('http://localhost:3000/proprietario')

    cy.url().should('include', '/login')

    cy.contains('h2', 'Catalog').should('be.visible')
  })

  it('permite o acesso após o usuário fazer login', () => {
    cy.visit('http://localhost:3000/login')

  
    cy.get('input[type="email"]').type('admin@admin.mp.br')
    cy.get('input[type="password"]').type('catalog@2025')
    cy.get('button[type="submit"]').click()

    cy.url().should('eq', 'http://localhost:3000/proprietario')

    cy.contains('h1', 'Proprietários').should('be.visible')
    cy.contains('button', 'Adicionar').should('be.visible') 
  })
})