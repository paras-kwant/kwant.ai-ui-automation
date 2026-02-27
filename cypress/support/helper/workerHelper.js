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
    cy.get(workforceSelector.overflowMenu).should('be.visible').click();
    cy.get('.dropdown-option').contains('Upload').click();  },


    closeSidebarIfOpen: () => {
      cy.url().then((url) => {
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

      cy.contains(workforceSelector.tableColumn, 'Safety Alert')
        .find('.table-header-filter-btn')
        .click()
    
      cy.get('[class*="select_item_container"]').within(() => {
    
        // First pass: collect indices of labels to click
        cy.get('label[for^=":r"]').then(($labels) => {
    
          const indicesToClick = []
    
          $labels.each((index, label) => {
            const text = Cypress.$(label)
              .find('span[type="onDropdown"]')
              .last()
              .text()
              .trim()
    
            if (text !== 'None') {
              indicesToClick.push(index)
            }
          })
    
          indicesToClick.forEach((index) => {
            cy.get('label[for^=":r"]').eq(index).click()
          })
    
        })
    
      })
    
      cy.wait(5000)
    
      cy.get(workforceSelector.tableRow)
        .eq(1)
        .click({ force: true })
    
      cy.get(workforceSelector.SafetyAuditPage).click()
    
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
      cy.contains('button', 'Choose File').attachFile(
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
