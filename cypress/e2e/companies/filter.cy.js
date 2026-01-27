/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import companiesHelper from '../../support/helper/companiesHelper';
import { workforceSelector } from '../../support/workforceSelector';

describe("Companies Module - Filter", () => {

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
	        
        cy.get('body').then($body => {
          if ($body.find('aside button svg, .sc-krNlru svg').length > 0) {
            cy.get('aside button svg, .sc-krNlru svg').first().click({ force: true });
          }
    
          if ($body.find('.sc-ktJbId.sc-gmgFlS').length > 0) {
            cy.get('.sc-ktJbId.sc-gmgFlS').eq(0).click({ force: true });
          } else {
            cy.log('Pagination not found, skipping to page one selection');
          }
      
          if ($body.find('.tag.default.grey:contains("Clear")').length > 0) {
            cy.contains('.tag.default.grey', 'Clear')
              .click({ force: true });
          }
    
          if ($body.find('.filters-header-container svg').length > 0) {
            cy.get('.filters-header-container svg').eq(0).click();
          }
    
          if($body.find(workforceSelector.searchInput).length > 0){
            cy.get(workforceSelector.searchInput).clear();
          }
        });
	
  });
  
  it("Verify Company Name filter dropdown can be opened", () => {
	cy.contains('.sc-fremEr.jImTfM', 'Company Name').find('.table-header-filter-btn').click();

  })


  it('Verify the table header filter exists for applicable table headers', () => {

    cy.get('.sc-bXWnss').each(($el, index) => {
      if (index >= 3) { // skip first 3 headers
        cy.wrap($el).then(($header) => {
          if ($header.find('.table-header-filter-btn').length) {
            cy.wrap($header)
              .find('.table-header-filter-btn')
              .should('exist'); 
          }
        });
      }
    });
  });
  
  it("Verify filtering by Primary Trade selection", () => {
	cy.contains('.sc-fremEr.jImTfM', 'Primary Trade')
	  .find('.table-header-filter-btn')
	  .click();
  
	cy.get(".sc-fzQBhs.fyTPqL").then(($parents) => {
  
	  const validParents = $parents.filter((_, el) => {
		const text = Cypress.$(el)
		  .find(".sc-eldPxv.bVwlNE")
		  .text()
		  .trim();
		return text !== "None";
	  });
  
	  expect(validParents.length, 'Non-None options available')
		.to.be.greaterThan(0);
  
	  const randomIndex = Cypress._.random(0, validParents.length - 1);
	  const $randomParent = validParents.eq(randomIndex);
  
	  const name = $randomParent
		.find(".sc-eldPxv.bVwlNE")
		.text()
		.trim();
  
	  cy.log(`Randomly selected company name: ${name}`);
  
	  cy.wrap($randomParent)
		.find('input[type="checkbox"]')
		.check({ force: true });
  
	  cy.get("p").contains("Filters:").click();
	  cy.wait(2000)
  
	  cy.verifyTableorEmptyState({
		tableRowSelector: ".sc-cRmqLi",
		cellSelector: ".table_td",
		expectedText: name,
	  });
	});
  });
  

  it("Verify filtering by Company Name selection", () => {
	cy.contains('.sc-fremEr.jImTfM', 'Company Name').find('.table-header-filter-btn').click();
	 cy.get(".sc-fzQBhs.fyTPqL").then(($parents) => {
	   const randomIndex = Cypress._.random(0, $parents.length - 1);
	   const $randomParent = $parents.eq(randomIndex);
	   const name = $randomParent.find(".sc-eldPxv.bVwlNE").text().trim();
 
	   cy.log(`Randomly selected company name: ${name}`);
 
	   cy.wrap($randomParent)
		 .find('input[type="checkbox"]')
		 .check({ force: true });
 
	   cy.get("p").contains("Filters:").click();
	   cy.wait(2000)
 
	   cy.verifyTableorEmptyState({
		 tableRowSelector: ".sc-cRmqLi",
		 cellSelector: ".personal-info-content__title",
		 expectedText: name,
	   });
	 });
   });



  it("Verify filtering by Status selection", () => {
	cy.contains('.sc-fremEr.jImTfM', 'Status')
	  .find('.table-header-filter-btn')
	  .click();
  
	cy.get(".sc-fzQBhs.fyTPqL").then(($parents) => {
  
	  const validParents = $parents.filter((_, el) => {
		const text = Cypress.$(el)
		  .find(".sc-eldPxv.bVwlNE")
		  .text()
		  .trim();
		return text !== "None";
	  });
  
	  expect(validParents.length, 'Non-None options available')
		.to.be.greaterThan(0);
  
	  const randomIndex = Cypress._.random(0, validParents.length - 1);
	  const $randomParent = validParents.eq(randomIndex);
  
	  const name = $randomParent
		.find(".sc-eldPxv.bVwlNE")
		.text()
		.trim();
  
	  cy.log(`Randomly selected company name: ${name}`);
  
	  cy.wrap($randomParent)
		.find('input[type="checkbox"]')
		.check({ force: true });
  
	  cy.get("p").contains("Filters:").click();
	  cy.wait(2000)
  
	  cy.verifyTableorEmptyState({
		tableRowSelector: ".sc-cRmqLi",
		cellSelector: ".table_td",
		expectedText: name,
	  });
	});
  });


  it("Verify filtering by Safety Manager selection", () => {
	cy.contains('.sc-fremEr.jImTfM', 'Safety Manager')
	  .find('.table-header-filter-btn')
	  .click();
  
	cy.get(".sc-fzQBhs.fyTPqL").then(($parents) => {
  
	  const validParents = $parents.filter((_, el) => {
		const text = Cypress.$(el)
		  .find(".sc-eldPxv.bVwlNE")
		  .text()
		  .trim();
		return text !== "None";
	  });
  
	  expect(validParents.length, 'Non-None options available')
		.to.be.greaterThan(0);
  
	  const randomIndex = Cypress._.random(0, validParents.length - 1);
	  const $randomParent = validParents.eq(randomIndex);
  
	  const name = $randomParent
		.find(".sc-eldPxv.bVwlNE")
		.text()
		.trim();
  
	  cy.log(`Randomly selected company name: ${name}`);
  
	  cy.wrap($randomParent)
		.find('input[type="checkbox"]')
		.check({ force: true });
  
	  cy.get("p").contains("Filters:").click();
	  cy.wait(2000)
  
	  cy.verifyTableorEmptyState({
		tableRowSelector: ".sc-cRmqLi",
		cellSelector: ".table_td",
		expectedText: name,
	  });
	});
  });

  it("Verify filtering by Project Manager selection", () => {
	cy.contains('.sc-fremEr.jImTfM', 'Project Manager')
	  .find('.table-header-filter-btn')
	  .click();
  
	cy.get(".sc-fzQBhs.fyTPqL").then(($parents) => {
  
	  const validParents = $parents.filter((_, el) => {
		const text = Cypress.$(el)
		  .find(".sc-eldPxv.bVwlNE")
		  .text()
		  .trim();
		return text !== "None";
	  });
  
	  expect(validParents.length, 'Non-None options available')
		.to.be.greaterThan(0);
  
	  const randomIndex = Cypress._.random(0, validParents.length - 1);
	  const $randomParent = validParents.eq(randomIndex);
  
	  const name = $randomParent
		.find(".sc-eldPxv.bVwlNE")
		.text()
		.trim();
  
	  cy.log(`Randomly selected company name: ${name}`);
  
	  cy.wrap($randomParent)
		.find('input[type="checkbox"]')
		.check({ force: true });
  
	  cy.get("p").contains("Filters:").click();
	  cy.wait(2000)
  
	  cy.verifyTableorEmptyState({
		tableRowSelector: ".sc-cRmqLi",
		cellSelector: ".table_td",
		expectedText: name,
	  });
	});
  });



  it("Verify filtering by Phone Number", () => {
	const phoneNumber = '+9779812345678';
  
	cy.contains('.sc-fremEr.jImTfM', 'Phone Number')
	  .find('.table-header-filter-btn')
	  .click();
  
	cy.get("input.sc-fHjqPf.fCepZC").type(phoneNumber);
	cy.get("p").contains("Filters:").click();
	cy.wait(4000)
  
	cy.get('body').then(($body) => {
	  const hasRows = $body.find(workforceSelector.tableRow).length > 0;
  
	  if (hasRows) {
		cy.get(workforceSelector.tableRow).each(($row) => {
		  cy.wrap($row)
			.find('.table_td')
			.then(($cells) => {
			  const hasMatch = [...$cells].some(cell =>
				cell.innerText.trim().includes('+9779812345678')
			  );
  
			  expect(hasMatch, 'Row should contain phone number').to.be.true;
			});
		});
  
	  } else {
		cy.get('.empty-body').should(
		  'have.text',
		  'No Results FoundTry adjusting your search or filter to find what you are looking for. Reset Filters '
		);
	  }
	});
  });

  it("Verify filtering by Address", () => {
	const address = 'kathmandu';
  
	cy.contains('.sc-fremEr.jImTfM', 'Address')
	  .find('.table-header-filter-btn')
	  .click();
  
	cy.get("input.sc-fHjqPf.fCepZC").type(address);
	cy.get("p").contains("Filters:").click();
	cy.wait(3000)
  
	cy.get('body').then(($body) => {
	  const hasRows = $body.find(workforceSelector.tableRow).length > 0;
  
	  if (hasRows) {
		cy.get(workforceSelector.tableRow).each(($row) => {
		  cy.wrap($row)
			.find('.table_td')
			.then(($cells) => {
			  const hasAddress = [...$cells].some(cell =>
				cell.innerText
				  .toLowerCase()
				  .includes(address.toLowerCase())
			  );
  
			  expect(
				hasAddress,
				'Each row should contain the filtered address'
			  ).to.be.true;
			});
		});
  
	  } else {
		cy.get('.empty-body').should(
		  'have.text',
		  'No Results FoundTry adjusting your search or filter to find what you are looking for. Reset Filters '
		);
	  }
	});
  });


  it("Verify filtering by Zip Code", () => {
	const zipCode = '112233';
  
	cy.contains('.sc-fremEr.jImTfM', 'Zip Code')
	  .find('.table-header-filter-btn')
	  .click();
  
	cy.get("input.sc-fHjqPf.fCepZC").type(zipCode);
	cy.get("p").contains("Filters:").click();
	cy.wait(3000)
  
	cy.get('body').then(($body) => {
	  const hasRows = $body.find(workforceSelector.tableRow).length > 0;
  
	  if (hasRows) {
		cy.get(workforceSelector.tableRow).each(($row) => {
		  cy.wrap($row)
			.find('.table_td')
			.then(($cells) => {
			  const hasAddress = [...$cells].some(cell =>
				cell.innerText
				  .toLowerCase()
				  .includes(zipCode.toLowerCase())
			  );
  
			  expect(
				hasAddress,
				'Each row should contain the filtered address'
			  ).to.be.true;
			});
		});
  
	  } else {
		cy.get('.empty-body').should(
		  'have.text',
		  'No Results FoundTry adjusting your search or filter to find what you are looking for. Reset Filters '
		);
	  }
	});
  });


  it("Verify filtering by Certificates selection", () => {
	let name;
	const validStatuses = ["Expired", "Expiring", "All Uploaded"];
  
	// Open Certificates filter
	cy.contains('.sc-fremEr.jImTfM', 'Certificates')
	  .find('.table-header-filter-btn')
	  .click();
  
	// Select random valid certificate filter (excluding "None")
	cy.get(".sc-fzQBhs.fyTPqL").then(($parents) => {
	  const validParents = $parents.filter((_, el) => {
		return Cypress.$(el)
		  .find(".sc-eldPxv.bVwlNE")
		  .text()
		  .trim() !== "None";
	  });
  
	  expect(validParents.length).to.be.greaterThan(0);
  
	  const randomIndex = Cypress._.random(0, validParents.length - 1);
	  const $randomParent = validParents.eq(randomIndex);
  
	  name = $randomParent
		.find(".sc-eldPxv.bVwlNE")
		.text()
		.trim();
  
	  cy.log(`Testing certificate filter: ${name}`);
  
	  cy.wrap($randomParent)
		.find('input[type="checkbox"]')
		.check({ force: true });
  
	  cy.contains("p", "Filters:").click();
	});
	
	cy.wait(3000);
  
	// Get certificate column index
	cy.get('.sc-fremEr.jImTfM').then(($headers) => {
	  const certColumnIndex = [...$headers].findIndex(header =>
		header.innerText.includes("Certificates")
	  );
  
	  expect(certColumnIndex).to.be.greaterThan(-1);
  
	  // Verify filtered results
	  cy.get('body').then(($body) => {
		const hasRows = $body.find(".sc-cRmqLi").length > 0;
  
		if (hasRows) {
		  cy.get(".sc-cRmqLi").each(($row) => {
			cy.wrap($row)
			  .find(".table_td")
			  .eq(certColumnIndex)
			  .then(($cell) => {
				const text = $cell.text().trim();
  
				if (name === "All Uploaded") {
				  const hasValidStatus = validStatuses.some(status =>
					text.startsWith(status)
				  );
				  expect(
					hasValidStatus,
					`Row should contain one of: ${validStatuses.join(", ")} but found "${text}"`
				  ).to.be.true;
				} else {
				  expect(text, `Row should contain "${name}"`).to.include(name);
				}
  
				cy.wrap($cell).find('.label').each(($label) => {
					cy.wrap($label).click();
					
					// Handle each .doc-option__label separately
					cy.get('.doc-option__label').should('be.visible').each(($optionLabel) => {
					  const optionText = $optionLabel.text().trim();
					  
					  cy.get('body').type('{esc}');
					  cy.wrap($cell).parent(workforceSelector.tableRow).click({force:true});
					  cy.get('.sc-fqkvVR.sc-dcJsrY').eq(2).click();
					  
					  cy.get('body').then(($body) => {
						const optionTextExists = $body.find('.sc-jaXxmE .sc-cRmqLi .cell-content').filter((_, el) => {
						  return Cypress.$(el).text().trim() === optionText || Cypress.$(el).text().includes(optionText);
						}).length > 0;
				  
						if (optionTextExists) {
						  cy.contains('.sc-jaXxmE .sc-cRmqLi .cell-content', optionText).should('be.visible');
						} else {
						  cy.get('.sc-YysOf').contains('Licences').click();
						  cy.contains('.sc-jaXxmE .sc-cRmqLi .cell-content', optionText).should('be.visible');
						  

						}
					  });
					  
					  cy.get('body').click(0, 0);
					});
				  });

				
				// Optional: Add a wait or verification after clicking
				cy.wait(1000);
				
				// Optional: If a modal/popup opens, you can verify and close it
				// cy.get('.modal-selector').should('be.visible');
				// cy.get('.close-button').click();
			  });
		  });
		} else {
		  cy.get('.empty-body').should(
			'have.text',
			'No Results FoundTry adjusting your search or filter to find what you are looking for. Reset Filters '
		  );
		}
	  });
	});
  });

  it('Verify filtering by Total Worker filter', () => {

	// Open filter
	cy.contains('.sc-fremEr.jImTfM', 'Total Workers')
	  .find('.table-header-filter-btn')
	  .click();
  
	cy.get('[placeholder="Min"]').clear().type('10');
	cy.get('[placeholder="Max"]').clear().type('50');
  
	cy.contains('p', 'Filters:').click();
	cy.wait(3000);
  
	// 1️⃣ Get Total Workers column index from header row
	cy.get('.sc-fremEr.jImTfM').then(($headers) => {
	  const totalWorkerIndex = [...$headers].findIndex(
		(header) => header.innerText.trim() === 'Total Workers'
	  );
  
	  expect(totalWorkerIndex, 'Total Workers column index').to.be.greaterThan(-1);
  
	  // 2️⃣ Validate table rows
	  cy.get('body').then(($body) => {
		if ($body.find(workforceSelector.tableRow).length > 0) {
  
		  cy.get(workforceSelector.tableRow).each(($row) => {
			cy.wrap($row)
			  .find('.table_td')
			  .eq(totalWorkerIndex)
			  .invoke('text')
			  .then((text) => {
				const totalWorkers = parseInt(text.trim(), 10);
				expect(totalWorkers).to.be.within(10, 50);
			  });
		  });
  
		} else {
		  cy.get('.empty-body')
			.should('contain.text', 'No Results Found');
		}
	  });
	});

	
  });

  it('Verify clearing all filters works correctly', () => {
	// Open Company Name filter
	cy.contains('.sc-fremEr.jImTfM', 'Company Name')
	  .find('.table-header-filter-btn')
	  .click();
  
	cy.get('.sc-fzQBhs.fyTPqL').then(($parents) => {
	  const randomIndex = Cypress._.random(0, $parents.length - 1);
	  const $randomParent = $parents.eq(randomIndex);
  
	  const companyName = $randomParent
		.find('.sc-eldPxv.bVwlNE')
		.text()
		.trim();
  

	  cy.wrap($randomParent)
		.find('input[type="checkbox"]')
		.check({ force: true });
  

	  cy.get('.label.default__label')
		.contains('Company Name: 1')
		.should('be.visible');
	});
  

	cy.contains('p', 'Filters:').click();
  

	cy.contains('.tag.default.grey', 'Clear All')
	  .should('be.visible')
	  .click();
  

	cy.contains('.tag.default.grey', 'Clear All')
	  .should('not.exist');
  

	  cy.contains('.label.default__label', 'Company Name')
	  .should('not.exist');
  });

  it('Verify filtering with multiple filters applied simultaneously', () => {
    // Apply Primary Trade filter
    cy.contains('.sc-fremEr.jImTfM', 'Primary Trade')
      .find('.table-header-filter-btn')
      .click();

    cy.get(".sc-fzQBhs.fyTPqL").then(($parents) => {
      const validParents = $parents.filter((_, el) => {
        const text = Cypress.$(el).find(".sc-eldPxv.bVwlNE").text().trim();
        return text !== "None";
      });

      const randomIndex = Cypress._.random(0, validParents.length - 1);
      cy.wrap(validParents.eq(randomIndex))
        .find('input[type="checkbox"]')
        .check({ force: true });
    });
    cy.contains('p', 'Filters:').click();

    // Apply Status filter
    cy.contains('.sc-fremEr.jImTfM', 'Status')
      .find('.table-header-filter-btn')
      .click();

    cy.get(".sc-fzQBhs.fyTPqL").then(($parents) => {
      const validParents = $parents.filter((_, el) => {
        const text = Cypress.$(el).find(".sc-eldPxv.bVwlNE").text().trim();
        return text !== "None";
      });

      const randomIndex = Cypress._.random(0, validParents.length - 1);
      cy.wrap(validParents.eq(randomIndex))
        .find('input[type="checkbox"]')
        .check({ force: true });
    });
    cy.contains('p', 'Filters:').click();

    cy.contains('.sc-fremEr.jImTfM', 'Address')
      .find('.table-header-filter-btn')
      .click();

    cy.get("input.sc-fHjqPf.fCepZC").type('kathmandu');
    cy.contains('p', 'Filters:').click();
    cy.wait(2000);

    cy.get('.label.default__label').contains('Primary Trade: 1').should('be.visible');
    cy.get('.label.default__label').contains('Status: 1').should('be.visible');
    cy.get('.label.default__label').contains('Address').should('be.visible');

    // Verify Clear All button exists
    cy.contains('.tag.default.grey', 'Clear All').should('be.visible');

    // Validate table has results or shows empty state
    cy.get('body').then(($body) => {
      if ($body.find(workforceSelector.tableRow).length > 0) {
        cy.get(workforceSelector.tableRow).should('exist');
        cy.log('✓ Results found matching all filters');
      } else {
        cy.get('.empty-body').should('contain.text', 'No Results Found');
        cy.log('⚠ No results match the applied filters');
      }
    });
  });


  it('Verify sorting functionality', () => {
	// Hover over "Company Name" header
	cy.contains('.sc-fremEr.jImTfM', 'Company Name').realHover();
  
	// First click: Sort Z-A (descending)
	cy.get('.sorting-icon').eq(0).click();
	cy.wait(3000)
  
	// Wait for table rows to appear
	cy.get('.personal-info-content__title').should('have.length.at.least', 1);
  
	// Validate Z-A order
	cy.get('.personal-info-content__title').then(($cells) => {
	  const names = $cells
		.map((_, cell) => cell.textContent.trim())
		.get();
  
	  console.log('Z-A Order:', names);
  
	  // Check Z-A sorting with normalization
	  for (let i = 0; i < names.length - 1; i++) {
		const current = names[i];
		const next = names[i + 1];
		
		const normalizedCurrent = current.toLowerCase().replace(/[^a-z0-9]/g, '');
		const normalizedNext = next.toLowerCase().replace(/[^a-z0-9]/g, '');
		
		const currentStartsWithNum = /^\d/.test(normalizedCurrent);
		const nextStartsWithNum = /^\d/.test(normalizedNext);
		
		// Letters should come before numbers in Z-A
		if (!currentStartsWithNum && nextStartsWithNum) {
		  continue; // Correct order
		} else if (currentStartsWithNum && !nextStartsWithNum) {
		  throw new Error(`Position ${i}: Letter "${next}" should come before number "${current}"`);
		} else {
		  // In Z-A, current should be >= next
		  const isCorrectOrder = normalizedCurrent >= normalizedNext;
		  expect(isCorrectOrder, `Position ${i}: "${current}" (normalized: "${normalizedCurrent}") should come after "${next}" (normalized: "${normalizedNext}")`).to.be.true;
		}
	  }
	});
  
	// Second click: Sort A-Z (ascending)
	cy.get('.sorting-icon').eq(0).click();
	cy.wait(3000)
	cy.get('.personal-info-content__title').should('have.length.at.least', 1);
  
	// Validate A-Z order
	cy.get('.personal-info-content__title').then(($cells) => {
	  const names = $cells
		.map((_, cell) => cell.textContent.trim())
		.get();
  
	  console.log('A-Z Order:', names);
  
	  // Check A-Z sorting with normalization
	  for (let i = 0; i < names.length - 1; i++) {
		const current = names[i];
		const next = names[i + 1];
		
		const normalizedCurrent = current.toLowerCase().replace(/[^a-z0-9]/g, '');
		const normalizedNext = next.toLowerCase().replace(/[^a-z0-9]/g, '');
		
		const currentStartsWithNum = /^\d/.test(normalizedCurrent);
		const nextStartsWithNum = /^\d/.test(normalizedNext);
		
		// Numbers should come before letters
		if (currentStartsWithNum && !nextStartsWithNum) {
		  continue; // Correct order
		} else if (!currentStartsWithNum && nextStartsWithNum) {
		  throw new Error(`Position ${i}: Number "${next}" should come before "${current}"`);
		} else {
		  // Compare normalized strings
		  const isCorrectOrder = normalizedCurrent <= normalizedNext;
		  expect(isCorrectOrder, `Position ${i}: "${current}" (normalized: "${normalizedCurrent}") should come before "${next}" (normalized: "${normalizedNext}")`).to.be.true;
		}
	  }
	});
  });
  
});
