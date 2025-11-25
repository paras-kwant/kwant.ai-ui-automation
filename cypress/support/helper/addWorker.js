import { workforceSelector } from '../workforceSelector';

const WorkerHelper = {
  visitWorkersPage: () => cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`),

  openAddWorkerModal: () => workforceSelector.addWorkerButton().click(),

  uploadProfileImage: (file = 'cypress/fixtures/profile.png') => {
    workforceSelector.profileImageUploadButton().click();
    cy.get('#worker_image_uploader').selectFile(file, { force: true });
  },

  fillMandatoryWorkerDetails: (workerData) => {
    workforceSelector.firstNameInput().type(workerData.firstName);
    workforceSelector.lastNameInput().type(workerData.lastName);
    cy.selectRandomOption('input[name="company"]', '.sc-tagGq[role="button"]', 'company');
  }
};

export default WorkerHelper;
