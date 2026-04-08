import { workforceSelector } from '../../../support/workforceSelector';
import WorkerHelper from '../../../support/helper/workerHelper';
class filterPage {
	switchToCardLayout() {
		cy.get('.selector-item.first').click()
		cy.get('.selector-item.first').should('have.class', 'active');
		  cy.get('.filters_header_right_section .selector-item.first').click();
	}

		openFilter() {
		  cy.contains('button p', 'Filter').click();
		  cy.contains('h1', 'Filters').should('be.visible');
		}
	  
		getLabel(labelText) {
		  return cy.get('body').then(($body) => {
			if ($body.find(`.select-container__label:contains("${labelText}")`).length > 0) {
			  return cy.contains('.select-container__label', labelText);
			} else {
			  return cy.contains('label', labelText);
			}
		  });
		}

	  
		validateFiltersFromAPI(excludedFilters = []) {
		  cy.wait('@getFilters').then(({ response }) => {
	  
			const visibleFilters = response.body
			  .filter(f => f.showInFilter)
			  .filter(f => !excludedFilters.includes(f.displayName));
	  
			visibleFilters.forEach(filter => {
			  this.getLabel(filter.displayName)
				.scrollIntoView()
				.should('be.visible');
			});
	  
		  });

		}
		applyFilter(){
			cy.contains('section button p', 'Filter').click();
			cy.get('body').click(0, 0);
			cy.get('.loader-image').should('not.exist');
		}

		filterByWorkerName(name) {
			cy.get('[placeholder="Enter Name"]').clear().type(name);
		  }

		  verifyWorkerInTable(workerName) {
			cy.get('body').then(($body) => {
			  const $rows = $body.find(workforceSelector.tableRow);
		  
			  if ($rows.length > 0) {
				cy.wrap($rows).each(($row) => {
				  cy.wrap($row)
					.invoke('text')
					.then((text) => {
					  const cleanText = text.replace(/\s+/g, ' ').trim();
					  expect(cleanText, `Row should include ${workerName}`).to.include(workerName);
					});
				});
			  } else {
				cy.validateEmptyTable();
			  }
			});
		  }
		  selectRandomOption(aliasName = 'selectedOption') {
			const defaultSelector = '.multi-select-option__head'; 
		  
			cy.get(defaultSelector)
			  .then($options => {
				const optionList = [...$options].map(el => el.innerText.trim());
				expect(optionList.length, 'Options list should not be empty').to.be.greaterThan(0);
		  
				const randomOption = Cypress._.sample(optionList);
		  
				cy.contains(defaultSelector, randomOption)
				  .scrollIntoView()
				  .click({ force: true });
	
				return cy.wrap(randomOption).as(aliasName);
			  });
		  }
	}
	  export default new filterPage();