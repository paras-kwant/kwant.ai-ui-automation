import { workforceSelector } from '../workforceSelector';
import workerHelper from './workerHelper';

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
      cy.url().then((url) => {
        // Only run cleanup if we're on the workers page
        if (!url.includes('/workers')) {
          workerHelper.visitWorkersPage();
        }
        
        cy.get('body').then($body => {
          if ($body.find('aside button svg, .sc-krNlru svg').length > 0) {
            cy.get('aside button svg, .sc-krNlru svg').first().click({ force: true });
          }
    
          if ($body.find('.sc-ktJbId.sc-gmgFlS').length > 0) {
            cy.get('.sc-ktJbId.sc-gmgFlS').eq(0).click({ force: true });
          } else {
            cy.log('Pagination not found, skipping to page one selection');
          }
      
          if ($body.find('.tag.default.grey:contains("Clear")').length > 0) {
            cy.contains('.tag.default.grey', 'Clear')
              .click({ force: true });
          }
    
          if ($body.find('.filters-header-container svg').length > 0) {
            cy.get('.filters-header-container svg').eq(0).click();
          }
    
          if($body.find(workforceSelector.searchInput).length > 0){
            cy.get(workforceSelector.searchInput).clear();
          }
        });
      });
    },


    openSafteyAuditModel: () => {
      cy.get('.table-header-filter-btn').eq(7).click();
    
      cy.get('.sc-esYiGF').each(($el) => {
        const label = $el.find('span').text().trim();
        if (label !== 'None') {
          cy.wrap($el).find('input[type="checkbox"]').check({ force: true });
        }
      });
      cy.get(workforceSelector.tableRow).eq(1).click({ force: true });
          workforceSelector.SafetyAudit().click();
    },

    addRandomComment: (commentPrefix = 'Auto comment') => {
      const randomComment = `${commentPrefix} - ${Cypress._.random(1000, 9999)}`;
    
      cy.get('body').then(($body) => {

        if ($body.find('.comment-item-body__content').length === 0) {
          cy.get('textarea').clear().type(randomComment);
          cy.contains('button p', 'Add Comment').click();
    
          cy.get('.comment-item-body__content').eq(0).should('contain.text', randomComment);
        }
      });
    
      return cy.wrap(randomComment);
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
