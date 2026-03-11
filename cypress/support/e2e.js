import './commands'
import 'cypress-file-upload';
import '@shelex/cypress-allure-plugin';
import "cypress-real-events/support";


Cypress.on('uncaught:exception', (err) => {
  if (
    err.message.includes("Unexpected token") ||
    err.message.includes("no healthy upstream") ||
    err.message.includes("PARSING_ERROR")
  ) {
    return false;
  }
  return false;
});

afterEach(function () {
  if (this.currentTest?.state === 'failed') {
    cy.screenshot(`FAILED -- ${this.currentTest.fullTitle()}`, { capture: 'fullPage' });
  }
});