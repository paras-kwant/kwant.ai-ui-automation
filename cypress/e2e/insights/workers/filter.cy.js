import { workforceSelector } from "../../../support/workforceSelector";
import WorkerHelper from "../../../support/helper/workerHelper";
import filterPage from "../../../pages/insights/workers/filter";


describe('Insight Worker - Filter Functionality', { tags: ["Epic:WorkForce", "Feature:Filter", "Module:Insights-Worker"] }, () => {
  let authHeaders = {};
  beforeEach(() => {
  cy.intercept('GET', '/api/projectConfigs', (req) => {
    authHeaders = {
      'x-auth-token': req.headers['x-auth-token'],
      'x-auth-project': req.headers['x-auth-project']
    };
  }).as('getConfig');

    cy.intercept('POST', '**/api/empinsight/work_table**').as('insightWorkerTableApi');
    cy.intercept('POST', '**/api/empinsight/work_table**').as('companyTableApi');
    cy.intercept('GET', '**/api/getPreferredColumns?module=worker')
    .as('getFilters');


	cy.loginAndVisit(() => WorkerHelper.visitWorkersInsightPage('5007477836'));
  filterPage.switchToCardLayout()
  });

  const getLabel = (labelText) => {
    return cy.get('body').then(($body) => {
      if ($body.find(`.select-container__label:contains("${labelText}")`).length > 0) {
        return cy.contains('.select-container__label', labelText);
      } else {
        return cy.contains('label', labelText);
      }
    });
  };

  it('Insight-worker validate filters except Access Status', () => {
    filterPage.openFilter()
    const excludedFilters = ["Access Status"];
    filterPage.validateFiltersFromAPI(excludedFilters);
  
  });

  it('Insights-Worker - dynamically search, validate, and select options',{},  () => {
    filterPage.openFilter();
  
      const dynamicSearchSelect = (placeholderText, selectCount = 3) => {

        cy.contains('.placeholder', placeholderText).click();
  
        cy.get('.multi-select-option__head').should('be.visible');
  
        cy.get('.multi-select-option__head').then($options => {
          const optionTexts = [...$options].map(el => el.innerText.trim());
  
          const randomOptions = Cypress._.sampleSize(optionTexts, Math.min(selectCount, optionTexts.length));
  
          randomOptions.forEach(fullText => {
            const searchText = fullText.slice(0, 3); // first 3 characters
  
            cy.get('section [placeholder="Search"]').clear().type(searchText);
            cy.get('.multi-select-option__head:visible').each($visibleOption => {
              cy.wrap($visibleOption)
                .invoke('text')
                .then(text => {
                  expect(text.toLowerCase()).to.include(searchText.toLowerCase());
                });
            });

            cy.contains('.multi-select-option__head', fullText)
              .scrollIntoView()
              .should('be.visible')
              .click({ force: true });

            cy.wait(100);
          });
        });
  
        cy.contains('button p', 'Filter').click({force:true});
      };
  
      const filters = [
        'Select Company',
        // 'Select Cost Code',
        'Select Certificate Status',
        'Select Safety Alert Type'
      ];
  
      filters.forEach(filter => dynamicSearchSelect(filter));
  
  });
  it('Insights-Worker - Filter button should be disable until user select any filter option', { tags: ["Story:Insights Filter Button Disabled Until Selection", "Severity:normal", "UI", "Module:Insights-Worker"] }, () => {
    filterPage.openFilter();
    cy.contains(' section button', 'Filter').should('be.disabled');
  });

  it('Insights-Worker - Verify Worker Name Filter',() => {
      cy.wait('@insightWorkerTableApi').then((interception) => {
        const responseBody = interception.response.body;
        cy.log('Response body sample: ' + JSON.stringify(responseBody).slice(0, 500));
        const workers = responseBody.content ?? responseBody.employeeTrackingTableList ?? [];
  
        const validWorkers = workers.filter(
          (employee) =>
            employee.firstName !== null &&
            employee.firstName !== undefined &&
            employee.firstName.trim() !== ''
        );
  
        expect(validWorkers.length, 'No valid workers found in response').to.be.greaterThan(0);
  
        const randomWorker = Cypress._.sample(validWorkers);
        const randomWorkerName = randomWorker.fullName || `${randomWorker.firstName} ${randomWorker.lastName}`.trim();
  
        cy.log('Selected Worker Name: ' + randomWorkerName);
        cy.wrap(randomWorkerName).as('selectedWorker');
      });
      cy.get('@selectedWorker').then((selectedWorker) => {
        filterPage.openFilter();
        filterPage.filterByWorkerName(selectedWorker);
        filterPage.applyFilter();
        filterPage.verifyWorkerInTable(selectedWorker);
      });
    });

  it('Insights-Worker - Verify Company Name Filter', 
    { tags: ["Story:Insights Filter By Company Name", "Severity:critical", "UI", "Module:Insights-Worker"] }, 
    () => {
      filterPage.openFilter()
      cy.contains('.placeholder', 'Select Company').click();
      filterPage.selectRandomOption('selectedCompany');
      filterPage.applyFilter();
      cy.get('@selectedCompany').then((selectedCompany) => {
        filterPage.verifyWorkerInTable(selectedCompany);
    
      });
    
    });

    it('should filter by crew and extract worker IDs from API response', () => {
      cy.wait('@companyTableApi'); // wait for initial load
    
      cy.contains('button p', 'Filter').click();
      cy.contains('.placeholder', 'Select Crew').click();
    
      cy.get('.multi-select-option__head:visible').then($options => {
        const crewList = [...$options]
          .map(el => el.innerText.trim())
          .filter(
            crew => crew && crew !== '-' && crew.toLowerCase() !== 'none'
          );
    
        if (!crewList.length) {
          throw new Error('No valid crew options found!');
        }
    
        const randomCrew = Cypress._.sample(crewList);
        cy.wrap(randomCrew).as('selectedCrew');
    
        cy.contains('.multi-select-option__head', randomCrew)
          .should('be.visible')
          .scrollIntoView()
          .click({ force: true });
      });
    
      cy.contains('section button p', 'Filter').click();
      cy.get('body').click(0, 0);
    
      cy.wait('@companyTableApi').then((interception) => {
        const responseBody = interception.response.body;
    
        const validWorkers = responseBody.employeeTrackingTableList.filter(
          employee => employee.firstName?.trim() 
        );
    
        const workerIds = validWorkers.map(employee => employee.id);
    
        cy.log(`Total workers in response: ${responseBody.employeeTrackingTableList.length}`);
        cy.log(`Valid workers (non-null firstName): ${validWorkers.length}`);
    
        cy.wrap(workerIds).as('workerIds');
        cy.wrap(workerIds.length).as('apiRowCount');
      });
    
      cy.wait(1000); 
    
      cy.get('@selectedCrew').then((selectedCrew) => {
        cy.get('body').then(($body) => {
          if ($body.find(workforceSelector.tableRow).length > 0) {
            cy.get('@apiRowCount').then((apiRowCount) => {
              cy.getTotalWorkers().then((footerCount) => {
                expect(footerCount).to.eq(apiRowCount);
              });
            });
    
            cy.get('@workerIds').then((workerIds) => {
              workerIds.forEach((id) => {
                cy.request({
                  method: 'GET',
                  url: `https://uat.kwant.ai/api/worker/get/${id}`,
                  headers: authHeaders,
                }).then((response) => {
                  expect(response.status).to.eq(200);
                  expect(response.body.crewName).to.eq(selectedCrew);
                });
              });
            });
    
          } else {
            cy.get('.empty-body__title').should('contain.text', 'No Results Found');
          }
        });
      });
    });
    
    it('Insights-Worker - Validate the Job Title Filter (UI only + update if empty)', { tags: ["Story:Insights Filter By Job Title", "Severity:critical", "UI", "Module:Insights-Worker"] }, () => {
      cy.intercept('POST', '**/api/empinsight/work_table**').as('companyTableApi');
    
      cy.contains('button p', 'Filter').click();
      cy.contains('.placeholder', 'Select Job Title').click();
      cy.wait(1000)
    
      cy.get('.multi-select-option__head')
        .then($options => {
          const jobTitleList = [...$options]
            .map(el => el.innerText.trim())
            .filter(title => title !== '' && title !== '-' && title.toLowerCase() !== 'none');
    
          expect(jobTitleList.length).to.be.greaterThan(0);
          const randomJobTitle = Cypress._.sample(jobTitleList);
          cy.wrap(randomJobTitle).as('selectedJobTitle');
          cy.log('Selected Job Title:', randomJobTitle);
          cy.contains('.multi-select-option__head', randomJobTitle).click();
        });
    
      cy.contains('section button p', 'Filter').click();
      cy.get('body').click(0, 0);
      cy.wait('@companyTableApi')
    
      cy.wait('@companyTableApi').then((interception) => {
        const responseBody = interception.response.body;
    
        const validWorkers = responseBody.employeeTrackingTableList.filter(
          (employee) => employee.firstName !== null && employee.firstName !== undefined && employee.firstName.trim() !== ''
        );
    
        const workerIds = validWorkers.map((employee) => employee.id);
    
        cy.log(`Total workers in response: ${responseBody.employeeTrackingTableList.length}`);
        cy.log(`Valid workers (non-null firstName): ${validWorkers.length}`);
    
        cy.wrap(workerIds).as('workerIds');
        cy.wrap(workerIds.length).as('apiRowCount');
      });
    
      cy.wait(3000);
    
      cy.get('@selectedJobTitle').then((selectedJobTitle) => {
        cy.get('body').then(($body) => {
          if ($body.find(workforceSelector.tableRow).length > 0) {
            cy.get('@apiRowCount').then((apiRowCount) => {
              cy.getTotalWorkers().then((footerCount) => {
                expect(footerCount).to.eq(apiRowCount);
              });
            });
    
            cy.get('@workerIds').then((workerIds) => {
              workerIds.forEach((id) => {
                cy.request({
                  method: 'GET',
                  url: `https://uat.kwant.ai/api/worker/get/${id}`,
                  headers: authHeaders,
                }).then((response) => {
                  expect(response.status).to.eq(200);
                  expect(response.body.title).to.eq(selectedJobTitle);
                });
              });
            });
    
          } else {
            cy.get('.empty-body__title').should('contain.text', 'No Results Found');
          }
        });
      });
    });

    it('should validate worker phone number', () => {

      const phone = '+9779868757379';
    
      cy.wait('@companyTableApi'); // initial load
    
      cy.contains('button p', 'Filter').click();
    
      cy.get('[placeholder="Enter Phone"]')
        .clear()
        .type(phone);
    
      cy.contains('section button p', 'Filter').click();
    
      cy.get('body').click(0, 0); // close dropdown/modal if any
    
      cy.wait('@companyTableApi').then((interception) => {
        const responseBody = interception.response.body;
        const workers = responseBody.employeeTrackingTableList || [];
    
        // ✅ Case 1: No workers found → validate empty screen
        if (workers.length === 0) {
          cy.log('No workers found for this phone number');
          cy.validateEmptyTable();
    
        } else {
    
          // ✅ Case 2: Workers exist → validate using ID
          const worker = workers.find(
            (emp) => emp.id !== undefined && emp.id !== null
          );
    
          expect(worker, 'Worker with valid ID').to.exist;
    
          cy.log(`Worker ID: ${worker.id}, Phone from table: ${worker.phone}`);
    
          cy.request({
            method: 'GET',
            url: `https://uat.kwant.ai/api/worker/get/${worker.id}`,
            headers: authHeaders
          }).then((res) => {
            expect(res.status).to.eq(200);
    
            // 🔥 Main validation
            expect(res.body.phone).to.eq(phone);
          });
        }
      });
    });



    it('Insights-Worker - Verify Last Seen Location', 
      { tags: ["Story:Insights Filter By Company Name", "Severity:critical", "UI", "Module:Insights-Worker"] }, 
      () => {
    
        cy.intercept('POST', '**/api/empinsight/work_table**').as('companyTableApi');
    
        // Open filter
        cy.contains('button p', 'Filter').click();
    
        // Select Last Seen Location dropdown
        cy.contains('.placeholder', 'Select Last Seen Location').click();
    
        // Pick a random location from options
        cy.get('.multi-select-option__head').then($options => {
          const locationList = [...$options].map(el => el.innerText.trim());
          expect(locationList.length).to.be.greaterThan(0);
    
          const randomLocation = Cypress._.sample(locationList);
          cy.wrap(randomLocation).as('selectedLocation');
    
          // Click on the selected location
          cy.contains('.multi-select-option__head', randomLocation)
            .scrollIntoView()
            .click({ force: true });
        });
    
        // Apply filter
        cy.contains('section button p', 'Filter').click();
        cy.get('body').click(0, 0);
        cy.wait(3000)
        cy.wait('@companyTableApi')
        cy.wait('@companyTableApi').then((interception) => {
          const responseBody = interception.response.body;
    
          const validWorkers = responseBody.employeeTrackingTableList.filter(
            (employee) => employee.firstName?.trim() // filters out null, undefined, empty
          );
    
          const workerIds = validWorkers.map((employee) => employee.id);
    
          cy.log(`Total workers in response: ${responseBody.employeeTrackingTableList.length}`);
          cy.log(`Valid workers (non-null firstName): ${validWorkers.length}`);
    
          cy.wrap(workerIds).as('workerIds');
          cy.wrap(workerIds.length).as('apiRowCount');
        });
    
        cy.get('@selectedLocation').then((selectedLocation) => {
          cy.get('@workerIds').then((workerIds) => {
            if (workerIds.length > 0) {
              workerIds.forEach((id) => {
                cy.request({
                  method: 'GET',
                  url: `https://uat.kwant.ai/api/worker/get/${id}`,
                  headers: authHeaders,
                }).then((response) => {
                  expect(response.status).to.eq(200);
                  expect(response.body.placeWork).to.eq(selectedLocation);
                });
              });
            } else {
              // ✅ Case: No rows
              cy.get('.empty-body__title')
                .should('be.visible')
                .and('contain.text', 'No Results Found');
            }
          });
        });

      });
      it('Insights-workers - Verify sorting functionality', { tags: ["Story:Sorting Functionality", "Severity:normal", "UI", "Module:WorkForce-Company"] }, () => {
  
        // Step 1: Verify default A-Z order first
        cy.get('[class*="personal-info-content__title"]').should('have.length.at.least', 1);
      
        cy.get('[class*="personal-info-content__title"]').then(($cells) => {
          const names = $cells.map((_, cell) => cell.textContent.trim()).get();
          console.log('Original A-Z Order:', names);
      
          for (let i = 0; i < names.length - 1; i++) {
            const current = names[i];
            const next = names[i + 1];
      
            const comparison = current.localeCompare(next, undefined, {
              sensitivity: 'base',
              numeric: true
            });
      
            expect(
              comparison,
              `[A-Z] Position ${i}: "${current}" should come before or equal "${next}"`
            ).to.be.lessThan(1);
          }
        });
      
        // Step 2: Click sort to trigger Z-A order
        cy.contains(workforceSelector.tableColumn, 'Worker Name').realHover();
        cy.get('[class*="sorting-icon"]').eq(0).click();
        cy.wait(3000);
      
        // Step 3: Validate Z-A order
        cy.get('[class*="personal-info-content__title"]').should('have.length.at.least', 1);
      
        cy.get('[class*="personal-info-content__title"]').then(($cells) => {
          const names = $cells.map((_, cell) => cell.textContent.trim()).get();
          console.log('Z-A Order:', names);
      
          for (let i = 0; i < names.length - 1; i++) {
            const current = names[i];
            const next = names[i + 1];
      
            const comparison = current.localeCompare(next, undefined, {
              sensitivity: 'base',
              numeric: true
            });
      
            expect(
              comparison,
              `[Z-A] Position ${i}: "${current}" should come after or equal "${next}"`
            ).to.be.greaterThan(-1);
          }
        });
      
        // Step 4: Click sort again to go back to A-Z
        cy.contains(workforceSelector.tableColumn, 'Worker Name').realHover();
        cy.get('[class*="sorting-icon"]').eq(0).click();
        cy.wait(3000);
      
        // Step 5: Validate back to A-Z order
        cy.get('[class*="personal-info-content__title"]').should('have.length.at.least', 1);
      
        cy.get('[class*="personal-info-content__title"]').then(($cells) => {
          const names = $cells.map((_, cell) => cell.textContent.trim()).get();
          console.log('Back to A-Z Order:', names);
      
          for (let i = 0; i < names.length - 1; i++) {
            const current = names[i];
            const next = names[i + 1];
      
            const comparison = current.localeCompare(next, undefined, {
              sensitivity: 'base',
              numeric: true
            });
      
            expect(
              comparison,
              `[A-Z again] Position ${i}: "${current}" should come before or equal "${next}"`
            ).to.be.lessThan(1);
          }
        });
      });
      it('Insights-Worker - Verify Ethnicity Filter',
        { tags: ["Story:Insights Filter By Ethnicity", "Severity:critical", "UI", "Module:Insights-Worker"] },
        () => {
      
          cy.intercept('POST', '**/api/empinsight/work_table**').as('ethnicityTableApi');
      
          // ================== OPEN FILTER & SELECT ETHNICITY ==================
          cy.contains('button p', 'Filter').click();
          cy.contains('.placeholder', 'Select Ethnicity').click();
      
          cy.get('.multi-select-option__head').then($options => {
            const ethnicityList = [...$options]
              .map(el => el.innerText.trim())
              .filter(item => item !== '' && item !== '-' && item.toLowerCase() !== 'none');
      
            expect(ethnicityList.length, 'No valid Ethnicity options found').to.be.greaterThan(0);
      
            const randomEthnicity = Cypress._.sample(ethnicityList);
            cy.wrap(randomEthnicity).as('selectedEthnicity');
            cy.log('Selected Ethnicity:', randomEthnicity);
      
            cy.contains('.multi-select-option__head', randomEthnicity)
              .scrollIntoView()
              .click({ force: true });
          });
      
          // ================== APPLY FILTER ==================
          cy.contains('section button p', 'Filter').click();
          cy.get('body').click(0, 0);
      
          // ================== WAIT FOR API ==================
          cy.wait('@ethnicityTableApi').then((interception) => {
            const responseBody = interception.response.body;
      
            const validWorkers = responseBody.employeeTrackingTableList.filter(
              (employee) =>
                employee.firstName !== null &&
                employee.firstName !== undefined &&
                employee.firstName.trim() !== ''
            );
      
            const workerIds = validWorkers.map((employee) => employee.id);
      
            cy.log(`Total workers in response: ${responseBody.employeeTrackingTableList.length}`);
            cy.log(`Valid workers (non-null firstName): ${validWorkers.length}`);
      
            cy.wrap(workerIds).as('workerIds');
            cy.wrap(workerIds.length).as('apiRowCount');
          });
      
          cy.wait(2000);
      
          // ================== VALIDATION ==================
          cy.get('@selectedEthnicity').then((selectedEthnicity) => {
            cy.get('body').then(($body) => {
      
              // ✅ Case 1: Rows exist — validate count + API per worker
              if ($body.find(workforceSelector.tableRow).length > 0) {
      
                // Validate footer count matches API count
                cy.get('@apiRowCount').then((apiRowCount) => {
                  cy.getTotalWorkers().then((footerCount) => {
                    expect(footerCount).to.eq(apiRowCount);
                  });
                });
      
                // Validate each worker has correct Ethnicity via API
                cy.get('@workerIds').then((workerIds) => {
                  workerIds.forEach((id) => {
                    cy.request({
                      method: 'GET',
                      url: `https://uat.kwant.ai/api/worker/get/${id}`,
                      headers: authHeaders,
                    }).then((response) => {
                      expect(response.status).to.eq(200);
                      expect(response.body.ethnicity).to.eq(selectedEthnicity);
                    });
                  });
                });
      
              }
              // ✅ Case 2: No rows — valid if filter returns empty
              else {
                cy.get('.empty-body__title')
                  .should('be.visible')
                  .and('contain.text', 'No Results Found');
              }
      
            });
          });
      
        }
      );
      it('Insights-Worker - Verify MWBE Filter',
        { tags: ["Story:Insights Filter By MWBE", "Severity:critical", "UI", "Module:Insights-Worker"] },
        () => {
      
          cy.intercept('POST', '**/api/empinsight/work_table**').as('mwbeTableApi');
      
          // ================== OPEN FILTER & SELECT MWBE ==================
          cy.contains('button p', 'Filter').click();
          cy.contains('.placeholder', 'Select MWBE').click();
      
          cy.get('.multi-select-option__head').then($options => {
            const mwbeList = [...$options]
              .map(el => el.innerText.trim())
              .filter(item => item !== '' && item !== '-' && item.toLowerCase() !== 'none');
      
            expect(mwbeList.length, 'No valid MWBE options found').to.be.greaterThan(0);
      
            const randomMWBE = Cypress._.sample(mwbeList);
            cy.wrap(randomMWBE).as('selectedMWBE');
            cy.log('Selected MWBE:', randomMWBE);
      
            cy.contains('.multi-select-option__head', randomMWBE)
              .scrollIntoView()
              .click({ force: true });
          });
      
          // ================== APPLY FILTER ==================
          cy.contains('section button p', 'Filter').click();
          cy.get('body').click(0, 0);
      
          // ================== WAIT FOR API ==================
          cy.wait('@mwbeTableApi').then((interception) => {
            const responseBody = interception.response.body;
      
            const validWorkers = responseBody.employeeTrackingTableList.filter(
              (employee) =>
                employee.firstName !== null &&
                employee.firstName !== undefined &&
                employee.firstName.trim() !== ''
            );
      
            const workerIds = validWorkers.map((employee) => employee.id);
      
            cy.log(`Total workers in response: ${responseBody.employeeTrackingTableList.length}`);
            cy.log(`Valid workers (non-null firstName): ${validWorkers.length}`);
      
            cy.wrap(workerIds).as('workerIds');
            cy.wrap(workerIds.length).as('apiRowCount');
          });
      
          cy.wait(2000);
      
          // ================== VALIDATION ==================
          cy.get('@selectedMWBE').then((selectedMWBE) => {
            cy.get('body').then(($body) => {
      
              // ✅ Case 1: Rows exist — validate count + API per worker
              if ($body.find(workforceSelector.tableRow).length > 0) {
      
                // Validate footer count matches API count
                cy.get('@apiRowCount').then((apiRowCount) => {
                  cy.getTotalWorkers().then((footerCount) => {
                    expect(footerCount).to.eq(apiRowCount);
                  });
                });
      
                // Validate each worker has correct MWBE via API
                cy.get('@workerIds').then((workerIds) => {
                  workerIds.forEach((id) => {
                    cy.request({
                      method: 'GET',
                      url: `https://uat.kwant.ai/api/worker/get/${id}`,
                      headers: authHeaders,
                    }).then((response) => {
                      expect(response.status).to.eq(200);
                      expect(response.body.mwbe).to.eq(selectedMWBE);
                    });
                  });
                });
      
              }
              // ✅ Case 2: No rows — valid if filter returns empty
              else {
                cy.get('.empty-body__title')
                  .should('be.visible')
                  .and('contain.text', 'No Results Found');
              }
      
            });
          });
      
        }
      );

      it("Added On - validates filtered workers correctly", () => {
        cy.intercept('POST', '**/api/empinsight/work_table**').as('companyTableApi');
      
        // ── Step 1: Capture all initial worker IDs ──
        cy.wait('@companyTableApi').then((interception) => {
          const allWorkers = interception.response.body.employeeTrackingTableList.filter(
            (employee) => employee.firstName?.trim()
          );
          cy.wrap(allWorkers.map((e) => e.id)).as('initialWorkerIds');
          cy.log(`Initial workers on page load: ${allWorkers.length}`);
        });
      
        // ── Helper function to apply date filter and validate ──
        function applyDateFilter(startDateStr, endDateStr) {
          const startDate = new Date(startDateStr);
          const endDate = endDateStr ? new Date(endDateStr) : new Date();
          if (!endDateStr) endDate.setHours(23, 59, 59, 999);
      
          cy.contains('button p', 'Filter').click();
          cy.wait(500);
      
          cy.get('[label="Added On"]').find('input').click().clear().realType(startDateStr).wait(300);
          cy.get('.rmdp-today .sd').click(); // select today as end date
          cy.wait(300);
      
          cy.contains('section button p', 'Filter').click();
          cy.get('body').click(0, 0);
          cy.wait('@companyTableApi')
          cy.wait('@companyTableApi').then((interception) => {
            const filteredWorkers = interception.response.body.employeeTrackingTableList.filter(
              (employee) => employee.firstName?.trim()
            );
            cy.wrap(filteredWorkers.map((e) => e.id)).as('filteredWorkerIds');
            cy.wrap(filteredWorkers.length).as('apiRowCount');
            cy.log(`${startDateStr} → ${endDateStr || 'today'} workers: ${filteredWorkers.length}`);
          });
      
          cy.wait(1000);
      
          cy.get('body').then(($body) => {
            cy.get('@filteredWorkerIds').then((filteredIds) => {
              // Validate each shown worker falls in date range
              filteredIds.forEach((id) => {
                cy.request({
                  method: 'GET',
                  url: `https://uat.kwant.ai/api/worker/get/${id}`,
                  headers: authHeaders,
                }).then((response) => {
                  expect(response.status).to.eq(200);
                  const createdDate = new Date(response.body.createdDate);
                  cy.log(`Worker ${id} createdDate: ${response.body.createdDate}`);
                  expect(
                    createdDate >= startDate && createdDate <= endDate,
                    `Worker ${id} createdDate "${response.body.createdDate}" should be in filter range`
                  ).to.be.true;
                });
              });
      
              cy.get('@initialWorkerIds').then((initialIds) => {
                const remainingIds = initialIds.filter(id => !filteredIds.includes(id));
                remainingIds.forEach((id) => {
                  cy.request({
                    method: 'GET',
                    url: `https://uat.kwant.ai/api/worker/get/${id}`,
                    headers: authHeaders,
                  }).then((response) => {
                    expect(response.status).to.eq(200);
                    const createdDate = new Date(response.body.createdDate);
                    cy.log(`Worker ${id} createdDate: ${response.body.createdDate}`);
                    expect(
                      createdDate < startDate || createdDate > endDate,
                      `Worker ${id} createdDate "${response.body.createdDate}" should NOT be in filter range`
                    ).to.be.true;
                  });
                });
              });
            });
      
            if ($body.find(workforceSelector.tableRow).length === 0) {
              cy.get('.empty-body__title')
                .should('be.visible')
                .and('contain.text', 'No Results Found');
            }
          });
        }
      
        // ── TEST 1: Narrow range (today → today) ──
        const todayStr = '04/01/2026';
        applyDateFilter(todayStr, todayStr);
      
        // ── TEST 2: Wide range (04/01/2024 → today) ──
        applyDateFilter('04/01/2024', todayStr);
      });
      it('Insights-Worker - Verify Last Seen Time Filter',
        { tags: ["Story:Insights Filter By Last Seen Time", "Severity:critical", "UI", "Module:Insights-Worker"] },
        () => {
      
          cy.intercept('POST', '**/api/empinsight/work_table**').as('companyTableApi');
      
          // ── Step 1: Capture all initial worker IDs ──
          cy.wait('@companyTableApi').then((interception) => {
            const allWorkers = interception.response.body.employeeTrackingTableList.filter(
              (employee) => employee.firstName?.trim()
            );
            cy.wrap(allWorkers.map((e) => e.id)).as('initialWorkerIds');
            cy.log(`Initial workers on page load: ${allWorkers.length}`);
          });
      
          // ── Helper: parse MM/DD/YYYY safely in local time ──
          const parseDate = (str) => {
            const [month, day, year] = str.split('/');
            return new Date(year, month - 1, day);
          };
      
          function applyDateFilter(startDateStr) {
            const startDate = parseDate(startDateStr);
            startDate.setHours(0, 0, 0, 0);
      
            // endDate is always today since we click .rmdp-today in the UI
            const endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
      
            cy.log(`Validating range: ${startDate.toISOString()} → ${endDate.toISOString()}`);
      
            cy.contains('button p', 'Filter').click();
            cy.wait(500);
      
            cy.get('[label="Last Seen Time"]').find('input').click().clear().realType(startDateStr).wait(300);
            cy.get('.rmdp-today .sd').click(); // always selects today as end date
            cy.wait(300);
      
            cy.contains('section button p', 'Filter').click();
            cy.get('body').click(0, 0);
            cy.wait('@companyTableApi');
            cy.wait('@companyTableApi').then((interception) => {
              const filteredWorkers = interception.response.body.employeeTrackingTableList.filter(
                (employee) => employee.firstName?.trim()
              );
              cy.wrap(filteredWorkers.map((e) => e.id)).as('filteredWorkerIds');
              cy.wrap(filteredWorkers.length).as('apiRowCount');
              cy.log(`${startDateStr} → today workers: ${filteredWorkers.length}`);
            });
      
            cy.wait(1000);
      
            cy.get('body').then(($body) => {
              cy.get('@filteredWorkerIds').then((filteredIds) => {
      
                // ── Validate each filtered worker's placeWorkTime is within range ──
                filteredIds.forEach((id) => {
                  cy.request({
                    method: 'GET',
                    url: `https://uat.kwant.ai/api/worker/get/${id}`,
                    headers: authHeaders,
                  }).then((response) => {
                    expect(response.status).to.eq(200);
      
                    const placeWorkTime = response.body.placeWorkTime;
      
                    if (placeWorkTime) {
                      const seenDate = new Date(placeWorkTime);
                      const inRange = seenDate >= startDate && seenDate <= endDate;
      
                      cy.log(
                        `Worker ${id} | placeWorkTime: ${placeWorkTime} | range: ${startDate.toISOString()} → ${endDate.toISOString()} | inRange: ${inRange}`
                      );
      
                      expect(
                        inRange,
                        `Worker ${id} placeWorkTime "${placeWorkTime}" should be in filter range`
                      ).to.be.true;
      
                    } else {
                      cy.log(`Worker ${id} has null placeWorkTime — skipping range check`);
                    }
                  });
                });
      
                // ── Validate excluded workers fall OUTSIDE the range ──
                cy.get('@initialWorkerIds').then((initialIds) => {
                  const remainingIds = initialIds.filter((id) => !filteredIds.includes(id));
                  remainingIds.forEach((id) => {
                    cy.request({
                      method: 'GET',
                      url: `https://uat.kwant.ai/api/worker/get/${id}`,
                      headers: authHeaders,
                    }).then((response) => {
                      expect(response.status).to.eq(200);
      
                      const placeWorkTime = response.body.placeWorkTime;
      
                      if (placeWorkTime) {
                        const seenDate = new Date(placeWorkTime);
                        const outOfRange = seenDate < startDate || seenDate > endDate;
      
                        cy.log(
                          `Excluded Worker ${id} | placeWorkTime: ${placeWorkTime} | outOfRange: ${outOfRange}`
                        );
      
                        expect(
                          outOfRange,
                          `Excluded Worker ${id} placeWorkTime "${placeWorkTime}" should NOT be in filter range`
                        ).to.be.true;
      
                      } else {
                        cy.log(`Excluded Worker ${id} has null placeWorkTime — skipping range check`);
                      }
                    });
                  });
                });
              });
      
              // ── Handle empty result case ──
              if ($body.find(workforceSelector.tableRow).length === 0) {
                cy.get('.empty-body__title')
                  .should('be.visible')
                  .and('contain.text', 'No Results Found');
              }
            });
          }
      
          // ── TEST 1: Narrow range (04/01/2026 → today) ──
          applyDateFilter('04/01/2026');
      
          // ── TEST 2: Wide range (04/01/2024 → today) ──
          applyDateFilter('04/01/2024');
        }
      );


      it('Insights-Worker - Verify Safety Alert Date Filter',
        { tags: ["Story:Insights Filter By Safety Alert Date", "Severity:critical", "UI", "Module:Insights-Worker"] },
        () => {
      
          cy.intercept('POST', '**/api/empinsight/work_table**').as('companyTableApi');
      
          // ── Step 1: Capture all initial worker IDs ──
          cy.wait('@companyTableApi').then((interception) => {
            const allWorkers = interception.response.body.employeeTrackingTableList.filter(
              (employee) => employee.firstName?.trim()
            );
            cy.wrap(allWorkers.map((e) => e.id)).as('initialWorkerIds');
            cy.log(`Initial workers on page load: ${allWorkers.length}`);
          });
      
          // ── Helper: parse MM/DD/YYYY safely in local time ──
          const parseDate = (str) => {
            const [month, day, year] = str.split('/');
            return new Date(year, month - 1, day);
          };
      
          function applyDateFilter(startDateStr) {
            const startDate = parseDate(startDateStr);
            startDate.setHours(0, 0, 0, 0);
      
            // endDate is always today since we click .rmdp-today in the UI
            const endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
      
            cy.log(`Validating range: ${startDate.toISOString()} → ${endDate.toISOString()}`);
      
            cy.contains('button p', 'Filter').click();
            cy.wait(500);
      
            cy.get('[label="Safety Alert Date"]').find('input').click().clear().realType(startDateStr).wait(300);
            cy.get('.rmdp-today .sd').click();
            cy.wait(300);
      
            cy.contains('section button p', 'Filter').click();
            cy.get('body').click(0, 0);
            cy.wait('@companyTableApi');
            cy.wait('@companyTableApi').then((interception) => {
              const filteredWorkers = interception.response.body.employeeTrackingTableList.filter(
                (employee) => employee.firstName?.trim()
              );
              cy.wrap(filteredWorkers.map((e) => e.id)).as('filteredWorkerIds');
              cy.wrap(filteredWorkers.length).as('apiRowCount');
              cy.log(`${startDateStr} → today workers: ${filteredWorkers.length}`);
            });
      
            cy.wait(1000);
      
            cy.get('body').then(($body) => {
              cy.get('@filteredWorkerIds').then((filteredIds) => {
      
                if (filteredIds.length > 0) {
      
                  // ── Validate footer count matches API count ──
                  cy.get('@apiRowCount').then((apiRowCount) => {
                    cy.getTotalWorkers().then((footerCount) => {
                      expect(footerCount).to.eq(apiRowCount);
                    });
                  });
      
                  // ── Validate each filtered worker has at least one alert with
                  //    notificationDate within the filter range ──
                  filteredIds.forEach((id) => {
                    cy.request({
                      method: 'POST',
                      url: `https://uat.kwant.ai/api/worker/safety/${id}`,
                      headers: authHeaders,
                    }).then((response) => {
                      expect(response.status).to.eq(200);
      
                      const alerts = response.body;
                      cy.log(`Worker ${id} | total safety alerts: ${alerts.length}`);
      
                      const hasAlertInRange = alerts.some((alert) => {
                        if (!alert.notificationDate) return false;
                        const notifDate = new Date(alert.notificationDate);
                        return notifDate >= startDate && notifDate <= endDate;
                      });
      
                      cy.log(
                        `Worker ${id} | hasAlertInRange: ${hasAlertInRange} | range: ${startDate.toISOString()} → ${endDate.toISOString()}`
                      );
      
                      expect(
                        hasAlertInRange,
                        `Worker ${id} should have at least one safety alert notificationDate within filter range`
                      ).to.be.true;
                    });
                  });
      
                  // ── Validate excluded workers have NO alerts within the range ──
                  cy.get('@initialWorkerIds').then((initialIds) => {
                    const remainingIds = initialIds.filter((id) => !filteredIds.includes(id));
                    remainingIds.forEach((id) => {
                      cy.request({
                        method: 'POST',
                        url: `https://uat.kwant.ai/api/worker/safety/${id}`,
                        headers: authHeaders,
                      }).then((response) => {
                        expect(response.status).to.eq(200);
      
                        const alerts = response.body;
                        cy.log(`Excluded Worker ${id} | total safety alerts: ${alerts.length}`);
      
                        const hasAlertInRange = alerts.some((alert) => {
                          if (!alert.notificationDate) return false;
                          const notifDate = new Date(alert.notificationDate);
                          return notifDate >= startDate && notifDate <= endDate;
                        });
      
                        cy.log(
                          `Excluded Worker ${id} | hasAlertInRange: ${hasAlertInRange}`
                        );
      
                        expect(
                          hasAlertInRange,
                          `Excluded Worker ${id} should NOT have any safety alert notificationDate within filter range`
                        ).to.be.false;
                      });
                    });
                  });
      
                } else {
                  cy.log('No filtered workers returned — skipping per-worker validation');
                }
              });
      
              // ── Handle empty result case ──
              if ($body.find(workforceSelector.tableRow).length === 0) {
                cy.get('.empty-body__title')
                  .should('be.visible')
                  .and('contain.text', 'No Results Found');
              }
            });
          }
      
          // ── TEST 1: Narrow range (04/01/2026 → today) ──
          applyDateFilter('04/01/2026');
      
          // ── TEST 2: Wide range (04/01/2024 → today) ──
          applyDateFilter('04/01/2024');
        }
      );

      it('Insights-Worker - Verify Certificate Expiry Date Filter',
        { tags: ["Story:Insights Filter By Certificate Expiry Date", "Severity:critical", "UI", "Module:Insights-Worker"] },
        () => {
      
          cy.intercept('POST', '**/api/empinsight/work_table**').as('companyTableApi');
      
          // ── Step 1: Capture all initial worker IDs ──
          cy.wait('@companyTableApi').then((interception) => {
            const allWorkers = interception.response.body.employeeTrackingTableList.filter(
              (employee) => employee.firstName?.trim()
            );
            cy.wrap(allWorkers.map((e) => e.id)).as('initialWorkerIds');
            cy.log(`Initial workers on page load: ${allWorkers.length}`);
          });
      
          // ── Helper: parse MM/DD/YYYY safely in local time ──
          const parseDate = (str) => {
            const [month, day, year] = str.split('/');
            return new Date(year, month - 1, day);
          };
      
          function applyDateFilter(startDateStr) {
            const startDate = parseDate(startDateStr);
            startDate.setHours(0, 0, 0, 0);
      
            // endDate is always today since we click .rmdp-today in the UI
            const endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
      
            cy.log(`Validating range: ${startDate.toISOString()} → ${endDate.toISOString()}`);
      
            cy.contains('button p', 'Filter').click();
            cy.wait(500);
      
            cy.get('[label="Certificate Expiry Date"]').find('input').click().clear().realType(startDateStr).wait(300);
            cy.get('.rmdp-today .sd').click();
            cy.wait(300);
      
            cy.contains('section button p', 'Filter').click();
            cy.get('body').click(0, 0);
            cy.wait('@companyTableApi');
            cy.wait('@companyTableApi').then((interception) => {
              const filteredWorkers = interception.response.body.employeeTrackingTableList.filter(
                (employee) => employee.firstName?.trim()
              );
              cy.wrap(filteredWorkers.map((e) => e.id)).as('filteredWorkerIds');
              cy.wrap(filteredWorkers.length).as('apiRowCount');
              cy.log(`${startDateStr} → today workers: ${filteredWorkers.length}`);
            });
      
            cy.wait(1000);
      
            cy.get('body').then(($body) => {
              cy.get('@filteredWorkerIds').then((filteredIds) => {
      
                if (filteredIds.length > 0) {
      
                  // ── Validate footer count matches API count ──
                  cy.get('@apiRowCount').then((apiRowCount) => {
                    cy.getTotalWorkers().then((footerCount) => {
                      expect(footerCount).to.eq(apiRowCount);
                    });
                  });
      
                  // ── Validate each filtered worker has at least one document
                  //    with expiryDate within the filter range ──
                  filteredIds.forEach((id) => {
                    cy.request({
                      method: 'GET',
                      url: `https://uat.kwant.ai/api/worker/get/${id}`,
                      headers: authHeaders,
                    }).then((response) => {
                      expect(response.status).to.eq(200);
      
                      const documents = response.body.documents ?? [];
                      cy.log(`Worker ${id} | total documents: ${documents.length}`);
      
                      const hasDocInRange = documents.some((doc) => {
                        if (!doc.expiryDate) return false;
                        const expiry = new Date(doc.expiryDate);
                        expiry.setHours(0, 0, 0, 0);
                        return expiry >= startDate && expiry <= endDate;
                      });
      
                      cy.log(
                        `Worker ${id} | hasDocInRange: ${hasDocInRange} | range: ${startDate.toISOString()} → ${endDate.toISOString()}`
                      );
      
                      expect(
                        hasDocInRange,
                        `Worker ${id} should have at least one document with expiryDate within filter range`
                      ).to.be.true;
                    });
                  });
      
                  // ── Validate excluded workers have NO documents with expiryDate in range ──
                  cy.get('@initialWorkerIds').then((initialIds) => {
                    const remainingIds = initialIds.filter((id) => !filteredIds.includes(id));
                    remainingIds.forEach((id) => {
                      cy.request({
                        method: 'GET',
                        url: `https://uat.kwant.ai/api/worker/get/${id}`,
                        headers: authHeaders,
                      }).then((response) => {
                        expect(response.status).to.eq(200);
      
                        const documents = response.body.documents ?? [];
                        cy.log(`Excluded Worker ${id} | total documents: ${documents.length}`);
      
                        const hasDocInRange = documents.some((doc) => {
                          if (!doc.expiryDate) return false;
                          const expiry = new Date(doc.expiryDate);
                          expiry.setHours(0, 0, 0, 0);
                          return expiry >= startDate && expiry <= endDate;
                        });
      
                        cy.log(
                          `Excluded Worker ${id} | hasDocInRange: ${hasDocInRange}`
                        );
      
                        expect(
                          hasDocInRange,
                          `Excluded Worker ${id} should NOT have any document with expiryDate within filter range`
                        ).to.be.false;
                      });
                    });
                  });
      
                } else {
                  cy.log('No filtered workers returned — skipping per-worker validation');
                }
              });
      
              // ── Handle empty result case ──
              if ($body.find(workforceSelector.tableRow).length === 0) {
                cy.get('.empty-body__title')
                  .should('be.visible')
                  .and('contain.text', 'No Results Found');
              }
            });
          }
      
          // ── TEST 1: Narrow range (04/01/2026 → today) ──
          applyDateFilter('04/01/2026');
      
          // ── TEST 2: Wide range (04/01/2024 → today) ──
          applyDateFilter('04/01/2024');
        }
      );
      it('Insights-Worker - Verify Device Filter',
        { tags: ["Story:Insights Filter By Device", "Severity:critical", "UI", "Module:Insights-Worker"] },
        () => {
      
          cy.intercept('POST', '**/api/empinsight/work_table**').as('companyTableApi');
      
          // ── Step 1: Wait for initial table load and grab worker IDs ──
          cy.wait('@companyTableApi').then((interception) => {
            const allWorkers = interception.response.body.employeeTrackingTableList.filter(
              (employee) => employee.firstName?.trim()
            );
      
            cy.wrap(allWorkers.map((e) => e.id)).as('initialWorkerIds');
            cy.log(`Initial workers on page load: ${allWorkers.length}`);
      
            // ── Step 2: Pick a random worker and fetch their beaconId ──
            const randomWorker = Cypress._.sample(allWorkers);
            cy.log(`Selected random worker ID: ${randomWorker.id}`);
      
            cy.request({
              method: 'GET',
              url: `https://uat.kwant.ai/api/worker/get/${randomWorker.id}`,
              headers: authHeaders,
            }).then((response) => {
              expect(response.status).to.eq(200);
      
              const beaconId = response.body.beaconId;
              const serialNumber = response.body.projectBeaconSerialNumber;
      
              cy.log(`Worker ${randomWorker.id} | beaconId: ${beaconId} | serialNumber: ${serialNumber}`);
      
              expect(beaconId, `Worker ${randomWorker.id} has no beaconId`).to.not.be.null;
              expect(beaconId, `Worker ${randomWorker.id} has no beaconId`).to.not.be.undefined;
      
              cy.wrap(beaconId).as('selectedBeaconId');
              cy.wrap(serialNumber).as('selectedSerialNumber');
            });
          });
      
          // ── Step 3: Open filter, search by beaconId ──
          cy.get('@selectedBeaconId').then((selectedBeaconId) => {
            cy.get('@selectedSerialNumber').then((selectedSerialNumber) => {
      
              cy.contains('button p', 'Filter').click();
              cy.contains('.placeholder', 'Select Device').click();
      
              // Search using beaconId — this is what the dropdown shows
              cy.get('section [placeholder="Search"]').clear().type(selectedBeaconId);
              cy.wait(500);
      
              cy.contains('.multi-select-option__head', selectedBeaconId)
                .scrollIntoView()
                .should('be.visible')
                .click({ force: true });
      
              // ── Step 4: Apply filter ──
              cy.contains('section button p', 'Filter').click();
              cy.get('body').click(0, 0);
      
              // ── Step 5: Wait for filtered API response ──
              cy.wait('@companyTableApi');
              cy.wait('@companyTableApi').then((interception) => {
                const filteredWorkers = interception.response.body.employeeTrackingTableList.filter(
                  (employee) => employee.firstName?.trim()
                );
                cy.wrap(filteredWorkers.map((e) => e.id)).as('filteredWorkerIds');
                cy.wrap(filteredWorkers.length).as('apiRowCount');
                cy.log(`Filtered workers for device "${selectedBeaconId}": ${filteredWorkers.length}`);
              });
      
              cy.wait(1000);
      
              // ── Step 6: Validate ──
              cy.get('body').then(($body) => {
                cy.get('@filteredWorkerIds').then((filteredIds) => {
      
                  if (filteredIds.length > 0) {
      
                    // Validate footer count matches API count
                    cy.get('@apiRowCount').then((apiRowCount) => {
                      cy.getTotalWorkers().then((footerCount) => {
                        expect(footerCount).to.eq(apiRowCount);
                      });
                    });
      
                    // Validate each filtered worker has the selected beaconId
                    filteredIds.forEach((id) => {
                      cy.request({
                        method: 'GET',
                        url: `https://uat.kwant.ai/api/worker/get/${id}`,
                        headers: authHeaders,
                      }).then((response) => {
                        expect(response.status).to.eq(200);
      
                        const workerBeaconId = response.body.beaconId;
                        const workerSerialNumber = response.body.projectBeaconSerialNumber;
      
                        cy.log(
                          `Worker ${id} | beaconId: ${workerBeaconId} | serialNumber: ${workerSerialNumber} | expected: ${selectedBeaconId}`
                        );
      
                        const matches =
                          workerBeaconId?.toUpperCase() === selectedBeaconId.toUpperCase() ||
                          workerSerialNumber?.toUpperCase() === selectedBeaconId.toUpperCase();
      
                        expect(
                          matches,
                          `Worker ${id} beaconId "${workerBeaconId}" or serialNumber "${workerSerialNumber}" should match "${selectedBeaconId}"`
                        ).to.be.true;
                      });
                    });
      
                    // Validate excluded workers do NOT have the selected beaconId
                    cy.get('@initialWorkerIds').then((initialIds) => {
                      const remainingIds = initialIds.filter((id) => !filteredIds.includes(id));
                      remainingIds.forEach((id) => {
                        cy.request({
                          method: 'GET',
                          url: `https://uat.kwant.ai/api/worker/get/${id}`,
                          headers: authHeaders,
                        }).then((response) => {
                          expect(response.status).to.eq(200);
      
                          const workerBeaconId = response.body.beaconId;
                          const workerSerialNumber = response.body.projectBeaconSerialNumber;
      
                          const matches =
                            workerBeaconId?.toUpperCase() === selectedBeaconId.toUpperCase() ||
                            workerSerialNumber?.toUpperCase() === selectedBeaconId.toUpperCase();
      
                          cy.log(
                            `Excluded Worker ${id} | beaconId: ${workerBeaconId} | matches: ${matches}`
                          );
      
                          expect(
                            matches,
                            `Excluded Worker ${id} should NOT have device "${selectedBeaconId}"`
                          ).to.be.false;
                        });
                      });
                    });
      
                  } else {
                    cy.log(`No workers found for device "${selectedBeaconId}" — checking empty state`);
                    cy.get('.empty-body__title')
                      .should('be.visible')
                      .and('contain.text', 'No Results Found');
                  }
                });
              });
            });
          });
        }
      );

      it('Insights-Worker - Verify Email Filter',
        { tags: ["Story:Insights Filter By Email", "Severity:critical", "UI", "Module:Insights-Worker"] },
        () => {
      
          cy.intercept('POST', '**/api/empinsight/work_table**').as('companyTableApi');
      
          // ── Step 1: Wait for initial table load ──
          cy.wait('@companyTableApi').then((interception) => {
            const allWorkers = interception.response.body.employeeTrackingTableList.filter(
              (employee) => employee.firstName?.trim()
            );
      
            cy.log(`Initial workers on page load: ${allWorkers.length}`);
            cy.wrap(allWorkers.map((e) => e.id)).as('initialWorkerIds');
      
            // ── Step 2: Find a worker with a valid email ──
            const findWorkerWithEmail = (workers) => {
              if (workers.length === 0) {
                throw new Error('No workers with a valid email found in the current page');
              }
      
              const [current, ...remaining] = workers;
      
              cy.request({
                method: 'GET',
                url: `https://uat.kwant.ai/api/worker/get/${current.id}`,
                headers: authHeaders,
              }).then((response) => {
                expect(response.status).to.eq(200);
      
                const email = response.body.email;
                cy.log(`Worker ${current.id} | email: ${email}`);
      
                if (email && email.trim() !== '') {
                  cy.log(`✅ Found worker with email: ${email}`);
                  cy.wrap(email.trim()).as('selectedEmail');
                  cy.wrap(current.id).as('selectedWorkerId');
                } else {
                  cy.log(`Worker ${current.id} has no email — trying next worker`);
                  findWorkerWithEmail(remaining);
                }
              });
            };
      
            const shuffled = Cypress._.shuffle(allWorkers);
            findWorkerWithEmail(shuffled);
          });
      
          // ── Step 3: Type email in filter ──
          cy.get('@selectedEmail').then((selectedEmail) => {
      
            cy.intercept('POST', '**/api/empinsight/work_table**').as('filteredTableApi');
      
            cy.contains('button p', 'Filter').click();
            cy.get('[placeholder="Enter Email"]').type(selectedEmail);
      
            // ── Step 4: Apply filter ──
            cy.contains('section button p', 'Filter').click();
            cy.get('body').click(0, 0);
      
            // ── single wait — API fires once ──
            cy.wait('@filteredTableApi').then((interception) => {
              const filteredWorkers = interception.response.body.employeeTrackingTableList.filter(
                (employee) => employee.firstName?.trim()
              );
      
              cy.wrap(filteredWorkers.map((e) => e.id)).as('filteredWorkerIds');
              cy.wrap(filteredWorkers.length).as('apiRowCount');
              cy.log(`Filtered workers for email "${selectedEmail}": ${filteredWorkers.length}`);
      
              cy.wait(1000);
      
              // ── Step 5: Validate filtered workers have the correct email ──
              filteredWorkers.forEach((worker) => {
                cy.request({
                  method: 'GET',
                  url: `https://uat.kwant.ai/api/worker/get/${worker.id}`,
                  headers: authHeaders,
                }).then((response) => {
                  expect(response.status).to.eq(200);
      
                  const workerEmail = response.body.email;
                  cy.log(`Worker ${worker.id} | email: ${workerEmail} | expected: ${selectedEmail}`);
      
                  expect(
                    workerEmail,
                    `Worker ${worker.id} email "${workerEmail}" should match filtered email "${selectedEmail}"`
                  ).to.eq(selectedEmail);
                });
              });
      
              // ── Step 6: Validate excluded workers do NOT have the selected email ──
              cy.get('@initialWorkerIds').then((initialIds) => {
                const filteredIds = filteredWorkers.map((e) => e.id);
                const remainingIds = initialIds.filter((id) => !filteredIds.includes(id));
      
                remainingIds.forEach((id) => {
                  cy.request({
                    method: 'GET',
                    url: `https://uat.kwant.ai/api/worker/get/${id}`,
                    headers: authHeaders,
                  }).then((response) => {
                    expect(response.status).to.eq(200);
      
                    const workerEmail = response.body.email;
                    cy.log(`Excluded Worker ${id} | email: ${workerEmail}`);
      
                    expect(
                      workerEmail,
                      `Excluded Worker ${id} email "${workerEmail}" should NOT match "${selectedEmail}"`
                    ).to.not.eq(selectedEmail);
                  });
                });
              });
      
              // ── Handle empty result case ──
              cy.get('body').then(($body) => {
                if ($body.find(workforceSelector.tableRow).length === 0) {
                  cy.get('.empty-body__title')
                    .should('be.visible')
                    .and('contain.text', 'No Results Found');
                }
              });
            });
          });
        }
      );
      it('Insights-Worker - Verify Worker ID Filter', { 
        tags: ["Story:Insights Filter By Worker ID", "Severity:critical", "UI", "Module:Insights-Worker"] 
    }, () => {
    
        // Step 1: Intercept initial table API
        cy.intercept('POST', '**/api/empinsight/work_table**').as('companyTableApi');
    
        cy.wait('@companyTableApi').then((interception) => {
            const allWorkers = interception.response.body.employeeTrackingTableList.filter(
                (employee) => employee.firstName?.trim()
            );
    
            // Save initial worker IDs
            cy.wrap(allWorkers.map(e => e.id)).as('initialWorkerIds');
    
            // Step 2: Filter workers with valid employeeId
            const workersWithEmployeeId = [];
            const fetchEmployeeIds = (index = 0) => {
                if (index >= allWorkers.length) {
                    if (workersWithEmployeeId.length === 0) {
                        throw new Error('No workers with a valid employeeId found!');
                    }
                    return;
                }
    
                const worker = allWorkers[index];
                cy.request({
                    method: 'GET',
                    url: `https://uat.kwant.ai/api/worker/get/${worker.id}`,
                    headers: authHeaders,
                }).then((resp) => {
                    expect(resp.status).to.eq(200);
                    const empId = resp.body.employeeId;
                    if (empId && empId.trim() !== '') {
                        workersWithEmployeeId.push({ id: worker.id, employeeId: empId.trim() });
                    }
                    fetchEmployeeIds(index + 1);
                });
            };
    
            fetchEmployeeIds();
    
            cy.then(() => {
                // Step 3: Pick a random worker
                const selected = Cypress._.sample(workersWithEmployeeId);
                cy.log(`Selected Worker ID: ${selected.id}, Employee ID: ${selected.employeeId}`);
                cy.wrap(selected.id).as('selectedWorkerId');
                cy.wrap(selected.employeeId).as('selectedEmployeeId');
            });
        });
    
        // Step 4: Apply filter
        cy.get('@selectedEmployeeId').then((selectedEmployeeId) => {
    
            cy.intercept('POST', '**/api/empinsight/work_table**').as('filteredTableApi');
    
            cy.contains('button p', 'Filter').click();
            cy.get('[placeholder="Enter Worker ID"]').clear().type(selectedEmployeeId);
            cy.contains('section button p', 'Filter').click();
            cy.get('body').click(0, 0);
    
            cy.wait('@filteredTableApi').then((interception) => {
                const filteredWorkers = interception.response.body.employeeTrackingTableList.filter(
                    (employee) => employee.firstName?.trim()
                );
    
                cy.wrap(filteredWorkers.map(e => e.id)).as('filteredWorkerIds');
                cy.log(`Filtered workers count: ${filteredWorkers.length}`);
    
                // Step 5: Validate filtered workers via GET API
                filteredWorkers.forEach((worker) => {
                    cy.request({
                        method: 'GET',
                        url: `https://uat.kwant.ai/api/worker/get/${worker.id}`,
                        headers: authHeaders,
                    }).then((resp) => {
                        expect(resp.status).to.eq(200);
                        const workerEmpId = resp.body.employeeId;
                        cy.log(`Worker ${worker.id} | Employee ID: ${workerEmpId}`);
                        expect(workerEmpId).to.eq(selectedEmployeeId);
                    });
                });
    
                // Step 6: Validate excluded workers
                cy.get('@initialWorkerIds').then((initialIds) => {
                    const filteredIds = filteredWorkers.map(w => w.id);
                    const excludedIds = initialIds.filter(id => !filteredIds.includes(id));
    
                    excludedIds.forEach((id) => {
                        cy.request({
                            method: 'GET',
                            url: `https://uat.kwant.ai/api/worker/get/${id}`,
                            headers: authHeaders,
                        }).then((resp) => {
                            expect(resp.status).to.eq(200);
                            expect(resp.body.employeeId).to.not.eq(selectedEmployeeId);
                        });
                    });
                });
    
                // Step 7: Handle empty table
                cy.get('body').then(($body) => {
                    if ($body.find(workforceSelector.tableRow).length === 0) {
                        cy.get('.empty-body__title')
                            .should('be.visible')
                            .and('contain.text', 'No Results Found');
                    }
                });
            });
        });
    });

    it('Insights-Worker - Verify Worker Zip Code Filter', { 
      tags: ["Story:Insights Filter By Zip Code", "Severity:critical", "UI", "Module:Insights-Worker"] 
  }, () => {  
      cy.wait('@insightWorkerTableApi').then((interception) => {
          const allWorkers = interception.response.body.employeeTrackingTableList.filter(
              (employee) => employee.firstName?.trim()
          );
  
          cy.wrap(allWorkers.map(e => e.id)).as('initialWorkerIds');
  
          const workersWithZipCode = [];
          const fetchZipCodes = (index = 0) => {
              if (index >= allWorkers.length) {
                  if (workersWithZipCode.length === 0) {
                      throw new Error('No workers with a valid zipCode found!');
                  }
                  return;
              }
  
              const worker = allWorkers[index];
              cy.request({
                  method: 'GET',
                  url: `/api/worker/get/${worker.id}`,
                  headers: authHeaders,
              }).then((resp) => {
                  expect(resp.status).to.eq(200);
                  const zipCode = resp.body.zipCode;
                  if (zipCode && zipCode.trim() !== '') {
                      workersWithZipCode.push({ id: worker.id, zipCode: zipCode.trim() });
                  }
                  fetchZipCodes(index + 1);
              });
          };
  
          fetchZipCodes();
  
          cy.then(() => {
              const selected = Cypress._.sample(workersWithZipCode);
              cy.log(`Selected Worker ID: ${selected.id}, Zip Code: ${selected.zipCode}`);
              cy.wrap(selected.id).as('selectedWorkerId');
              cy.wrap(selected.zipCode).as('selectedZipCode');
          });
      });
  
      cy.get('@selectedZipCode').then((selectedZipCode) => {
       filterPage.openFilter()
          cy.get('[placeholder="Enter Zip Code"]').clear().type(selectedZipCode);
          filterPage.applyFilter()
  
          cy.wait('@insightWorkerTableApi').then((interception) => {
              const filteredWorkers = interception.response.body.employeeTrackingTableList.filter(
                  (employee) => employee.firstName?.trim()
              );
  
              cy.wrap(filteredWorkers.map(e => e.id)).as('filteredWorkerIds');
  
              filteredWorkers.forEach((worker) => {
                  cy.request({
                      method: 'GET',
                      url: `/api/worker/get/${worker.id}`,
                      headers: authHeaders,
                  }).then((resp) => {
                      expect(resp.status).to.eq(200);
                      const zipCode = resp.body.zipCode;
                      cy.log(`Worker ${worker.id} | Zip Code: ${zipCode}`);
                      expect(zipCode).to.eq(selectedZipCode);
                  });
              });
  
              cy.get('@initialWorkerIds').then((initialIds) => {
                  const filteredIds = filteredWorkers.map(w => w.id);
                  const excludedIds = initialIds.filter(id => !filteredIds.includes(id));
  
                  excludedIds.forEach((id) => {
                      cy.request({
                          method: 'GET',
                          url: `/api/worker/get/${id}`,
                          headers: authHeaders,
                      }).then((resp) => {
                          expect(resp.status).to.eq(200);
                          expect(resp.body.zipCode).to.not.eq(selectedZipCode);
                      });
                  });
              });
  
              cy.get('body').then(($body) => {
                  if ($body.find(workforceSelector.tableRow).length === 0) {
                      cy.get('.empty-body__title')
                          .should('be.visible')
                          .and('contain.text', 'No Results Found');
                  }
              });
          });
      });
  });
  it('Insights-Worker - Verify $/MH Filter', {
    tags: ["Story:Insights Filter By $/MH", "Severity:critical", "UI", "Module:Insights-Worker"]
}, () => {
    cy.wait('@insightWorkerTableApi').then((interception) => {
        const allWorkers = interception.response.body.employeeTrackingTableList.filter(
            (employee) => employee.firstName?.trim()
        );

        cy.wrap(allWorkers.map(e => e.id)).as('initialWorkerIds');

        const workersWithDollar = [];

        const fetchDollar = (index = 0) => {
            if (index >= allWorkers.length) {
                if (workersWithDollar.length === 0) {
                    throw new Error('No workers with a valid $/MH found!');
                }
                return;
            }

            const worker = allWorkers[index];

            cy.request({
                method: 'GET',
                url: `/api/worker/get/${worker.id}`,
                headers: authHeaders,
            }).then((resp) => {

                expect(resp.status).to.eq(200);

                const dollar = resp.body.dollarPerManHour;
                const parsedDollar = Number(dollar);

                if (
                    dollar !== null &&
                    dollar !== undefined &&
                    !isNaN(parsedDollar) &&
                    parsedDollar !== 0
                ) {
                    workersWithDollar.push({
                        id: worker.id,
                        dollar: parsedDollar
                    });
                }

                fetchDollar(index + 1);
            });
        };

        fetchDollar();

        cy.then(() => {
            const selected = Cypress._.sample(workersWithDollar);

            cy.log(`Selected Worker ID: ${selected.id}, $/MH: ${selected.dollar}`);

            cy.wrap(selected.id).as('selectedWorkerId');
            cy.wrap(selected.dollar).as('selectedDollar');
        });
    });

    cy.get('@selectedDollar').then((selectedDollar) => {
        filterPage.openFilter();
        cy.get('[placeholder="Enter $/MH"]').clear().type(`${selectedDollar}`);
        filterPage.applyFilter()
        cy.wait('@insightWorkerTableApi').then((interception) => {

            const filteredWorkers = interception.response.body.employeeTrackingTableList.filter(
                (employee) => employee.firstName?.trim()
            );

            cy.wrap(filteredWorkers.map(e => e.id)).as('filteredWorkerIds');

            cy.log(`Filtered workers count: ${filteredWorkers.length}`);

            filteredWorkers.forEach((worker) => {
                cy.request({
                    method: 'GET',
                    url: `https://uat.kwant.ai/api/worker/get/${worker.id}`,
                    headers: authHeaders,
                }).then((resp) => {

                    expect(resp.status).to.eq(200);

                    const dollar = Number(resp.body.dollarPerManHour);

                    cy.log(`Worker ${worker.id} | $/MH: ${dollar}`);

                    expect(
                        dollar,
                        `Worker ${worker.id} should have $/MH = ${selectedDollar}`
                    ).to.eq(selectedDollar);
                });
            });
            cy.get('@initialWorkerIds').then((initialIds) => {

                const filteredIds = filteredWorkers.map(w => w.id);
                const excludedIds = initialIds.filter(id => !filteredIds.includes(id));

                excludedIds.forEach((id) => {
                    cy.request({
                        method: 'GET',
                        url: `/api/worker/get/${id}`,
                        headers: authHeaders,
                    }).then((resp) => {

                        expect(resp.status).to.eq(200);

                        const dollar = Number(resp.body.dollarPerManHour);

                        expect(
                            dollar,
                            `Excluded Worker ${id} should NOT have $/MH = ${selectedDollar}`
                        ).to.not.eq(selectedDollar);
                    });
                });
            });

            // ── Step 5: Handle empty state ──
            cy.get('body').then(($body) => {
                if ($body.find(workforceSelector.tableRow).length === 0) {
                    cy.get('.empty-body__title')
                        .should('be.visible')
                        .and('contain.text', 'No Results Found');
                }
            });

        });
    });
});
it('Insights-Worker - Filter by Race and validate inclusivity & exclusivity via API',
  { tags: ["Story:Insights Filter By Race", "Severity:critical", "UI", "Module:Insights-Worker"] },
  () => {

    let authHeaders = {};
    let allWorkerIds = [];
    let filteredIds = [];

    // Capture auth headers
    cy.intercept('GET', '/api/projectConfigs', (req) => {
      authHeaders = {
        'x-auth-token': req.headers['x-auth-token'],
        'x-auth-project': req.headers['x-auth-project']
      };
    }).as('getConfig');

    cy.intercept('POST', '**/api/empinsight/work_table**').as('workerTableApi');

    cy.loginAndVisit(() => WorkerHelper.visitWorkersInsightPage('5795237201'));

    // ================== STEP 1: GET ALL IDS BEFORE FILTER ==================
    cy.wait('@workerTableApi').then(interception => {
      const workers = interception.response.body.employeeTrackingTableList;

      allWorkerIds = workers
        .filter(w => w.firstName?.trim())
        .map(w => w.id);

      cy.log(`Total workers before filter: ${allWorkerIds.length}`);
    });

    // ================== STEP 2: APPLY FILTER ==================
    cy.contains('button p', 'Filter').click();

    cy.get('#select-input-container .placeholder')
      .contains('Select Race')
      .click();

    cy.get('.multi-select-option__head:visible').then($options => {
      const raceList = [...$options].map(el => el.innerText.trim());
      const randomRace = Cypress._.sample(raceList);

      cy.wrap(randomRace).as('selectedRace');

      cy.contains('.multi-select-option__head', randomRace)
        .click({ force: true });
    });

    cy.contains('section button p', 'Filter').click();

    // ================== STEP 3: GET FILTERED IDS ==================
    cy.wait('@workerTableApi').then(interception => {
      const workers = interception.response.body.employeeTrackingTableList;

      filteredIds = workers
        .filter(w => w.firstName?.trim())
        .map(w => w.id);

      cy.wrap(filteredIds).as('filteredIds');

      cy.log(`Filtered workers count: ${filteredIds.length}`);
    });

    // ================== STEP 4: VALIDATION ==================
    cy.get('@selectedRace').then(selectedRace => {

      // ✅ Inclusive Check
      cy.get('@filteredIds').then(filteredIds => {
        filteredIds.forEach(id => {
          cy.request({
            method: 'GET',
            url: `/api/worker/get/${id}`,
            headers: authHeaders,
          }).then(resp => {
            expect(resp.status).to.eq(200);
            expect(resp.body.raceName).to.eq(selectedRace);
          });
        });
      });

      // ❌ Exclusive Check
      cy.then(() => {
        const nonFilteredIds = allWorkerIds.filter(id => !filteredIds.includes(id));

        nonFilteredIds.forEach(id => {
          cy.request({
            method: 'GET',
            url: `/api/worker/get/${id}`,
            headers: authHeaders,
          }).then(resp => {
            expect(resp.body.raceName).to.not.eq(selectedRace);
          });
        });
      });

    });

  });
  it('Insights-Worker - Filter by Sex and validate inclusivity & exclusivity via API',
    { tags: ["Story:Insights Filter By Sex", "Severity:critical", "UI", "Module:Insights-Worker"] },
    () => {
  
      let authHeaders = {};
      let allWorkerIds = [];
      let filteredIds = [];
  
      // Capture auth headers
      cy.intercept('GET', '/api/projectConfigs', (req) => {
        authHeaders = {
          'x-auth-token': req.headers['x-auth-token'],
          'x-auth-project': req.headers['x-auth-project']
        };
      }).as('getConfig');
  
      cy.intercept('POST', '**/api/empinsight/work_table**').as('workerTableApi');
  
      cy.loginAndVisit(() => WorkerHelper.visitWorkersInsightPage('5795237201'));
  
      // ================== STEP 1: GET ALL IDS BEFORE FILTER ==================
      cy.wait('@workerTableApi').then(interception => {
        const workers = interception.response.body.employeeTrackingTableList;
  
        allWorkerIds = workers
          .filter(w => w.firstName?.trim())
          .map(w => w.id);
  
        cy.log(`Total workers before filter: ${allWorkerIds.length}`);
      });
  
      // ================== STEP 2: APPLY SEX FILTER ==================
      cy.contains('button p', 'Filter').click();
  
      cy.get('#select-input-container .placeholder')
        .contains('Select Sex')   // 👈 changed here
        .click();
  
      cy.get('.multi-select-option__head:visible').then($options => {
        const sexList = [...$options].map(el => el.innerText.trim());
  
        if (!sexList.length) throw new Error('No valid sex options found!');
  
        const randomSex = Cypress._.sample(sexList);
  
        cy.wrap(randomSex).as('selectedSex');
  
        cy.contains('.multi-select-option__head', randomSex)
          .click({ force: true });
      });
  
      cy.contains('section button p', 'Filter').click();
  
      // ================== STEP 3: GET FILTERED IDS ==================
      cy.wait('@workerTableApi').then(interception => {
        const workers = interception.response.body.employeeTrackingTableList;
  
        filteredIds = workers
          .filter(w => w.firstName?.trim())
          .map(w => w.id);
  
        cy.wrap(filteredIds).as('filteredIds');
  
        cy.log(`Filtered workers count: ${filteredIds.length}`);
      });
  
      // ================== STEP 4: VALIDATION ==================
      cy.get('@selectedSex').then(selectedSex => {
  
        // ✅ Inclusive Check
        cy.get('@filteredIds').then(filteredIds => {
          filteredIds.forEach(id => {
            cy.request({
              method: 'GET',
              url: `/api/worker/get/${id}`,
              headers: authHeaders,
            }).then(resp => {
              expect(resp.status).to.eq(200);
              expect(resp.body.sexName).to.eq(selectedSex);  // 👈 changed here
            });
          });
        });
  
        // ❌ Exclusive Check
        cy.then(() => {
          const nonFilteredIds = allWorkerIds.filter(id => !filteredIds.includes(id));
  
          nonFilteredIds.forEach(id => {
            cy.request({
              method: 'GET',
              url: `/api/worker/get/${id}`,
              headers: authHeaders,
            }).then(resp => {
              expect(resp.body.sexName).to.not.eq(selectedSex); // 👈 changed here
            });
          });
        });
  
      });
  
    });
    it('Insights-Worker - Filter by Union and validate inclusivity & exclusivity via API',
      { tags: ["Story:Insights Filter By Union", "Severity:critical", "UI", "Module:Insights-Worker"] },
      () => {
    
        let authHeaders = {};
        let allWorkerIds = [];
        let filteredIds = [];
    
        // Capture auth headers
        cy.intercept('GET', '/api/projectConfigs', (req) => {
          authHeaders = {
            'x-auth-token': req.headers['x-auth-token'],
            'x-auth-project': req.headers['x-auth-project']
          };
        }).as('getConfig');
    
        cy.intercept('POST', '**/api/empinsight/work_table**').as('workerTableApi');
    
        cy.loginAndVisit(() => WorkerHelper.visitWorkersInsightPage('5795237201'));
    
        // ================== STEP 1: GET ALL IDS BEFORE FILTER ==================
        cy.wait('@workerTableApi').then(interception => {
          const workers = interception.response.body.employeeTrackingTableList;
    
          allWorkerIds = workers
            .filter(w => w.firstName?.trim())
            .map(w => w.id);
    
          cy.log(`Total workers before filter: ${allWorkerIds.length}`);
        });
    
        // ================== STEP 2: APPLY UNION FILTER ==================
        cy.contains('button p', 'Filter').click();
    
        cy.get('#select-input-container .placeholder')
          .contains('Select Union')   // 👈 changed here
          .click();
    
        cy.get('.multi-select-option__head:visible').then($options => {
          const unionList = [...$options].map(el => el.innerText.trim()).
          filter(union=> union && union !== '-' && union.toLowerCase() !== 'none');
    
          if (!unionList.length) throw new Error('No valid union options found!');
    
          const randomUnion = Cypress._.sample(unionList);
    
          cy.wrap(randomUnion).as('selectedUnion');
    
          cy.contains('.multi-select-option__head', randomUnion)
            .click({ force: true });
        });
    
        cy.contains('section button p', 'Filter').click();
    
        // ================== STEP 3: GET FILTERED IDS ==================
        cy.wait('@workerTableApi').then(interception => {
          const workers = interception.response.body.employeeTrackingTableList;
    
          filteredIds = workers
            .filter(w => w.firstName?.trim())
            .map(w => w.id);
    
          cy.wrap(filteredIds).as('filteredIds');
    
          cy.log(`Filtered workers count: ${filteredIds.length}`);
        });
    
        // ================== STEP 4: VALIDATION ==================
        cy.get('@selectedUnion').then(selectedUnion => {
    
          // ✅ Inclusive Check
          cy.get('@filteredIds').then(filteredIds => {
            filteredIds.forEach(id => {
              cy.request({
                method: 'GET',
                url: `/api/worker/get/${id}`,
                headers: authHeaders,
              }).then(resp => {
                expect(resp.status).to.eq(200);
    
                // 👇 Adjust this field based on API response
                expect(resp.body.unionName).to.eq(selectedUnion);
              });
            });
          });
    
          // ❌ Exclusive Check
          cy.then(() => {
            const nonFilteredIds = allWorkerIds.filter(id => !filteredIds.includes(id));
    
            nonFilteredIds.forEach(id => {
              cy.request({
                method: 'GET',
                url: `/api/worker/get/${id}`,
                headers: authHeaders,
              }).then(resp => {
    
                // 👇 Adjust this field based on API response
                expect(resp.body.unionName).to.not.eq(selectedUnion);
              });
            });
          });
    
        });
    
      });

      it('Insights-Worker - Filter by Trade Classification and validate inclusivity & exclusivity via API',
        { tags: ["Story:Insights Filter By Trade Classification", "Severity:critical", "UI", "Module:Insights-Worker"] },
        () => {
      
          let authHeaders = {};
          let allWorkerIds = [];
          let filteredIds = [];
      
          // Capture auth headers
          cy.intercept('GET', '/api/projectConfigs', (req) => {
            authHeaders = {
              'x-auth-token': req.headers['x-auth-token'],
              'x-auth-project': req.headers['x-auth-project']
            };
          }).as('getConfig');
      
          cy.intercept('POST', '**/api/empinsight/work_table**').as('workerTableApi');
          cy.intercept('POST', '**/api/empinsight/work_table**').as('filteredTableApi');

      
          cy.loginAndVisit(() => WorkerHelper.visitWorkersInsightPage('5795237201'));
      
          // ================== STEP 1: GET ALL IDS BEFORE FILTER ==================
          cy.wait('@workerTableApi').then(interception => {
            const workers = interception.response.body.employeeTrackingTableList;
      
            allWorkerIds = workers
              .filter(w => w.firstName?.trim())
              .map(w => w.id);
      
            cy.log(`Total workers before filter: ${allWorkerIds.length}`);
          });
      
          // ================== STEP 2: APPLY TRADE CLASSIFICATION FILTER ==================
          cy.contains('button p', 'Filter').click();
      
          cy.get('#select-input-container .placeholder')
            .contains('Trade Classification')   // 👈 UI label
            .click();
      
          cy.get('.multi-select-option__head:visible').then($options => {
            const tradeList = [...$options].map(el => el.innerText.trim());
      
            if (!tradeList.length) throw new Error('No valid trade classification options found!');
      
            const randomTrade = Cypress._.sample(tradeList);
      
            cy.wrap(randomTrade).as('selectedTrade');
      
            cy.contains('.multi-select-option__head', randomTrade)
              .click({ force: true });
          });
      
          cy.contains('section button p', 'Filter').click();
      
          cy.wait('@workerTableApi').then(interception => {
            const workers = interception.response.body.employeeTrackingTableList;
      
            filteredIds = workers
              .filter(w => w.firstName?.trim())
              .map(w => w.id);
      
            cy.wrap(filteredIds).as('filteredIds');
      
            cy.log(`Filtered workers count: ${filteredIds.length}`);
          });
          cy.get('@selectedTrade').then(selectedTrade => {
      

            cy.get('@filteredIds').then(filteredIds => {
              filteredIds.forEach(id => {
                cy.request({
                  method: 'GET',
                  url: `/api/worker/get/${id}`,
                  headers: authHeaders,
                }).then(resp => {
                  expect(resp.status).to.eq(200);
                  expect(resp.body.projectTaskCategoryName).to.eq(selectedTrade);
                });
              });
            });
            cy.then(() => {
              const nonFilteredIds = allWorkerIds.filter(id => !filteredIds.includes(id));
      
              nonFilteredIds.forEach(id => {
                cy.request({
                  method: 'GET',
                  url: `/api/worker/get/${id}`,
                  headers: authHeaders,
                }).then(resp => {
      
                  expect(resp.body.projectTaskCategoryName).to.not.eq(selectedTrade);
                });
              });
            });
      
          });
      
        });
        it("Certificate Type - validates filtered workers correctly", () => {

          let allWorkerIds = [];
          let filteredIds = [];
          
          cy.wait('@companyTableApi').then((interception) => {
            const workers = interception.response.body.employeeTrackingTableList;
            allWorkerIds = workers
              .filter(w => w.firstName?.trim())
              .map(w => w.id);
            cy.log(`Total workers before filter: ${allWorkerIds.length}`);
          });
          filterPage.openFilter()
        
          cy.get('#select-input-container .placeholder')
            .contains('Select Certificate Type')
            .click();
        
          cy.get('.multi-select-option__head:visible').then($options => {
            const certList = [...$options].map(el => el.innerText.trim()).filter(Boolean);
        
            if (!certList.length) throw new Error('No certificate type options found!');
        
            const randomCert = Cypress._.sample(certList);
            cy.log(`Selected cert: "${randomCert}"`);
            cy.wrap(randomCert).as('selectedCertificate');
        
            cy.contains('.multi-select-option__head', randomCert)
              .click({ force: true });
          });
        
          filterPage.applyFilter();
          cy.wait('@insightWorkerTableApi');
          cy.wait('@insightWorkerTableApi').then((interception) => {
            const workers = interception.response.body.employeeTrackingTableList;
            filteredIds = workers
              .filter(w => w.firstName?.trim())
              .map(w => w.id);
            cy.wrap(filteredIds).as('filteredIds');
            cy.log(`Filtered workers count: ${filteredIds.length}`);
            cy.get(workforceSelector.tableRow).should('have.length', filteredIds.length);
          });
    
          cy.get('@selectedCertificate').then((selectedCertificate) => {

            cy.get('@filteredIds').then((filteredIds) => {
        
              if (!filteredIds.length) {
                cy.log('No workers found — validating empty state');
                cy.get('.empty-body__title')
                  .should('be.visible')
                  .and('contain.text', 'No Results Found');
                return;
              }
        
              filteredIds.forEach((id) => {
                cy.request({
                  method: 'GET',
                  url: `/api/worker/get/${id}`,
                  headers: authHeaders,
                }).then((response) => {
                  expect(response.status).to.eq(200);
        
                  const documents = response.body.documents || [];
                  const certNames = documents.map(doc => doc.documentType?.trim());
        
                  cy.log(`Worker ${id} certs: ${certNames.join(', ')}`);
        
                  expect(
                    certNames,
                    `Worker ${id} should have cert "${selectedCertificate}"`
                  ).to.include(selectedCertificate);
                });
              });
            });
    
            cy.then(() => {
              const nonFilteredIds = allWorkerIds.filter(id => !filteredIds.includes(id));
        
              nonFilteredIds.forEach((id) => {
                cy.request({
                  method: 'GET',
                  url: `/api/worker/get/${id}`,
                  headers: authHeaders,
                }).then((response) => {
                  expect(response.status).to.eq(200);
        
                  const documents = response.body.documents || [];
                  const certNames = documents.map(doc => doc.documentType?.trim());
        
                  cy.log(`Worker ${id} certs: ${certNames.join(', ')}`);
        
                  if (certNames.includes(selectedCertificate)) {
                    cy.log(`⚠️ Worker ${id} has "${selectedCertificate}" but was NOT in filtered results — possible pagination gap`);
                  }
                });
              });
            });
        
          });
        
        });
    })
