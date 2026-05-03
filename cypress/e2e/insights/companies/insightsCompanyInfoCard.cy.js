/// <reference types="cypress" />
import companiesHelper from "../../../support/helper/companiesHelper";
import { workforceSelector } from "../../../support/workforceSelector";

describe('Insights Company - Insights Company Info-card', {
  tags: ["Epic:WorkForce", "Feature:Insights Company", "Module:Insights-Company"]
}, () => {

  beforeEach(() => {
    cy.intercept('GET', '/api/projectConfigs').as('getConfig');
    cy.intercept('POST', '**/api/insight/company/table**').as('getCompanyTable');

    cy.loginAndVisit(() => companiesHelper.visitCompaniesInsightPage('5007477836'));
    cy.get('.selector-item.last').click();

    cy.wait('@getConfig').then(({ request }) => {
      cy.wrap({
        'x-auth-token': request.headers['x-auth-token'],
        'x-auth-project': Number(request.headers['x-auth-project'])
      }).as('authHeaders');
    });
  });

 
  it('Insights-Company - Validate company selection and alert counts against API', {
    tags: ["Story:Company Alerts Validation", "Severity:blocker", "API", "Module:Insights-Company"]
  }, function () {
    cy.intercept('POST', 'https://uat.kwant.ai/api/empinsight/work_table?**').as('getWorkerTable');
    cy.wait(5000);

    let uiAlerts = [];
    let uiAlertCounts = {};
    let selectedWorker;
    let companyName;

    cy.get(workforceSelector.tableRow).then(($rows) => {
      const matchedRows = Array.from($rows).filter(row =>
        Number(Cypress.$(row).find('.site-label').text().trim()) >= 1
      );
      expect(matchedRows.length).to.be.gte(2, 'There should be at least two rows with label >=1');

      selectedWorker = matchedRows[1];

      cy.wrap(selectedWorker).find('input[type="checkbox"]').check({ force: true });
      cy.wait(2000);

      cy.wrap(selectedWorker).find('.personal-info-content__title').invoke('text').then((text) => {
        companyName = text.trim();
        cy.log(`Selected company name: ${companyName}`);

        cy.get('.onsite-selected-container .personal-info-content__title')
          .contains(companyName)
          .should('be.visible');
        cy.wait(2000);

        cy.wrap(selectedWorker)
          .find('.site-label')
          .scrollIntoView({ block: 'center' })
          .should('be.visible')
          .then($el => {
            $el[0].click();
          });
      });
    });

    cy.wait(3000);
    cy.get('.selector-item.last').click();

    cy.get('body').then($body => {
      const hasContainer = $body.find('.summery-alert-list-container').length > 0;
      const hasNoAlertLabel = $body.find('.summery-alert-label:visible').length > 0;

      if (hasNoAlertLabel) {
        const labelText = $body.find('.summery-alert-label:visible').text().trim().toLowerCase();
        if (labelText.includes('no alerts')) {
          uiAlerts = [];
          uiAlertCounts = {};
          cy.log("UI shows 'No Alerts'");
          return;
        }
      }

      if (hasContainer) {
        const containerText = $body.find('.summery-alert-list-container').text().trim().toLowerCase();

        if (containerText === '-') {
          uiAlerts = [];
          uiAlertCounts = {};
          cy.log("UI shows '-' (no alerts)");
        } else {
          containerText.split(',').map(a => a.trim()).forEach(entry => {
            const match = entry.match(/^(.+?)\+\s*(\d+)$/);
            if (match) {
              const type = match[1].trim();
              const count = parseInt(match[2]) + 1;
              uiAlertCounts[type] = count;
            } else {
              uiAlertCounts[entry] = 1;
            }
          });

          uiAlerts = Object.keys(uiAlertCounts);
          cy.log(`UI Alert Counts → ${JSON.stringify(uiAlertCounts)}`);
        }
      } else {
        uiAlerts = [];
        uiAlertCounts = {};
        cy.get(".summery-alert-label").contains('No Alerts').should('be.visible');
        cy.log("No alert container found, treating as no alerts");
      }

      cy.wait(2000);
    });

    cy.wait('@getWorkerTable');
    cy.wait('@getWorkerTable').then(({ response }) => {
      expect(response.statusCode).to.eq(200);

      const workers = response.body.employeeTrackingTableList || [];
      const safetyAlertWorkers = workers.filter(w => w.hasSafetyAlert === true);
      const today = new Date().toISOString().split('T')[0];
      let apiAlertCounts = {};

      safetyAlertWorkers.forEach((worker) => {
        cy.request({
          method: 'POST',
          url: `https://uat.kwant.ai/api/worker/safety/${worker.workerId}`,
          headers: this.authHeaders,
          failOnStatusCode: false
        }).then((safetyResponse) => {
          const alerts = safetyResponse.body || [];
          alerts.forEach(alert => {
            if (alert.notificationDate?.startsWith(today)) {
              const type = alert.type.toLowerCase();
              apiAlertCounts[type] = (apiAlertCounts[type] || 0) + 1;
            }
          });
        });
      });

      cy.then(() => {
        cy.log(`API Alert Counts Today → ${JSON.stringify(apiAlertCounts)}`);

        if (uiAlerts.length === 0) {
          expect(Object.keys(apiAlertCounts).length).to.eq(
            0,
            "UI shows no alerts so API should also have no alerts today"
          );
        } else {
          uiAlerts.forEach(type => {
            const uiCount = uiAlertCounts[type];
            const apiCount = apiAlertCounts[type] || 0;

            expect(apiCount).to.be.gte(
              uiCount,
              `UI shows ${uiCount}x "${type}" but API only returned ${apiCount}x`
            );
          });
        }
      });
    });
  }); // ← END: TEST 1


  it('Insights-Company - Validate companies onsite today count matches API', {
    tags: ["Story:Dashboard Cards Validation", "Severity:critical", "API", "Module:Insights-Company"]
  }, function () {
    const dashboardLabel = ".company-insights-top-stats__item .company-insights-top-stats__item__label";
    const dashboardCountSelector = ".total-onsite-count";

    cy.wait('@getCompanyTable').then(({ response }) => {
      expect(response.statusCode).to.eq(200);

      const companies = response.body.data || [];
      const expectedOnsiteCompanies = companies.filter(c => c.onsiteToday > 0).length;

      cy.log(`API: Expected companies onsite today → ${expectedOnsiteCompanies}`);

      cy.get(dashboardLabel)
        .contains("Companies On-site Today")
        .should("exist");

      cy.wait(3000);

      cy.get(dashboardCountSelector)
        .invoke("text")
        .then((text) => {
          const dashboardCount = Number(text.trim());
          cy.log(`UI: Dashboard card count → ${dashboardCount}`);

          expect(dashboardCount).to.eq(
            expectedOnsiteCompanies,
            `Dashboard card (${dashboardCount}) should match API count of companies onsite today (${expectedOnsiteCompanies})`
          );
        });
    });
  }); // ← END: TEST 2

  // ─────────────────────────────────────────────────────────────
  // TEST 3: Validate Most Active Zones (All Company)
  // ─────────────────────────────────────────────────────────────
  it('Insights - Validate Most Active Zones', function () {
    const now = new Date();
    const endDate = now.toISOString();
    
    // ✅ match UI → last 1 day
    const startDate = new Date(
      now.getTime() - 24 * 60 * 60 * 1000
    ).toISOString();
  
    const projectId = 5007477836;
  
    let uiZones = [];
  cy.wait(10000)
  
    // ✅ Get UI zones
    cy.get('body').then(($body) => {
      const $zones = $body.find('.zone-list-item');
  
      if ($zones.length === 0) {
        uiZones = [];
        cy.log('⚠️ No zones in UI');
      } else {
        $zones.each((_, el) => {
          const text = Cypress.$(el).text().trim().toLowerCase();
  
          if (text && text !== '-') {
            uiZones.push(text);
          }
        });
      }
  
      cy.log(`📋 UI Zones → ${JSON.stringify(uiZones)}`);
    });
  
    // ✅ API call
    cy.get('@authHeaders').then((headers) => {
      cy.request({
        method: 'POST',
        url: 'https://mock.ontargetcloud.com/api/trackByLocationWithFilter?edgeId&groupType=ALL_COMPANY',
        headers: headers,
        body: {
          projectId,
          startDate,
          endDate,
          startDateOnly: startDate.split('T')[0],
          endDateOnly: endDate.split('T')[0],
          companyHoursType: "ACTUALHOURFROMHORKER",
          hourType: "normalized",
          isEdgeCategory: false,
          isImportedHour: false,
          groupId: null
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
  
        const locationMap = {};
  
        // ✅ SAFE aggregation
        Object.values(response.body).forEach((arr) => {
          if (!Array.isArray(arr)) return;
  
          arr.forEach((entry) => {
            const loc = entry.location?.trim().toLowerCase();
            const minutes = Number(entry.minutes) || 0;
  
            if (!loc) return;
  
            locationMap[loc] = (locationMap[loc] || 0) + minutes;
          });
        });
  
        cy.log(`📊 Aggregated Zones → ${JSON.stringify(locationMap)}`);
  
        const sortedZones = Object.entries(locationMap)
          .sort((a, b) => b[1] - a[1])
          .map(([zone]) => zone);
  
        cy.log(`🏆 API Zones → ${JSON.stringify(sortedZones)}`);
  
        // ✅ HANDLE EMPTY CASE
        if (uiZones.length === 0) {
          expect(sortedZones.length, 'UI empty → API should also be empty').to.eq(0);
          cy.log('✅ No zones in both UI and API');
          return;
        }
  
        // ❗ IMPORTANT FIX: ensure API has enough data
        expect(
          sortedZones.length,
          'API should return zones when UI has zones'
        ).to.be.greaterThan(0);
  
        const expectedZones = sortedZones.slice(0, uiZones.length);
  
        // ✅ FINAL VALIDATION
        uiZones.forEach((zone, index) => {
          expect(
            expectedZones[index],
            `UI zone "${zone}" should match API rank ${index + 1}`
          ).to.eq(zone);
        });
  
        cy.log('✅ Zones validated successfully');
      });
    });
  });// ← END: TEST 3

  // ─────────────────────────────────────────────────────────────
  // TEST 4: Validate most active zones for selected company
  // ─────────────────────────────────────────────────────────────
  it('Insights-Company - Validate most active zones for selected company', {
    tags: ["Story:Company Zone Validation", "Severity:critical", "API", "Module:Insights-Company"]
  }, function () {
    cy.intercept('GET', 'https://uat.kwant.ai/api/projectTaskTradesForTracking').as('getCompanyName');
    cy.wait(5000);
  
    let selectedWorker;
    let companyName;
    let uiZones = [];
  
    cy.get(workforceSelector.tableRow).then(($rows) => {
      const matchedRows = Array.from($rows).filter(row =>
        Number(Cypress.$(row).find('.site-label').text().trim()) >= 1
      );
      expect(matchedRows.length).to.be.gte(2, 'There should be at least two rows with label >=1');
  
      selectedWorker = matchedRows[3];
      cy.wrap(selectedWorker).find('input[type="checkbox"]').check({ force: true });
      cy.wait(5000);
  

      cy.get('body').then(($body) => {
        const $zoneItems = $body.find('.zone-list-item');
  
        if ($zoneItems.length === 0) {
          uiZones = [];
          cy.log('UI: No zone-list-item elements found — treating as "-"');
        } else {
          $zoneItems.each((index, el) => {
            if (index >= 2) return false; // Only grab first 2 zones
            const name = Cypress.$(el).text().trim();
            if (name && name !== '-') {
              uiZones.push(name.toLowerCase());
            }
          });
  
          if (uiZones.length === 0) {
            cy.log('UI: Zones show "-" (no active zones)');
          } else {
            cy.log(`UI Zone #1 (Most Active)     → "${uiZones[0]}"`);
            cy.log(`UI Zone #2 (2nd Most Active) → "${uiZones[1] ?? 'N/A'}"`);
          }
        }
      });
  
      cy.wrap(selectedWorker).find('.personal-info-content__title').invoke('text').then((text) => {
        companyName = text.trim();
        cy.log(`Selected company name: ${companyName}`);
  
        cy.get('.onsite-selected-container .personal-info-content__title')
          .contains(companyName)
          .should('be.visible');
  
        cy.wait(2000);
        cy.wrap(selectedWorker)
        .find('.site-label')
        .scrollIntoView()
        .should('be.visible')
        .trigger('mousemove')
        .wait(150)
        .trigger('mouseover')
        .wait(150)
        .click();
  
        cy.wait('@getCompanyName').then(({ response }) => {
          expect(response.statusCode).to.eq(200);
  
          const companies = response.body || [];
          const matchedCompany = companies.find(
            company => company.name.trim().toLowerCase() === companyName.toLowerCase()
          );
  
          if (!matchedCompany) {
            cy.log(`⚠️ No company match found for: "${companyName}"`);
            cy.log(`Available names: ${companies.map(c => c.name).join(', ')}`);
          } else {
            cy.log(`✅ Matched company: "${matchedCompany.name}" → ID: ${matchedCompany.id}`);
          }
  
          expect(matchedCompany, `Company "${companyName}" should exist in API response`).to.not.be.undefined;
  
          const companyId = matchedCompany.id;
          cy.log(`Company ID: ${companyId}`);
  
          const now = new Date();
          const endDate = now.toISOString().split('T')[0];
          const startDate = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0];
  
          // ✅ STEP 2: Call trackByLocationWithFilter — same API that powers the UI
          cy.get('@authHeaders').then((headers) => {
            cy.request({
              method: 'POST',
              url: 'https://mock.ontargetcloud.com/api/trackByLocationWithFilter?edgeId&groupType=ALL_COMPANY',
              headers: headers,
              body: {
                projectId: 5007477836,
                startDate: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: now.toISOString(),
                startDateOnly: startDate,
                endDateOnly: endDate,
                companyHoursType: "ACTUALHOURFROMWORKER",
                hourType: "normalized",
                isEdgeCategory: false,
                isImportedHour: false,
                groupId: null
              },
              failOnStatusCode: false
            }).then((response) => {
              expect(response.status).to.eq(200);
  
              cy.log(`Full API Response Keys → ${JSON.stringify(Object.keys(response.body))}`);
  
              // ✅ STEP 3: Find the key in response that matches selected company name
              const responseKeys = Object.keys(response.body);
              const matchedKey = responseKeys.find(
                key => key.trim().toLowerCase() === companyName.trim().toLowerCase()
              );
  
              cy.log(`Looking for company key: "${companyName}"`);
              cy.log(`Matched key in response: "${matchedKey ?? 'NOT FOUND'}"`);
  
              if (!matchedKey) {
                // If company not in API response, UI should also show no zones
                cy.log(`⚠️ Company "${companyName}" not found in API response`);
                expect(uiZones.length, 
                  `Company not in API → UI should show no zones`
                ).to.eq(0);
                return;
              }
  
              const companyEntries = response.body[matchedKey]; // Array of worker-zone entries
  
              // ✅ STEP 4: Aggregate total minutes per location for this company only
              const locationMap = {};
              companyEntries.forEach(entry => {
                const loc = entry.location?.trim().toLowerCase();
                if (!loc) return;
                locationMap[loc] = (locationMap[loc] || 0) + (entry.minutes || 0);
              });
  
              cy.log(`📊 Zone Minutes for "${companyName}" → ${JSON.stringify(locationMap)}`);
  
              // ✅ STEP 5: Sort zones by total minutes descending → gives ranked zones
              const sortedZones = Object.entries(locationMap)
                .sort((a, b) => b[1] - a[1])
                .map(([zone]) => zone);
  
              const apiZone1 = sortedZones[0]; // Most active zone
              const apiZone2 = sortedZones[1]; // 2nd most active zone
  
              cy.log(`🏆 API Zone #1 (Most Active)    → "${apiZone1 ?? 'N/A'}" (${locationMap[apiZone1] ?? 0} mins)`);
              cy.log(`🥈 API Zone #2 (2nd Most Active) → "${apiZone2 ?? 'N/A'}" (${locationMap[apiZone2] ?? 0} mins)`);
              cy.log(`👁 UI Zone #1  → "${uiZones[0] ?? 'N/A'}"`);
              cy.log(`👁 UI Zone #2  → "${uiZones[1] ?? 'N/A'}"`);
  
              // ✅ STEP 6: Validate UI zones against API-calculated zones
              if (uiZones.length === 0) {
                expect(sortedZones.length,
                  `UI shows no active zones but API calculated: ${sortedZones.join(', ')}`
                ).to.eq(0);
                cy.log('✅ Both UI and API agree: no active zones');
              } else {
                // Validate Zone #1
                expect(
                  apiZone1,
                  `UI most active zone "${uiZones[0]}" should match API #1 zone "${apiZone1}"`
                ).to.eq(uiZones[0]);
  
                // Validate Zone #2 only if UI has it
                if (uiZones[1]) {
                  expect(
                    apiZone2,
                    `UI 2nd most active zone "${uiZones[1]}" should match API #2 zone "${apiZone2}"`
                  ).to.eq(uiZones[1]);
                } else {
                  cy.log('ℹ️ Only 1 zone in UI — skipping 2nd zone validation');
                }
  
                cy.log('✅ Top 2 zones validated successfully between UI and API');
              }
            });
          });
        });
      });
    });
  });// ← END: TEST 4

  // ─────────────────────────────────────────────────────────────
  // TEST 5: Validate time spent in active zones matches API percentage
  // ─────────────────────────────────────────────────────────────
  it('Insights-Company - Validate time spent in active zones matches API percentage', {
    tags: ["Story:Time in Active Zones Validation", "Severity:critical", "API", "Module:Insights-Company"]
  }, function () {
    cy.intercept('POST', '**/api/insight/company/fetchCompanyInfo').as('getTimeInActiveZoneToday');

    cy.wait('@getTimeInActiveZoneToday').then(({ response }) => {
      expect(response.statusCode).to.oneOf([200, 201]);

      const data = response.body;
      const timeActiveZone = data.timeSpentInMostActiveZones;
      const expectedValue = `${Math.round(timeActiveZone)}%`;

      cy.contains('.company-insights-top-stats__item__label', 'Time in Active Zones Today')
        .should('be.visible');

      cy.get('.company-insights-top-stats__item__body')
        .should('contain', expectedValue);
    });
  }); // ← END: TEST 5

}); // ← END: describe