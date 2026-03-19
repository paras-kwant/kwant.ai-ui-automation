/// <reference types="cypress" />
import { validateRequest } from "twilio/lib/webhooks/webhooks";
import companiesHelper from "../../../support/helper/companiesHelper";
import { workforceSelector } from "../../../support/workforceSelector";

describe("Insights Company - Company Profile View", { tags: ["Epic:WorkForce", "Feature:WorkforceDashboard", "Module:Insights-Company"] }, () => {

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
  })

  it('Insights-Company - Verify company full profile opens with correct details', {
	tags: ["Story:Open Company Profile", "Severity:critical", "UI", "Module:Insights-Company"]
  }, () => {
	cy.intercept('GET', '**/config**').as('getConfig');

	cy.wait('@getConfig').then(({ request }) => {
		const authHeaders = {
		  'x-auth-token': request.headers['x-auth-token'],
		  'x-auth-project': request.headers['x-auth-project']
		};
	
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

			cy.get('button').contains('Full Profile').click()
			cy.get('p').contains(companyName).should('be.visible')
		});
	})
})
  })
  it('Insights-Company - Validate worker dashboard counts against API response', {
	tags: ["Story:Worker Counts Validation", "Severity:blocker", "API", "Module:Insights-Company"]
  }, () => {
	let selectedWorker;
	let companyName;
	const workerCounts = {};
	let authHeaders = {}; 
  

	cy.intercept('GET', '**/api/projectTaskTrade/detail/**').as('taskDetail');
	cy.intercept('GET', '**/config**').as('getConfig');
  

  
	// Step 1: select worker
	cy.get(workforceSelector.tableRow).its('length').should('be.greaterThan', 1);
	cy.get(workforceSelector.tableRow).then(($rows) => {
	  const matchedRows = Array.from($rows).filter(row =>
		Number(Cypress.$(row).find('.site-label').text().trim()) >= 1
	  );
	  expect(matchedRows.length).to.be.gte(2);
  
	  selectedWorker = matchedRows[1];
	  cy.wrap(selectedWorker).find('input[type="checkbox"]').check({ force: true });
  
	  cy.wrap(selectedWorker).find('.personal-info-content__title').invoke('text').then((text) => {
		companyName = text.trim();
		cy.log(`Selected company name: ${companyName}`);
  
		cy.get('.onsite-selected-container .personal-info-content__title')
		  .contains(companyName)
		  .should('be.visible');
  
		// Step 2: click Full Profile
		cy.get('button').contains('Full Profile').click();
		// Step 0: get authHeaders from config API
	cy.wait('@getConfig').then(({ request }) => {
		authHeaders = {
		  'x-auth-token': request.headers['x-auth-token'],
		  'x-auth-project': request.headers['x-auth-project'],
		};
		cy.log('✅ Auth Headers captured', JSON.stringify(authHeaders));
	  });
  
		// Step 3: wait for projectTaskTrade API and capture lastId
		cy.wait('@taskDetail').then(({ request }) => {
		  const lastId = request.url.split('/').pop();
		  cy.log(`✅ projectTaskTradeId: ${lastId}`);
  
		  // Step 4: fetch API data with dynamic authHeaders
		  cy.request({
			method: 'GET',
			url: `https://uat.kwant.ai/api/projectTaskTrade/detail/${lastId}`,
			headers: authHeaders,
		  }).then((apiResponse) => {
			const apiWorkers = apiResponse.body.workers || {};
			cy.log('📌 API Worker Counts:', JSON.stringify(apiWorkers));
  
			// Step 5: capture UI counts
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
	let selectedWorker;
	let companyName;
	const generalDetails = {};
	let authHeaders = {}; // 

	cy.intercept('GET', '**/config**').as('getConfig');
	cy.intercept('GET', '**/api/projectTaskTrade/detail/**').as('taskDetail');
	cy.get(workforceSelector.tableRow).its('length').should('be.greaterThan', 1);

	cy.get(workforceSelector.tableRow).then(($rows) => {
		const matchedRows = Array.from($rows).filter(row =>
			Number(Cypress.$(row).find('.site-label').text().trim()) >= 1
		);
		expect(matchedRows.length).to.be.gte(2);

		selectedWorker = matchedRows[1];
		cy.wrap(selectedWorker).find('input[type="checkbox"]').check({ force: true });
		

		cy.wrap(selectedWorker).find('.personal-info-content__title').invoke('text').then((text) => {
			companyName = text.trim();
			cy.log(`Selected company name: ${companyName}`);

			cy.get('.onsite-selected-container .personal-info-content__title')
				.contains(companyName)
				.should('be.visible');

			// Step 2: click Full Profile
			cy.get('button').contains('Full Profile').click();
			cy.wait('@getConfig').then(({ request }) => {
				authHeaders = {
					'x-auth-token': request.headers['x-auth-token'],
					'x-auth-project': request.headers['x-auth-project']
				};
				cy.log('✅ Auth Headers captured:', JSON.stringify(authHeaders));
			});
			cy.get('p').contains(companyName).should('be.visible');

			// Step 3: capture General Details dynamically
			cy.wait(2000); // wait for UI fields to render
			cy.get('.hover-hoc-container').each(($container) => {
				const label = $container.find('.hover-hoc-container__label').text().trim();
				const value = $container.find('.hover-hoc-container__input__display-value').text().trim();
				if (label) generalDetails[label] = value;
			}).then(() => {
				cy.log('📌 General Details UI Object:', JSON.stringify(generalDetails));

				cy.wait('@taskDetail').then(({ request }) => {
					const lastId = request.url.split('/').pop();
					cy.log(`✅ projectTaskTradeId: ${lastId}`);

					// Step 5: fetch API data using dynamic authHeaders
					cy.request({
						method: 'GET',
						url: `https://uat.kwant.ai/api/projectTaskTrade/detail/${lastId}`,
						headers: authHeaders
					}).then((apiResp) => {
						const apiData = apiResp.body || {};
						cy.log('📌 API General Details:', JSON.stringify(apiData));

						// Step 6: compare UI labels with API fields
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
								// Add other dynamic mappings if needed
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
	let authHeaders = {};
	let selectedWorker;
	let companyName;
	const uiDocuments = [];
  
	// Intercepts
	cy.intercept('GET', '**/config**').as('getConfig');
	cy.intercept('GET', '**/api/projectTaskTrade/detail/**').as('taskDetail');
  
	// Helpers
	const normalize = (str) => (str || '').toString().trim().toLowerCase();
	const normalizeDate = (dateStr) => {
	  if (!dateStr || dateStr === '-') return '';
	  if (dateStr.includes('/')) {
		const [month, day, year] = dateStr.split('/');
		return `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
	  }
	  if (dateStr.includes('T')) return dateStr.split('T')[0];
	  return dateStr;
	};
  

  
	// Step 1: select worker
	cy.get(workforceSelector.tableRow).its('length').should('be.greaterThan', 1);
	cy.get(workforceSelector.tableRow).then(($rows) => {
	  const matchedRows = Array.from($rows).filter(row =>
		Number(Cypress.$(row).find('.site-label').text().trim()) >= 1
	  );
	  expect(matchedRows.length).to.be.gte(2, 'At least two rows with label >=1');
  
	  selectedWorker = matchedRows[1];
	  cy.wrap(selectedWorker).find('input[type="checkbox"]').check({ force: true });
  
	  cy.wrap(selectedWorker)
		.find('.personal-info-content__title')
		.invoke('text')
		.then((text) => {
		  companyName = text.trim();
		  cy.log(`✅ Selected company: ${companyName}`);
  
		  cy.get('.onsite-selected-container .personal-info-content__title')
			.contains(companyName)
			.should('be.visible');
  
		  // Step 2: open Full Profile
		  cy.get('button').contains('Full Profile').click();
		  	// Step 0: get auth headers dynamically
	cy.wait('@getConfig').then(({ request }) => {
		authHeaders = {
		  'x-auth-token': request.headers['x-auth-token'],
		  'x-auth-project': request.headers['x-auth-project']
		};
		cy.log('✅ Auth Headers captured:', JSON.stringify(authHeaders));
	  });
		  cy.get('p').contains(companyName).should('be.visible');
  
		  // Step 3: navigate to Document page
		  cy.get(workforceSelector.documentPage).click();
  
		  // Step 4: capture UI documents
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
  
			  // Step 5: wait for projectTaskTrade API
			  cy.wait('@taskDetail').then(({ request }) => {
				const lastId = request.url.split('/').pop();
				cy.log(`✅ projectTaskTradeId: ${lastId}`);
  
				// Step 6: fetch API data
				cy.request({
				  method: 'GET',
				  url: `https://uat.kwant.ai/api/projectTaskTrade/detail/${lastId}`,
				  headers: authHeaders
				}).then((apiResp) => {
				  const apiDocs = apiResp.body.documents?.docList || [];
				  cy.log('📌 API documents:', JSON.stringify(apiDocs));
  
				  // Step 7: strict match each UI doc
				  uiDocuments.forEach((uiDoc) => {
					cy.log(`🔍 Validating document: ${uiDoc.name}`);
  
					const match = apiDocs.find(apiDoc => 
					  normalize(apiDoc.documentType) === normalize(uiDoc.name)
					);
  
					// Fail immediately if no match
					if (!match) {
					  throw new Error(`❌ No API match found for document: ${uiDoc.name}`);
					}
  
					// Expiry check
					const apiExpiry = normalizeDate(match.expiryDate);
					const uiExpiry = normalizeDate(uiDoc.expiry);
					if (uiExpiry !== apiExpiry) {
					  throw new Error(`❌ Expiry mismatch for ${uiDoc.name}: UI="${uiDoc.expiry}" vs API="${match.expiryDate}"`);
					}
  
					// Credential ID check
					const apiCred = normalize(match.credentialId);
					const uiCred = normalize(uiDoc.credentialId);
					if (uiCred !== apiCred) {
					  throw new Error(`❌ CredentialId mismatch for ${uiDoc.name}: UI="${uiDoc.credentialId}" vs API="${match.credentialId}"`);
					}
  
					cy.log(`✔ Document validated: ${uiDoc.name} | Expiry: ${uiExpiry} | CredentialId: ${uiCred}`);
				  });
  
				  cy.log('🎯 All documents validated successfully!');
				});
			  });
			});
		});
	});
  });


})

