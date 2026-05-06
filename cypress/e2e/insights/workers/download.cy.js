import { workforceSelector } from "../../../support/workforceSelector";
import WorkerHelper from "../../../support/helper/workerHelper";

describe('Insight Worker - Download',()=>{

	beforeEach(()=>{
		cy.loginAndVisit(() => WorkerHelper.visitWorkersInsightPage('5007477836'));
		cy.wait(2000)
		cy.get('.selector-item.first').click()
		cy.wait(1000)
	})


	it('Insight-Worker - Verify that the dowbnlod have the date that is in the table calander filter', ()=>{
		cy.wait(1000)
		cy.get('.filters_header_right_section button').contains('/').invoke('text').then((dateText)=>{
			cy.log('Date text from filter:', dateText);
			cy.get('.filters_header_right_section button').last().click();
			cy.get('.dropdown-option').contains('Download').click();
			cy.get('[label="Start Date"]').find('input').invoke('val').then((startDate)=>{
				cy.get('[label="End Date"]').find('input').invoke('val').then((endDate)=>{
					cy.log('Start Date from download modal:', startDate);
					cy.log('End Date from download modal:', endDate);
					const expectedDateText = `${startDate} - ${endDate}`;
					expect(dateText.trim()).to.eq(expectedDateText);
				})
			})
		})
	})

	it('Insight-Worker Validate that the downloaded file is in .csv format',{tags:'@smoke'}, () => {
		cy.wait(2000)
		cy.intercept('POST', '/api/empinsight/download').as('downloadApi');
		cy.wait(1000)
		cy.get('.filters_header_right_section button').last().click();
		cy.get('.dropdown-option').contains('Download').click();
		cy.get('[label="Download"]').click()
		cy.wait('@downloadApi');
		const downloadsFolder = Cypress.config('downloadsFolder');
		cy.task('getLatestDownloadedFile', { downloadsFolder }).then((fileName) => {
		  cy.log('Downloaded file: ' + fileName);
		  expect(fileName).to.not.be.null;
	  
		  expect(fileName).to.match(/\.csv$/i);
		});
	  });


	  it('Insight-Worker Validate the ui of the download modal',{tags:'@smoke'}, ()=>{
		cy.wait(2000)
		cy.get('.filters_header_right_section button').last().click();
		cy.get('.dropdown-option').contains('Download').click();
		cy.get('p').contains('Download').should('be.visible');
		cy.get('p').contains('Select the fields to be included in the report').should('be.visible');
		const ColumnName = [
			"Worker Name",
			"Work Date",
			"Job Title",
			"Worker ID",
			"Device ID",
			"Company Name",
			"Crew",
			"Cost Code",
			"Project Code",
			"Shift",
			"Check in time",
			"Check out time",
			"Location",
			"On-site Hours",
			"Overtime Hours",
			"Zone Time",
			"Sensor Time"
		  ];
		  cy.get('.field_name').each(($el) => {
			const text = $el.text().trim();
			expect(ColumnName).to.include(text);
		  });
	  })

	  it('Insight-Worker clicking out side of the download modal should close the modal', ()=>{
		cy.wait(2000)
		cy.get('.filters_header_right_section button').last().click();
		cy.get('.dropdown-option').contains('Download').click();
		cy.get('p').contains('Download').should('be.visible');
		cy.get('p').contains('Select the fields to be included in the report').should('be.visible');
		cy.get('body').click(0,0);
		cy.get('p').contains('Download').should('not.exist');
		cy.get('p').contains('Select the fields to be included in the report').should('not.exist');
	  })
	 

	  it('Insight-Worker clicking on the closing icon "x" should close the modal', ()=>{
		cy.wait(2000)
		cy.get('.filters_header_right_section button').last().click();
		cy.get('.dropdown-option').contains('Download').click();
		cy.get('p').contains('Download').should('be.visible');
		cy.get('p').contains('Select the fields to be included in the report').should('be.visible');
		cy.get('header button').click()
		cy.get('p').contains('Download').should('not.exist');
		cy.get('p').contains('Select the fields to be included in the report').should('not.exist');
	  })


	  it('Insight-Worker Verify UI rows exist in downloaded CSV (Name + Company match)', () => {

		let uiRows = [];

		cy.get(workforceSelector.tableRow)
		  .should('have.length.greaterThan', 1)
		  .then(($rows) => {
	  
			$rows.each((_, row) => {
			  const $row = Cypress.$(row);
	  
			  // Full name + company from UI
			  const fullName = $row.find('.personal-info-content__title').text().trim();
			  const company = $row.find('.cell-content').eq(0).text().trim();
	  
			  const [firstName, ...last] = fullName.split(' ');
			  const lastName = last.join(' ');
	  
			  if (firstName && lastName && company) {
				uiRows.push({
				  firstName: firstName.toLowerCase().trim(),
				  lastName: lastName.toLowerCase().trim(),
				  company: company.toLowerCase().trim()
				});
			  }
			});
		  })
		  .then(() => {
	  
			cy.intercept('POST', '/api/empinsight/download_quick_report?*')
			  .as('download');
	  
			cy.get('.filters_header_right_section button').last().click();
			cy.get('.dropdown-option').contains('Download').click();
			cy.get('[label="Download Quick Report"]').click();
	  
			cy.wait('@download');
	  
			const downloadsFolder = Cypress.config('downloadsFolder');
	  
			cy.task('getLatestDownloadedFile', { downloadsFolder }).then((fileName) => {
	  
			  cy.readFile(`${downloadsFolder}/${fileName}`).then((content) => {
				const parse = (row) => {
				  const res = [];
				  let cur = '';
				  let inQuotes = false;
	  
				  for (let char of row) {
					if (char === '"') inQuotes = !inQuotes;
					else if (char === ',' && !inQuotes) {
					  res.push(cur.replace(/"/g, '').trim().toLowerCase());
					  cur = '';
					} else {
					  cur += char;
					}
				  }
	  
				  res.push(cur.replace(/"/g, '').trim().toLowerCase());
				  return res;
				};
	  
				const lines = content.split('\n').filter(Boolean);
	  
				const headers = parse(lines[0]);
				const iFirst = headers.findIndex(h => h.includes('first name'));
				const iLast = headers.findIndex(h => h.includes('last name'));
				const iCompany = headers.findIndex(h => h.includes('company name'));
				const csvRows = lines.slice(1).map(line => {
				  const cols = parse(line);
	  
				  return {
					firstName: cols[iFirst],
					lastName: cols[iLast],
					company: cols[iCompany]
				  };
				});

				uiRows.forEach(ui => {
	  
				  const exists = csvRows.some(csv =>
					csv.firstName === ui.firstName &&
					csv.lastName === ui.lastName &&
					csv.company === ui.company
				  );
	  
				  expect(exists,
					`Missing in CSV: ${ui.firstName} ${ui.lastName} - ${ui.company}`
				  ).to.be.true;
				});
	  
			  });
			});
	  
		  });
	  
	  });
	it('Insight-Worker Worker Name and Company Name  cant be unchecked', ()=>{
		cy.wait(2000)
		cy.get('.filters_header_right_section button').last().click();
		cy.get('.dropdown-option').contains('Download').click();
		cy.get('.field_name').contains('Worker Name').parent().parent().find('input[type="checkbox"]').should('be.disabled');
		cy.get('.field_name').contains('Work Date').parent().parent().find('input[type="checkbox"]').should('be.disabled');
	  })


	  it("Insight-Worker either zone Time  or Sensor Time should can be checked but not both at the same time", ()=>{
		cy.wait(2000)
		cy.get('.filters_header_right_section button').last().click();
		cy.get('.dropdown-option').contains('Download').click();
		cy.get('.field_name').contains('Zone Time').scrollIntoView().parent().parent().find('input[type="checkbox"]').uncheck({force: true})
		cy.get('.field_name').contains('Sensor Time').parent().parent().find('input[type="checkbox"]').scrollIntoView().uncheck({force: true});

		cy.get('.field_name').contains('Zone Time').parent().parent().find('input[type="checkbox"]').should('not.be.checked');
		cy.get('.field_name').contains('Sensor Time').parent().parent().find('input[type="checkbox"]').should('not.be.checked');
		cy.get('.field_name').contains('Zone Time').parent().parent().find('input[type="checkbox"]').check({force: true});
		cy.get('.field_name').contains('Zone Time').parent().parent().find('input[type="checkbox"]').should('be.checked');
		cy.get('.field_name').contains('Sensor Time').parent().parent().find('input[type="checkbox"]').should('be.disabled');
		cy.get('.field_name').contains('Zone Time').parent().parent().find('input[type="checkbox"]').uncheck({force: true});
		cy.get('.field_name').contains('Sensor Time').parent().parent().find('input[type="checkbox"]').should('not.be.checked');
		cy.get('.field_name').contains('Sensor Time').parent().parent().find('input[type="checkbox"]').check({force: true});
		cy.get('.field_name').contains('Sensor Time').parent().parent().find('input[type="checkbox"]').should('be.checked');
		cy.get('.field_name').contains('Zone Time').parent().parent().find('input[type="checkbox"]').should('be.disabled');
	  })


	  it('Insight-Worker should include only selected fields in downloaded CSV', () => {
		const downloadsFolder = Cypress.config('downloadsFolder');
		const checkedFields = [];
		const uncheckedFields = [];
	  
		// Open Download Modal
		cy.get('.filters_header_right_section button').last().click();
		cy.get('.dropdown-option').contains('Download').click();
	  
		cy.get('.field_wrapper').each(($wrapper) => {
		  const name = $wrapper.find('.field_name').text().trim().toLowerCase();
		  const isChecked = $wrapper.find('input[type="checkbox"]').is(':checked');
	  
		  const csvName = name === 'worker name' ? 'name'
						: name === 'company name' ? 'company'
						: name;
	  
		  if (isChecked) {
			checkedFields.push(csvName);
			cy.log(`✅ Checked: ${name} → ${csvName}`);
		  } else {
			uncheckedFields.push(csvName);
			cy.log(`❌ Unchecked: ${name} → ${csvName}`);
		  }
		}).then(() => {
		  cy.wrap(checkedFields).as('checkedFields');
		  cy.wrap(uncheckedFields).as('uncheckedFields');
		});
	  
		cy.intercept('POST', '/api/empinsight/download*').as('download');
		cy.get('[label="Download"]').click();
		cy.wait('@download');
	  
		// task OUTSIDE of then() chain
		cy.task('getLatestDownloadedFile', { downloadsFolder }).then((fileName) => {
		  cy.log(`Downloaded file: ${fileName}`);
		});
	  
		cy.task('getLatestDownloadedFile', { downloadsFolder }).then((fileName) => {
		  cy.readFile(`${downloadsFolder}/${fileName}`).then((content) => {
			const lines = content.split('\n').filter(Boolean);
			const headerLine = lines[1];
	  
			const csvHeaders = headerLine
			  .split(',')
			  .map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''))
			  .filter(Boolean);
	  
			cy.log(`CSV Headers: ${JSON.stringify(csvHeaders)}`);
	  
			cy.get('@checkedFields').then((checked) => {
			  cy.get('@uncheckedFields').then((unchecked) => {
				cy.log(`✅ Expected in CSV: ${JSON.stringify(checked)}`);
				cy.log(`❌ Should NOT be in CSV: ${JSON.stringify(unchecked)}`);
	  
				// All checked fields should be in CSV
				checked.forEach(field => {
				  expect(csvHeaders).to.include(field, `"${field}" should be in CSV`);
				});
	  
				// All unchecked fields should NOT be in CSV
				unchecked.forEach(field => {
				  expect(csvHeaders).to.not.include(field, `"${field}" should NOT be in CSV`);
				});
	  
				// Exact match - no extra columns
				expect(csvHeaders).to.have.members(
				  checked,
				  `CSV should have exactly the checked fields`
				);
			  });
			});
		  });
		});
	  });
it('Insight-Worker should include only default selected fields in downloaded CSV', () => {

	const normalize = (text) =>
	  text.toLowerCase().replace(/\s+/g, ' ').trim()
  
	const fieldMapping = {
	  'worker name': 'name',
	  'work date': 'work date',
	  'job title': 'job title',
	  'company name': 'company',
	  'cost code': 'cost code',
	  'check in time': 'check in time',
	  'check out time': 'check out time',
	  'on-site hours': 'on-site hours'
	}
  
	const selectedFields = []
	const downloadsFolder = Cypress.config('downloadsFolder')
  
	cy.intercept('POST', '/api/empinsight/download*').as('download')
  
	cy.task('deleteFile', {
	  filePath: `${downloadsFolder}/worker_insight_report.csv`
	})
  
	cy.get('.filters_header_right_section button').last().click()
	cy.contains('.dropdown-option', 'Download').click()
  
	cy.get('.field_wrapper').each(($wrapper) => {
	  const name = normalize($wrapper.find('.field_name').text())
	  const isChecked = $wrapper.find('input[type="checkbox"]').is(':checked')
  
	  if (isChecked) {
		const mapped = fieldMapping[name]
  
		if (!mapped) {
		  throw new Error(`❌ Missing mapping for UI field: ${name}`)
		}
  
		selectedFields.push(mapped)
	  }
	})
	.then(() => {
  
	  cy.log('Mapped Selected Fields:', selectedFields.join(', '))
  
	  cy.get('[label="Download"]').click()
	  cy.wait('@download')
  
	  cy.task('getLatestDownloadedFile', { downloadsFolder })
		.then((fileName) => {
  
		  cy.readFile(`${downloadsFolder}/${fileName}`).then((content) => {
  
			const headerLine = content.split('\n')[1]
  
			const csvHeaders = headerLine
			  .replace(/"/g, '')
			  .split(',')
			  .map(h => normalize(h))
			  .filter(Boolean)
  
			cy.log('CSV Headers:', csvHeaders.join(', '))
  
			console.log('UI mapped:', selectedFields)
			console.log('CSV:', csvHeaders)
  
			// ✅ FINAL ASSERTION
			expect(csvHeaders).to.have.members(selectedFields)
		  })
		})
	})
  })
  it('Insight-Worker should include default + randomly checked fields in downloaded CSV', () => {

	const normalize = (text) =>
	  text.toLowerCase().replace(/\s+/g, ' ').trim()
  
	const selectedFields = []
	const uncheckedWrappers = []
	const downloadsFolder = Cypress.config('downloadsFolder')
  
	cy.intercept('POST', '/api/empinsight/download*').as('download')
  
	cy.task('deleteFile', {
	  filePath: `${downloadsFolder}/worker_insight_report.csv`
	})
	cy.wait(3000)
	cy.get('.filters_header_right_section button').last().click()
	cy.contains('.dropdown-option', 'Download').click()

	cy.get('.field_wrapper').each(($wrapper) => {
  
	  const name = normalize($wrapper.find('.field_name').text())
	  const isChecked = $wrapper.find('input[type="checkbox"]').is(':checked')
  
	  if (isChecked) {
		selectedFields.push(name)
	  } else {
		uncheckedWrappers.push($wrapper)
	  }
	})
	.then(() => {
  
	  if (uncheckedWrappers.length > 0) {
  
		const count = Math.min(2, uncheckedWrappers.length)
  
		for (let i = 0; i < count; i++) {
		  const randomIndex = Math.floor(Math.random() * uncheckedWrappers.length)
		  const wrapper = uncheckedWrappers.splice(randomIndex, 1)[0]
  
		  const name = normalize(wrapper.find('.field_name').text())
  
		  cy.log(`Checking: ${name}`)
  
		  cy.wrap(wrapper).find('input[type="checkbox"]').check({force: true})
  
		  selectedFields.push(name)
		}
	  }
  
	  cy.log('Final Selected Fields:', selectedFields.join(', '))
  
	  // Download CSV
	  cy.get('[label="Download"]').click()
	  cy.wait('@download')
	  cy.wait(3000)
  
	  // Read file
	  cy.task('getLatestDownloadedFile', { downloadsFolder })
		.then((fileName) => {
  
		  cy.readFile(`${downloadsFolder}/${fileName}`).then((content) => {
  
			const headerLine = content.split('\n')[1]
  
			const csvHeaders = headerLine
			  .replace(/"/g, '')
			  .split(',')
			  .map(h => normalize(h))
			  .filter(Boolean)
  
			cy.log('CSV Headers:', csvHeaders.join(', '))
			cy.log('Expected:', selectedFields.join(', '))
  
			// ✅ Flexible validation (no mapping needed)
			csvHeaders.forEach((header) => {
  
			  const match = selectedFields.some(field =>
				header.includes(field) || field.includes(header)
			  )
  
			  expect(
				match,
				`Header "${header}" should match selected fields`
			  ).to.be.true
			})
		  })
		})
	})
  })

  it('Insight-Worker UI vs CSV - robust multi-row worker validation', () => {
	const downloadsFolder = Cypress.config('downloadsFolder');
  
	const normalize = (str) =>
	  (str || '')
		.toLowerCase()
		.replace(/\r/g, '')
		.replace(/\n/g, '')
		.replace(/"/g, '')
		.replace(/[\u2018\u2019\u201A\u201B]/g, "'")
		.replace(/\s+/g, ' ')
		.trim();
  
	const parseCSVLine = (line) => {
	  const result = [];
	  let current = '';
	  let inQuotes = false;
	  for (let i = 0; i < line.length; i++) {
		const char = line[i];
		if (char === '"') {
		  inQuotes = !inQuotes;
		} else if (char === ',' && !inQuotes) {
		  result.push(normalize(current));
		  current = '';
		} else {
		  current += char;
		}
	  }
	  result.push(normalize(current));
	  return result;
	};
  
	const parseCSV = (content) => {
	  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
	  const headers = parseCSVLine(lines[1]).filter(Boolean);
	  const rows = [];
	  for (let i = 2; i < lines.length; i++) {
		const values = parseCSVLine(lines[i]);
		if (!values[0]) continue;
		const obj = {};
		headers.forEach((h, idx) => { obj[h] = values[idx] || ''; });
		rows.push(obj);
	  }
	  return rows;
	};
  
	cy.get('.filters_header_right_section button').last().click();
	cy.contains('.dropdown-option', 'Download').click();
  
	cy.intercept('POST', '/api/empinsight/download*').as('download');
	cy.get('[label="Download"]').click();
	cy.wait('@download');
  
	cy.get('[data-testid="table_tr"]')
	  .should('have.length.greaterThan', 0)
	  .then(($rows) => {
  
		const uiRows = [];
		$rows.each((i, row) => {
		  const uiName = normalize(Cypress.$(row).find('.personal-info-content__title').text());
		  const uiCompany = normalize(Cypress.$(row).find('.cell-content').eq(0).text());
  
		  if (!uiName || !uiCompany) return;
  
		  uiRows.push({ uiName, uiCompany });
		});
  
		cy.task('getLatestDownloadedFile', { downloadsFolder })
		  .then((fileName) => cy.readFile(`${downloadsFolder}/${fileName}`))
		  .then((content) => {
			const csvRows = parseCSV(content);
  
			uiRows.forEach(({ uiName, uiCompany }) => {
			  const found = csvRows.some(r =>
				r['name'] === uiName && r['company'] === uiCompany
			  );
			  expect(found).to.be.true;
			});
		  });
	  });
  });
})
