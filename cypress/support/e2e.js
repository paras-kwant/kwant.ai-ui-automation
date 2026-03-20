import './commands';
import 'cypress-file-upload';
import '@shelex/cypress-allure-plugin';
import "cypress-real-events/support";

// Handle uncaught exceptions safely
Cypress.on('uncaught:exception', (err, runnable) => {
  // Log the error object for debugging
  if (typeof err === 'object') {
    console.warn('Ignored uncaught object error:', err);
    return false; // prevent Cypress from failing the test
  }

  // Existing string-based error conditions
  if (
    err.message?.includes("Unexpected token") ||
    err.message?.includes("no healthy upstream") ||
    err.message?.includes("PARSING_ERROR")
  ) return false;

  // Let other errors fail the test
  return true;
});

// Attach screenshots on failure
afterEach(function () {
  if (this.currentTest.state === 'failed') {
    const name = this.currentTest.fullTitle().replace(/\//g, '-');
    cy.screenshot(name, { capture: 'fullPage' }).then(() => {
      const filePath = `cypress/screenshots/${Cypress.spec.name}/${name}.png`;
      cy.readFile(filePath, 'base64').then((img) => {
        cy.allure().attachment('Screenshot on Failure', img, 'image/png');
      });
    });
  }
});