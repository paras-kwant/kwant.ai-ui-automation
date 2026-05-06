/// <reference types="cypress" />

import companyProfilePage from '../../../pages/insights/workers/workerProfileView'
import { workforceSelector } from '../../../support/workforceSelector';

describe("Insights Worker - Worker Profile View", { tags: ["Epic:WorkForce", "Feature:WorkforceDashboard"] }, () => {

  beforeEach(() => {
    companyProfilePage.interceptGetConfig();
    companyProfilePage.interceptTaskDetail();

    companyProfilePage.visit('5007477836');
    companyProfilePage.switchToCardLayout();
    companyProfilePage.captureAuthHeaders();
  });


  it('Insights-Worker - Verify selected company name appears in onsite selection panel', {
    tags: ["Story:Company Selection Display", "Severity:critical", "UI", "Module:Insights-Company"]
  }, () => {
    companyProfilePage.selectRandomCompanyRow();

    cy.get('@companyName').then((companyName) => {
      companyProfilePage.assertCompanyNameVisible(companyName);
    });
  });


  it('Insights-Worker - Verify company full profile opens with correct details', {
    tags: ["Story:Open Company Profile", "Severity:critical", "UI", "Module:Insights-Company"]
  }, () => {
    companyProfilePage.selectRandomCompanyRow();

    cy.get('@companyName').then((companyName) => {
      companyProfilePage.clickFullProfile();
      companyProfilePage.assertProfileNameVisible(companyName);
    });
  });


  it('Insights-Worker - Validate company general details match API data',{tags:'@smoke'}, () => {
    companyProfilePage.interceptGetWorker();
    companyProfilePage.selectRandomCompanyRow();

    cy.get('@companyName').then((companyName) => {
      companyProfilePage.clickFullProfile();
      companyProfilePage.assertProfileNameVisible(companyName);

      companyProfilePage.waitForGetWorker().then((interception) => {
        const workerId = companyProfilePage.extractWorkerIdFromURL(interception.request.url);

        companyProfilePage.captureGeneralDetails().then((generalDetails) => {
          cy.get('@authHeaders').then((authHeaders) => {
            companyProfilePage.validateGeneralDetailsAgainstAPI(generalDetails, authHeaders, workerId);
          });
        });
      });
    });
  });



  it('Insight-Worker - Verify Company Row Status Colors Match Expected Values', () => {
    companyProfilePage.interceptGetWorker();
    companyProfilePage.selectRandomRowForStatus();

    companyProfilePage.clickFullProfile();

    companyProfilePage.waitForGetWorker().then((interception) => {
      const workerId = companyProfilePage.extractWorkerIdFromURL(interception.request.url);

      cy.get('@statusColor').then((statusColor) => {
        cy.get('@authHeaders').then((authHeaders) => {
          companyProfilePage.validateStatusColorAgainstAPI(statusColor, authHeaders, workerId);
        });
      });
    });
  });


  it('Insights-Worker - Validate document records with strict API matching', {
    tags: ["Story:Document Verification", "Severity:blocker", "API", "Module:Insights-Company"]
  }, () => {
    companyProfilePage.interceptGetWorker();
    companyProfilePage.selectRandomCompanyRow();

    cy.get('@companyName').then((companyName) => {
      companyProfilePage.clickFullProfile();
      companyProfilePage.assertProfileNameVisible(companyName);

      companyProfilePage.waitForGetWorker().then((interception) => {
        const workerId = companyProfilePage.extractWorkerIdFromURL(interception.request.url);
        cy.log(`✅ workerId: ${workerId}`);
        cy.wait(2000);

        companyProfilePage.clickDocumentPage();

        cy.get('@authHeaders').then((authHeaders) => {
          companyProfilePage.assertDocumentsEmptyOrValidate(authHeaders, workerId);
        });
      });
    });
  });
  it("Verify Worker Row Status Colors for all rows except first",{tags:'@smoke'}, () => {
    cy.wait(3000);
    cy.get(workforceSelector.tableRow).then(($rows) => {
      const totalRows = $rows.length;
      cy.log(`Total rows found: ${totalRows}`);
  
      for (let rowToTest = 1; rowToTest < totalRows; rowToTest++) {
        cy.log(`\n========== Testing Row ${rowToTest} ==========`);
  
        cy.get(workforceSelector.tableRow).eq(rowToTest).as("row");
  
        // 1️⃣ Get tooltip COLOR — use .find() on row directly, no within() needed
        cy.get("@row").then(($row) => {
          const $span = $row.find(".row_status_tooltip_container p span");
          const colorText = $span.length ? $span.text().trim().toLowerCase() : "none";
          cy.log(`Row ${rowToTest} - Tooltip span text: "${colorText}"`);
          cy.wrap(colorText).as("tooltipColor");
        });
  
        // 2️⃣ Uncheck ALL checkboxes across all rows first
        cy.get(workforceSelector.tableRow)
          .find('input[type="checkbox"]')
          .then(($allCheckboxes) => {
            if ($allCheckboxes.length) {
              cy.wrap($allCheckboxes).uncheck({ force: true });
              cy.log(`Unchecked all checkboxes`);
            } else {
              cy.log("No checkboxes found");
            }
          });
  
        // 3️⃣ Check the current row's checkbox
        cy.get("@row").within(() => {
          cy.get('input[type="checkbox"]').then(($checkbox) => {
            if ($checkbox.length && !$checkbox.is(":checked")) {
              cy.wrap($checkbox).check({ force: true });
              cy.log(`Row ${rowToTest} - Checkbox checked`);
            } else {
              cy.log(`Row ${rowToTest} - Checkbox already checked or not present`);
            }
          });
        });
  
        // 4️⃣ Set intercept with UNIQUE alias per row
        const interceptAlias = `getWorkerDetail_row${rowToTest}`;
        cy.intercept("GET", "**/api/worker/get/*").as(interceptAlias);
  
        cy.wait(1000);
        cy.get("button").contains("Full Profile").click({ force: true });
        cy.log(`Row ${rowToTest} - Full Profile clicked`);
  
        // 5️⃣ Wait using the unique alias for this row
        cy.wait(`@${interceptAlias}`).then((interception) => {
          const worker = interception.response.body;
          const workerId = worker.id;
  
          cy.log(`Row ${rowToTest} - Intercepted URL: ${interception.request.url}`);
          cy.log(`Row ${rowToTest} - Worker ID from response: ${workerId}`);
  
          cy.get("@tooltipColor").then((colorText) => {
            cy.get("@authHeaders").then((authHeaders) => {
  
              const hasFlag = worker.flag === true;
              const isUnauthorized = worker.unauthorized === true;
  
              cy.log(`Row ${rowToTest} | color: "${colorText}" | flag: ${hasFlag} | unauthorized: ${isUnauthorized}`);
  
              if (colorText.includes("red")) {
                // ✅ RED — flag or unauthorized must be true
                expect(
                  hasFlag || isUnauthorized,
                  `Row ${rowToTest} - RED: flag or unauthorized must be true for worker ${workerId}`
                ).to.be.true;
  
              } else if (colorText.includes("yellow")) {
                // ✅ YELLOW — expired docs or safety alert must exist
                cy.request({
                  method: "POST",
                  url: `/api/worker/safety/${workerId}`,
                  headers: authHeaders,
                }).then((safetyResp) => {
                  const safetyAlerts = safetyResp.body;
  
                  const hasExpiredDocs = Array.isArray(worker.documents)
                    ? worker.documents.some((doc) => doc.expired === true)
                    : false;
                  const hasSafetyAlert =
                    Array.isArray(safetyAlerts) && safetyAlerts.length > 0;
  
                  cy.log(`Row ${rowToTest} | expiredDocs: ${hasExpiredDocs} | safetyAlert: ${hasSafetyAlert}`);
  
                  expect(
                    hasExpiredDocs || hasSafetyAlert,
                    `Row ${rowToTest} - YELLOW: expired doc or safety alert must exist for worker ${workerId}`
                  ).to.be.true;
                });
  
              } else {
                // ✅ CLEAR — everything must be false
                cy.request({
                  method: "POST",
                  url: `/api/worker/safety/${workerId}`,
                  headers: authHeaders,
                }).then((safetyResp) => {
                  const safetyAlerts = safetyResp.body;
  
                  const hasExpiredDocs = Array.isArray(worker.documents)
                    ? worker.documents.some((doc) => doc.expired === true)
                    : false;
                  const hasSafetyAlert =
                    Array.isArray(safetyAlerts) && safetyAlerts.length > 0;
  
                  cy.log(`Row ${rowToTest} | expiredDocs: ${hasExpiredDocs} | safetyAlert: ${hasSafetyAlert}`);
  
                  expect(
                    hasFlag || isUnauthorized,
                    `Row ${rowToTest} - CLEAR: flag and unauthorized must be false for worker ${workerId}`
                  ).to.be.false;
  
                  expect(
                    hasExpiredDocs || hasSafetyAlert,
                    `Row ${rowToTest} - CLEAR: no expired docs and no safety alerts for worker ${workerId}`
                  ).to.be.false;
                });
              }
            });
          });
        });
  
        // 9️⃣ Close profile drawer
        cy.contains("button", "Cancel").then(($cancel) => {
          if ($cancel.length) {
            cy.wrap($cancel).click({ force: true });
            cy.log(`Row ${rowToTest} - Profile drawer closed`);
          } else {
            cy.log(`Row ${rowToTest} - No Cancel button found`);
          }
        });
  
        cy.wait(500);
      }
    });
  });
});