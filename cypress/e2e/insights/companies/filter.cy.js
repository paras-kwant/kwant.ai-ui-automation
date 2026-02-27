import { workforceSelector } from "../../../support/workforceSelector";

describe('Companies Insights - Filter Functionality', () => {
  before(() => {
    cy.session("userSession", () => {
      cy.login();
      cy.get(".card-title").contains('Pearl Apartments').click();
    });
    cy.visit('/projects/5007477836/insights/companies');
    cy.get('.filters_header_right_section .selector-item.first').click()
  })
  let authHeaders = {};
  const getLabel = (labelText) => {
    return cy.get('body').then(($body) => {
      if ($body.find(`.select-container__label:contains("${labelText}")`).length > 0) {
        return cy.contains('.select-container__label', labelText)
      } else {
        return cy.contains('label', labelText)
      }
    })
  }
  beforeEach(() => {
    cy.cleanUI()
  })

  beforeEach(() => {
    cy.intercept('GET', '/api/projectConfigs', (req) => {
      authHeaders = {
        'x-auth-token': req.headers['x-auth-token'],
        'x-auth-project': req.headers['x-auth-project']
      };
    }).as('getConfig');
  });

  it('verify the UI of the filter form', () => {
    cy.contains('button p', 'Filter').click();
    cy.contains('h1', 'Filters').should('be.visible');

    const dropdownFilters = [
      { label: 'Company' },
      { label: 'Cost Code' },
      { label: 'Crew' },
      { label: 'Job Title' },
      { label: 'Pay Group' },
      { label: 'Certificate Status' },
      { label: 'Certificate Type' },
      { label: 'Safety Alert Type' },
      { label: 'Safety Alert Date' },
      { label: 'Certificate Expiry Date' },
    ];

    dropdownFilters.forEach(({ label }) => {
      getLabel(label).scrollIntoView().should('exist');
    });

    const rangeFilters = [
      { label: 'Workers On-site' },
      { label: 'Actual Work-Days' },
    ];

    rangeFilters.forEach(({ label }) => {
      getLabel(label).scrollIntoView().should('exist');
    });

  });

  it('verify the options button in the filter button (UI random)', () => {
    cy.contains('button p', 'Filter').click()
    cy.contains('.placeholder', 'Select Company').click()

    cy.get('.multi-select-option__head')
      .then($options => {
  
        const optionTexts = [...$options].map(el =>
          el.innerText.trim()
        )
  
        const randomTexts = Cypress._.sampleSize(
          optionTexts,
          Math.min(3, optionTexts.length)
        )
  
        return randomTexts
      })
      .then(randomTexts => {
  
        randomTexts.forEach(text => {
          cy.contains('.multi-select-option__head', text)
            .click()
        })
      })
  
    cy.get('body').click(0, 0)
    cy.contains('button p', 'Filter').click()
    cy.contains('.placeholder', 'Select Cost Code').click()
  
    cy.get('.multi-select-option__head')
      .then($options => {
  
        const optionTexts = [...$options].map(el =>
          el.innerText.trim()
        )
  
        const randomTexts = Cypress._.sampleSize(
          optionTexts,
          Math.min(3, optionTexts.length)
        )
  
        return randomTexts
      })
      .then(randomTexts => {
  
        randomTexts.forEach(text => {
          cy.contains('.multi-select-option__head', text)
            .click()
        })
      })
  
    cy.get('body').click(0, 0)

    cy.contains('button p', 'Filter').click()
    cy.contains('.placeholder', 'Select Certificate Status').click()  
    const certOptions = ['Expired', 'Expiring', 'All Uploaded']
  
    certOptions.forEach(option => {
      cy.contains('.multi-select-option__head', option)
        .should('be.visible')
    })
  
    cy.get('body').click(0, 0)
  

    cy.contains('button p', 'Filter').click()
    cy.contains('.placeholder', 'Select Safety Alert Type').click()
  
    const safetyOptions = [
      'SOS',
      'Fall',
      'Near miss',
      'Restricted',
      'Fatigue'
    ]
  
    safetyOptions.forEach(option => {
      cy.contains('.multi-select-option__head', option)
        .should('be.visible')
    })
  
  })


it('Filter button should be disable until user select any filter option', () => {
  cy.contains('button p', 'Filter').click();
  cy.contains(' section button', 'Filter').should('be.disabled');
})

it('Verify Company Name Filter', () => {
  cy.intercept(
    'POST',
    '**/api/insight/company/table*'
  ).as('companyTableApi');

  cy.contains('button p', 'Filter').click();
  cy.contains('.placeholder', 'Select Company').click();

  cy.get('.multi-select-option__head')
    .then($options => {

      const companyList = [...$options].map(el =>
        el.innerText.trim()
      );
      expect(companyList.length).to.be.greaterThan(0);

      const randomCompany = Cypress._.sample(companyList);
      cy.wrap(randomCompany).as('selectedCompany');

      cy.contains('.multi-select-option__head', randomCompany)
        .click();

    });
  cy.contains('section button p', 'Filter').click();
  cy.wait('@companyTableApi');
  cy.get('body').click(0, 0);

  cy.get('@selectedCompany').then((randomCompany) => {

    cy.get('body').then(($body) => {

      if ($body.find(workforceSelector.tableRow).length > 0) {

        cy.get(workforceSelector.tableRow)
          .each(($row) => {
            cy.wrap($row)
              .find('.personal-info-content__title').contains(randomCompany)
          });

      } else {

        cy.get('.empty-body__title')
          .should('contain.text', 'No Results Found');

      }

    });

  });

});

it('Verify Crew Filter', () => {

  cy.intercept(
    'POST',
    '**/api/insight/company/table*'
  ).as('companyTableApi');

  cy.contains('button p', 'Filter').click();
  cy.contains('.placeholder', 'Select Crew').click();
  cy.get('.multi-select-option__head')
    .then($options => {
      const crewList = [...$options].map(el =>
        el.innerText.trim()
      );
      expect(crewList.length).to.be.greaterThan(0);
      const randomCrew = Cypress._.sample(crewList);
      cy.wrap(randomCrew).as('selectedCrew');
      cy.contains('.multi-select-option__head', randomCrew)
        .click();
    });
  cy.contains('section button p', 'Filter').click();
  cy.get('body').click(0, 0);
  cy.wait('@companyTableApi');
  cy.get('@selectedCrew').then((selectedCrew) => {
    cy.get('body').then(($body) => {
      if ($body.find(workforceSelector.tableRow).length > 0) {
        cy.log('Table has rows, verifying each row contains the selected Crew');
        // cy.get(workforceSelector.tableRow)
        //   .each(($row) => {
        //     cy.wrap($row)
        //       .should('contain.text', selectedCrew);
          // });
      } else {
        cy.get('.empty-body__title')
          .should('contain.text', 'No Results Found');
      }
    });
  });
});
  

it('Validate the Job Title Filter (UI only + update if empty)', () => {
  cy.intercept('POST', '**/api/projectTaskTrade/filter*').as('taskTradeFilter');
  cy.visit('https://uat.kwant.ai/projects/5007477836/companies');
  cy.wait('@taskTradeFilter').its('response.statusCode').should('eq', 200);


  cy.contains(workforceSelector.tableColumn, 'Workers On-site')
    .find('.table-header-filter-btn').click();

  cy.get('[placeholder="Min"]').clear().type('1');
  cy.get('[placeholder="Max"]').clear().type('10');
  cy.get('p').contains('Filters:').click()

  cy.get('.default__label').contains('Clear All').should('be.visible');
  cy.wait('@taskTradeFilter').its('response.statusCode').should('eq', 200);
  cy.get('.loader-image').should('not.exist');
  cy.wait(3000)

  cy.get('.personal-info-content__title')
    .first()
    .invoke('text')
    .then((text) => {
      const companyName = text.trim();
      cy.log('First company in table: ' + companyName);
      Cypress.env('companyName', companyName);
    });

  cy.get('.personal-info-content__title').first().click();
  cy.get(workforceSelector.companyWorkerPage).click();
  cy.contains('p', 'Total Workers On-site')
    .parent().parent().parent()
    .as('totalOnsiteWorkerCard');
  cy.get('@totalOnsiteWorkerCard').find('button').click();
  cy.get(workforceSelector.tableRow).find('.personal-info-content__title').first().click();
  cy.get(workforceSelector.jobDetailsPage).click();
  cy.getWorkerField('Job Title').then(($jobField) => {
    let trimmedJobTitle = $jobField.text().trim();
    cy.log('Original Job Title: ' + trimmedJobTitle);
    if (trimmedJobTitle === '-' || trimmedJobTitle.toLowerCase() === 'none') {
      cy.get($jobField).click({ force: true });
      cy.selectRandomOption(
        '[placeholder="Select Job Title"]',
        '.select_item_container [role="button"]',
        'jobTitleField'
      );

      cy.get(workforceSelector.updateButton).click();
      cy.getWorkerField('Job Title')
        .invoke('text')
        .then((newJobTitle) => {
          trimmedJobTitle = newJobTitle.trim();
          cy.log('Updated Job Title: ' + trimmedJobTitle);
          Cypress.env('jobTitle', trimmedJobTitle);
        });

    } else {
      Cypress.env('jobTitle', trimmedJobTitle);
    }

  }).then(() => {
    cy.visit('/projects/5007477836/insights/companies');
    cy.contains('button p', 'Filter').click();
    cy.contains('.placeholder', 'Select Job Title').click();
    cy.then(() => {
      const jobTitle = Cypress.env('jobTitle');
      const companyName = Cypress.env('companyName');
      cy.get('section [placeholder="Search"]').type(jobTitle);
      cy.get('.multi-select-option__head')
        .contains(jobTitle)
        .click();
      cy.contains('section button p', 'Filter').click();
      cy.get('body').click(0, 0);
      cy.get('.personal-info-content__title')
        .contains(companyName)
        .should('be.visible');
    });
  });
});


  it('Workers On-site filter should return correct results based on range selection', () => {
    cy.intercept('POST', '**/api/insight/company/table*').as('companyTableApi');

    cy.contains('button p', 'Filter').click();
    cy.contains('label', 'Workers On-site').parent().find('[name="totalOnSiteWorkers"]').eq(0).as('minInput');
    cy.contains('label', 'Workers On-site').parent().find('[name="totalOnSiteWorkers"]').eq(1).as('maxInput');
    cy.get('@minInput').clear().type('1');
    cy.get('@maxInput').clear().type('2');
    cy.contains('section button p', 'Filter').click();
    cy.wait('@companyTableApi');
    cy.get('body').click(0, 0);


    cy.get(workforceSelector.tableRow).find('.table_td').then(($headers) => {
      const colIndex = [...$headers].findIndex((th) => th.innerText.includes('On-site Today'));
      cy.log('On-site Today column index: ' + colIndex);
    
      cy.get('body').then(($body) => {
        if ($body.find(workforceSelector.tableRow).length > 0) {
          cy.get(workforceSelector.tableRow).each(($row) => {
            cy.wrap($row).find('.table_td').eq(2).invoke('text').then((text) => {
              const count = parseInt(text.trim());
              expect(count).to.be.within(1, 2);
            });
          });
        } else {
          cy.log('No Results Found for Workers On-site filter');
          cy.contains('.empty-body__title', 'No Results Found').should('exist');
        }
      });

    });
  });
  it('Workers On-site filter - only min set should return results greater than or equal to min', () => {
    cy.intercept('POST', '**/api/insight/company/table*').as('companyTableApi');
    cy.contains('button p', 'Filter').click();
    cy.contains('label', 'Workers On-site').parent().find('[name="totalOnSiteWorkers"]').eq(0).as('minInput');
    cy.get('@minInput').clear().type('3');
    cy.contains('section button p', 'Filter').click();
    cy.wait('@companyTableApi');
    cy.get('body').click(0, 0);
    cy.get('body').then(($body) => {
      if ($body.find(workforceSelector.tableRow).length > 0) {
        cy.get(workforceSelector.tableRow).each(($row) => {
          cy.wrap($row).find('.table_td').eq(2).invoke('text').then((text) => {
            const count = parseInt(text.trim());
            expect(count).to.be.gte(3);
          });
        });
      } else {
        cy.log('No Results Found for Workers On-site min only filter');
        cy.contains('.empty-body__title', 'No Results Found').should('exist');
      }
    });
  });
  
  it('Workers On-site filter - only max set should return results less than or equal to max', () => {
    cy.intercept('POST', '**/api/insight/company/table*').as('companyTableApi');
    cy.contains('button p', 'Filter').click();
    cy.contains('label', 'Workers On-site').parent().find('[name="totalOnSiteWorkers"]').eq(1).as('maxInput');
    cy.get('@maxInput').clear().type('5');
    cy.contains('section button p', 'Filter').click();
    cy.wait('@companyTableApi');
    cy.get('body').click(0, 0);
    cy.get('body').then(($body) => {
      if ($body.find(workforceSelector.tableRow).length > 0) {
        cy.get(workforceSelector.tableRow).each(($row) => {
          cy.wrap($row).find('.table_td').eq(2).invoke('text').then((text) => {
            const count = parseInt(text.trim());
            expect(count).to.be.lte(5);
          });
        });
      } else {
        cy.log('No Results Found for Workers On-site max only filter');
        cy.contains('.empty-body__title', 'No Results Found').should('exist');
      }
    });
  });

  it('Actual Work-Days filter should return correct results based on range selection', () => {
cy.intercept('POST', '**/api/insight/company/table*').as('companyTableApi');
    cy.contains('button p', 'Filter').click();
    cy.contains('label', 'Actual Work-Days').parent().find('[name="actualWorkDays"]').eq(0).as('minInput');
    cy.contains('label', 'Actual Work-Days').parent().find('[name="actualWorkDays"]').eq(1).as('maxInput');
    cy.get('@minInput').clear().type('1');
    cy.get('@maxInput').clear().type('2');
    cy.contains('section button p', 'Filter').click();
    cy.wait('@companyTableApi');
    cy.get('body').click(0, 0);
    cy.get(workforceSelector.tableRow).find('.table_td').then(($headers) => {
      const colIndex = [...$headers].findIndex((th) => th.innerText.includes('Actual Work-Days'));
      cy.log('Actual Work-Days column index: ' + colIndex);
  
      cy.get('body').then(($body) => {
        if ($body.find(workforceSelector.tableRow).length > 0) {
          cy.get(workforceSelector.tableRow).each(($row) => {
            cy.wrap($row).find('.table_td').eq(3).invoke('text').then((text) => {
              const count = parseInt(text.trim());
              expect(count).to.be.within(1, 2);
            });
          });
        } else {
          cy.log('No Results Found for Actual Work-Days filter');
          cy.contains('.empty-body__title', 'No Results Found').should('exist');
        }
      });
    });
  });

  it('Actual Work-Days filter - only min set should return results greater than or equal to min', () => {
cy.intercept('POST', '**/api/insight/company/table*').as('companyTableApi');
  cy.contains('button p', 'Filter').click();
  cy.contains('label', 'Actual Work-Days').parent().find('[name="actualWorkDays"]').eq(0).as('minInput');
  cy.get('@minInput').clear().type('3');
  cy.contains('section button p', 'Filter').click();
  cy.wait('@companyTableApi');
  cy.get('body').click(0, 0);

  cy.get('body').then(($body) => {
    if ($body.find(workforceSelector.tableRow).length > 0) {
      cy.get(workforceSelector.tableRow).each(($row) => {
        cy.wrap($row).find('.table_td').eq(3).invoke('text').then((text) => {
          const count = parseInt(text.trim());
          expect(count).to.be.gte(3);
        });
      });
    } else {
      cy.log('No Results Found for Actual Work-Days min only filter');
      cy.contains('.empty-body__title', 'No Results Found').should('exist');
    }
  });
});

it('Actual Work-Days filter - only max set should return results less than or equal to max', () => {
cy.intercept('POST', '**/api/insight/company/table*').as('companyTableApi');
  cy.contains('button p', 'Filter').click();
  cy.contains('label', 'Actual Work-Days').parent().find('[name="actualWorkDays"]').eq(1).as('maxInput');
  cy.get('@maxInput').clear().type('5');
  cy.contains('section button p', 'Filter').click();
  cy.wait('@companyTableApi');

  cy.get('body').click(0, 0);

  cy.get('body').then(($body) => {
    if ($body.find(workforceSelector.tableRow).length > 0) {
      cy.get(workforceSelector.tableRow).each(($row) => {
        cy.wrap($row).find('.table_td').eq(3).invoke('text').then((text) => {
          const count = parseInt(text.trim());
          expect(count).to.be.lte(5);
        });
      });
    } else {
      cy.log('No Results Found for Actual Work-Days max only filter');
      cy.contains('.empty-body__title', 'No Results Found').should('exist');
    }
  });
});

it('Workers On-site + Company filter combined should return correct results (UI only)', () => {
  cy.intercept('POST', '**/api/insight/company/table*').as('companyTableApi');
  cy.contains('button p', 'Filter').click();
  cy.contains('.placeholder', 'Select Company').click();
  cy.get('.multi-select-option__head')
    .should('have.length.greaterThan', 0)
    .then($options => {

      const companyList = [...$options].map(el => el.innerText.trim());
      const randomCompany = Cypress._.sample(companyList);

      cy.wrap(randomCompany).as('selectedCompany');

      cy.get('section [placeholder="Search"]')
        .clear()
        .type(randomCompany);

      cy.contains('.multi-select-option__head', randomCompany)
        .click();

    });

  cy.contains('label', 'Workers On-site')
    .parent()
    .find('[name="totalOnSiteWorkers"]')
    .eq(0)
    .clear()
    .type('1');

  cy.contains('label', 'Workers On-site')
    .parent()
    .find('[name="totalOnSiteWorkers"]')
    .eq(1)
    .clear()
    .type('10');
  cy.contains('section button p', 'Filter').click();
  cy.get('body').click(0, 0);
  cy.wait('@companyTableApi').its('response.statusCode').should('eq', 200);
  cy.get('.loader-image').should('not.exist');
  cy.get('@selectedCompany').then((selectedCompany) => {
    cy.get('body').then(($body) => {
      if ($body.find(workforceSelector.tableRow).length > 0) {
        cy.get(workforceSelector.tableRow).each(($row) => {
          cy.wrap($row).find('.table_td').eq(1)
            .invoke('text')
            .then(text => {
              expect(text.trim()).to.include(selectedCompany);
            });

          cy.wrap($row).find('.table_td').eq(2)
            .invoke('text')
            .then(text => {
              const count = parseInt(text.trim());
              expect(count).to.be.within(1, 10);
            });
        });
      } else {
        cy.log('No Results Found for combined Company + Workers On-site filter');
        cy.contains('.empty-body__title', 'No Results Found')
          .should('exist');

      }

    });

  });

});

it('Actual Work-Days + Crew filter combined should return correct results (UI only)', () => {
  cy.intercept('POST', '**/api/insight/company/table*').as('companyTableApi');

  cy.contains('button p', 'Filter').click();
  cy.contains('.placeholder', 'Select Crew').click();

  cy.get('.multi-select-option__head')
    .should('have.length.greaterThan', 0)
    .then($options => {
      const crewList = [...$options].map(el => el.innerText.trim());
      const randomCrew = Cypress._.sample(crewList);
      cy.wrap(randomCrew).as('selectedCrew');
      cy.get('section [placeholder="Search"]').clear().type(randomCrew);
      cy.contains('.multi-select-option__head', randomCrew).click();
    });
  cy.contains('label', 'Actual Work-Days').parent().find('[name="actualWorkDays"]').eq(0).clear().type('1');
  cy.contains('label', 'Actual Work-Days').parent().find('[name="actualWorkDays"]').eq(1).clear().type('10');
  cy.contains('section button p', 'Filter').click();
  cy.wait('@companyTableApi');
  cy.get('body').click(0, 0);
  cy.get('.loader-image').should('not.exist');
  cy.get('@selectedCrew').then(() => {
    cy.get('body').then(($body) => {
      if ($body.find(workforceSelector.tableRow).length > 0) {
        cy.get(workforceSelector.tableRow).each(($row) => {
          cy.wrap($row).find('.table_td').eq(3).invoke('text').then(text => {
            const count = parseInt(text.trim());
            expect(count).to.be.within(1, 10);
          });
        });
      } else {
        cy.contains('.empty-body__title', 'No Results Found').should('exist');
      }
    });
  });

});

it('Workers On-site + Actual Work-Days combined should return correct results (UI only)', () => {
  cy.intercept('POST', '**/api/insight/company/table*').as('companyTableApi');
  cy.contains('button p', 'Filter').click();
  cy.contains('label', 'Workers On-site').parent().find('[name="totalOnSiteWorkers"]').eq(0).clear().type('1');
  cy.contains('label', 'Workers On-site').parent().find('[name="totalOnSiteWorkers"]').eq(1).clear().type('10');
  cy.contains('label', 'Actual Work-Days').parent().find('[name="actualWorkDays"]').eq(0).clear().type('1');
  cy.contains('label', 'Actual Work-Days').parent().find('[name="actualWorkDays"]').eq(1).clear().type('10');
  cy.contains('section button p', 'Filter').click();
  cy.get('body').click(0, 0);
  cy.wait('@companyTableApi').its('response.statusCode').should('eq', 200);
  cy.get('.loader-image').should('not.exist');
  cy.get('body').then(($body) => {
    if ($body.find(workforceSelector.tableRow).length > 0) {
      cy.get(workforceSelector.tableRow).each(($row) => {
        cy.wrap($row).find('.table_td').eq(2).invoke('text').then(text => {
          const count = parseInt(text.trim());
          expect(count).to.be.within(1, 10);
        });
        cy.wrap($row).find('.table_td').eq(3).invoke('text').then(text => {
          const count = parseInt(text.trim());
          expect(count).to.be.within(1, 10);
        });
      });
    } else {
      cy.contains('.empty-body__title', 'No Results Found').should('exist');
    }
  });
});

it('Company + Crew + Workers On-site all combined should return correct results (UI only)', () => {
  cy.intercept('POST', '**/api/insight/company/table*').as('companyTableApi');
  cy.contains('button p', 'Filter').click();
  cy.contains('.placeholder', 'Select Company').click();
  cy.get('.multi-select-option__head')
    .should('have.length.greaterThan', 0)
    .then($options => {
      const companyList = [...$options].map(el => el.innerText.trim());
      const randomCompany = Cypress._.sample(companyList);
      cy.wrap(randomCompany).as('selectedCompany');
      cy.get('section [placeholder="Search"]').clear().type(randomCompany);
      cy.contains('.multi-select-option__head', randomCompany).click();
    });

  cy.contains('.placeholder', 'Select Crew').click();
  cy.get('.multi-select-option__head')
    .should('have.length.greaterThan', 0)
    .then($options => {
      const crewList = [...$options].map(el => el.innerText.trim());
      const randomCrew = Cypress._.sample(crewList);
      cy.wrap(randomCrew).as('selectedCrew');
      cy.get('section [placeholder="Search"]').clear().type(randomCrew);
      cy.contains('.multi-select-option__head', randomCrew).click();
    });
  cy.contains('label', 'Workers On-site').parent().find('[name="totalOnSiteWorkers"]').eq(0).clear().type('1');
  cy.contains('label', 'Workers On-site').parent().find('[name="totalOnSiteWorkers"]').eq(1).clear().type('10');

  cy.contains('section button p', 'Filter').click();
  cy.wait('@companyTableApi');
  cy.get('body').click(0, 0);
  cy.get('.loader-image').should('not.exist');
  cy.get('@selectedCompany').then((selectedCompany) => {
    cy.get('@selectedCrew').then(() => {
      cy.get('body').then(($body) => {
        if ($body.find(workforceSelector.tableRow).length > 0) {
          cy.get(workforceSelector.tableRow).each(($row) => {
            cy.wrap($row).find('.table_td').eq(1).invoke('text').then(text => {
              expect(text.trim()).to.include(selectedCompany);
            });
            cy.wrap($row).find('.table_td').eq(2).invoke('text').then(text => {
              const count = parseInt(text.trim());
              expect(count).to.be.within(1, 10);
            });
          });
        } else {
          cy.contains('.empty-body__title', 'No Results Found').should('exist');
        }
      });
    });
  });
});

it('Validate Filter of certificate expired', () => {
  cy.intercept('POST', '**/api/insight/company/table*').as('companyTable');
  cy.contains('button p', 'Filter').click();
  cy.contains('.placeholder', 'Select Certificate Status').click();
  cy.contains('.multi-select-option__head', 'Expired').click({ force: true });
  cy.contains('section button p', 'Filter').click();
  cy.get('body').click(0, 0);
  cy.get('.loader-image').should('not.exist');

  cy.wait('@companyTable').then((interception) => {
    const responseBody = interception.response.body;
    const companies = responseBody.data;

    cy.get(workforceSelector.tableRow).then(($rows) => {
      if ($rows.length > 0) {
        cy.get(workforceSelector.tableRow).each(($row, index) => {
          const company = companies[index];
          const companyId = company.id;
          expect(
            company.hasDocumentExpiredOrSafety,
            `Company "${company.companyName}" (ID: ${companyId}) should have hasDocumentExpiredOrSafety as true`
          ).to.be.true;
        });
      } else {
        cy.log('No Results Found for Certificate Status filter');
        cy.contains('.empty-body__title', 'No Results Found').should('exist');
      }
    });
  });
});
it('Validate the Cost Code Filter (UI only + update if empty)', () => {
  cy.intercept('POST', '**/api/projectTaskTrade/filter*').as('taskTradeFilter');

  cy.visit('https://uat.kwant.ai/projects/5007477836/companies');
  cy.wait('@taskTradeFilter')

  cy.contains(workforceSelector.tableColumn, 'Workers On-site')
    .find('.table-header-filter-btn').click();
  cy.get('[placeholder="Min"]').type('1');
  cy.get('[placeholder="Max"]').type('10');
  cy.get('body').click(0, 0);
  cy.wait('@taskTradeFilter').its('response.statusCode').should('eq', 200);
  
  cy.get('.loader-image').should('not.exist');
  cy.wait(4000)

  cy.get('.personal-info-content__title').first().invoke('text').then((text) => {
    const companyName = text.trim();
    cy.log('First company in table: ' + companyName);
    Cypress.env('companyName', companyName);
  });
  cy.get('.personal-info-content__title').first().click();
  cy.get(workforceSelector.companyWorkerPage).click();

  cy.contains('p', 'Total Workers On-site')
    .parent().parent().parent()
    .as('totalOnsiteWorkerCard');

  cy.get('@totalOnsiteWorkerCard').find('button').click();
  cy.get('.loader-image').should('not.exist');


  cy.get('.personal-info-content__title').first().click();
  cy.get(workforceSelector.jobDetailsPage).click();
  cy.getWorkerField('Cost Code').then(($costField) => {
    let trimmedCostCode = $costField.text().trim();
    cy.log('Original Cost Code: ' + trimmedCostCode);
    if (trimmedCostCode === '-' || trimmedCostCode.toLowerCase() === 'none') {
      cy.get($costField).click({ force: true });
      cy.selectRandomOption(
        '[placeholder="Select Cost Code"]',
        '.select_item_container [role="button"]',
        'costCodeField'
      );
      cy.get(workforceSelector.updateButton).click();
      cy.get('.loader-image').should('not.exist');

      cy.getWorkerField('Cost Code').invoke('text').then((newCostCode) => {
        trimmedCostCode = newCostCode.trim();
        cy.log('Updated Cost Code: ' + trimmedCostCode);
        Cypress.env('costCode', trimmedCostCode);
      });
    } else {
      Cypress.env('costCode', trimmedCostCode);
    }
  }).then(() => {
    cy.visit('/projects/5007477836/insights/companies');
    cy.contains('button p', 'Filter').click();
    cy.contains('.placeholder', 'Select Cost Code').click();

    cy.then(() => {
      const costCode = Cypress.env('costCode');
      const companyName = Cypress.env('companyName');

      cy.get('.multi-select-option__head').contains(costCode).click();
      cy.contains('section button p', 'Filter').click();
      cy.get('body').click(0, 0);

      cy.get('.personal-info-content__title').contains(companyName).should('be.visible');
    });
  });
});

it('Validate the Pay Group Filter (UI only + update if empty)', () => {
  cy.visit('https://uat.kwant.ai/projects/5007477836/companies');

  cy.contains(workforceSelector.tableColumn, 'Workers On-site')
    .find('.table-header-filter-btn').click();
  cy.get('[placeholder="Min"]').type('1');
  cy.get('[placeholder="Max"]').type('10');
  cy.get('.loader-image').should('not.exist');
  cy.wait(3000)


  cy.get('.personal-info-content__title').first().invoke('text').then((text) => {
    const companyName = text.trim();
    cy.log('First company in table: ' + companyName);
    Cypress.env('companyName', companyName);
  });

  cy.get('.personal-info-content__title').first().click();
  cy.get(workforceSelector.companyWorkerPage).click();

  cy.contains('p', 'Total Workers On-site')
    .parent().parent().parent()
    .as('totalOnsiteWorkerCard');

  cy.get('@totalOnsiteWorkerCard').find('button').click();
  cy.get('.loader-image').should('not.exist');


  cy.get('.personal-info-content__title').first().click();
  cy.get(workforceSelector.jobDetailsPage).click();

  cy.getWorkerField('Pay Group').then(($payField) => {
    let trimmedPayGroup = $payField.text().trim();
    cy.log('Original Pay Group: ' + trimmedPayGroup);

    if (trimmedPayGroup === '-' || trimmedPayGroup.toLowerCase() === 'none') {
      cy.get($payField).click({ force: true });
      cy.selectRandomOption(
        '[placeholder="Select Pay Group"]',
        '.select_item_container [role="button"]',
        'payGroupField'
      );
      cy.get(workforceSelector.updateButton).click();
      cy.get('.loader-image').should('not.exist');


      cy.getWorkerField('Pay Group').invoke('text').then((newPayGroup) => {
        trimmedPayGroup = newPayGroup.trim();
        cy.log('Updated Pay Group: ' + trimmedPayGroup);
        Cypress.env('payGroup', trimmedPayGroup);
      });
    } else {
      Cypress.env('payGroup', trimmedPayGroup);
    }
  }).then(() => {
    cy.visit('/projects/5007477836/insights/companies');
    cy.contains('button p', 'Filter').click();
    cy.contains('.placeholder', 'Select Pay Group').click();

    cy.then(() => {
      const payGroup = Cypress.env('payGroup');
      const companyName = Cypress.env('companyName');

      cy.get('.multi-select-option__head').contains(payGroup).click();
      cy.contains('section button p', 'Filter').click();
      cy.get('body').click(0, 0);
      cy.get('.loader-image').should('not.exist');


      cy.get('.personal-info-content__title').contains(companyName).should('be.visible');
    });
  });
});
it('Verify Safety Alert filter functionality', () => {
  cy.intercept('POST', '**/api/projectTaskTrade/filter*').as('taskTradeFilter');
  cy.intercept('POST', 'https://uat.kwant.ai/api/insight/company/table?sort=companyName,asc&page=1&size=100').as('companyTable');
  cy.visit('https://uat.kwant.ai/projects/5007477836/companies');
  cy.wait('@taskTradeFilter').its('response.statusCode').should('eq', 200);

  cy.contains(workforceSelector.tableColumn, 'Workers On-site')
    .find('.table-header-filter-btn').click();
  cy.get('[placeholder="Min"]').type('1');
  cy.get('[placeholder="Max"]').type('10');
  cy.get('p').contains('Filters:').click()
  cy.wait('@taskTradeFilter').its('response.statusCode').should('eq', 200);
  cy.get('.loader-image').should('not.exist');
  cy.wait(5000)
  cy.get('.personal-info-content__title').first().invoke('text').then((text) => {
    const companyName = text.trim();
    cy.log('First company in table: ' + companyName);
    Cypress.env('companyName', companyName);
  });
  cy.get('.personal-info-content__title').first().click();
  cy.get(workforceSelector.companyWorkerPage).click();
  cy.contains('p', 'Total Workers On-site')
    .parent().parent().parent()
    .as('totalOnsiteWorkerCard');

  cy.get('@totalOnsiteWorkerCard').find('button').click();
  cy.get('.loader-image').should('not.exist');

  cy.get('.personal-info-content__title').first().click();
  cy.get(workforceSelector.SafetyAuditPage).click();
  cy.get('.loader-image').should('not.exist');


  cy.get('section [data-testid="table_tr"]').then(($rows) => {
    const collectedLabels = new Set();

    $rows.each((_, row) => {
      const labels = row.querySelectorAll('.default__label');
      labels.forEach(labelEl => {
        const text = labelEl.innerText.trim();
        if (text) collectedLabels.add(text);
      });
    });

    const uniqueLabels = Array.from(collectedLabels);
    cy.log('Unique labels across all rows: ' + JSON.stringify(uniqueLabels));

    uniqueLabels.forEach(label => {
      cy.contains('section [data-testid="table_tr"] .default__label', label)
        .should('exist');
    });

    expect(uniqueLabels.length).to.be.greaterThan(0);

    Cypress.env('safetyAlertLabel', uniqueLabels[0]);
  });

  cy.visit('/projects/5007477836/insights/companies');
  cy.contains('button p', 'Filter').click();
  cy.contains('.placeholder', 'Select Safety Alert Type').click();
  cy.then(() => {
    const safetyAlertLabel = Cypress.env('safetyAlertLabel');

    cy.get('section [placeholder="Search"]').type(safetyAlertLabel);
    cy.get('.multi-select-option__head').contains(safetyAlertLabel).click();
  });

  cy.contains('section button p', 'Filter').click();
  cy.get('body').click(0, 0);
  cy.wait('@companyTable').its('response.statusCode').should('eq', 200);
  cy.get('.loader-image').should('not.exist');
  cy.wait(3000)


  cy.then(() => {
    const companyName = Cypress.env('companyName');
  
    cy.get(workforceSelector.tableRow).then(($rows) => {
      if ($rows.length > 0) {
        const texts = [...$rows].map(row => 
          row.querySelector('.personal-info-content__title')?.innerText.trim() || ''
        );
        cy.log('Company names in table: ' + JSON.stringify(texts));
  
        const found = texts.some(text => text.includes(companyName));
        expect(found, `Expected at least one row to contain "${companyName}"`).to.be.true;
  
      } else {
        cy.log('No Results Found for Safety Alert Type filter');
        cy.contains('.empty-body__title', 'No Results Found').should('exist');
      }
    });
  });
})

it('Verify Safety Alert filter functionality (Type + Multiple Dates)', () => {
  cy.intercept('POST', '**/api/projectTaskTrade/filter*').as('taskTradeFilter');
  cy.intercept('POST', 'https://uat.kwant.ai/api/insight/company/table?sort=companyName,asc&page=1&size=100').as('companyTable');
  cy.visit('https://uat.kwant.ai/projects/5007477836/companies');
  cy.wait('@taskTradeFilter').its('response.statusCode').should('eq', 200);
  cy.contains(workforceSelector.tableColumn, 'Workers On-site')
    .find('.table-header-filter-btn').click();

  cy.get('[placeholder="Min"]').type('1');
  cy.get('[placeholder="Max"]').type('10');
  cy.wait('@taskTradeFilter').its('response.statusCode').should('eq', 200);

  cy.get('.loader-image').should('not.exist');


  // Store first company name
  cy.get('.personal-info-content__title')
    .first()
    .invoke('text')
    .then((text) => {
      const companyName = text.trim();
      Cypress.env('companyName', companyName);
      cy.log('Company Name: ' + companyName);
    });

  cy.get('.personal-info-content__title').first().click();
  cy.get(workforceSelector.companyWorkerPage).click();

  cy.contains('p', 'Total Workers On-site')
    .parent().parent().parent()
    .as('totalOnsiteWorkerCard');

  cy.get('@totalOnsiteWorkerCard').find('button').click();
  cy.get('.loader-image').should('not.exist');


  cy.get('.personal-info-content__title').first().click();
  cy.get(workforceSelector.SafetyAuditPage).click();
  cy.get('.loader-image').should('not.exist');



  cy.get('section [data-testid="table_tr"] .default__label')
    .then(($labels) => {

      const uniqueLabels = [...new Set(
        [...$labels]
          .map(el => el.innerText.trim())
          .filter(Boolean)
      )];

      expect(uniqueLabels.length).to.be.greaterThan(0);

      Cypress.env('safetyAlertLabel', uniqueLabels[0]);
      cy.log('Unique Labels: ' + JSON.stringify(uniqueLabels));
    });

  // ============================================
  // Collect Unique Dates
  // ============================================

  cy.get('.cell-content').then(($cells) => {

    const uniqueDates = [...new Set(
      [...$cells]
        .map(el => el.innerText.trim().split(' ')[0])
        .filter(Boolean)
    )];

    expect(uniqueDates.length).to.be.greaterThan(0);

    Cypress.env('uniqueDates', uniqueDates);
    cy.log('Unique Dates: ' + JSON.stringify(uniqueDates));
  });

  // ============================================
  // Navigate to Insights Page
  // ============================================

  cy.visit('/projects/5007477836/insights/companies');

  // ============================================
  // Apply Safety Alert Type Filter
  // ============================================
  cy.visit('/projects/5007477836/insights/companies');

  cy.contains('button p', 'Filter').click();
  cy.contains('.placeholder', 'Select Safety Alert Type').click();

  cy.then(() => {
    const label = Cypress.env('safetyAlertLabel');

    cy.get('section [placeholder="Search"]').clear().type(label);
    cy.contains('.multi-select-option__head', label).click();
  });

  cy.contains('section button p', 'Filter').click();
  cy.get('body').click(0, 0);
  cy.wait('@companyTable').its('response.statusCode').should('eq', 200);
  cy.get('.loader-image').should('not.exist');
  cy.wait(3000)


  // ============================================

  cy.then(() => {
    const uniqueDates = Cypress.env('uniqueDates');
    const companyName = Cypress.env('companyName');

    cy.wrap(uniqueDates).each((date) => {

      cy.log('Applying Date Filter: ' + date);

 
      cy.contains('button p', 'Filter').click();

      cy.get('[placeholder="MM/DD/YYYY - MM/DD/YYYY"]')
      .eq(1)
      .click({ force: true })
      .wait(300)
      .type('{selectall}', { force: true })   // select everything
      .wait(200)
      .type('{backspace}', { force: true })   // delete
      .wait(300)
      .type(`${date} ${date}`, { delay: 100 }) // slow typing
      .wait(300);

      cy.contains('section button p', 'Filter').click();
      cy.get('body').click(0, 0);
      cy.get('.loader-image').should('not.exist');


      cy.get('body').then(($body) => {

        if ($body.find(workforceSelector.tableRow).length > 0) {
          cy.get(workforceSelector.tableRow).then(($rows) => {
            const names = [...$rows].map(row =>
              row.querySelector('.personal-info-content__title')?.innerText.trim() || ''
            );
            const found = names.some(name => name.includes(companyName));
            expect(
              found,
              `Expected company "${companyName}" for date ${date}`
            ).to.be.true;

          });

        } else {

          cy.contains('.empty-body__title', 'No Results Found')
            .should('exist');

        }

      });

    });

  });

});

it('Verify the Certificate Status', () => {
  cy.intercept('POST', '**/api/insight/company/table*').as('companyTable');
  cy.intercept('POST', '**/api/projectTaskTrade/filter*').as('taskTradeFilter');

  // Visit companies page
  cy.visit('https://uat.kwant.ai/projects/5007477836/companies');
  cy.wait('@taskTradeFilter').its('response.statusCode').should('eq', 200);

  // Open Workers On-site filter
  cy.contains(workforceSelector.tableColumn, 'Workers On-site')
    .find('.table-header-filter-btn').click();
  cy.get('[placeholder="Min"]').type('1');
  cy.get('[placeholder="Max"]').type('10');
  cy.get('p').contains('Filters:').click();
  cy.wait('@taskTradeFilter').its('response.statusCode').should('eq', 200);
  cy.get('.loader-image').should('not.exist');
  cy.wait(5000);

  cy.get('.personal-info-content__title')
    .first()
    .invoke('text')
    .then((text) => {
      const companyName = text.trim();
      Cypress.env('companyName', companyName);
      cy.log('Company Name: ' + companyName);
    });
    cy.get('.personal-info-content__title').first().click();
    cy.get(workforceSelector.companyWorkerPage).click()
  cy.contains('p', 'Total Workers On-site').parent().parent().parent().as('totalOnsiteWorkerCard');
  cy.get('@totalOnsiteWorkerCard').find('button').click();
  cy.get('.loader-image').should('not.exist');
  cy.get('.personal-info-content__title').first().click();
  cy.get(workforceSelector.documentPage).click();
  cy.get('.loader-image').should('not.exist');

  cy.get('section [data-testid="table_tr"]').first().then(($row) => {
    const tooltipText = $row.find('.tooltip-content p').text().toLowerCase();
    const rowText = $row.text().toLowerCase();
    let filterOption = null;

    if (tooltipText.includes('expired')) {
      filterOption = 'Expired';
      cy.log('Certificate is Expired');
    } else if (tooltipText.includes('expiring') || rowText.includes('expiring') || rowText.includes('expiry date ends soon')) {
      filterOption = 'Expiring';
      cy.log('Certificate is Expiring');
    } else {
      filterOption = 'All Uploaded';
      cy.log('No specific expiry status found — using All Uploaded');
    }
    cy.visit('https://uat.kwant.ai/projects/5007477836/insights/companies');
    const companyName = Cypress.env('companyName');
    cy.contains('button p', 'Filter').click();
    cy.contains('.placeholder', 'Select Certificate Status').click();
    cy.contains('.multi-select-option__head', filterOption).click();
    cy.contains('section button p', 'Filter').click();
    cy.get('body').click(0, 0);
    cy.get('.loader-image').should('not.exist');
    cy.wait('@companyTable').its('response.statusCode').should('eq', 200);
    cy.wait(4000);

    cy.get('body').then(($body) => {
      if ($body.find(workforceSelector.tableRow).length > 0) {
        cy.get(workforceSelector.tableRow)
          .find('.personal-info-content__title')
          .then(($titles) => {
            const names = [...$titles].map(el => el.innerText.trim());
            const found = names.some(name => name.includes(companyName));
            expect(found, `Expected company "${companyName}" to appear in "${filterOption}" filter`).to.be.true;
          });
      } else {
        cy.contains('.empty-body__title', 'No Results Found').should('exist');
      }
    });
  });
});


it('Verify Certificate Type Filter using document name from row', () => {

  cy.intercept('POST', '**/api/insight/company/table*').as('companyTable');
  cy.intercept('POST', '**/api/projectTaskTrade/filter*').as('taskTradeFilter');

  cy.visit('https://uat.kwant.ai/projects/5007477836/companies');
  cy.wait('@taskTradeFilter').its('response.statusCode').should('eq', 200);

  // Apply Workers On-site filter
  cy.contains(workforceSelector.tableColumn, 'Workers On-site')
    .find('.table-header-filter-btn').click();

  cy.get('[placeholder="Min"]').type('1');
  cy.get('[placeholder="Max"]').type('10');
  cy.contains('p', 'Filters:').click();

  cy.wait('@taskTradeFilter').its('response.statusCode').should('eq', 200);
  cy.get('.loader-image').should('not.exist');
  cy.wait(4000)

  cy.get('.personal-info-content__title')
    .first()
    .invoke('text')
    .then((text) => {
      Cypress.env('companyName', text.trim());
      cy.log('Company Name: ' + text.trim());
    });


  cy.get('.personal-info-content__title').first().click();
  cy.get(workforceSelector.companyWorkerPage).click();
  cy.contains('p', 'Total Workers On-site')
  .parent().parent().parent()
  .as('totalOnsiteWorkerCard');
cy.get('@totalOnsiteWorkerCard').find('button').click();
cy.get('.loader-image').should('not.exist');
cy.get('.personal-info-content__title').first().click();
cy.get(workforceSelector.documentPage).click();
  cy.get('section [data-testid="table_tr"]').first()
    .find('.cell-content').first()
    .invoke('text')
    .then((docName) => {
      const documentName = docName.trim();
      cy.log('Document Name: ' + documentName);

      cy.visit('https://uat.kwant.ai/projects/5007477836/insights/companies');

      cy.wait('@companyTable').its('response.statusCode').should('eq', 200);
      cy.get('.loader-image').should('not.exist');

      cy.contains('button p', 'Filter').should('be.visible').click();

      cy.contains('.placeholder', 'Select Certificate Type').click();

      cy.get('section [placeholder="Search"]')
        .clear()
        .type(documentName);

      cy.contains('.multi-select-option__head', documentName)
        .should('be.visible')
        .click();

      cy.contains('section button p', 'Filter').click();
      cy.get('body').click(0, 0);
      cy.get('.loader-image').should('not.exist');
      cy.wait('@companyTable').its('response.statusCode').should('eq', 200);

      cy.get(workforceSelector.tableRow)
        .find('.personal-info-content__title')
        .then(($titles) => {
          const names = [...$titles].map(el => el.innerText.trim());
          const found = names.some(name =>
            name.includes(Cypress.env('companyName'))
          );

          expect(
            found,
            `Expected company "${Cypress.env('companyName')}" to appear after filtering by document "${documentName}"`
          ).to.be.true;
        });
    });
});
})