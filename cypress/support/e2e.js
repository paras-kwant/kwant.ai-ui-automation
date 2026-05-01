import './commands';
import 'cypress-file-upload';
import '@shelex/cypress-allure-plugin';
import "cypress-real-events/support";

Cypress.on('uncaught:exception', (err) => {
  if (typeof err === 'object') {
    console.warn('Ignored uncaught object error:', err);
    return false;
  }

  if (
    err.message?.includes("Unexpected token") ||
    err.message?.includes("no healthy upstream") ||
    err.message?.includes("PARSING_ERROR")
  ) return false;

  return true;
});

// afterEach(function () {
//   if (this.currentTest?.state === 'failed') {
//     const screenshotName = `FAILED -- ${this.currentTest.fullTitle()}`;

//     cy.wait(1000);
//     cy.screenshot(screenshotName, {
//       capture: 'fullPage',
//       overwrite: true,
//       disableTimersAndAnimations: true,
//     });
//   }
// });
