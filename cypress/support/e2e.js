import './commands'
import 'cypress-file-upload';
import '@shelex/cypress-allure-plugin';
import "cypress-real-events/support";


Cypress.on('uncaught:exception', (err) => {
  // Ignore API parse failures like "no healthy upstream"
  if (
    err.message.includes("Unexpected token") ||
    err.message.includes("no healthy upstream") ||
    err.message.includes("PARSING_ERROR")
  ) {
    return false;
  }
})