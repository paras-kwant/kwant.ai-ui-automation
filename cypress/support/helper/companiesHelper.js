import { workforceSelector } from '../workforceSelector';

const companiesHelper = {
  visitCompaniesPage: () => cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/companies`),

};


export default companiesHelper;
