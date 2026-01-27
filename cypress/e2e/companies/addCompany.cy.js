/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import companiesHelper from '../../support/helper/companiesHelper';
import { generateCompanyData } from '../../fixtures/workerData';
import { generateWorkerData } from '../../fixtures/workerData';
import { workforceSelector } from '../../support/workforceSelector';
import { addWorkerSelector } from '../../selector/addWorker';


describe("Companies Module - Search", () => {

  before(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title')
        .contains(Cypress.env('PROJECT_NAME'))
        .click();
    });
    companiesHelper.visitCompaniesPage();
  });
  beforeEach(() => {
	// cy.get('body').then($body => {
	// 	if ($body.find('aside button svg, .sc-krNlru svg').length > 0) {
	// 	  cy.get('aside button svg, .sc-krNlru svg').first().click({ force: true });
	// 	}

// }) 
cy.get('body').click(0, 0);
})
  beforeEach(() => {
	cy.get('body').then($body => {
		if ($body.find(workforceSelector.searchInput).length > 0) {
			cy.get(workforceSelector.searchInput).clear()
		}	
		
}) 
  })

  it('shows error message when invalid phone number is entered while adding a company', () => {
	const companyData = generateCompanyData();
	const invalidPhones = [
	  '12345',
	  'abcdefghij',
	  '98@#123456',
	  '980000000000'
	];
	const errorMessagePrefix = 'Phone number can not be verified as a valid Number';
  
	cy.get('[label="Add Company"] button').click();
	cy.wait(1000)
	cy.get('input[placeholder="Enter Company Name"]')
	  .type(companyData.companyName);
  
	cy.wrap(invalidPhones).each((invalidPhone) => {
	  cy.get('input[placeholder="Enter Phone Number"]')
		.clear()
		.type(invalidPhone)
		.should('have.value', invalidPhone);
  
	  cy.get('footer [label="Add Company"] button').click();
  
	  cy.get('.sc-kOPcWz')
		.should('be.visible')
		.should('contain.text', invalidPhone)
		.and('contain.text', errorMessagePrefix);
	});
  });

  it('Should restrict worker image upload to PNG, JPG, JPEG', () => {
	cy.get('[label="Add Company"] button').click();
cy.wait(1000)
	cy.get('input[type="file"]', { timeout: 5000 })
	.should('exist')
	.selectFile('cypress/fixtures/demo.pdf', { force: true });
	cy.get('.sc-kOPcWz').contains ('Image upload failed: Unsupported file type.').should('be.visible');

  });

  it('Should show warning when adding existing Company', () => {
    cy.get('.personal-info-content__title')
      .first()
      .invoke('text')
      .then((fullName) => {
        const [firstName, lastName] = fullName.trim().split(" ");

		cy.get('[label="Add Company"] button').click();
		cy.get('input[placeholder="Enter Company Name"]').type(fullName.trim());
		cy.get('footer [label="Add Company"] button').click();
		cy.get('.sc-kOPcWz')
		  .should('be.visible')
		  .and('contain.text', 'Company name has already been registered.');
      });
  });
  
  

it('Validate submiting the Add Company form while leaving all field empty', () => {
	cy.get('[label="Add Company"] button').click();
	cy.get('footer [label="Add Company"] button').click();
	cy.get('.sc-kOPcWz')
	  .should('be.visible')
	  .and('contain.text', 'Company name is required.');
})
  it("Verify that a company can be added with only the mandatory field filled.", () => {
	let companyId;
	cy.intercept('POST', '/api/projectTaskTrades').as('addCompany');
	cy.wait(1000)
	cy.get('[label="Add Company"] button').click();
	const companyData = generateCompanyData();
	cy.get('input[placeholder="Enter Company Name"]').type(companyData.companyName);
	cy.get('input[placeholder="Enter Company Name"]').should('have.value', companyData.companyName);
	cy.wait(1000)
	cy.get('footer [label="Add Company"] button').click();
	cy.get('.sc-kOPcWz')
	  .should('be.visible')
	  .and('contain.text', 'Company added successfully');

	  cy.wait('@addCompany').then(({ response }) => {
		expect(response.statusCode).to.eq(201);
		companyId = response.body.id;
	  
		expect(response.body.name).to.eq(companyData.companyName);
		expect(response.body.status).to.eq('ACTIVE');
	  
		// Save to fixture
		cy.writeFile('cypress/fixtures/createdCompanyNoWorker.json', {
		  id: response.body.id,
		  name: response.body.name
		});
	  });


})


it("Verify that a company can be added with only the mandatory field filled.", () => {
	const companyData = generateCompanyData();
	let companyId;
  
	cy.intercept('POST', '/api/projectTaskTrades').as('addCompany');
	cy.intercept('POST', '/api/companies/delete').as('deleteCompany');
  
	cy.get('[label="Add Company"] button').click();
	cy.wait(1000)
  
	cy.get('input[placeholder="Enter Company Name"]')
	  .type(companyData.companyName)
	  .should('have.value', companyData.companyName);
	  cy.wait(2000)
  
	cy.get('footer [label="Add Company"] button').click();
  
	cy.wait('@addCompany').then(({ response }) => {
		expect(response.statusCode).to.eq(201);
		companyId = response.body?.id; // store ID for cleanup
		cy.log(`Company created with ID: ${companyId}`);
	  });
  
	cy.get('.sc-kOPcWz')
	  .should('be.visible')
	  .and('contain.text', 'Company added successfully');
  
	cy.get('body').click(0, 0);
  
	cy.get(workforceSelector.searchInput).clear().type(companyData.companyName);
  
	cy.get(".sc-cRmqLi").contains(companyData.companyName).should('be.visible');
  
	cy.get(".sc-cRmqLi").each(($row) => {
	  cy.wrap($row).find('[type="checkbox"]').check({ force: true });
	});

	cy.get(workforceSelector.overflowMenu).click();
	cy.contains(".dropdown-option", "Delete").click();
	cy.get("button p").contains("Delete").click();
	cy.wait('@deleteCompany').its('response.statusCode').should('eq', 200);
  });

  it('verify adding company while usin the camera to capture logo', () => {
	cy.get('[label="Add Company"] button').click();
	cy.wait(1000)
	cy.intercept('POST', '/api/projectTaskTrades').as('addCompany');
	cy.intercept('POST', '/api/companies/delete').as('deleteCompany');
	let companyId;
	const companyData = generateCompanyData();
	cy.get('input[placeholder="Enter Company Name"]').type(companyData.companyName);
	cy.get('input[placeholder="Enter Company Name"]').should('have.value', companyData.companyName);
	cy.get('.upload-button__camera-icon').click();
	cy.get('.upload-button__upload-options__option').eq(1).click()
	cy.get('.video_viewer').should('be.visible');
	cy.get('.hdcwLk > button > p').click();
	cy.contains('button>p','Submit Photo').click()
	cy.get('.upload-avatar img')
    .should('have.attr', 'src')
    .and('match', /^blob:/); 
	cy.wait(1000)
	cy.get('footer [label="Add Company"] button').click();
	cy.wait('@addCompany').then(({ response }) => {
		expect(response.statusCode).to.eq(201);
		companyId = response.body?.id; // store ID for cleanup
		cy.log(`Company created with ID: ${companyId}`);
	  });
	cy.get('.sc-kOPcWz')
	  .should('be.visible')
	  .and('contain.text', 'Company added successfully');
	  cy.get('body').click(0, 0);

	cy.get(workforceSelector.searchInput).clear().type(companyData.companyName);
  
	cy.get(".sc-cRmqLi").contains(companyData.companyName).should('be.visible');
  
	cy.get(".sc-cRmqLi").each(($row) => {
	  cy.wrap($row).find('[type="checkbox"]').check({ force: true });
	});
	cy.get(workforceSelector.overflowMenu).click();
	cy.contains(".dropdown-option", "Delete").click();
	cy.get("button p").contains("Delete").click();
	cy.wait('@deleteCompany').its('response.statusCode').should('eq', 200);
  })
  
  
  it('Verify adding company with all fields filled', () => {

	cy.viewport(1440, 900);
  
	const companyData = generateCompanyData();
	const workerData = generateWorkerData();
	let companyId;
  
	const tempCsvPath = `cypress/fixtures/temp/worker_${Date.now()}.csv`;
  
	cy.intercept('POST', '/api/projectTaskTrades').as('addCompany');
	cy.intercept('POST', '/api/companies/delete').as('deleteCompany');
  
	// ---------- CREATE TEMP CSV (ISOLATED) ----------
	cy.readFile('cypress/fixtures/testdata/fulldata.csv').then((content) => {
	  const lines = content.split('\n');
	  const headers = lines[0].split(',');
	  const data = lines[1].split(',');
  
	  const getIndex = (headerName) =>
		headers.findIndex(
		  h => h.replace(/"/g, '').trim() === headerName
		);
  
	  data[getIndex('First Name')] = `"${workerData.firstName}"`;
	  data[getIndex('Last Name')] = `"${workerData.lastName}"`;
	  data[getIndex('Company Name')] = `"${companyData.companyName}"`;
  
	  const updatedCsv = [headers.join(','), data.join(',')].join('\n');
	  cy.writeFile(tempCsvPath, updatedCsv);
	});
  
	cy.get('[label="Add Company"] button').click();
	cy.wait(1000)
  
	cy.get('input[type="file"]', { timeout: 5000 })
	  .should('exist')
	  .selectFile('cypress/fixtures/profile.png', { force: true });
  
	cy.get('label').contains('E Mail').parent().find('input')
	  .type(companyData.email);
  
	cy.get('label').contains('Company Name').parent().find('input')
	  .type(companyData.companyName);
  
	cy.get('label').contains('Zip Code').parent().find('input')
	  .type(companyData.zipCode);
  
	cy.selectRandomOption(
	  '[placeholder="Select Certificates"]',
	  '.sc-tagGq[role="button"]',
	  'certificatesName'
	);
  
	cy.selectRandomOption(
	  '[placeholder="Select Primary Trade"]',
	  '.sc-tagGq[role="button"]',
	  'primaryTradeName'
	);
  
	cy.get('label').contains('Phone Number').parent().find('input')
	  .type(companyData.phoneNumber);
  
	cy.get('label').contains('Address').parent().find('input')
	  .type(companyData.address);
  
	cy.get('.label-active').contains('Company Banner').parent().click();
	cy.get('.sc-fqkvVR.sc-dcJsrY').eq(2).click();
  
	addWorkerSelector.addCertificationButton().click();
  
	cy.selectRandomOption(
	  '[name="documentType"]',
	  '.sc-tagGq[role="button"]',
	  'documentType'
	);
  
	addWorkerSelector.credentialIdInput()
	  .type('74774747477477474');
  
	cy.get('[placeholder="Issued Date"]').click();
  
	cy.fixture('image.png', 'base64').then(fileContent => {
	  cy.get('.sc-erUUZj').attachFile(
		{
		  fileContent,
		  fileName: 'file.pdf',
		  mimeType: 'application/pdf'
		},
		{ subjectType: 'drag-n-drop' }
	  );
	});
  
	addWorkerSelector.submitButton().click();
  
	cy.get('.sc-fqkvVR.sc-dcJsrY').eq(1).click();
	cy.get('button p').contains('Add Worker').click();
  
	cy.get('button.sc-erUUZj').attachFile(
	  {
		filePath: tempCsvPath.replace('cypress/fixtures/', ''),
		mimeType: 'text/csv'
	  },
	  { subjectType: 'drag-n-drop', force: true }
	);
  
	cy.get('.sc-kOPcWz')
	  .contains('1 worker(s) will be added.')
	  .should('be.visible');

	  cy.wait(1000)
  
	cy.get('.hdcwLk > button > p').click();
  
	cy.wait('@addCompany').then(({ response }) => {
		expect(response.statusCode).to.eq(201);
		companyId = response.body.id;
	  
		expect(response.body.name).to.eq(companyData.companyName);
		expect(response.body.email).to.eq(companyData.email);
		expect(response.body.status).to.eq('ACTIVE');
		cy.writeFile('cypress/fixtures/createdCompany.json', {
		  id: response.body.id,
		  name: response.body.name
		});
	  });
	  
  
cy.get('body').click(0, 0);
	cy.get(workforceSelector.searchInput)
	  .clear()
	  .type(companyData.companyName);
  
	cy.contains('.sc-cRmqLi', companyData.companyName).click();
  
	cy.getWorkerField('Company Name')
	  .should('have.text', companyData.companyName);
  
	cy.getWorkerField('E Mail')
	  .should('have.text', companyData.email);
  
	cy.get('.sc-fqkvVR.sc-dcJsrY').eq(1).click();
  
	cy.get('.details')
	  .should('contain.text', 'Total Workers')
	  .and('contain.text', '1');
  });

})


