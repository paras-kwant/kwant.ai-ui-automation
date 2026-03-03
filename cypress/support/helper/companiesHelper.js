import { workforceSelector } from '../workforceSelector';

const companiesHelper = {

  visitCompaniesPage: (projectId) => {
    const id = projectId || Cypress.env('PROJECT_ID');
    cy.visit(`/projects/${id}/companies`);
  },

  visitCompaniesInsightPage: (projectId) => {
    const id = projectId || Cypress.env('PROJECT_ID');
    cy.visit(`/projects/${id}/insights/companies`);
  },

};

export default companiesHelper;