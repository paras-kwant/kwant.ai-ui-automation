
import { workforceSelector } from './workforceSelector';  


Cypress.Commands.add('login', () => {
  cy.session([Cypress.env('EMAIL'), Cypress.env('PASSWORD')], () => {
    cy.visit('/') 
    cy.get('[name="email"]').type(Cypress.env('EMAIL'))
    cy.get('[name="password"]').type(Cypress.env('PASSWORD'))
    cy.get('button p').click()
  
  }, {
    cacheAcrossSpecs: true 
  })
})


  Cypress.Commands.add("searchAndDeleteWorker", (firstName, lastName) => {
    cy.get(workforceSelector.searchInput).type(firstName);
  
    // Verify worker card shows up
    cy.get(".personal-info-content__title")
      .contains(`${firstName} ${lastName}`)
      .should("be.visible");
  
    // Validate worker details
    cy.get(".sc-cHMHOW.jSllKi")
      .should("contain.text", firstName)
      .and("contain.text", "Micron");
  
    // Delete workflow
    cy.get(".checkboxCheckmark").click();
    cy.get(".sc-gFAWRd>.sc-aXZVg>button").click();
    cy.get(".delete-btn").click();
    cy.get("button>p").contains("Delete").click();
  
    // Assertion after deletion
    cy.get(".sc-kOPcWz")
      .contains("1 worker was successfully deleted")
      .should("be.visible");
  });



