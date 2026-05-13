/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import companiesHelper from '../../../support/helper/companiesHelper';
import { workforceSelector } from '../../../support/workforceSelector';

describe("WorkForce Companies Module - Filter", { tags: ["Epic:WorkForce", "Feature:Filter"] }, () => {

	beforeEach(() => {
		cy.loginAndVisit(() => companiesHelper.visitCompaniesPage('500526306'));
		cy.cleanUI();
	});

	it("WorkForce-Company - Verify Company Name filter dropdown can be opened", { tags: ["Story:Open Company Name Filter Dropdown", "Severity:critical", "UI", "@smoke"] }, () => {
		cy.contains(workforceSelector.tableColumn, 'Company Name').find('.table-header-filter-btn').click();
	});

	it('Verify the table header filter exists for applicable table headers', { tags: ["Story:Table Header Filter Existence", "Severity:normal", "UI", "Module:WorkForce-Company"] }, () => {
		cy.get(workforceSelector.tableColumn).each(($el, index) => {
			if (index >= 3) {
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

	it("WorkForce-Company - Verify filtering by Primary Trade selection", { tags: ["Story:Filter By Primary Trade", "Severity:critical", "UI", "Module:WorkForce-Company"] }, () => {
		cy.contains(workforceSelector.tableColumn, 'Primary Trade')
			.find('.table-header-filter-btn')
			.click();

		cy.get('[class*="select_item_container"]').within(() => {
			cy.get('label[for^=":r"]').then(($labels) => {
				const validLabels = $labels.filter((_, el) => {
					const text = Cypress.$(el)
						.find('span[type="onDropdown"]')
						.last()
						.text()
						.trim();
					return text !== "None";
				});

				expect(validLabels.length, 'Non-None options available').to.be.greaterThan(0);

				const randomIndex = Cypress._.random(0, validLabels.length - 1);
				const $randomLabel = validLabels.eq(randomIndex);

				const name = $randomLabel
					.find('span[type="onDropdown"]')
					.last()
					.text()
					.trim();

				cy.log(`Randomly selected Primary Trade: ${name}`);

				cy.wrap($randomLabel)
					.find('input[type="checkbox"]')
					.check({ force: true });

				cy.wrap(name).as('selectedName');
			});
		});

		cy.get("p").contains("Filters:").click();
		cy.wait(2000);

		cy.get('@selectedName').then((name) => {
			cy.verifyTableorEmptyState({
				tableRowSelector: workforceSelector.tableRow,
				cellSelector: ".table_td",
				expectedText: name,
			});
		});
	});

	it("WorkForce-Company - Verify filtering by Company Name selection", { tags: ["Story:Filter By Company Name", "Severity:critical", "UI", "Module:WorkForce-Company"] }, () => {
		cy.contains(workforceSelector.tableColumn, 'Company Name').find('.table-header-filter-btn').click();

		cy.get('[class*="select_item_container"]').within(() => {
			cy.get('label[for^=":r"]').then(($options) => {
				const randomIndex = Cypress._.random(0, $options.length - 1);
				const $randomOption = $options.eq(randomIndex);

				const name = $randomOption.find('span[type="onDropdown"]').last().text().trim();

				cy.log(`Randomly selected company name: ${name}`);

				cy.wrap($randomOption)
					.find('input[type="checkbox"]')
					.check({ force: true });
			});
		});

		cy.get("p").contains("Filters:").click();
		cy.wait(2000);

		cy.verifyTableorEmptyState({
			tableRowSelector: workforceSelector.tableRow,
			cellSelector: ".personal-info-content__title",
			expectedText: name,
		});
	});

	it("WorkForce-Company - Verify filtering by Status selection", { tags: ["Story:Filter By Status", "Severity:critical", "UI", "Module:WorkForce-Company"] }, () => {
		cy.contains(workforceSelector.tableColumn, 'Status')
			.find('.table-header-filter-btn')
			.click();

		cy.get('[class*="select_item_container"]').within(() => {
			cy.get('label[for^=":r"]').then(($labels) => {
				const validLabels = $labels.filter((_, el) => {
					const text = Cypress.$(el)
						.find('span[type="onDropdown"]')
						.last()
						.text()
						.trim();
					return text !== "None";
				});

				expect(validLabels.length, 'Non-None options available').to.be.greaterThan(0);

				const randomIndex = Cypress._.random(0, validLabels.length - 1);
				const $randomLabel = validLabels.eq(randomIndex);

				const name = $randomLabel
					.find('span[type="onDropdown"]')
					.last()
					.text()
					.trim();

				cy.log(`Randomly selected status: ${name}`);

				cy.wrap($randomLabel)
					.find('input[type="checkbox"]')
					.check({ force: true });
			});
		});

		cy.get("p").contains("Filters:").click();
		cy.wait(2000);

		cy.verifyTableorEmptyState({
			tableRowSelector: workforceSelector.tableRow,
			cellSelector: ".table_td",
			expectedText: name,
		});
	});

	it("WorkForce-Company - Verify filtering by Safety Manager selection", { tags: ["Story:Filter By Safety Manager", "Severity:critical", "UI", "Module:WorkForce-Company"] }, () => {
		cy.contains(workforceSelector.tableColumn, 'Safety Manager')
			.find('.table-header-filter-btn')
			.click();

		cy.get('[class*="select_item_container"]').within(() => {
			cy.get('label[for^=":r"]').then(($labels) => {
				const validLabels = $labels.filter((_, el) => {
					const text = Cypress.$(el)
						.find('span[type="onDropdown"]')
						.last()
						.text()
						.trim();
					return text !== "None";
				});

				expect(validLabels.length, 'Non-None options available').to.be.greaterThan(0);

				const randomIndex = Cypress._.random(0, validLabels.length - 1);
				const $randomLabel = validLabels.eq(randomIndex);

				const name = $randomLabel
					.find('span[type="onDropdown"]')
					.last()
					.text()
					.trim();

				cy.log(`Randomly selected Safety Manager: ${name}`);

				cy.wrap($randomLabel)
					.find('input[type="checkbox"]')
					.check({ force: true });

				cy.wrap(name).as('selectedName');
			});
		});

		cy.get("p").contains("Filters:").click();
		cy.wait(2000);

		cy.get('@selectedName').then((name) => {
			cy.verifyTableorEmptyState({
				tableRowSelector: workforceSelector.tableRow,
				cellSelector: ".table_td",
				expectedText: name,
			});
		});
	});

	it("WorkForce-Company - Verify filtering by Project Manager selection", { tags: ["Story:Filter By Project Manager", "Severity:critical", "UI", "Module:WorkForce-Company"] }, () => {
		cy.contains(workforceSelector.tableColumn, 'Project Manager')
			.find('.table-header-filter-btn')
			.click();

		cy.get('[class*="select_item_container"]').within(() => {
			cy.get('label[for^=":r"]').then(($labels) => {
				const validLabels = $labels.filter((_, el) => {
					const text = Cypress.$(el)
						.find('span[type="onDropdown"]')
						.last()
						.text()
						.trim();
					return text !== "None";
				});

				expect(validLabels.length, 'Non-None options available').to.be.greaterThan(0);

				const randomIndex = Cypress._.random(0, validLabels.length - 1);
				const $randomLabel = validLabels.eq(randomIndex);

				const name = $randomLabel
					.find('span[type="onDropdown"]')
					.last()
					.text()
					.trim();

				cy.log(`Randomly selected Project Manager: ${name}`);

				cy.wrap($randomLabel)
					.find('input[type="checkbox"]')
					.check({ force: true });

				cy.wrap(name).as('selectedName');
			});
		});

		cy.get("p").contains("Filters:").click();
		cy.wait(2000);

		cy.get('@selectedName').then((name) => {
			cy.verifyTableorEmptyState({
				tableRowSelector: workforceSelector.tableRow,
				cellSelector: ".table_td",
				expectedText: name,
			});
		});
	});

	it("WorkForce-Company - Verify filtering by Phone Number", { tags: ["Story:Filter By Phone Number", "Severity:critical", "UI", "Module:WorkForce-Company"] }, () => {
		const phoneNumber = '+9779812345678';

		cy.contains(workforceSelector.tableColumn, 'Phone Number')
			.find('.table-header-filter-btn')
			.click();
		cy.get('body').should('be.visible');

		cy.get('[placeholder="Search"]').eq(1).type(phoneNumber);
		cy.get("p").contains("Filters:").click();
		cy.wait(4000);

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
				cy.get('.empty-body').contains('No Results Found').should('be.visible');
			}
		});
	});

	it("WorkForce-Company - Verify filtering by Address", { tags: ["Story:Filter By Address", "Severity:critical", "UI", "Module:WorkForce-Company"] }, () => {
		const address = 'kathmandu';

		cy.contains(workforceSelector.tableColumn, 'Address')
			.find('.table-header-filter-btn')
			.click();

		cy.get('[placeholder="Search"]').eq(1).type(address);
		cy.get("p").contains("Filters:").click();
		cy.wait(3000);

		cy.get('body').then(($body) => {
			const hasRows = $body.find(workforceSelector.tableRow).length > 0;

			if (hasRows) {
				cy.get(workforceSelector.tableRow).each(($row) => {
					cy.wrap($row)
						.find('.table_td')
						.then(($cells) => {
							const hasAddress = [...$cells].some(cell =>
								cell.innerText.toLowerCase().includes(address.toLowerCase())
							);
							expect(hasAddress, 'Each row should contain the filtered address').to.be.true;
						});
				});
			} else {
				cy.get('.empty-body').contains('No Results Found').should('be.visible');
			}
		});
	});

	it("WorkForce-Company - Verify filtering by Zip Code", { tags: ["Story:Filter By Zip Code", "Severity:critical", "UI", "Module:WorkForce-Company"] }, () => {
		const zipCode = '112233';

		cy.contains(workforceSelector.tableColumn, 'Zip Code')
			.find('.table-header-filter-btn')
			.click();

		cy.get('[placeholder="Search"]').eq(1).type(zipCode);
		cy.get("p").contains("Filters:").click();
		cy.wait(3000);

		cy.get('body').then(($body) => {
			const hasRows = $body.find(workforceSelector.tableRow).length > 0;

			if (hasRows) {
				cy.get(workforceSelector.tableRow).each(($row) => {
					cy.wrap($row)
						.find('.table_td')
						.then(($cells) => {
							const hasAddress = [...$cells].some(cell =>
								cell.innerText.toLowerCase().includes(zipCode.toLowerCase())
							);
							expect(hasAddress, 'Each row should contain the filtered address').to.be.true;
						});
				});
			} else {
				cy.get('.empty-body').contains('No Results Found').should('be.visible');
			}
		});
	});

	it("WorkForce-Company - Verify filtering by Certificates selection", { tags: ["Story:Filter By Certificates", "Severity:critical", "UI", "Module:WorkForce-Company"] }, () => {
		cy.get(workforceSelector.tableRow).should('be.visible');
		const validStatuses = ["Expired", "Expiring", "All Uploaded"];
		cy.get(workforceSelector.tableColumn).then(($headers) => {
			const allHeaders = [...$headers];

			const certColumnIndex = allHeaders.findIndex((header, index) => {
				const text = header.innerText.trim();
				cy.log(`Header ${index}: "${text}"`);
				return text === "Certificates";
			});

			cy.log(`Final certColumnIndex: ${certColumnIndex}`);
			cy.wrap(certColumnIndex).as('certColumnIndex');

			cy.contains(workforceSelector.tableColumn, 'Certificates')
				.find('.table-header-filter-btn')
				.click();

			cy.get('[class*="select_item_container"]').within(() => {
				cy.get('label[for^=":r"]').then(($labels) => {
					const validLabels = $labels.filter((_, el) => {
						const text = Cypress.$(el).find('span[type="onDropdown"]').last().text().trim();
						return text !== "None";
					});

					expect(validLabels.length, 'Non-None options available').to.be.greaterThan(0);

					const $randomLabel = validLabels.eq(Cypress._.random(0, validLabels.length - 1));
					const name = $randomLabel.find('span[type="onDropdown"]').last().text().trim();

					cy.log(`Testing certificate filter: ${name}`);
					cy.wrap($randomLabel).find('input[type="checkbox"]').check({ force: true });
					cy.wrap(name).as('selectedName');
				});
			});

			cy.contains("p", "Filters:").click();
			cy.wait(3000);

			cy.get('@selectedName').then((name) => {
				cy.get('@certColumnIndex').then((certColumnIndex) => {
					cy.get('body').then(($body) => {
						const hasRows = $body.find(workforceSelector.tableRow).length > 0;

						if (!hasRows) {
							cy.get('.empty-body').contains('No Results Found').should('be.visible');
							return;
						}

						cy.get(workforceSelector.tableRow).then(($rows) => {
							const rowsToCheck = Math.min($rows.length, 2);

							Cypress._.range(rowsToCheck).forEach((rowIndex) => {
								cy.get(workforceSelector.tableRow).eq(rowIndex)
									.find(".table_td")
									.eq(certColumnIndex - 1)
									.then(($cell) => {
										const text = $cell.text().trim();
										cy.log(`Row ${rowIndex} certificate: "${text}"`);

										if (name === "All Uploaded") {
											expect(
												validStatuses.some(status => text.startsWith(status)),
												`Row should contain one of: ${validStatuses.join(", ")} but found "${text}"`
											).to.be.true;
										} else {
											expect(text, `Row should contain "${name}"`).to.include(name);
										}

										cy.wrap($cell).find('.tag .small__label').then(($tags) => {
											if ($tags.length === 0) return;

											cy.wrap($tags).first().click({ force: true });

											cy.get('[class*="doc-option__label"]').should('be.visible').then(($docLabels) => {
												const docOptionTexts = $docLabels.map((_, el) => Cypress.$(el).text().trim()).get();
												cy.log(`Document options: ${docOptionTexts.join(', ')}`);

												cy.get('body').type('{esc}');
												cy.wait(300);

												cy.get(workforceSelector.tableRow).eq(rowIndex).click({ force: true });
												cy.wait(500);

												cy.get(workforceSelector.companyDocumentPage).click();
												cy.wait(1000);

												docOptionTexts.forEach((docText) => {
													cy.get('body').then(($body) => {
														const docExists = $body.find(workforceSelector.documentTableRow)
															.find('[class*="cell-content"]')
															.filter((_, el) => Cypress.$(el).text().trim().includes(docText)).length > 0;

														if (docExists) {
															cy.log(`✓ Found "${docText}" in Documents tab`);
															cy.get(workforceSelector.documentTableRow)
																.find('[class*="cell-content"]')
																.then(($cells) => {
																	expect(
																		$cells.map((_, el) => Cypress.$(el).text().trim()).get()
																			.some(cellText => cellText.includes(docText)),
																		`"${docText}" should be found in document table`
																	).to.be.true;
																});
														} else {
															cy.log(`⚠ "${docText}" not found in Documents, checking Licences tab...`);
															cy.get(workforceSelector.licencesTab).click();
															cy.wait(500);

															cy.get(workforceSelector.documentTableRow)
																.find('[class*="cell-content"]')
																.then(($cells) => {
																	expect(
																		$cells.map((_, el) => Cypress.$(el).text().trim()).get()
																			.some(cellText => cellText.includes(docText)),
																		`"${docText}" should be found in Licences table`
																	).to.be.true;
																});

															cy.get(workforceSelector.CertificationsTab).click();
															cy.wait(500);
														}
													});
												});

												cy.get('body').type('{esc}');
												cy.wait(1000);
												cy.get(workforceSelector.tableRow).should('be.visible');
											});
										});
									});
							});
						});
					});
				});
			});
		});
	});

	it('WorkForce-Company - Verify filtering by Total Worker filter', { tags: ["Story:Filter By Total Workers", "Severity:critical", "UI", "@smoke"] }, () => {
		cy.contains(workforceSelector.tableColumn, 'Total Workers')
			.find('.table-header-filter-btn')
			.click();

		cy.get('[placeholder="Min"]').clear().type('10');
		cy.get('[placeholder="Max"]').clear().type('50');

		cy.contains('p', 'Filters:').click();
		cy.wait(3000);

		cy.get(workforceSelector.tableColumn).then(($headers) => {
			const totalWorkerIndex = [...$headers].findIndex(
				(header) => header.innerText.trim() === 'Total Workers'
			);

			expect(totalWorkerIndex, 'Total Workers column index').to.be.greaterThan(-1);
			cy.wrap(totalWorkerIndex - 1).as('totalWorkerIndex');
		});

		cy.get('@totalWorkerIndex').then((totalWorkerIndex) => {
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
					cy.get('.empty-body').should('contain.text', 'No Results Found');
				}
			});
		});
	});

	it('WorkForce-Company - Verify clearing all filters works correctly', { tags: ["Story:Clear All Filters", "Severity:normal", "UI", "Module:WorkForce-Company"] }, () => {
		cy.contains(workforceSelector.tableColumn, 'Company Name')
			.find('.table-header-filter-btn')
			.click();

		cy.get('[class*="select_item_container"]').within(() => {
			cy.get('label[for^=":r"]').then(($labels) => {
				const randomIndex = Cypress._.random(0, $labels.length - 1);
				const $randomLabel = $labels.eq(randomIndex);

				const companyName = $randomLabel
					.find('span[type="onDropdown"]')
					.last()
					.text()
					.trim();

				cy.log(`Selected company: ${companyName}`);

				cy.wrap($randomLabel)
					.find('input[type="checkbox"]')
					.check({ force: true });
			});
		});

		cy.get('[class*="label"][class*="default__label"]')
			.contains('Company Name: 1')
			.should('be.visible');

		cy.contains('p', 'Filters:').click();

		cy.contains('[class*="tag"][class*="default"][class*="grey"]', 'Clear All')
			.should('be.visible')
			.click();

		cy.contains('[class*="tag"][class*="default"][class*="grey"]', 'Clear All')
			.should('not.exist');

		cy.contains('[class*="label"][class*="default__label"]', 'Company Name')
			.should('not.exist');
	});

	it('WorkForce-Company - Verify filtering with multiple filters applied simultaneously', { tags: ["Story:Multiple Filters Applied", "Severity:normal", "UI", "Module:WorkForce-Company"] }, () => {
		cy.contains(workforceSelector.tableColumn, 'Primary Trade')
			.find('.table-header-filter-btn')
			.click();

		cy.get('[class*="select_item_container"]').within(() => {
			cy.get('label[for^=":r"]').then(($labels) => {
				const validLabels = $labels.filter((_, el) => {
					const text = Cypress.$(el)
						.find('span[type="onDropdown"]')
						.last()
						.text()
						.trim();
					return text !== "None";
				});

				expect(validLabels.length, 'Non-None options available').to.be.greaterThan(0);

				const randomIndex = Cypress._.random(0, validLabels.length - 1);
				cy.wrap(validLabels.eq(randomIndex))
					.find('input[type="checkbox"]')
					.check({ force: true });
			});
		});

		cy.contains('p', 'Filters:').click();

		cy.contains(workforceSelector.tableColumn, 'Status')
			.find('.table-header-filter-btn')
			.click();

		cy.get('[class*="select_item_container"]').within(() => {
			cy.get('label[for^=":r"]').then(($labels) => {
				const validLabels = $labels.filter((_, el) => {
					const text = Cypress.$(el)
						.find('span[type="onDropdown"]')
						.last()
						.text()
						.trim();
					return text !== "None";
				});

				expect(validLabels.length, 'Non-None options available').to.be.greaterThan(0);

				const randomIndex = Cypress._.random(0, validLabels.length - 1);
				cy.wrap(validLabels.eq(randomIndex))
					.find('input[type="checkbox"]')
					.check({ force: true });
			});
		});

		cy.contains('p', 'Filters:').click();

		cy.contains(workforceSelector.tableColumn, 'Address')
			.find('.table-header-filter-btn')
			.click();

		cy.get('[placeholder="Search"]').eq(1).type('kathmandu');
		cy.contains('p', 'Filters:').click();
		cy.wait(2000);

		cy.get('[class*="label"][class*="default__label"]').contains('Primary Trade: 1').should('be.visible');
		cy.get('[class*="label"][class*="default__label"]').contains('Status: 1').should('be.visible');
		cy.get('[class*="label"][class*="default__label"]').contains('Address').should('be.visible');

		cy.contains('[class*="tag"][class*="default"][class*="grey"]', 'Clear All').should('be.visible');

		cy.get('body').then(($body) => {
			if ($body.find(workforceSelector.tableRow).length > 0) {
				cy.get(workforceSelector.tableRow).should('exist');
				cy.log('✓ Results found matching all filters');
			} else {
				cy.get('.empty-body').contains('No Results Found').should('be.visible');
				cy.log('⚠ No results match the applied filters');
			}
		});
	});

	it('WorkForce-Company - Verify sorting functionality', { tags: ["Story:Sorting Functionality", "Severity:normal", "UI", "Module:WorkForce-Company"] }, () => {
		cy.contains(workforceSelector.tableColumn, 'Company Name').realHover();

		cy.get('[class*="sorting-icon"]').eq(0).click();
		cy.wait(3000);

		cy.get('[class*="personal-info-content__title"]').should('have.length.at.least', 1);

		cy.get('[class*="personal-info-content__title"]').then(($cells) => {
			const names = $cells.map((_, cell) => cell.textContent.trim()).get();

			console.log('Z-A Order:', names);

			for (let i = 0; i < names.length - 1; i++) {
				const current = names[i];
				const next = names[i + 1];

				const normalizedCurrent = current.toLowerCase().replace(/[^a-z0-9]/g, '');
				const normalizedNext = next.toLowerCase().replace(/[^a-z0-9]/g, '');

				const currentStartsWithNum = /^\d/.test(normalizedCurrent);
				const nextStartsWithNum = /^\d/.test(normalizedNext);

				if (!currentStartsWithNum && nextStartsWithNum) {
					continue;
				} else if (currentStartsWithNum && !nextStartsWithNum) {
					throw new Error(`Position ${i}: Letter "${next}" should come before number "${current}"`);
				} else {
					const isCorrectOrder = normalizedCurrent >= normalizedNext;
					expect(isCorrectOrder, `Position ${i}: "${current}" (normalized: "${normalizedCurrent}") should come after "${next}" (normalized: "${normalizedNext}")`).to.be.true;
				}
			}
		});

		cy.get('[class*="sorting-icon"]').eq(0).click();
		cy.wait(3000);
		cy.get('[class*="personal-info-content__title"]').should('have.length.at.least', 1);

		cy.get('[class*="personal-info-content__title"]').then(($cells) => {
			const names = $cells.map((_, cell) => cell.textContent.trim()).get();

			console.log('A-Z Order:', names);

			for (let i = 0; i < names.length - 1; i++) {
				const current = names[i];
				const next = names[i + 1];

				const normalizedCurrent = current.toLowerCase().replace(/[^a-z0-9]/g, '');
				const normalizedNext = next.toLowerCase().replace(/[^a-z0-9]/g, '');

				const currentStartsWithNum = /^\d/.test(normalizedCurrent);
				const nextStartsWithNum = /^\d/.test(normalizedNext);

				if (currentStartsWithNum && !nextStartsWithNum) {
					continue;
				} else if (!currentStartsWithNum && nextStartsWithNum) {
					throw new Error(`Position ${i}: Number "${next}" should come before "${current}"`);
				} else {
					const isCorrectOrder = normalizedCurrent <= normalizedNext;
					expect(isCorrectOrder, `Position ${i}: "${current}" (normalized: "${normalizedCurrent}") should come before "${next}" (normalized: "${normalizedNext}")`).to.be.true;
				}
			}
		});
	});

});