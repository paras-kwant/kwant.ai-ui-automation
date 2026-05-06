/// <reference types="cypress" />
import companiesHelper from "../../../support/helper/companiesHelper";
import { workforceSelector } from "../../../support/workforceSelector";

describe("Insights Company - Company Profile View", { tags: ["Epic:WorkForce", "Feature:WorkforceDashboard", "Module:Insights-Company"] }, () => {

  beforeEach(() => {
    cy.intercept('GET', '**/api/projectConfigs**').as('getConfig');
    cy.intercept('GET', '**/api/projectTaskTrade/detail/**').as('taskDetail');

    cy.loginAndVisit(() => companiesHelper.visitCompaniesInsightPage('5795237201'));

    cy.wait(2000);
    cy.get('.selector-item.last').click();
    cy.get('.selector-item.last').should('have.class', 'active');

    cy.wait('@getConfig').then(({ request }) => {
      cy.wrap({
        'x-auth-token': request.headers['x-auth-token'],
        'x-auth-project': Number(request.headers['x-auth-project'])
      }).as('authHeaders');
    });
  });

  function selectCompanyRow() {
    cy.get(workforceSelector.tableRow).its('length').should('be.greaterThan', 1);
    cy.get(workforceSelector.tableRow).eq(1).then(($row) => {
      cy.wrap($row).find('input[type="checkbox"]').check({ force: true });

      cy.wrap($row).find('.personal-info-content__title').invoke('text').then((text) => {
        const companyName = text.trim();
        cy.wrap(companyName).as('companyName');

        cy.get('.onsite-selected-container .personal-info-content__title')
          .contains(companyName)
          .should('be.visible');
      });
    });
  }

  it('Insights-Company - Verify selected company name appears in onsite selection panel', {
    tags: ["Story:Company Selection Display", "Severity:critical", "UI", "@smoke"]
  }, () => {
    cy.get(workforceSelector.tableRow).its('length').should('be.greaterThan', 1);
    cy.get(workforceSelector.tableRow).eq(1).then(($row) => {
      cy.wrap($row).find('input[type="checkbox"]').check({ force: true });

      cy.wrap($row).find('.personal-info-content__title').invoke('text').then((text) => {
        const companyName = text.trim();

        cy.get('.onsite-selected-container .personal-info-content__title')
          .contains(companyName)
          .should('be.visible');
      });
    });
  });

  it('Insights-Company - Verify company full profile opens with correct details', {
    tags: ["Story:Open Company Profile", "Severity:critical", "UI", "@smoke"]
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

      cy.wait('@taskDetail').then(({ request }) => {
        const lastId = request.url.split('/').pop();

        cy.get('@authHeaders').then((authHeaders) => {
          cy.request({
            method: 'GET',
            url: `https://uat.kwant.ai/api/projectTaskTrade/detail/${lastId}`,
            headers: authHeaders,
          }).then((apiResponse) => {
            const apiWorkers = apiResponse.body.workers || {};

            cy.get(workforceSelector.companyWorkerPage).click();
            cy.get('div.details, div.other-counts, div.count-card').each(($section) => {
              cy.wrap($section).within(() => {
                cy.get('p').then(($ps) => {
                  for (let i = 0; i < $ps.length; i += 2) {
                    const label = $ps.eq(i).text().trim();
                    const countText = $ps.eq(i + 1)?.text()?.trim() || '0';
                    const count = parseInt(countText.replace(/\D/g, '')) || 0;
                    workerCounts[label] = count;
                  }
                });
              });
            }).then(() => {
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

      cy.wait(2000);
      cy.get('.hover-hoc-container').each(($container) => {
        const label = $container.find('.hover-hoc-container__label').text().trim();
        const value = $container.find('.hover-hoc-container__input__display-value').text().trim();
        if (label) generalDetails[label] = value;
      }).then(() => {
        cy.wait('@taskDetail').then(({ request }) => {
          const lastId = request.url.split('/').pop();

          cy.get('@authHeaders').then((authHeaders) => {
            cy.request({
              method: 'GET',
              url: `https://uat.kwant.ai/api/projectTaskTrade/detail/${lastId}`,
              headers: authHeaders
            }).then((apiResp) => {
              const apiData = apiResp.body || {};

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
  
    const normalize = (str) => {
      if (!str) return '';
      str = str.toString().trim().toLowerCase();
      if (str === '-' || str === '') return 'placeholder';
      return str.replace(/\s+/g, ' ');
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
  
    selectCompanyRow();
  
    cy.get('@companyName').then((companyName) => {
      cy.get('button').contains('Full Profile').click();
      cy.get('p').contains(companyName).should('be.visible');
  
      cy.get(workforceSelector.documentPage).click();
  
      cy.wait('@taskDetail').then(({ request }) => {
        const lastId = request.url.split('/').pop();
  
        cy.get('@authHeaders').then((authHeaders) => {
          cy.request({
            method: 'GET',
            url: `https://uat.kwant.ai/api/projectTaskTrade/detail/${lastId}`,
            headers: authHeaders
          }).then((apiResp) => {
            const apiDocs = apiResp.body.documents?.docList || [];
  
            cy.get('body').then(($body) => {
              const rows = $body.find(workforceSelector.documentTableRow);
  
              if (rows.length === 0) {
                expect(apiDocs.length).to.eq(0);
                return;
              }
  
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
                  uiDocuments.forEach((uiDoc) => {
                    const match = apiDocs.find(apiDoc =>
                      normalize(apiDoc.documentType) === normalize(uiDoc.name)
                    );
  
                    if (!match) {
                      throw new Error(`❌ No API match found for document: ${uiDoc.name}`);
                    }
  
                    const apiExpiry = normalizeDate(match.expiryDate || '-');
                    const uiExpiry = normalizeDate(uiDoc.expiry || '-');
  
                    if (apiExpiry !== uiExpiry) {
                      throw new Error(`❌ Expiry mismatch for ${uiDoc.name}: UI="${uiDoc.expiry}" vs API="${match.expiryDate}"`);
                    }
  
                    const apiCred = normalize(match.credentialId || '-');
                    const uiCred = normalize(uiDoc.credentialId || '-');
  
                    if (uiCred !== apiCred) {
                      throw new Error(`❌ CredentialId mismatch for ${uiDoc.name}: UI="${uiDoc.credentialId}" vs API="${match.credentialId}"`);
                    }
                  });
                });
            });
          });
        });
      });
    });
  });

  it("Insight-Company - Verify Company Row Status Colors Match Expected Values", () => {
    cy.intercept("GET", "**/projectTaskTrade/detail/*").as("getDetail");

    cy.get(workforceSelector.tableRow).eq(1).as("row");

    cy.get("@row")
      .find(".row_status_tooltip_container")
      .invoke("text")
      .then((tooltipText) => {
        const uiText = tooltipText.toLowerCase();
        cy.wrap(uiText).as("uiText");
      });

    cy.get("@row").find('input[type="checkbox"]').check({ force: true });
    cy.contains("button", "Full Profile").click();

    cy.wait("@getDetail").then((interception) => {
      const companyId = interception.request.url.split("/").pop();

      cy.get("@authHeaders").then((authHeaders) => {
        cy.request({
          method: "GET",
          url: `https://uat.kwant.ai/api/projectTaskTrade/detail/${companyId}`,
          headers: authHeaders,
        }).then((apiResp) => {
          const workers = apiResp.body.workers;

          cy.get("@uiText").then((uiText) => {
            const hasFlagged = workers.flaggedWorker > 0 || workers.unauthorizedWorker > 0;
            const hasSafety = workers.totalSafetyAlerts > 0;

            if (uiText.includes("flagged") || uiText.includes("unauthorized")) {
              expect(hasFlagged, "API should have flagged/unauthorized").to.be.true;
            } else if (
              uiText.includes("fatigue") ||
              uiText.includes("safety") ||
              uiText.includes("sos") ||
              uiText.includes("fall")
            ) {
              expect(hasSafety, "API should have safety alerts").to.be.true;
            } else {
              expect(hasFlagged, "No flagged workers expected").to.be.false;
              expect(hasSafety, "No safety alerts expected").to.be.false;
            }
          });
        });
      });
    });
  });

});