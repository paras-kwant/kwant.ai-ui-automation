
import companiesHelper from "../../../support/helper/companiesHelper";
import { workforceSelector } from "../../../support/workforceSelector";
import WorkerHelper from "../../../support/helper/workerHelper";

describe('Insight-Worker Insight Worker Info Card', () => {

  beforeEach(() => {
    cy.intercept('GET', '**/api/projectConfigs**').as('getConfig');
    cy.intercept('POST', '**/api/insight/company/table*').as('companyTable');

	cy.loginAndVisit(() => WorkerHelper.visitWorkersInsightPage('5007477836'));
    cy.get('.selector-item.last').should('be.visible').click()
	cy.wait('@getConfig').then(({ request }) => {
      cy.wrap({
        'x-auth-token': request.headers['x-auth-token'],
        'x-auth-project': request.headers['x-auth-project']
      }).as('authHeaders');
    });
  });

  it("Insight-Worker Validate Worker on-site today card displays correct information",{tags:"@smoke"}, function () {
    let uiWorkerCount;
    cy.get('.worker_insight_section')
      .contains('Workers On-site Today')
      .parent()
      .find('p')
      .eq(1)
      .invoke('text')
      .then((text) => {

        uiWorkerCount = text.trim() === '-' ? 0 : Number(text.trim());
        cy.log(`UI Workers On-site: ${uiWorkerCount}`);

      });
    cy.visit('/projects/5007477836/insights/companies');
    cy.wait('@companyTable').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      const apiWorkerCount =
        interception.response.body.totalOnsiteWorkers ?? 0;
      cy.log(`API Workers On-site: ${apiWorkerCount}`);
      expect(uiWorkerCount).to.eq(apiWorkerCount);
    });
  });


  it('Insight-Worker Most active zones for selected worker',{tags:'@smoke'}, () => {
	let selectedWorkerName;
	let selectedWorkerId;
	let uiZones = [];
  
	let floorIds = [];
	let bestFloor = null;
	let maxMinutes = 0;
  
	// ✅ Dynamic date: today from 04:00Z to current time in UTC
	const now = new Date();
	const pad = (n) => String(n).padStart(2, '0');
	const todayDate = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;
	const startDateTime = `${todayDate}T04:00:00Z`;
	const endDateTime = `${todayDate}T${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}Z`;
  
	cy.log(`Date range: ${startDateTime} → ${endDateTime}`);
  
	cy.intercept('POST', '**/api/empinsight/work_table*').as('workerTable');

	cy.get(workforceSelector.tableRow)
	  .eq(2)
	  .should('be.visible');
  
	cy.get(workforceSelector.tableRow)
	  .eq(2)
	  .find('input[type="checkbox"]').as('workerCheckbox')
	  .check({ force: true });
	  cy.wait(2000)
  
	  cy.get('body').then(($body) => {
		if ($body.find('.zone-list-item').length > 0) {
			cy.get('.zone-list-item')
  .then(($els) => {

    uiZones = [...$els].map(el =>
      el.innerText.trim()
    ).filter(Boolean);

    cy.log(`UI Zones: ${JSON.stringify(uiZones)}`);
  });
		} else {
			uiZones = ['-'];
			cy.log('UI Zones: -');
		}
	});
  
	cy.get(workforceSelector.tableRow)
	  .eq(2)
	  .find('.personal-info-content__title')
	  .invoke('text')
	  .then((text) => {
		selectedWorkerName = text.trim();
		cy.log(`Worker Name: ${selectedWorkerName}`);
	  });
  
	cy.wait('@workerTable').then((interception) => {
  
	  const workers = interception.response.body.employeeTrackingTableList;
  
	  const worker = workers.find(w =>
		`${w.firstName} ${w.lastName}`.trim() === selectedWorkerName
	  );
  
	  expect(worker).to.exist;
  
	  selectedWorkerId = worker.id;
	  cy.log(`Worker ID: ${selectedWorkerId}`);
  
	  cy.get('@authHeaders').then((headers) => {
  
		return cy.request({
		  method: 'GET',
		  url: `https://uat.kwant.ai/api/locationplan/getBuildingsAndFloor`,
		  headers: headers,
		}).then((resp) => {
  
		  expect(resp.status).to.eq(200);
  
		  floorIds = resp.body.flatMap(b => b.floors.map(f => f.id));
		  cy.log(`Floor IDs: ${JSON.stringify(floorIds)}`);
  
		}).then(() => {
  
		  return cy.wrap(floorIds).each((floorId) => {
  
			cy.log(`Checking floor ${floorId}...`);
  
			return cy.request({
			  method: 'POST',
			  url: `https://uat.kwant.ai/api/floorSubDetail?startDateTime=${startDateTime}&endDateTime=${endDateTime}`,
			  headers: headers,
			  failOnStatusCode: false,
			  body: {
				floorId: floorId,
				floorSubType: "WORKERDETAIL",
				searchCriteriaList: []
			  }
			}).then((resp) => {
  
			  const workers = resp.body?.content || [];
			  const match = workers.find(w => w.id === selectedWorkerId);
  
			  if (match && match.workMinutes > maxMinutes) {
				maxMinutes = match.workMinutes;
				bestFloor = floorId;
			  }
  
			});
  
		  });
  
		}).then(() => {
  
		  cy.log(`BEST FLOOR: ${bestFloor}`);
		  cy.log(`MAX MINUTES: ${maxMinutes}`);
		  
  
		  return cy.request({
			method: 'POST',
			url: `https://uat.kwant.ai/api/floorSubDetail?startDateTime=${startDateTime}&endDateTime=${endDateTime}`,
			headers: headers,
			failOnStatusCode: false,
			body: {
			  floorId: bestFloor,
			  floorSubType: "ZONEDETAIL",
			  searchCriteriaList: []
			}
		  });
  
		}).then((resp) => {
  
		  cy.log('ZONE RESPONSE:', JSON.stringify(resp.body));
  
		  const zones = resp.body || [];
		  const apiZoneNames = zones.map(z => z.name);
  
		  cy.log('API Zone Names:', apiZoneNames);
		  cy.log(apiZoneNames.join(', '));

		  if (bestFloor === null) {
			expect(uiZones).to.include('-');
		} else {
			expect(
				apiZoneNames.some(zone => uiZones.includes(zone))
			).to.be.true;
		}
  
		});
  
	  });
	});
  
  });


  it('Insight-Worker Insights-Company - Validate time spent in active zones matches API percentage', {
    tags: ["Story:Time in Active Zones Validation", "Severity:critical", "API", "Module:Insights-Company"]
  }, function () {
    cy.intercept('POST', '**/api/getEmployeeTrackingSummary*').as('getTrackingSummary');
    cy.wait('@getTrackingSummary').then(({ response }) => {
      expect(response.statusCode).to.oneOf([200, 201]);
      const data = response.body;

      const timeInMostActiveZone = data.info?.timeInMostActiveZone;
      const expectedValue = `${Math.round(timeInMostActiveZone)}%`;

      cy.log(`API timeInMostActiveZone: ${timeInMostActiveZone}`);
      cy.log(`Expected UI Value: ${expectedValue}`);

      cy.contains('p', 'Time in Active Zones Today').as('timeInActiveZonesLabel')
        .should('be.visible');
		cy.wait(1000)

		cy.get('@timeInActiveZonesLabel').parent().find('p').eq(1).invoke('text').then((text) => {
		  const uiValue = text.trim();
		  cy.log(`UI Value: ${uiValue}`);
		  expect(`${uiValue}%`).to.eq(expectedValue, `Expected UI to show ${expectedValue} but got ${uiValue}`);		});
    });
  });

  it('Insight-Worker Insights-Company - Validate safety alert for selected worker', {
	tags: ["Story:Safety Alert Validation", "Severity:critical", "API", "Module:Insights-Company"]
  }, function () {
  
	cy.intercept('POST', '**/api/empinsight/work_table*').as('workerTable');
	cy.get(workforceSelector.tableRow)
	  .eq(1)
	  .should('be.visible')
	  .find('input[type="checkbox"]')
	  .check({ force: true });
  
	cy.get(workforceSelector.tableRow)
	  .eq(1)
	  .find('.personal-info-content__title')
	  .invoke('text')
	  .then((text) => {
		const selectedWorkerName = text.trim();
		cy.log(`UI Selected Worker Name: ${selectedWorkerName}`);
  
		// Step 3: Wait for API and match worker by name to get ID
		cy.wait('@workerTable').then((interception) => {
		  const workers = interception.response.body.employeeTrackingTableList;
  
		  const worker = workers.find(w =>
			`${w.firstName} ${w.lastName}`.trim() === selectedWorkerName
		  );
  
		  expect(worker).to.exist;
  
		  const workerId = worker.workerId;
		  const hasSafetyAlert = worker.hasSafetyAlert;
  
		  cy.log(`Matched Worker ID from API: ${workerId}`);
		  cy.log(`hasSafetyAlert: ${hasSafetyAlert}`);
  
		  // Step 4: Fetch safety alerts using workerId and count only today's alerts
		  const today = new Date().toISOString().split('T')[0];
  
		  cy.request({
			method: 'POST',
			url: `/api/worker/safety/${workerId}`,
			headers: this.authHeaders,
			failOnStatusCode: false
		  }).then((safetyResponse) => {
			expect(safetyResponse.status).to.eq(200);
  
			const alerts = safetyResponse.body || [];
  
			// Count only today's alerts
			const todayAlertsCount = alerts.filter(alert =>
			  alert.notificationDate?.startsWith(today)
			).length;
  
			cy.log(`Today's alert count from safety API for worker ${workerId}: ${todayAlertsCount}`);
  
			// Step 5: Compare today's alert count with UI
			if (todayAlertsCount > 0) {
  
			  cy.get('.summery-alert-list-container')
				.should('be.visible')
				.invoke('text')
				.then((uiText) => {
				  cy.log(`UI Alert Container Text: ${uiText.trim()}`);
  
				  // Extract total count from UI text
				  // e.g. "Fatigue +2" → 3, "SOS" → 1, "SOS, Fatigue +2" → 4
				  let uiTotalCount = 0;
				  uiText.split(',').map(entry => entry.trim()).forEach(entry => {
					const match = entry.match(/\+\s*(\d+)$/);
					if (match) {
					  uiTotalCount += parseInt(match[1]) + 1;
					} else if (entry.length > 0 && entry !== '-') {
					  uiTotalCount += 1;
					}
				  });
  
				  cy.log(`UI Total Alert Count: ${uiTotalCount}`);
				  cy.log(`API Today Alert Count: ${todayAlertsCount}`);
  
				  expect(uiTotalCount).to.eq(
					todayAlertsCount,
					`UI shows ${uiTotalCount} alert(s) but safety API has ${todayAlertsCount} alert(s) for today`
				  );
				});
  
			} else {
			  cy.get('.summery-alert-list-container')
				.should('not.exist');
				cy.get('.summery-alert-label').contains('No Alerts').should('be.visible')
  
			  cy.log(`No alerts today for worker ${workerId}, UI correctly shows no alerts`);
			}
		  });
		});
	  });
  });
  
});