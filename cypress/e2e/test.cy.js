
describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://app.kwant.ai/')
    cy.get('[name="email"]').type(Cypress.env('EMAIL'))
    cy.get('[name="password"]').type(Cypress.env('PASSWORD'))
    cy.get('button p').click()
    cy.get('#project-card-container').eq(0).click()
    cy.get('a > .sc-djTQaJ > .icon-button').click()
    cy.get('a').contains('Team').click()
  })
})