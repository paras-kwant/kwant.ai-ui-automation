/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';
import workerHelper from '../../support/helper/workerHelper';
import { generateWorkerData } from '../../fixtures/workerData.js';
import companiesHelper from '../../support/helper/companiesHelper.js';


describe("Companu Module -  Download", () => {

  before(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.contains('.card-title', Cypress.env('PROJECT_NAME'), { timeout: 40000 })
        .should('be.visible')
        .click();
    });
	companiesHelper.visitCompaniesPage();
  });
  beforeEach(() => {
	cy.get('body').then(($body) => {
		if ($body.find('aside button svg, .sc-krNlru svg').length > 0) {
		  cy.get('aside button svg, .sc-krNlru svg').first().click({ force: true });
		}
	  });

  })
  describe('Download company CSV', () => {

    it('Should download the worker CSV template successfully', () => {
		const DOWNLOADS_FOLDER = Cypress.config("downloadsFolder");
      const fileName = 'Company-upload-template.csv';

	  cy.task("deleteDownloadedFiles", {
		downloadsFolder: DOWNLOADS_FOLDER,
		pattern: "Company-upload-template",
		extension: ".csv"
	  });

      workerHelper.openUploadModal();
      cy.get('.sc-jaXxmE p').contains('Companies Upload Template').click();

      cy.readFile(`${DOWNLOADS_FOLDER}/${fileName}`, { timeout: 15000 })
        .should('exist')
        .then((content) => {
          const expectedHeaders = [
            "S.No.","Company Name","Phone Number","Email"
          ];

          expectedHeaders.forEach(header => {
            expect(content).to.contain(header);
          });
        });
    });
	it('Should verify downloaded Company CSV content matches UI Company list', () => {
		const DOWNLOADS_FOLDER = Cypress.config("downloadsFolder");
	
		cy.wait(4000);
	  
		cy.get('.personal-info-content__title').then(($els) => {
		  const uiCompanyNames = [...$els].map(el => el.innerText.trim());
		  cy.log('UI Names:', uiCompanyNames.join(', '));
	  
		  // Delete old files first
		  cy.task("deleteDownloadedFiles", {
			downloadsFolder: DOWNLOADS_FOLDER,
			pattern: "Company",
			extension: ".csv"
		  });
		  cy.get('.sc-gFAWRd>.sc-aXZVg>button').click();
		  cy.get('.dropdown-option').contains('Download').click();
	  
		  cy.wrap(null).then(() => {
			const getFile = () =>
			  cy.task("getLatestDownloadedFile", {
				downloadsFolder: DOWNLOADS_FOLDER,
				prefix: "Company"
			  }).then((fileName) => {
				if (!fileName) {
				  cy.wait(1000); // retry after 1 sec
				  return getFile();
				}
				return fileName;
			  });
	  
			return getFile();
		  }).then((fileName) => {
			const FILE_PATH = path.join(DOWNLOADS_FOLDER, fileName);
			cy.log(`Downloaded file found: ${FILE_PATH}`);
	  
			// Parse CSV
			cy.task("parseExcel", { filePath: FILE_PATH }).then((rows) => {
			  // Find header row
			  const headerRowIndex = rows.findIndex(row =>
				row.some(cell => cell?.toString().trim() === "Company Name")
			  );
			  if (headerRowIndex === -1) throw new Error("CSV missing 'Company Name' column");
	  
			  const header = rows[headerRowIndex];
			  const companyIndex = header.findIndex(h => h?.toString().trim() === "Company Name");

	  
			  const csvCompanyNames = rows.slice(headerRowIndex + 1)
				.map(row => row[companyIndex]?.toString().trim())
				.filter(Boolean);
	  
			  cy.log('CSV Names:', csvCompanyNames.join(', '));
	  

			  const missing = uiCompanyNames.filter(name => !csvCompanyNames.includes(name));
			  expect(missing, `UI companies missing in CSV: ${missing.join(', ')}`).to.be.empty;
			});
		  });
		});
	  });
	  
	  
	  
	  
	  

    it('Should verify downloaded CSV contains only the selected Company', () => {
		const DOWNLOADS_FOLDER = Cypress.config("downloadsFolder");
	  

		cy.wait(4000);
	  
		cy.get('.personal-info-content__title').eq(0).then(($els) => {
		  const uiCompanyNames = [...$els].map(el => el.innerText.trim());
		  cy.log('UI Names:', uiCompanyNames.join(', '));
	  
		  // Delete old files first
		  cy.task("deleteDownloadedFiles", {
			downloadsFolder: DOWNLOADS_FOLDER,
			pattern: "Company",
			extension: ".csv"
		  });
		  cy.get('.checkboxCheckmark').eq(0).click({ force: true });
		  cy.get('.sc-gFAWRd>.sc-aXZVg>button').click();
		  cy.get('.dropdown-option').contains('Download').click();
	  
		  cy.wrap(null).then(() => {
			const getFile = () =>
			  cy.task("getLatestDownloadedFile", {
				downloadsFolder: DOWNLOADS_FOLDER,
				prefix: "Company"
			  }).then((fileName) => {
				if (!fileName) {
				  cy.wait(1000); // retry after 1 sec
				  return getFile();
				}
				return fileName;
			  });
	  
			return getFile();
		  }).then((fileName) => {
			const FILE_PATH = path.join(DOWNLOADS_FOLDER, fileName);
			cy.log(`Downloaded file found: ${FILE_PATH}`);
	  
			// Parse CSV
			cy.task("parseExcel", { filePath: FILE_PATH }).then((rows) => {
			  // Find header row
			  const headerRowIndex = rows.findIndex(row =>
				row.some(cell => cell?.toString().trim() === "Company Name")
			  );
			  if (headerRowIndex === -1) throw new Error("CSV missing 'Company Name' column");
	  
			  const header = rows[headerRowIndex];
			  const companyIndex = header.findIndex(h => h?.toString().trim() === "Company Name");

	  
			  const csvCompanyNames = rows.slice(headerRowIndex + 1)
				.map(row => row[companyIndex]?.toString().trim())
				.filter(Boolean);
	  
			  cy.log('CSV Names:', csvCompanyNames.join(', '));
			  expect(csvCompanyNames.length, 'Only one company should be in CSV').to.equal(1);
	  

			  const missing = uiCompanyNames.filter(name => !csvCompanyNames.includes(name));
			  expect(missing, `UI companies missing in CSV: ${missing.join(', ')}`).to.be.empty;
			});
		  });
		});
	})
})
});



function extractWorkerNamesFromCSV(rows) {
  const header = rows[1];
  const firstNameIndex = header.indexOf("First Name");
  const lastNameIndex = header.indexOf("Last Name");

  return rows.slice(2)
    .map(row => {
      const first = row[firstNameIndex]?.toString().trim() || "";
      const last = row[lastNameIndex]?.toString().trim() || "";
      return `${first} ${last}`.trim();
    })
    .filter(Boolean);
}

function validateNamesMatch(uiNames, csvNames) {
  const missing = uiNames.filter(name => !csvNames.includes(name));
  expect(missing, `Missing workers in CSV: ${missing.join(', ')}`).to.be.empty;
}




