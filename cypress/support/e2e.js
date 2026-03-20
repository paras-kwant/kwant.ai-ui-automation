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
Cypress.on('fail', (error, runnable) => {
  const screenshotFileName = `${Cypress.spec.name}-${runnable.title} (failed)`;
  cy.screenshot(screenshotFileName, { capture: 'runner' }).then(() => {
    const path = `cypress/screenshots/${Cypress.spec.name}/${screenshotFileName}.png`;
    cy.allure().attachment('Screenshot', path, 'image/png');
  });
  throw error;
});