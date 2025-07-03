import React from 'react'
import Proprietario from './Proprietario'

describe('<Proprietario />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Proprietario />)
  })
})