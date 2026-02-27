/// <reference types="cypress" />

import companiesHelper from '../../support/helper/companiesHelper';
import generalDetailsPage from '/cypress/pages/companies/generalDetails'
import { generateRandomEmail, generateRandomWorldAddress } from '../../fixtures/workerData';
import { workforceSelector } from '../../support/workforceSelector';
import { generateWorkerData } from '../../fixtures/workerData';

describe("Companies Module - Worker Stepper", () => {
  
  before(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title')
        .contains('Pearl Apartments')
        .click();
    });
    cy.visit(`/projects/5007477836/companies`);

  });

  beforeEach(() => {

    cy.cleanUI()
  });
  
  it('Verify total workers count matches workers list data', () => {
    cy.contains(workforceSelector.tableColumn, 'Status')
	.find('.table-header-filter-btn')
	.click();
	cy.get('body').should('be.visible')
  cy.get('.select_item_container label')
  .contains('Active')
  .parent()
  .find('input[type="checkbox"]')
  .check({ force: true });

    cy.get('p').contains('Filters:').click();
    // cy.get(workforceSelector.searchInput).clear().type('King Mechanical Corp')
    cy.wait(3000);

    cy.get(workforceSelector.tableRow).each(($row) => {
      cy.wrap($row)
        .should('be.visible')
        .and('contain.text', 'Active');
    });

    cy.get(workforceSelector.tableRow)
      .first()
      .as('activeCompanyRow');
  
    cy.get('@activeCompanyRow')
      .parent()
      .find('.personal-info-content__title')
      .first()
      .invoke('text')
      .then((companyName) => {
        cy.wrap(companyName.trim()).as('companyName');
      });
  
    cy.get('@activeCompanyRow').first().click();
    cy.wait(1000)
    cy.get(workforceSelector.companyWorkerPage).click();
  
    cy.contains('p', 'Total Workers')
      .parent()
      .parent()
      .parent()
      .as('totalWorkersCard');
  
    cy.get('@totalWorkersCard')
      .find('p')
      .contains('Total Workers')
      .should('be.visible');
  
    cy.get('@totalWorkersCard')
      .find('p')
      .eq(1)
      .invoke('text')
      .then((totalWorkersText) => {
  
        cy.log('Total Workers Text:', totalWorkersText);
  
        cy.get('@totalWorkersCard').find('button').click();
  
        cy.url().should('include', '/workers');
  
        cy.get('.filter-tag-container')
          .eq(0)
          .should('be.visible').realHover();
  
        cy.get('@companyName').then((companyName) => {
          cy.get('.label.default__label')
            .contains(companyName)
            .should('be.visible');
        });
  
        cy.get(workforceSelector.tableRow).should('be.visible');
  
        cy.get('.workers-footer')
          .invoke('text')
          .then((text) => {
            const totalWorker = text
              .trim()
              .match(/(\d+)\s*-\s*(\d+)\s*of\s*(\d+)/)[3];
  
            cy.log(`Total number of workers: ${totalWorker}`);
            expect(parseInt(totalWorkersText)).to.eq(parseInt(totalWorker));
          });
      });
  
    cy.get(workforceSelector.tableColumn).then(($headers) => {
      let companyIndex = -1;
  
      $headers.each((i, el) => {
        const headerText = Cypress.$(el).text().trim();
        if (headerText.toLowerCase().includes('company')) {
          companyIndex = i;
          cy.log(`✅ Company column at index: ${i}`);
        }
      });
  
      expect(companyIndex).to.be.greaterThan(-1);
  
      cy.get('.workers-footer')
          .invoke('text')
          .then((text) => {
            const totalWorker = text
              .trim()
              .match(/(\d+)\s*-\s*(\d+)\s*of\s*(\d+)/)[3];
          cy.log(`Total workers to validate: ${totalWorker}`);
  
          let validatedRows = 0;
  
          function validateVisibleRows() {
            cy.get(workforceSelector.tableRow)
              .then(($rows) => {
                cy.log(`Currently visible rows: ${$rows.length}`);
  
                cy.wrap($rows).each(($row) => {
                  cy.wrap($row)
                    .find('.table_td')
                    .eq(companyIndex)
                    .invoke('text')
                    .then((company) => {
                      cy.get('@companyName').then((companyName) => {
                        expect(company.trim()).to.contain(companyName);
                      });
                      validatedRows++;
                      cy.log(`✅ Row ${validatedRows}/${totalWorkers} verified`);
                    });
                });
              })
              .then(() => {
                if (validatedRows < totalWorkers) {
                  cy.log(`Scrolling to load more... (${validatedRows}/${totalWorkers})`);
                  cy.get(workforceSelector.tableRow).last().scrollIntoView();
                  cy.wait(100);
                  validateVisibleRows();
                } else {
                  cy.log(`🎉 All ${validatedRows} rows validated!`);
                }
              });
          }
  
          validateVisibleRows();
        });
    });
  });
  it('Add a worker and verify total workers count increases', () => {
    cy.visit(`/projects/5007477836/companies`);
    cy.contains(workforceSelector.tableColumn, 'Status')
      .find('.table-header-filter-btn')
      .click();
    cy.get('body').should('be.visible');
    cy.get('.select_item_container label')
      .contains('Active')
      .parent()
      .find('input[type="checkbox"]')
      .check({ force: true });
  
    cy.get('p').contains('Filters:').click();
    cy.get(workforceSelector.searchInput).clear().type('King Mechanical Corp')
    cy.wait(3000);
  
    cy.get(workforceSelector.tableRow)
      .first()
      .as('activeCompanyRow');
  
    cy.get('@activeCompanyRow')
      .parent()
      .find('.personal-info-content__title')
      .first()
      .invoke('text')
      .then((companyName) => {
        cy.wrap(companyName.trim()).as('companyName');
      });
  
    cy.get('@activeCompanyRow').first().click();
  
    // Step 3: Navigate to company workers page
    cy.get(workforceSelector.companyWorkerPage).click();
  
    // Step 4: Get initial total workers count from card
    cy.contains('p', 'Total Workers')
      .parent()
      .parent()
      .parent()
      .as('totalWorkersCard');
  
    cy.get('@totalWorkersCard')
      .find('p')
      .eq(1)
      .invoke('text')
      .then((initialTotalWorkersText) => {
        cy.wrap(parseInt(initialTotalWorkersText)).as('initialCount');
        cy.log(`Initial Total Workers: ${initialTotalWorkersText}`);
      });
  
    // Step 5: Navigate to workers list
    cy.get('@totalWorkersCard').find('button').click();
    cy.url().should('include', '/workers');
    cy.wait(3000);
  
    // Step 6: Get initial worker count from footer
    cy.get('.workers-footer')
      .invoke('text')
      .then((text) => {
        const initialWorkerCount = parseInt(text.trim().match(/of\s*(\d+)/)[1]);
        cy.wrap(initialWorkerCount).as('initialWorkerCount');
        cy.log(`Initial worker count from footer: ${initialWorkerCount}`);
      });
  
    // Step 7: Generate worker data and add new worker
    const workerData = generateWorkerData();
  
    cy.get('button p').contains('Add Worker').click();
  
    cy.get('input[name="firstName"]').type(workerData.firstName);
    cy.get('input[name="lastName"]').type(workerData.lastName);
    cy.get('input[name="company"]').click();
    cy.get('input[name="company"]').type('King Mechanical Corp');
    cy.get('.select_item_container [role="button"]').contains('King Mechanical Corp.').click();
    cy.contains('footer [label="Add Worker"] button', 'Add Worker').click();
  
    cy.wait(3000);
  
    // Step 8: Navigate back to company page
    cy.visit('https://uat.kwant.ai/projects/5007477836/companies');
    cy.get(workforceSelector.searchInput).type('king mechanical corp');
    cy.wait(2000);
    cy.get(workforceSelector.tableRow).contains('King Mechanical Corp').click();
    cy.get(workforceSelector.companyWorkerPage).click();
  
    // Step 9: Get final total workers count from card
    cy.contains('p', 'Total Workers')
      .parent()
      .parent()
      .parent()
      .as('totalWorkersCardFinal');
  
    cy.get('@totalWorkersCardFinal')
      .find('p')
      .eq(1)
      .invoke('text')
      .then((finalTotalWorkersText) => {
        const finalCount = parseInt(finalTotalWorkersText);
        cy.log(`Final Total Workers: ${finalTotalWorkersText}`);
  
        // Verify count increased by 1
        cy.get('@initialCount').then((initialCount) => {
          expect(finalCount).to.eq(initialCount + 1);
          cy.log(`✅ Total Workers increased from ${initialCount} to ${finalCount}`);
        });
      });
    })


  
  it.skip("Verify total workers count matches workers list data Workers With Safety Alerts", () => {
    cy.visit(`/projects/5007477836/companies`);
    cy.contains(workforceSelector.tableColumn, 'Status')
	.find('.table-header-filter-btn')
	.click();
    
    cy.get('.sc-dxUMQK.kTpyWF')
      .contains('.sc-gFqAkR.gorvtv', 'Active')
      .parents('.sc-dxUMQK.kTpyWF')
      .within(() => {
        cy.get('input[type="checkbox"]').check({ force: true });
      });

    cy.get('p').contains('Filters:').click();
    cy.wait(1000);

    cy.get(workforceSelector.tableRow).contains('Active')
      .should('be.visible');

    cy.get(workforceSelector.tableRow)
      .first()
      .as('activeCompanyRow');

    cy.get('@activeCompanyRow')
      .parent()
      .find('.personal-info-content__title')
      .first()
      .invoke('text')
      .then((companyName) => {
        cy.wrap(companyName.trim()).as('companyName');
      });

    cy.get('@activeCompanyRow').first().click();

    cy.get(':nth-child(2) > .sc-iGgWBj').click();
    
    cy.contains('p', 'Workers With Safety Alerts')
      .parent()           
      .parent()  
      .parent()           
      .as('totalSafteyAlerts');
    
    cy.get('@totalSafteyAlerts').find('p').contains('Workers With Safety Alerts').should('be.visible');
    
    cy.get('@totalSafteyAlerts').find('p').eq(1).invoke('text').then((totalWorkersText) => {
      cy.log('Total Workers With Safety Alerts Text:', totalWorkersText);
      cy.get('@totalSafteyAlerts').find('button').click();
      cy.url().should('include',`/projects/${Cypress.env('PROJECT_ID')}/workers`);

      cy.get('.filter-tag').eq(0).realHover();
      const labels = ['SOS', 'Fall', 'Near miss', 'Restricted', 'Fatigue', 'Unsafe'];

      labels.forEach((label) => {
        cy.get('.label.default__label')
          .contains(label)
          .should('be.visible');
      });
      
      cy.get('.filter-tag').eq(1).realHover();
      cy.get('.label.default__label').contains('AutoQA Labs').should("be.visible");

      cy.get(workforceSelector.tableRow).should('be.visible');
      
      cy.get('.sc-jIGnZt.ieNRXe')
        .invoke('text')
        .then((text) => {
          const totalWorker = text
            .trim()
            .match(/(\d+)\s*-\s*(\d+)\s*of\s*(\d+)/)[3];
          cy.log(`Total number of workers: ${totalWorker}`);
          expect(parseInt(totalWorkersText)).to.eq(parseInt(totalWorker));
        });
    });
    
    cy.get(workforceSelector.tableColumn).then(($headers) => {
      let companyIndex = -1;
      
      $headers.each((i, el) => {
        const headerText = Cypress.$(el).text().trim();
        if (headerText.toLowerCase().includes('company')) {
          companyIndex = i;
          cy.log(`✅ Company column at index: ${i}`);
        }
      });
      
      expect(companyIndex).to.be.greaterThan(-1);
      
      cy.get('.sc-jIGnZt.ieNRXe').invoke('text').then((text) => {
        const totalWorkers = parseInt(text.trim().match(/of\s*(\d+)/)[1]);
        cy.log(`Total workers to validate: ${totalWorkers}`);
        
        let validatedRows = 0;
        
        function validateVisibleRows() {
          cy.get(workforceSelector.tableRow).then(($rows) => {
            const currentRowCount = $rows.length;
            cy.log(`Currently visible rows: ${currentRowCount}`);
            
            cy.wrap($rows).each(($row, index) => {
              cy.wrap($row)
                .find('.table_td')
                .eq(companyIndex)
                .invoke('text')
                .then((company) => {
                  expect(company.trim()).to.contain('AutoQA Labs');
                  validatedRows++;
                  cy.log(`✅ Row ${validatedRows}/${totalWorkers} verified`);
                });
            });
            
          }).then(() => {
            if (validatedRows < totalWorkers) {
              cy.log(`Scrolling to load more... (${validatedRows}/${totalWorkers})`);
              
              cy.get(workforceSelector.tableRow).last().scrollIntoView();
              cy.wait(100);
              
              validateVisibleRows();
            } else {
              cy.log(`🎉 All ${validatedRows} rows validated!`);
            }
          });
        }
        validateVisibleRows();
      });
    });
  });

  it("Verify total workers count matches workers list data - Flagged Workers On-site", () => {
    cy.visit(`/projects/5007477836/companies`);
    cy.contains(workforceSelector.tableColumn, 'Status')
	.find('.table-header-filter-btn')
	.click();
    
  cy.get('.select_item_container label')
  .contains('Active')
  .parent()
  .find('input[type="checkbox"]')
  .check({ force: true });

    cy.get('p').contains('Filters:').click();
    cy.get(workforceSelector.searchInput).clear().type('King Mechanical Corp')
    cy.wait(1000);

    cy.get(workforceSelector.tableRow)
      .contains('Active')
      .should('be.visible');
  
    cy.get(workforceSelector.tableRow)
      .first()
      .as('activeCompanyRow');
  
    cy.get('@activeCompanyRow')
      .parent()
      .find('.personal-info-content__title')
      .first()
      .invoke('text')
      .then((companyName) => {
        cy.wrap(companyName.trim()).as('companyName');
      });
  
    cy.get('@activeCompanyRow').first().click();
  
    cy.get(':nth-child(2) > .sc-iGgWBj').click();
  
    cy.contains('p', 'Flagged Workers On-site')
      .parent()
      .parent()
      .parent()
      .as('flaggedWorkersCard');
  
    cy.get('@flaggedWorkersCard')
      .find('p')
      .contains('Flagged Workers On-site')
      .should('be.visible');
  
    cy.get('@flaggedWorkersCard')
      .find('p')
      .eq(1)
      .invoke('text')
      .then((totalWorkersText) => {
  
        cy.log(`Total Flagged Workers On-site: ${totalWorkersText}`);
  
        cy.get('@flaggedWorkersCard').find('button').click();
  
        cy.url().should('include', '/workers');
  
        cy.get('.filter-tag-container')
          .eq(0)
          .should('be.visible')
          .realHover();
  
        cy.get('.label.default__label')
          .contains('Flagged')
          .should('be.visible');
  
        cy.get('.filter-tag-container')
          .eq(1)
          .should('be.visible')
          .realHover();
  
        cy.get('@companyName').then((companyName) => {
          cy.get('.label.default__label')
            .contains(companyName)
            .should('be.visible');
        });
  
        cy.get(workforceSelector.tableRow).should('be.visible');
  
        cy.get('.sc-jIGnZt.ieNRXe')
          .invoke('text')
          .then((text) => {
            const totalFromTable = text
              .trim()
              .match(/(\d+)\s*-\s*(\d+)\s*of\s*(\d+)/)[3];
  
            cy.log(`Total workers from table: ${totalFromTable}`);
            expect(parseInt(totalWorkersText)).to.eq(parseInt(totalFromTable));
          });
      });
  
    cy.get(workforceSelector.tableColumn).then(($headers) => {
      let companyIndex = -1;
  
      $headers.each((i, el) => {
        const headerText = Cypress.$(el).text().trim();
        if (headerText.toLowerCase().includes('company')) {
          companyIndex = i;
          cy.log(`✅ Company column index: ${i}`);
        }
      });
  
      expect(companyIndex).to.be.greaterThan(-1);
  
      cy.get('.sc-jIGnZt.ieNRXe')
        .invoke('text')
        .then((text) => {
          const totalWorkers = parseInt(text.trim().match(/of\s*(\d+)/)[1]);
          cy.log(`Total workers to validate: ${totalWorkers}`);
  
          let validatedRows = 0;
  
          function validateVisibleRows() {
            cy.get(workforceSelector.tableRow)
              .then(($rows) => {
                cy.log(`Currently visible rows: ${$rows.length}`);
  
                cy.wrap($rows).each(($row) => {
                  cy.wrap($row)
                    .find('.table_td')
                    .eq(companyIndex)
                    .invoke('text')
                    .then((company) => {
                      cy.get('@companyName').then((companyName) => {
                        expect(company.trim()).to.contain(companyName);
                      });
                      validatedRows++;
                      cy.log(`✅ Row ${validatedRows}/${totalWorkers} verified`);
                    });
                });
              })
              .then(() => {
                if (validatedRows < totalWorkers) {
                  cy.log(`Scrolling to load more... (${validatedRows}/${totalWorkers})`);
                  cy.get(workforceSelector.tableRow).last().scrollIntoView();
                  cy.wait(100);
                  validateVisibleRows();
                } else {
                  cy.log(`🎉 All ${validatedRows} flagged workers validated`);
                }
              });
          }
          validateVisibleRows();
        });
    });
  });

  it('Add a flagged worker and verify total flagged count increases', () => {
    // Step 1: Navigate to companies and filter for Active
    cy.visit(`/projects/5007477836/companies`);
    cy.contains(workforceSelector.tableColumn, 'Status')
      .find('.table-header-filter-btn')
      .click();
    cy.get('body').should('be.visible');
    cy.get('.select_item_container label')
      .contains('Active')
      .parent()
      .find('input[type="checkbox"]')
      .check({ force: true });
    cy.get('p').contains('Filters:').click();
    cy.get(workforceSelector.searchInput).clear().type('King Mechanical Corp')
    cy.wait(3000);
  
    // Step 2: Get first active company
    cy.get(workforceSelector.tableRow)
      .first()
      .as('activeCompanyRow');
    cy.get('@activeCompanyRow')
      .parent()
      .find('.personal-info-content__title')
      .first()
      .invoke('text')
      .then((companyName) => {
        cy.wrap(companyName.trim()).as('companyName');
      });
    cy.get('@activeCompanyRow').first().click();
  
    // Step 3: Navigate to company workers page
    cy.get(workforceSelector.companyWorkerPage).click();
  
    // Step 4: Get initial flagged workers count
    cy.contains('p', 'Flagged Workers On-site')
      .parent()
      .parent()
      .parent()
      .as('flaggedWorkersCard');
    cy.get('@flaggedWorkersCard')
      .find('p')
      .eq(1)
      .invoke('text')
      .then((initialFlaggedWorkersText) => {
        cy.wrap(parseInt(initialFlaggedWorkersText)).as('initialFlaggedCount');
        cy.log(`Initial Flagged Workers On-site: ${initialFlaggedWorkersText}`);
      });
  
    cy.contains('p', 'Total Workers')
      .parent()
      .parent()
      .parent()
      .as('totalWorkersCard');
  
    cy.get('@totalWorkersCard')
      .find('p')
      .eq(1)
      .invoke('text')
      .then((initialTotalWorkersText) => {
        cy.wrap(parseInt(initialTotalWorkersText)).as('initialCount');
        cy.log(`Initial Total Workers: ${initialTotalWorkersText}`);
      });
  
    cy.get('@totalWorkersCard').find('button').click();
    cy.url().should('include', '/workers');
    cy.wait(3000);
  
    const workerData = generateWorkerData();
    cy.get('button p').contains('Add Worker').click();
    cy.get('input[name="firstName"]').type(workerData.firstName);
    cy.get('input[name="lastName"]').type(workerData.lastName);
    cy.get('input[name="company"]').click();
    cy.get('input[name="company"]').type('King Mechanical Corp');
    cy.get('.select_item_container [role="button"]').contains('King Mechanical Corp.').click();
    cy.contains('footer [label="Add Worker"] button', 'Add Worker').click();
    cy.get("body").click(0,0);
    cy.wait(3000);
  
    cy.get(workforceSelector.searchInput).type(`${workerData.firstName} ${workerData.lastName}`);
    cy.get(workforceSelector.tableRow).contains(`${workerData.firstName}`).click();
    cy.get(workforceSelector.accessControlPage).click();
    cy.contains('Flag')
      .parent()
      .find('input[type="checkbox"]')
      .check({ force: true });
  
    cy.get('button p').contains('Update').click();
    cy.wait(3000);
  
    cy.visit(`/projects/5007477836/companies`);
    cy.get(workforceSelector.searchInput).type('King Mechanical Corp');
    cy.get(workforceSelector.tableRow).contains('King Mechanical Corp').click();
    cy.get(workforceSelector.companyWorkerPage).click();
  
    // Verify Flagged Workers count increased
    cy.contains('p', 'Flagged Workers On-site')
      .parent()
      .parent()
      .parent()
      .find('p')
      .eq(1)
      .invoke('text')
      .then((finalFlaggedWorkersText) => {
        const finalFlaggedCount = parseInt(finalFlaggedWorkersText);
        cy.log(`Final Flagged Workers On-site: ${finalFlaggedWorkersText}`);
  
        cy.get('@initialFlaggedCount').then((initialFlaggedCount) => {
          expect(finalFlaggedCount).to.eq(initialFlaggedCount + 1);
          cy.log(`✅ Flagged Workers increased from ${initialFlaggedCount} to ${finalFlaggedCount}`);
        });
      });
  });
  it("Verify total workers count matches workers list data - Total Workers On-site", () => {
    cy.visit(`/projects/5007477836/companies`);
    cy.contains(workforceSelector.tableColumn, 'Status')
  .find('.table-header-filter-btn')
	  .click();
    
    cy.get('.select_item_container label')
  .contains('Active')
  .parent()
  .find('input[type="checkbox"]')
  .check({ force: true });

    cy.get('p').contains('Filters:').click();
    cy.get(workforceSelector.searchInput).clear().type('King Mechanical Corp')
    cy.wait(1000);

    cy.get(workforceSelector.tableRow)
      .contains('Active')
      .should('be.visible');
  
    cy.get(workforceSelector.tableRow)
      .first()
      .as('activeCompanyRow');
  
    cy.get('@activeCompanyRow')
      .parent()
      .find('.personal-info-content__title')
      .first()
      .invoke('text')
      .then((companyName) => {
        cy.wrap(companyName.trim()).as('companyName');
      });
  
    cy.get('@activeCompanyRow').first().click();
  
    cy.get(':nth-child(2) > .sc-iGgWBj').click();
  
    cy.contains('p', 'Total Workers On-site')
      .parent()
      .parent()
      .parent()
      .as('totalWorkersOnSiteCard');
  
    cy.get('@totalWorkersOnSiteCard')
      .find('p')
      .contains('Total Workers On-site')
      .should('be.visible');
  
    cy.get('@totalWorkersOnSiteCard')
      .find('p')
      .eq(1)
      .invoke('text')
      .then((totalWorkersText) => {
  
        cy.log(`Total Workers On-site: ${totalWorkersText}`);
  
        cy.get('@totalWorkersOnSiteCard').find('button').click();
  
        cy.url().should('include', '/workers');
  
        cy.get('.filter-tag-container')
          .eq(0)
          .should('be.visible')
          .realHover();
  
        cy.get('.label.default__label')
          .contains('On-site')
          .should('be.visible');
  
        cy.get('.filter-tag-container')
          .eq(1)
          .should('be.visible')
          .realHover();
  
        cy.get('@companyName').then((companyName) => {
          cy.get('.label.default__label')
            .contains(companyName)
            .should('be.visible');
        });
  
        cy.get(workforceSelector.tableRow).should('be.visible');
  
        cy.get('.workers-footer')
          .invoke('text')
          .then((text) => {
            const totalFromTable = text
              .trim()
              .match(/(\d+)\s*-\s*(\d+)\s*of\s*(\d+)/)[3];
  
            cy.log(`Total workers from table: ${totalFromTable}`);
            expect(parseInt(totalWorkersText)).to.eq(parseInt(totalFromTable));
          });
      });
  
    cy.get(workforceSelector.tableColumn).then(($headers) => {
      let companyIndex = -1;
      let siteStatusIndex = -1;
  
      $headers.each((i, el) => {
        const headerText = Cypress.$(el).text().trim();
        if (headerText.toLowerCase().includes('company')) {
          companyIndex = i;
          cy.log(`✅ Company column index: ${i}`);
        }
        if (headerText.toLowerCase().includes('site status')) {
          siteStatusIndex = i;
          cy.log(`✅ Site Status column index: ${i}`);
        }
      });
  
      expect(companyIndex).to.be.greaterThan(-1);
      expect(siteStatusIndex).to.be.greaterThan(-1);
  
      cy.get('.workers-footer')
        .invoke('text')
        .then((text) => {
          const totalWorkers = parseInt(text.trim().match(/of\s*(\d+)/)[1]);
          cy.log(`Total workers to validate: ${totalWorkers}`);
  
          let validatedRows = 0;
  
          function validateVisibleRows() {
            cy.get(workforceSelector.tableRow)
              .then(($rows) => {
                cy.log(`Currently visible rows: ${$rows.length}`);
  
                cy.wrap($rows).each(($row) => {
                  cy.wrap($row)
                    .find('.table_td')
                    .eq(companyIndex)
                    .invoke('text')
                    .then((company) => {
                      cy.get('@companyName').then((companyName) => {
                        expect(company.trim()).to.contain(companyName);
                      });
                    });
  
                  cy.wrap($row)
                    .find('.table_td')
                    .eq(siteStatusIndex)
                    .invoke('text')
                    .then((siteStatus) => {
                      expect(siteStatus.trim()).to.equal('On-site');
                      validatedRows++;
                      cy.log(`✅ Row ${validatedRows}/${totalWorkers} verified`);
                    });
                });
              })
              .then(() => {
                if (validatedRows < totalWorkers) {
                  cy.log(`Scrolling to load more... (${validatedRows}/${totalWorkers})`);
                  cy.get(workforceSelector.tableRow).last().scrollIntoView();
                  cy.wait(100);
                  validateVisibleRows();
                } else {
                  cy.log(`🎉 All ${validatedRows} workers on-site validated`);
                }
              });
          }
  
          validateVisibleRows();
        });
    });
  });
})
