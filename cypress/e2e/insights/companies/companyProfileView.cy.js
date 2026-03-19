/// <reference types="cypress" />
import companiesHelper from "../../../support/helper/companiesHelper";
import { workforceSelector } from "../../../support/workforceSelector";

describe("Insights Company - Company Profile View", { tags: ["Epic:WorkForce", "Feature:WorkforceDashboard", "Module:Insights-Company"] }, () => {

  beforeEach(() => {
    cy.intercept('GET', '**/api/projectConfigs**').as('getConfig');
    cy.intercept('GET', '**/api/projectTaskTrade/detail/**').as('taskDetail');

    cy.loginAndVisit(() => companiesHelper.visitCompaniesInsightPage('5007477836'));

    cy.get('.selector-item.last').click();

    cy.wait('@getConfig').then(({ request }) => {
      cy.wrap({
        'x-auth-token': request.headers['x-auth-token'],
        'x-auth-project': request.headers['x-auth-project']
      }).as('authHeaders');
    });
  });

  function selectCompanyRow() {
    cy.get(workforceSelector.tableRow).its('length').should('be.greaterThan', 1);
    cy.get(workforceSelector.tableRow).then(($rows) => {
      const matchedRows = Array.from($rows).filter(row =>
        Number(Cypress.$(row).find('.site-label').text().trim()) >= 1
      );
      expect(matchedRows.length).to.be.gte(2, 'There should be at least two rows with label >=1');

      const selectedWorker = matchedRows[1];
      cy.wrap(selectedWorker).find('input[type="checkbox"]').check({ force: true });

      cy.wrap(selectedWorker).find('.personal-info-content__title').invoke('text').then((text) => {
        const companyName = text.trim();
        cy.log(`Selected company name: ${companyName}`);
        cy.wrap(companyName).as('companyName');

        cy.get('.onsite-selected-container .personal-info-content__title')
          .contains(companyName)
          .should('be.visible');
      });
    });
  }

  it('Insights-Company - Verify selected company name appears in onsite selection panel', {
    tags: ["Story:Company Selection Display", "Severity:critical", "UI", "Module:Insights-Company"]
  }, () => {
    let selectedWorker;
    let companyName;

    cy.get(workforceSelector.tableRow).its('length').should('be.greaterThan', 1);
    cy.get(workforceSelector.tableRow).then(($rows) => {
      const matchedRows = Array.from($rows).filter(row =>
        Number(Cypress.$(row).find('.site-label').text().trim()) >= 1
      );
      expect(matchedRows.length).to.be.gte(2, 'There should be at least two rows with label >=1');

      selectedWorker = matchedRows[1];
      cy.wrap(selectedWorker).find('input[type="checkbox"]').check({ force: true });

      cy.wrap(selectedWorker).find('.personal-info-content__title').invoke('text').then((text) => {
        companyName = text.trim();
        cy.log(`Selected company name: ${companyName}`);

        cy.get('.onsite-selected-container .personal-info-content__title')
          .contains(companyName)
          .should('be.visible');
      });
    });
  });

  it('Insights-Company - Verify company full profile opens with correct details', {
    tags: ["Story:Open Company Profile", "Severity:critical", "UI", "Module:Insights-Company"]
  }, () => {
    selectCompanyRow();

    cy.get('@companyName').then((companyName) => {
      cy.get('button').contains('Full Profile').click();
      cy.get('p').contains(companyName).should('be.visible');
    });
  });

  it('Insights-Company - Validate worker dashboard counts against API response', {
    tags: ["Story:Worker Counts Validation", "Severity:blocker", "API", "Module:Insights-Company"]
  }, () => {
    const workerCounts = {};

    selectCompanyRow();

    cy.get('@companyName').then((companyName) => {
      cy.get('button').contains('Full Profile').click();
      cy.get('p').contains(companyName).should('be.visible');

      // Wait for projectTaskTrade API and capture lastId
      cy.wait('@taskDetail').then(({ request }) => {
        const lastId = request.url.split('/').pop();
        cy.log(`✅ projectTaskTradeId: ${lastId}`);

        // Fetch API data with authHeaders from beforeEach alias
        cy.get('@authHeaders').then((authHeaders) => {
          cy.request({
            method: 'GET',
            url: `https://uat.kwant.ai/api/projectTaskTrade/detail/${lastId}`,
            headers: authHeaders,
          }).then((apiResponse) => {
            const apiWorkers = apiResponse.body.workers || {};
            cy.log('📌 API Worker Counts:', JSON.stringify(apiWorkers));

            // Capture UI counts
            cy.get(workforceSelector.companyWorkerPage).click();
            cy.get('div.details, div.other-counts, div.count-card').each(($section) => {
              cy.wrap($section).within(() => {
                cy.get('p').then(($ps) => {
                  for (let i = 0; i < $ps.length; i += 2) {
                    const label = $ps.eq(i).text().trim();
                    const countText = $ps.eq(i + 1)?.text()?.trim() || '0';
                    const count = parseInt(countText.replace(/\D/g, '')) || 0;
                    workerCounts[label] = count;
                    cy.log(`📌 UI ${label}: ${count}`);
                  }
                });
              });
            }).then(() => {
              cy.log('✅ UI Worker Counts Object:', JSON.stringify(workerCounts));

              const mapping = {
                'Total Workers': 'totalWorker',
                'Total Workers On-site': 'onsiteWorker',
                'Flagged Workers On-site': 'flaggedWorker',
                'Workers With Safety Alerts': 'totalSafetyAlerts'
              };

              Object.keys(mapping).forEach(uiLabel => {
                const apiKey = mapping[uiLabel];
                if (workerCounts[uiLabel] !== undefined && apiWorkers[apiKey] !== undefined) {
                  expect(workerCounts[uiLabel]).to.eq(apiWorkers[apiKey]);
                  cy.log(`✔ Matched ${uiLabel}: UI=${workerCounts[uiLabel]}, API=${apiWorkers[apiKey]}`);
                }
              });
            });
          });
        });
      });
    });
  });

  it('Insights-Company - Validate company general details match API data', {
    tags: ["Story:General Details Validation", "Severity:critical", "API", "Module:Insights-Company"]
  }, () => {
    const generalDetails = {};

    selectCompanyRow();

    cy.get('@companyName').then((companyName) => {
      cy.get('button').contains('Full Profile').click();
      cy.get('p').contains(companyName).should('be.visible');

      // Wait for UI fields to render
      cy.wait(2000);
      cy.get('.hover-hoc-container').each(($container) => {
        const label = $container.find('.hover-hoc-container__label').text().trim();
        const value = $container.find('.hover-hoc-container__input__display-value').text().trim();
        if (label) generalDetails[label] = value;
      }).then(() => {
        cy.log('📌 General Details UI Object:', JSON.stringify(generalDetails));

        cy.wait('@taskDetail').then(({ request }) => {
          const lastId = request.url.split('/').pop();
          cy.log(`✅ projectTaskTradeId: ${lastId}`);

          // Fetch API data using authHeaders from beforeEach alias
          cy.get('@authHeaders').then((authHeaders) => {
            cy.request({
              method: 'GET',
              url: `https://uat.kwant.ai/api/projectTaskTrade/detail/${lastId}`,
              headers: authHeaders
            }).then((apiResp) => {
              const apiData = apiResp.body || {};
              cy.log('📌 API General Details:', JSON.stringify(apiData));

              Object.keys(generalDetails).forEach(label => {
                const uiVal = generalDetails[label].trim().toLowerCase();
                let apiVal = '';

                switch (label) {
                  case 'Company Name':
                    apiVal = apiData.name?.trim().toLowerCase(); break;
                  case 'Status':
                    apiVal = apiData.status?.trim().toLowerCase(); break;
                  case 'Project Manager':
                    apiVal = apiData.projectManagerName?.trim().toLowerCase(); break;
                  case 'Safety Manager':
                    apiVal = apiData.safetyManagerName?.trim().toLowerCase(); break;
                  default: apiVal = '';
                }

                if (apiVal) {
                  expect(uiVal).to.eq(apiVal);
                  cy.log(`✔ Matched ${label}: UI="${generalDetails[label]}", API="${apiVal}"`);
                }
              });
            });
          });
        });
      });
    });
  });

  it('Insights-Company - Validate document records with strict API matching', {
    tags: ["Story:Document Verification", "Severity:blocker", "API", "Module:Insights-Company"]
  }, () => {
    const uiDocuments = [];

    // Normalize function: trim, lowercase, treat '-' and ' ' as same
    const normalize = (str) => {
      if (!str) return '';
      str = str.toString().trim().toLowerCase();
      if (str === '-' || str === '') return 'placeholder';
      return str.replace(/\s+/g, ' '); // collapse multiple spaces to single
    };

    const normalizeDate = (dateStr) => {
      if (!dateStr || dateStr === '-' || dateStr === '') return '';
      if (dateStr.includes('/')) {
        const [month, day, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      if (dateStr.includes('T')) return dateStr.split('T')[0];
      return dateStr;
    };

    // Select company row and get its name
    selectCompanyRow();

    cy.get('@companyName').then((companyName) => {
      cy.get('button').contains('Full Profile').click();
      cy.get('p').contains(companyName).should('be.visible');

      // Navigate to Document page
      cy.get(workforceSelector.documentPage).click();

      // Capture UI documents
      cy.get(workforceSelector.documentTableRow)
        .should('be.visible')
        .and('have.length.greaterThan', 0)
        .each(($row) => {
          const doc = {};
          cy.wrap($row).find('.cell-content').then(($cells) => {
            doc.name = $cells.eq(0).text().trim();
            doc.expiry = $cells.eq(1).text().trim();
            doc.credentialId = $cells.eq(2).text().trim();
            uiDocuments.push(doc);
          });
        }).then(() => {
          cy.log('📄 Captured UI documents:', JSON.stringify(uiDocuments));

          // Wait for projectTaskTrade API
          cy.wait('@taskDetail').then(({ request }) => {
            const lastId = request.url.split('/').pop();
            cy.log(`✅ projectTaskTradeId: ${lastId}`);

            // Fetch API data using authHeaders from beforeEach alias
            cy.get('@authHeaders').then((authHeaders) => {
              cy.request({
                method: 'GET',
                url: `https://uat.kwant.ai/api/projectTaskTrade/detail/${lastId}`,
                headers: authHeaders
              }).then((apiResp) => {
                const apiDocs = apiResp.body.documents?.docList || [];
                cy.log('📌 API documents:', JSON.stringify(apiDocs));

                // Strict match each UI doc
                uiDocuments.forEach((uiDoc) => {
                  cy.log(`🔍 Validating document: ${uiDoc.name}`);

                  const match = apiDocs.find(apiDoc =>
                    normalize(apiDoc.documentType) === normalize(uiDoc.name)
                  );

                  if (!match) {
                    throw new Error(`❌ No API match found for document: ${uiDoc.name}`);
                  }

                  const apiExpiry = normalizeDate(match.expiryDate || '-');
                  const uiExpiry = normalizeDate(uiDoc.expiry || '-');

                  // Treat '-' and blank as same
                  if (apiExpiry !== uiExpiry) {
                    throw new Error(`❌ Expiry mismatch for ${uiDoc.name}: UI="${uiDoc.expiry}" vs API="${match.expiryDate}"`);
                  }

                  const apiCred = normalize(match.credentialId || '-');
                  const uiCred = normalize(uiDoc.credentialId || '-');

                  if (uiCred !== apiCred) {
                    throw new Error(`❌ CredentialId mismatch for ${uiDoc.name}: UI="${uiDoc.credentialId}" vs API="${match.credentialId}"`);
                  }

                  cy.log(`✔ Document validated: ${uiDoc.name} | Expiry: ${apiExpiry} | CredentialId: ${apiCred}`);
                });

                cy.log('🎯 All documents validated successfully!');
              });
            });
          });
        });
    });
  });

});