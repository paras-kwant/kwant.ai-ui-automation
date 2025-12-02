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
  },

  openUploadModal: () => {
    cy.get('.sc-gFAWRd>.sc-aXZVg>button').click();
    cy.get('.dropdown-option').contains('Upload').click();  },


    closeSidebarIfOpen: () => {
      cy.get('body').then($body => {
        if ($body.find('aside button svg, .sc-krNlru svg').length > 0) {
          cy.get('aside button svg, .sc-krNlru svg').first().click({ force: true });
        }
    
        if ($body.find('.tag.default.grey:contains("Clear")').length > 0) {
          cy.contains('.tag.default.grey', 'Clear')
            .click({ force: true });
        }


        if( $body.find(workforceSelector.searchInput).length > 0){
          cy.get(workforceSelector.searchInput).clear();
        }
      });
    },
    


  uploadWorkerCSV: (filePath) => {
    cy.fixture(filePath, 'base64').then(fileContent => {
      const fileName = filePath.split('/').pop(); // extract filename
      cy.get('.sc-ewBhFl').attachFile(
        {
          fileContent,
          fileName,
          mimeType: 'text/csv',
          encoding: 'base64'
        },
        { subjectType: 'drag-n-drop', force: true }
      );
    });
  }
};


export default WorkerHelper;
