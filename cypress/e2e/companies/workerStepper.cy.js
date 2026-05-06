/// <reference types="cypress" />

import companiesHelper from '../../support/helper/companiesHelper';
import { generateWorkerData } from '../../fixtures/generateData';
import { workforceSelector } from '../../support/workforceSelector';

describe("Companies Module - Worker Stepper", { tags: ["Epic:WorkForce", "Feature:WorkerStepper", "Module:WorkForce-Company"] }, () => {

  beforeEach(() => {
    cy.loginAndVisit(() => companiesHelper.visitCompaniesPage('5007477836'));
  });

  it('WorkForce-Company - Verify total workers count matches workers list data', { tags: ["Story:Total Workers Count Matches List", "Severity:critical", "UI", "Module:WorkForce-Company"] }, () => {
    cy.contains(workforceSelector.tableColumn, 'Status')
      .find('.table-header-filter-btn')
      .click();

    cy.get('.select_item_container label')
      .contains('Active')
      .parent()
      .find('input[type="checkbox"]')
      .check({ force: true });
    cy.get('p').contains('Filters:').click();
    cy.wait(4000);
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

    cy.get('@activeCompanyRow').first().click({force:true});
    cy.wait(1000);
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
                cy.get(workforceSelector.tableRow).should('be.visible');
cy.get('body').realMouseMove(800, 400)
cy.wait(200)

        cy.get('.filter-tag-container')
          .eq(0)
          .should('be.visible').scrollIntoView({ duration: 0 })
  .realHover({ position: 'center', scrollBehavior: false });

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
  });

  it('WorkForce-Company - Add a worker and verify total workers count increases', { tags: ["Story:Add Worker Increases Total Count", "Severity:critical", "UI", "Module:WorkForce-Company"] }, () => {
    cy.contains(workforceSelector.tableColumn, 'Status')
      .find('.table-header-filter-btn')
      .click();
    cy.get('.select_item_container label')
      .contains('Active')
      .parent()
      .find('input[type="checkbox"]')
      .check({ force: true });
      cy.wait(3000)
      cy.get(workforceSelector.tableRow).contains('Active').should('exist');

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

    cy.get('@activeCompanyRow').first().click({force:true});
    cy.get(workforceSelector.companyWorkerPage).click();
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

    cy.get('.workers-footer')
      .invoke('text')
      .then((text) => {
        const initialWorkerCount = parseInt(text.trim().match(/of\s*(\d+)/)[1]);
        cy.wrap(initialWorkerCount).as('initialWorkerCount');
        cy.log(`Initial worker count from footer: ${initialWorkerCount}`);
      });

    const workerData = generateWorkerData();
    cy.get('button p').contains('Add Worker').click();
    cy.get('input[name="firstName"]').type(workerData.firstName);
    cy.get('input[name="lastName"]').type(workerData.lastName);
    cy.get('input[name="company"]').click();
    cy.get('input[name="company"]').type(companyName);
    cy.get('.select_item_container [role="button"]').contains(companyName).click();
    cy.contains('footer [label="Add Worker"] button', 'Add Worker').click();
    cy.wait(3000);

    cy.visit('/projects/5007477836/companies');
    cy.get(workforceSelector.searchInput).type(companyName);
    cy.wait(2000);
    cy.get(workforceSelector.tableRow).contains(companyName).click();
    cy.get(workforceSelector.companyWorkerPage).click();

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

        cy.get('@initialCount').then((initialCount) => {
          expect(finalCount).to.eq(initialCount + 1);
          cy.log(`✅ Total Workers increased from ${initialCount} to ${finalCount}`);
        });
      });
  });
});

  it(
    "Verify total workers count matches workers list data Workers With Safety Alerts",
    { tags: ["Story:Safety Alerts Count Matches List", "Severity:critical", "UI", "Module:WorkForce-Company"] },
    () => {
  
      cy.contains(workforceSelector.tableColumn, 'Status')
        .find('.table-header-filter-btn')
        .click();
  
      cy.get('.select_item_container label')
        .contains('Active')
        .parent()
        .find('input[type="checkbox"]')
        .check({ force: true });
  
      cy.contains('p', 'Filters:').click();
      cy.wait(2000)
  
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
  
      cy.get('@activeCompanyRow').click({force:true});
  
      cy.get(workforceSelector.companyWorkerPage).click();
  
      cy.contains('p', 'Workers With Safety Alerts')
        .parent()
        .parent()
        .parent()
        .as('totalSafteyAlerts');
  
      cy.get('@totalSafteyAlerts')
        .find('p')
        .contains('Workers With Safety Alerts')
        .should('be.visible');
  
      cy.get('@totalSafteyAlerts')
        .find('p')
        .eq(1)
        .invoke('text')
        .then((totalWorkersText) => {
  
          const totalWorkersTextNumber = parseInt(totalWorkersText.replace(/\D/g, ''));
          cy.log('Workers With Safety Alerts Count:', totalWorkersTextNumber);
  
          cy.get('@totalSafteyAlerts').find('button').click();
  
          const labels = ['SOS', 'Fall', 'Near miss', 'Restricted', 'Fatigue', 'Unsafe'];
                  cy.get(workforceSelector.tableRow).should('be.visible');
cy.get('body').realMouseMove(800, 400)
cy.wait(200)

          cy.get('.filter-tag').first().each(($tag) => {
            cy.wrap($tag).scrollIntoView({ duration: 0 })
  .realHover({ position: 'center', scrollBehavior: false });
          
            labels.forEach((label) => {
              cy.get('body').then(($body) => {
                if ($body.find(`.label.default__label:contains("${label}")`).length) {
                  cy.contains('.label.default__label', label).should('be.visible');
                }
              });
            });
          });
          // cy.get(workforceSelector.tableRow).first().click({force: true});

          cy.get(workforceSelector.tableRow).should('be.visible');
          cy.getTotalWorkers().then((totalWorker) => {
  
            cy.log(`Total number of workers: ${totalWorker}`);
  
            expect(totalWorkersTextNumber).to.eq(totalWorker);
  
          });
  

          cy.get(workforceSelector.tableColumn).then(($headers) => {
  
            let companyIndex = -1;
  
            $headers.each((i, el) => {
  
              const headerText = Cypress.$(el).text().trim().toLowerCase();
  
              if (headerText.includes('company')) {
                companyIndex = i;
                cy.log(`Company column index: ${i}`);
              }
  
            });
  
            expect(companyIndex).to.be.greaterThan(-1);

            cy.get('@companyName').then((companyName) => {
  
              cy.get(workforceSelector.tableRow).each(($row) => {
  
                cy.wrap($row)
                  .find('.table_td')
                  .eq(5)
                  .invoke('text')
                  .then((company) => {
                    expect(company.trim()).to.contain(companyName);
                  });

                  cy.get(workforceSelector.tableRow).first().click({force: true});
                  cy.get(workforceSelector.SafetyAuditPage).click()
                  const alerts = ['SOS', 'Fall', 'Near miss', 'Restricted', 'Fatigue', 'Unsafe'];

cy.get(workforceSelector.documentTableRow).each(($row) => {
  cy.wrap($row)
    .find('.label.default__label')
    .invoke('text')
    .then((text) => {
      const hasAlert = alerts.some(alert => text.includes(alert));
      expect(hasAlert, `Row contains one of alerts: ${alerts.join(', ')}`).to.be.true;
    });
});
  
              });
  
            });
  
          });
  
        });
  
    }
  );

  it("WorkForce-Company - Verify total workers count matches workers list data - Flagged Workers On-site", { tags: ["Story:Flagged Workers Count Matches List", "Severity:critical", "UI", "Module:WorkForce-Company"] }, () => {
    cy.contains(workforceSelector.tableColumn, 'Status')
      .find('.table-header-filter-btn')
      .click();

    cy.get('.select_item_container label')
      .contains('Active')
      .parent()
      .find('input[type="checkbox"]')
      .check({ force: true });

    cy.get('p').contains('Filters:').click();
    cy.wait(2000)

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

    cy.get('@activeCompanyRow').first().click({force:true});
    cy.get(workforceSelector.companyWorkerPage).click();

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
                cy.get(workforceSelector.tableRow).should('be.visible');
cy.get('body').realMouseMove(800, 400)
cy.wait(200)

        cy.get('.filter-tag-container').eq(0).should('be.visible').scrollIntoView({ duration: 0 })
  .realHover({ position: 'center', scrollBehavior: false });
        cy.get('.label.default__label').contains('Flagged').should('be.visible');
                cy.get(workforceSelector.tableRow).should('be.visible');
cy.get('body').realMouseMove(800, 400)
cy.wait(200)

        cy.get('.filter-tag-container').eq(1).should('be.visible').scrollIntoView({ duration: 0 })
  .realHover({ position: 'center', scrollBehavior: false });
        cy.get('@companyName').then((companyName) => {
          cy.get('.label.default__label').contains(companyName).should('be.visible');
        });

        cy.get(workforceSelector.tableRow).should('be.visible');

        cy.get('.workers-footer')
          .invoke('text')
          .then((text) => {
            const totalFromTable = text.trim().match(/(\d+)\s*-\s*(\d+)\s*of\s*(\d+)/)[3];
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
                    .eq(companyIndex - 1)
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

  it('WorkForce-Company - Add a flagged worker and verify total flagged count increases', { tags: ["Story:Add Flagged Worker Increases Count", "Severity:critical", "UI", "@smoke"] }, () => {
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
    cy.wait(2000)
    cy.get(workforceSelector.tableRow).contains('Active').should('be.visible');

    cy.get(workforceSelector.tableRow).first().as('activeCompanyRow');
    cy.get('@activeCompanyRow')
      .parent()
      .find('.personal-info-content__title')
      .first()
      .invoke('text')
      .then((companyName) => {
        cy.wrap(companyName.trim()).as('companyName');
    cy.get('@activeCompanyRow').first().click({force:true});

    cy.get(workforceSelector.companyWorkerPage).click();

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
    cy.get('input[name="company"]').type(companyName);
    cy.get('.select_item_container [role="button"]').contains(companyName).click();
    cy.contains('footer [label="Add Worker"] button', 'Add Worker').click();
    cy.get("body").click(0, 0);
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
    cy.get(workforceSelector.searchInput).type(companyName);
    cy.get(workforceSelector.tableRow).contains(companyName).click();
    cy.get(workforceSelector.companyWorkerPage).click();

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
});

  it("WorkForce-Company - Verify total workers count matches workers list data - Total Workers On-site", { tags: ["Story:Total Workers On-site Count Matches List", "Severity:critical", "UI", "Module:WorkForce-Company"] }, () => {
    cy.contains(workforceSelector.tableColumn, 'Status')
      .find('.table-header-filter-btn')
      .click();

    cy.get('.select_item_container label')
      .contains('Active')
      .parent()
      .find('input[type="checkbox"]')
      .check({ force: true });

    cy.get('p').contains('Filters:').click();
    cy.wait(2000)

    cy.get(workforceSelector.tableRow).contains('Active').should('be.visible');

    cy.get(workforceSelector.tableRow).first().as('activeCompanyRow');

    cy.get('@activeCompanyRow')
      .parent()
      .find('.personal-info-content__title')
      .first()
      .invoke('text')
      .then((companyName) => {
        cy.wrap(companyName.trim()).as('companyName');

    cy.get('@activeCompanyRow').first().click({force:true});
    cy.get(workforceSelector.companyWorkerPage).click();

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
                cy.get(workforceSelector.tableRow).should('be.visible');
cy.get('body').realMouseMove(800, 400)
cy.wait(200)

        cy.get('.filter-tag-container').eq(0).should('be.visible').scrollIntoView({ duration: 0 })
  .realHover({ position: 'center', scrollBehavior: false });
        cy.get('.label.default__label').contains('On-site').should('be.visible');
                cy.get(workforceSelector.tableRow).should('be.visible');
cy.get('body').realMouseMove(800, 400)
cy.wait(200)
        cy.get('.filter-tag-container').eq(1).should('be.visible').scrollIntoView({ duration: 0 })
  .realHover({ position: 'center', scrollBehavior: false });
        cy.get('@companyName').then((companyName) => {
          cy.get('.label.default__label').contains(companyName).should('be.visible');
        });

        cy.get(workforceSelector.tableRow).should('be.visible');

        cy.get('.workers-footer')
          .invoke('text')
          .then((text) => {
            const totalFromTable = text.trim().match(/(\d+)\s*-\s*(\d+)\s*of\s*(\d+)/)[3];
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
                    .eq(companyIndex - 1)
                    .invoke('text')
                    .then((company) => {
                      cy.get('@companyName').then((companyName) => {
                        expect(company.trim()).to.contain(companyName);
                      });
                    });

                  cy.wrap($row)
                    .find('.table_td')
                    .eq(siteStatusIndex - 1)
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
});

});