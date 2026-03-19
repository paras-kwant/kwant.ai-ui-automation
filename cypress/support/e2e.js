import './commands';
import 'cypress-file-upload';
import '@shelex/cypress-allure-plugin';
import "cypress-real-events/support";

Cypress.on('uncaught:exception', (err) => {
  if (
    err.message.includes("Unexpected token") ||
    err.message.includes("no healthy upstream") ||
    err.message.includes("PARSING_ERROR")
  ) return false;
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