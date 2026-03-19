/// <reference types="cypress" />
import { validateRequest } from "twilio/lib/webhooks/webhooks";
import companiesHelper from "../../../support/helper/companiesHelper";
import { workforceSelector } from "../../../support/workforceSelector";

describe('Insights Company - Insights Company Info-card', { 
  tags: ["Epic:WorkForce", "Feature:Insights Company", "Module:Insights-Company"] 
}, () => {

  beforeEach(() => {
    cy.loginAndVisit(() => companiesHelper.visitCompaniesInsightPage('5007477836'));

	cy.get('.selector-item.last').click()
  let authHeaders = {};
    cy.intercept('GET', '/api/projectConfigs', (req) => {
      authHeaders = {
        'x-auth-token': req.headers['x-auth-token'],
        'x-auth-project': req.headers['x-auth-project']
      };
    }).as('getConfig');
  });

  it('Insights-Company - Validate company selection and alert counts against API', {
    tags: ["Story:Company Alerts Validation", "Severity:blocker", "API", "Module:Insights-Company"]
  }, () => {
    cy.intercept('POST', 'https://uat.kwant.ai/api/empinsight/work_table?**').as('getWorkerTable');
    cy.intercept('GET', '**/config**').as('getConfig');
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
  
      cy.wrap(selectedWorker).find('input[type="checkbox"]').check({force:true});
      cy.wait(2000)
  
      cy.wrap(selectedWorker).find('.personal-info-content__title').invoke('text').then((text) => {
        companyName = text.trim();
        cy.log(`Selected company name: ${companyName}`);
  
        cy.get('.onsite-selected-container .personal-info-content__title')
          .contains(companyName)
          .should('be.visible');
        cy.wait(2000);
        cy.wrap(selectedWorker)
  .find('.site-label')
  .scrollIntoView({ block: 'center' })  // keeps it away from edges
  .should('be.visible')
  .then($el => {
    $el[0].click(); // native DOM click prevents Cypress re-scroll
  });
      });
    });
    cy.wait(3000);
	cy.get('.selector-item.last').click()
  
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
              const count = parseInt(match[2]) + 1; // "+1" means 2 total
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
  
    cy.wait('@getConfig').then(({ request }) => {
      const authHeaders = {
        'x-auth-token': request.headers['x-auth-token'],
        'x-auth-project': request.headers['x-auth-project']
      };
      cy.wait('@getWorkerTable')
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
            headers: authHeaders,
            failOnStatusCode: false
          }).then((safetyResponse) => {
            const alerts = safetyResponse.body || [];
            alerts.forEach(alert => {
              if (alert.notificationDate?.startsWith(today)) {
                const type = alert.type.toLowerCase();
                // Count each occurrence per type across all workers
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
    });
  });
  it('Insights-Company - Validate companies onsite today count matches API', {
    tags: ["Story:Dashboard Cards Validation", "Severity:critical", "API", "Module:Insights-Company"]
  }, () => {
      const dashboardLabel =
        ".company-insights-top-stats__item .company-insights-top-stats__item__label";
      const dashboardCountSelector = ".total-onsite-count";
  
      cy.intercept("POST", "**/api/insight/company/table**").as("getCompanyTable");
  
      cy.wait("@getCompanyTable").then(({ response }) => {
        expect(response.statusCode).to.eq(200);
  
        const companies = response.body.data || [];
  
        const expectedOnsiteCompanies = companies.filter(
          (c) => c.onsiteToday > 0
        ).length;
  
        cy.log(`API: Expected companies onsite today → ${expectedOnsiteCompanies}`);
  
        cy.get(dashboardLabel)
          .contains("Companies On-site Today")
          .should("exist");

          cy.wait(3000)
  
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
    }
  );
  
  it('Insights-Company - Validate most active zones against aggregated floor data', {
    tags: ["Story:Zone Analytics Validation", "Severity:blocker", "API", "Module:Insights-Company"]
  }, () => {

    const planIds = [
      6149325418,
      6151004500,
      5158254942,
      6284072360,
      6150982228,
      6284072433,
      6284098553
    ];
  
    const now = new Date();
    const endDateTime = now.toISOString();
    const startDateTime = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
  
    let uiZones = [];
    let allPlanDetails = [];
  
    cy.get('.company-insights-top-stats__item__label')
      .contains('Most Active Zones Today')
      .should('be.visible')
      .and('have.text', 'Most Active Zones Today');
  
    cy.wait(3000);
  
    cy.get('body').then(($body) => {
      const $zoneItems = $body.find('.zone-list-item');
  
      if ($zoneItems.length === 0) {
        uiZones = [];
        cy.log('⚠️ UI: No zones found in the widget');
      } else {
        $zoneItems.each((_, el) => {
          const name = Cypress.$(el).text().trim();
          if (name && name !== '-') uiZones.push(name);
        });
        cy.log(`📋 UI Zones Collected → ${JSON.stringify(uiZones)}`);
      }
    });
  
    cy.wait('@getConfig').then(({ request }) => {
  
      const authHeaders = {
        'x-auth-token': request.headers['x-auth-token'],
        'x-auth-project': request.headers['x-auth-project']
      };
  
      cy.wrap(planIds).each((floorId) => {
  
        cy.request({
          method: 'POST',
          url: `https://uat.kwant.ai/api/floorDetail?startDateTime=${startDateTime}&endDateTime=${endDateTime}`,
          headers: authHeaders,
          body: { floorId, searchCriteriaList: [] },
          failOnStatusCode: false,
          timeout: 20000
        }).then((response) => {
  
          expect(response.status, `floorDetail API for floor ${floorId} should return 200`).to.eq(200);
          expect(response.body, `floorDetail response body for floor ${floorId} should be an array`).to.be.an('array');
  
          const workerModule = response.body.find(mod => mod.key === 'worker_detail');
          expect(workerModule, `worker_detail module should exist for floor ${floorId}`).to.not.be.undefined;
  
          const workersOnFloor = workerModule?.onsite ?? 0;
  
          cy.request({
            method: 'GET',
            url: `https://uat.kwant.ai/api/plan/get/${floorId}?isDataRequestForCurrentlyActivePlan=true`,
            headers: authHeaders,
            failOnStatusCode: false
          }).then((planResponse) => {
  
            expect(planResponse.status, `plan/get API for floor ${floorId} should return 200`).to.eq(200);
            expect(planResponse.body, `plan/get response body for floor ${floorId} should be an object`).to.be.an('object');
  
            const planName = planResponse.body.calibrate?.name ?? 'Unknown';
  
            const floorZones = (planResponse.body.zones ?? [])
              .map(zone => zone.name.trim());
  
            cy.log(`🏢 Plan: ${planName} (${floorId}) → Workers: ${workersOnFloor}`);
            cy.log(`📍 Zones → ${floorZones.length > 0 ? JSON.stringify(floorZones) : 'No zones'}`);
  
            allPlanDetails.push({
              id: floorId,
              name: planName,
              workers: workersOnFloor,
              zones: floorZones.map(z => z.toLowerCase())
            });
          });
        });
      });
  
      cy.then(() => {
  
        expect(allPlanDetails, 'All floor data should be collected').to.have.length(planIds.length);
  
        // ✅ Top floor from API
        const topFloor = allPlanDetails
          .filter(p => p.workers > 0)
          .sort((a, b) => b.workers - a.workers)[0];
  
        expect(topFloor, 'There should be at least one active floor with workers').to.not.be.undefined;
  
        cy.log(`🏆 Top Floor: ${topFloor.name} (${topFloor.id}) → ${topFloor.workers} workers`);
        cy.log(`📍 Top Floor Zones → ${JSON.stringify(topFloor.zones)}`);
  
        // ✅ Only take first UI zone
        const firstUiZone = uiZones[0];
  
        cy.log(`📋 First UI Zone → "${firstUiZone}"`);
  
        if (!firstUiZone) {
  
          expect(
            topFloor.zones.length,
            `UI shows no zones but top floor "${topFloor.name}" has zones: ${JSON.stringify(topFloor.zones)}`
          ).to.eq(0);
  
          cy.log('✅ Both UI and API agree: no active zones');
  
        } else {
  
          expect(
            topFloor.zones.includes(firstUiZone.toLowerCase()),
            `First UI zone "${firstUiZone}" should exist in top floor "${topFloor.name}".\n` +
            `  Top floor zones: ${JSON.stringify(topFloor.zones)}`
          ).to.be.true;
  
          cy.log(`✅ First UI Zone "${firstUiZone}" validated in top floor "${topFloor.name}"`);
        }
      });
    });
  });



  it('Insights-Company - Validate most active zones for selected company', {
    tags: ["Story:Company Zone Validation", "Severity:critical", "API", "Module:Insights-Company"]
  }, () => {
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
  
      selectedWorker = matchedRows[1];
      cy.wrap(selectedWorker).find('input[type="checkbox"]').check({ force: true });
      cy.wait(3000)
      cy.get('body').then(($body) => {
        const $zoneItems = $body.find('.zone-list-item');
  
        if ($zoneItems.length === 0) {
          // No zone list items — check if it shows '-'
          uiZones = [];
          cy.log('UI: No zone-list-item elements found — treating as "-"');
        } else {
          const zoneText = $zoneItems.text().trim();
          if (zoneText === '-' || zoneText === '') {
            uiZones = [];
            cy.log('UI: Zone shows "-" (no active zones)');
          } else {
            // Collect each zone name individually
            $zoneItems.each((_, el) => {
              const name = Cypress.$(el).text().trim();
              if (name && name !== '-') {
                uiZones.push(name);
              }
            });
            cy.log(`UI Zones → ${JSON.stringify(uiZones)}`);
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
        cy.wrap(selectedWorker).find('.site-label').click();
  
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
  
          const planIds = [
            6149325418,
            6151004500,
            5158254942,
            6284072360,
            6150982228,
            6284072433,
            6284098553
          ];
  
          const now = new Date();
          const endDateTime = now.toISOString();
          const startDateTime = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
          const endDate = now.toISOString().split('T')[0];
          const startDate = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0];
  
          cy.wait('@getConfig').then(({ request }) => {
            const authHeaders = {
              'x-auth-token': request.headers['x-auth-token'],
              'x-auth-project': request.headers['x-auth-project']
            };
  
            let maxWorkers = 0;
            let maxPlanId = null;
  
            planIds.forEach((floorId) => {
              cy.request({
                method: 'POST',
                url: `https://uat.kwant.ai/api/floorDetail?startDateTime=${startDateTime}&endDateTime=${endDateTime}`,
                headers: authHeaders,
                body: {
                  floorId,
                  searchCriteriaList: [
                    { filterKey: "projectTaskTradeId", value: [companyId], operation: "in" }
                  ]
                },
                failOnStatusCode: false,
                timeout: 20000
              }).then((response) => {
                expect(response.status).to.eq(200);
  
                const workerModule = response.body.find(mod => mod.key === "worker_detail");
                const workersOnFloor = workerModule?.onsite ?? 0;
  
                cy.log(`Floor ${floorId}: Workers → ${workersOnFloor}`);
  
                if (workersOnFloor > maxWorkers) {
                  maxWorkers = workersOnFloor;
                  maxPlanId = floorId;
                }
              });
            });
  
            cy.then(() => {
              cy.log(`Most active floor: ${maxPlanId} (${maxWorkers} workers)`);
  
              // Step 2: Call fetchCompanyInfo to get API zones
              cy.request({
                method: 'POST',
                url: `https://uat.kwant.ai/api/insight/company/fetchCompanyInfo`,
                headers: authHeaders,
                body: {
                  startDate,
                  endDate,
                  searchCriteriaList: [
                    { filterKey: "projectTaskTradeId", value: [companyId], operation: "in" }
                  ]
                },
                failOnStatusCode: false
              }).then((insightResponse) => {
                expect(insightResponse.status).to.be.oneOf([200, 201]);
  
                const data = insightResponse.body;
                cy.log(`Company Insight Response → ${JSON.stringify(data)}`);
  
                const apiZones = data.mostActiveZones ?? [];
                cy.log(`API Zones → ${JSON.stringify(apiZones)}`);
                cy.log(`UI Zones → ${JSON.stringify(uiZones)}`);
  
                // Step 3: Compare UI zones vs API zones
                if (uiZones.length === 0) {
                  // UI shows '-' — API should also return no zones
                  expect(apiZones.length).to.eq(
                    0,
                    `UI shows no active zones ("-") but API returned: ${apiZones.join(', ')}`
                  );
                  cy.log('✅ Both UI and API agree: no active zones');
                } else {
                  // UI shows zones — each must exist in API response
                  uiZones.forEach((zoneName) => {
                    expect(apiZones.map(z => z.toLowerCase())).to.include(
                      zoneName.toLowerCase(),
                      `UI zone "${zoneName}" must exist in API mostActiveZones`
                    );
                  });
                  cy.log('✅ All UI zones validated against API');
                }
              });
            });
          });
        });
      });
    });
  });
  it('Insights-Company - Validate time spent in active zones matches API percentage', {
    tags: ["Story:Time in Active Zones Validation", "Severity:critical", "API", "Module:Insights-Company"]
  }, () => {
    cy.intercept('POST', '**/api/insight/company/fetchCompanyInfo')
      .as('getTimeInActiveZoneToday');
  
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
  
  });
});
    