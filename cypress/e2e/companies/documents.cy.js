/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import companiesHelper from '../../support/helper/companiesHelper';
import { workforceSelector } from '../../support/workforceSelector';
import "cypress-real-events/support";

describe("Companies Module - Documents Page", () => {

  before(() => {
	// cy.viewport(1440, 900);
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title')
        .contains(Cypress.env('PROJECT_NAME'))
        .click();
    });
    companiesHelper.visitCompaniesPage();
  });
  beforeEach(()=>{
	cy.get('body').click(0, 0);
  })


  it("Verify the UI of the company documents page", () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
	cy.get(':nth-child(3) > .sc-fqkvVR').click()

    cy.get("p").contains("Documents").should("be.visible");
    cy.get('button').contains('Add Certification').should("be.visible"); // Adjust based on your button text

    const headers = ["Type", "Expiry Date", "Credential ID", "Actions"];

    cy.get(".sc-dhKdcB.gqyqmk").then(($els) => {
      const texts = [...$els].map((el) => el.innerText.trim());
      headers.forEach((header) => {
        expect(texts).to.include(header);
      });
    });
    
    cy.get(".sc-YysOf").contains("Licences").click();
    cy.get('button').contains('Add Licence').should("be.visible");

    const headerLicences = ["Type", "Expiry Date", "Credential ID", "Actions"];

    cy.get(".sc-dhKdcB.gqyqmk").then(($els) => {
      const texts = [...$els].map((el) => el.innerText.trim());
      headerLicences.forEach((header) => {
        expect(texts).to.include(header);
      });
    });
  });

  it("Validate the UI of the company document form", () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
	cy.get(':nth-child(3) > .sc-fqkvVR').click()

    cy.get('button').contains('Add Certification').click();

    cy.get('button').contains('Submit').click();

    cy.get('[type="error"]')
      .contains("A document name is required.")
      .should("be.visible");

    cy.get('[placeholder="Issued Date"]').click();
	cy.get('.rmdp-day-picker').should('be.visible');
    cy.get(".rmdp-today").first().click();

	cy.get('[placeholder="Expiry Date"]').click();

	cy.get('.rmdp-calendar')
	  .should('exist')
	  .then(() => {
		cy.get('.rmdp-calendar')
		  .find(':nth-child(6) > :nth-child(4) > .sd')
		  .click({ force: true });
	  });
	
    cy.get("button p").contains("Back").click();
    cy.get("p")
  .contains("Documents")
  .scrollIntoView()   
  .should("be.visible");

  });



  it('Verify that updating the company details and adding the documents and then refreshing the page should redirect to the company list page without saving', () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
	cy.get(':nth-child(3) > .sc-fqkvVR').click()
    cy.get('button').contains('Add Certification').click();

    cy.get('[placeholder="Issued Date"]').click();
    cy.get(".rmdp-today").first().click();

	cy.get('[placeholder="Expiry Date"]').click();
	cy.get('.rmdp-calendar')
	  .should('exist')
	  .then(() => {
		cy.get('.rmdp-calendar')
		  .find(':nth-child(6) > :nth-child(4) > .sd')
		  .click({ force: true });
	  });

    cy.reload();

    // Adjust selector based on your company list page
    cy.get('button').contains('Add Company').should('be.visible');
  });



  it(
	"Displays yellow row and red warning icon for company documents expiring within 7 days",
	() => {
	  const credID = Array.from({ length: 16 }, () =>
		Math.floor(Math.random() * 10)
	  ).join("");
  
	  cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
	  cy.get(':nth-child(3) > .sc-fqkvVR').click();
  
	  cy.contains('button', 'Add Certification').click();
	  cy.selectRandomOption(
		'[name="documentType"]',
		'.sc-tagGq[role="button"]',
		'documentType'
	  );
  
	  cy.get('[name="credentialId"]').type(credID);
  
	  // Issued Date
	  cy.get('[placeholder="Issued Date"]').click();
	  cy.get('.rmdp-today').first().click();
  
	  // Expiry Date
	  cy.get('[placeholder="Expiry Date"]').click();
	  cy.get('.rmdp-calendar')
		.should('exist')
		.then(() => {
		  cy.get('.rmdp-calendar')
			.find(':nth-child(6) > :nth-child(4) > .sd')
			.click({ force: true });
		});
  
	  // Capture expiry date value
	  cy.get('[placeholder="Expiry Date"]')
		.invoke('val')
		.then((expiryDate) => {
		  cy.log(`Expiry Date selected: ${expiryDate}`);
  
		  // Upload file
		  cy.fixture('file.pdf', 'base64').then((fileContent) => {
			cy.get('.sc-erUUZj').attachFile(
			  {
				fileContent,
				fileName: 'file.pdf',
				mimeType: 'application/pdf',
			  },
			  { subjectType: 'drag-n-drop' }
			);
		  });
  
		  cy.get('iframe[src^="blob:https://uat.kwant.ai"]').should('be.visible');
  
		  cy.contains('button > p', 'Submit').click();
  
		  // Row-level validation
		  cy.get('.cell-content')
			.contains(credID)
			.closest('.sc-cRmqLi')
			.within(() => {
			  cy.contains(expiryDate)
				.find('svg[fill="#DF4242"]')
				.should('exist');
  
			cy.contains("p", "Expiry Date ends soon. Please upload new certificate.");
			});
		});

		cy.get('body').click(0, 0);
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
	 cy.get(':nth-child(3) > .sc-fqkvVR')
		.find('svg path[fill="#DF4242"]')
		.should('exist');
	}
  );
  

  it("Displays red row and red warning icon for company documents expired", () => {
    const credID = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");
    
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
	cy.get(':nth-child(3) > .sc-fqkvVR').click()

    cy.get('button').contains('Add Certification').click();
    cy.selectRandomOption('[name="documentType"]', '.sc-tagGq[role="button"]', 'documentType');
    cy.get('[placeholder="Issued Date"]').clear().type('11/12/2024');
    cy.get('[name="credentialId"]').type(credID);


	cy.get('[placeholder="Expiry Date"]').click();
	cy.get('.rmdp-calendar')
	  .should('exist')
	  .then(() => {
		cy.get('.rmdp-calendar')
		  .find('.rmdp-today').first()
		  .click({ force: true });
	  });

  cy.get('[placeholder="Expiry Date"]')
		.invoke('val')
		.then((expiryDate) => {
		  cy.log(`Expiry Date selected: ${expiryDate}`);
  
		  // Upload file
		  cy.fixture('file.pdf', 'base64').then((fileContent) => {
			cy.get('.sc-erUUZj').attachFile(
			  {
				fileContent,
				fileName: 'file.pdf',
				mimeType: 'application/pdf',
			  },
			  { subjectType: 'drag-n-drop' }
			);
		  });
        cy.get('iframe[src^="blob:https://uat.kwant.ai"]').should('be.visible');
        cy.wait(1000);

        cy.get("button > p").contains("Submit").click({ force: true });
        cy.get(".cell-content")
          .contains(credID)
          .closest(".sc-cRmqLi")
          .within(() => {
            cy.contains(expiryDate).find('svg[fill="#DF4242"]').should("exist");
			cy.contains("p", "Expiry Date has ended. Please upload new certificate.");
          });
      });
      cy.get('body').click(0, 0);
	  cy.get(workforceSelector.tableRow).eq(0).click({ force: true });

	  cy.get(':nth-child(3) > .sc-fqkvVR')
      .find('svg path[fill="#DF4242"]')
      .should("exist");
  });

  it("Verify that expired or expiring company document's expiry date is updated to future date", () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
	cy.get(':nth-child(3) > .sc-fqkvVR').click()

    cy.get(".sc-cRmqLi.bpifwg,.sc-cRmqLi.dEhqLz")
      .eq(0)
      .find(".cell-content")
      .eq(2)
      .invoke("text")
      .then((originalCred) => {
        const origCred = originalCred.trim();
        cy.log(`Original Credential ID: ${origCred}`);

        cy.get(".sc-cRmqLi.bpifwg,.sc-cRmqLi.dEhqLz").eq(0).click();

        cy.get('.hover-hoc-container__input__display-value')
          .eq(3)
          .realHover()
          .find('svg')
          .should('be.visible')
          .click({ force: true });

        cy.get('[placeholder="Select Expiry date"]')
          .clear({ force: true })
          .type('11/06/2026');
        cy.get('body').click();

        cy.get('.hover-hoc-container__input__display-value')
          .eq(3)
          .should('contain.text', '11/06/2026')
          .invoke('text')
          .then((newDate) => {
            const updatedDate = newDate.trim();
            cy.log(`Updated Expiry Date: ${updatedDate}`);

            cy.contains('button p', 'Update').click();
            cy.get(workforceSelector.toastMessage).contains('Document updated successfully');

            cy.wait(2000);

            cy.get(".cell-content")
              .contains(origCred)
              .closest(".sc-cRmqLi")
              .within(() => {
                cy.contains(updatedDate).find('svg[fill="#DF4242"]').should("not.exist");
              });
          });
      });
  });

  it('Should update an existing company certificate', () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
	cy.get(':nth-child(3) > .sc-fqkvVR').click()

    cy.get(".sc-cRmqLi.dEhqLz, .sc-cRmqLi.bpifwg")
      .eq(0)
      .find(".cell-content")
      .eq(2)
      .invoke("text")
      .then((originalCred) => {
        const origCred = originalCred.trim();
        cy.log(`Original Credential ID: ${origCred}`);

        cy.get(".sc-cRmqLi.dEhqLz, .sc-cRmqLi.bpifwg").eq(0).click();

        cy.get('.hover-hoc-container__input__display-value')
          .eq(3)
          .realHover()
          .find('svg')
          .should('be.visible')
          .click({ force: true });

        cy.get('[placeholder="Select Expiry date"]')
          .clear({ force: true })
          .type('11/06/2026');
        cy.get('body').click();

        cy.get('.hover-hoc-container__input__display-value')
          .eq(3)
          .should('contain.text', '11/06/2026')
          .invoke('text')
          .then((newDate) => {
            const updatedDate = newDate.trim();
            cy.log(`Updated Expiry Date: ${updatedDate}`);

            cy.contains('button p', 'Update').click();
            cy.get(workforceSelector.toastMessage).contains('Document updated successfully');

            cy.wait(1000);

            cy.get(".sc-cRmqLi.dEhqLz, .sc-cRmqLi.bpifwg").then($allRows => {
              let matchingIndex = -1;
              $allRows.each((index, row) => {
                const credId = Cypress.$(row).find('.cell-content').eq(2).text().trim();
                if (credId === origCred) {
                  matchingIndex = index;
                  return false;
                }
              });

              cy.log(`Found matching row at index: ${matchingIndex}`);

              cy.get(".sc-cRmqLi.dEhqLz, .sc-cRmqLi.bpifwg")
                .eq(matchingIndex)
                .scrollIntoView()
                .should('be.visible');

              cy.get(".sc-cRmqLi.dEhqLz, .sc-cRmqLi.bpifwg")
                .eq(matchingIndex)
                .find('.cell-content')
                .eq(1)
                .scrollIntoView()
                .should('be.visible')
                .should('contain.text', updatedDate);
            });
          });
      });
  });

  it("Deleting a company certificate", () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
	cy.get(':nth-child(3) > .sc-fqkvVR').click()

    cy.get(".sc-cRmqLi.dEhqLz,.sc-cRmqLi.bpifwg")
      .eq(0)
      .find(".cell-content")
      .invoke("text")
      .then((documentName) => {
        const docText = documentName.trim();
        cy.log(`Deleting document: ${docText}`);

        cy.get(".sc-cRmqLi.dEhqLz,.sc-cRmqLi.bpifwg")
          .eq(0)
          .find(".sc-jXbUNg.jnXMtv")
          .eq(1)
          .click();

        cy.contains("button p", "Delete").click({ force: true });
        cy.get(workforceSelector.toastMessage)
          .contains("Successfully deleted document.")
          .should("be.visible");

        cy.wait(2000);
        cy.get("body").then(($body) => {
          const rows = $body.find(".sc-cRmqLi.bpifwg,.sc-cRmqLi.dEhqLz");

          if (rows.length > 0) {
            cy.log("🟡 Rows still exist — verifying document is deleted");

            cy.get(".sc-cRmqLi.bpifwg .cell-content, .sc-cRmqLi.dEhqLz .cell-content")
              .should("not.contain.text", docText)
              .then(() => {
                const hasRedSvg = $body.find('.cell-content svg[fill="#DF4242"]').length > 0;

                if (hasRedSvg) {
                  cy.log("🔴 Red SVG found — verifying lower icon exists");
                  cy.get(".sc-jXbUNg.gDlPVv")
                    .eq(4)
                    .find('svg path[fill="#DF4242"]')
                    .should("exist");
                } else {
                  cy.log('No svg found');
                }
              });
          } else {
            cy.log("✅ No rows exist — document list is empty (deletion confirmed)");
            cy.get(".sc-jXbUNg.gDlPVv")
              .eq(4)
              .find('svg path[fill="#DF4242"]')
              .should("not.exist");
          }
        });
      });
  });

  it("Verify expired company licence shows red color for close date", () => {
    const credID = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
	cy.get(':nth-child(3) > .sc-fqkvVR').click()

    cy.get(".sc-YysOf").contains("Licences").click();
    cy.get('button').contains('Add Licence').click({ force: true });

    cy.get('[name="documentType"]').click();

    cy.get('[role="button"]').contains("sd").click();
    cy.get('[name="credentialId"]').type(credID);

    cy.get('[placeholder="Issued Date"]').click();
    cy.get('[placeholder="Expiry Date"]').click();
    cy.get(".sd:visible").first().click({ force: true });

    cy.get('[placeholder="Expiry Date"]')
      .invoke("val")
      .then((expiryDate) => {
        cy.fixture("file.pdf", "base64").then((fileContent) => {
          cy.get(".sc-erUUZj").attachFile(
            { fileContent, fileName: "file.pdf", mimeType: "application/pdf" },
            { subjectType: "drag-n-drop" }
          );
        });

        cy.get("button > p").contains("Submit").click({ force: true });

        cy.get(".cell-content")
          .contains(credID)
          .closest(".sc-cRmqLi.bpifwg, .sc-cRmqLi.dEhqLz")
          .within(() => {
            cy.contains(expiryDate).find('svg[fill="#DF4242"]').should("exist");
          });
      });
    
    cy.get('body').click(0, 0);
	cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
	cy.get(':nth-child(3) > .sc-fqkvVR')
      .find('svg path[fill="#DF4242"]')
      .should("exist");
  });

  it("Deleting a company licence", () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
	cy.get(':nth-child(3) > .sc-fqkvVR').click()

    cy.get(".sc-YysOf").contains("Licences").click();

    cy.get(".sc-cRmqLi.bpifwg, .sc-cRmqLi.dEhqLz")
      .eq(0)
      .find(".cell-content")
      .invoke("text")
      .then((documentName) => {
        const docText = documentName.trim();
        cy.log(`Deleting document: ${docText}`);

        cy.get(".sc-cRmqLi.bpifwg,.sc-cRmqLi.dEhqLz")
          .eq(0)
          .find(".sc-jXbUNg.jnXMtv")
          .eq(1)
          .click();

        cy.contains("button p", "Delete").click({ force: true });
        cy.get(workforceSelector.toastMessage)
          .contains("Successfully deleted document.")
          .should("be.visible");

        cy.wait(2000);

        cy.get("body").then(($body) => {
          const rows = $body.find(".sc-cRmqLi.bpifwg");
          if (rows.length > 0) {
            cy.get(".sc-cRmqLi.bpifwg .cell-content").should(
              "not.contain.text",
              docText
            );

            cy.get("body").then(($body) => {
              const hasRedSvg =
                $body.find('.cell-content svg[fill="#DF4242"]').length > 0;
              if (hasRedSvg) {
                cy.log(
                  "🔴 Red SVG found in .cell-content — verifying lower one exists"
                );
				cy.get(':nth-child(3) > .sc-fqkvVR')
                  .find('svg path[fill="#DF4242"]')
                  .should("exist");
              } else {
				cy.get(':nth-child(3) > .sc-fqkvVR')
                  .find('svg path[fill="#DF4242"]')
                  .should("not.exist");
              }
            });
          } else {
            cy.log(
              "✅ No rows exist — document list is empty (deletion confirmed)"
            );
          }
        });
      });
  });

  it("Adding company document with invalid file type", () => {
    const credID = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
	cy.get(':nth-child(3) > .sc-fqkvVR').click()

    cy.get('button').contains('Add Certification').click();
    cy.selectRandomOption('[name="documentType"]', '.sc-tagGq[role="button"]', 'documentType');
    cy.get('[name="credentialId"]').type(credID);

    cy.get('[placeholder="Issued Date"]').click();
    cy.get(".rmdp-today").first().click();

        cy.fixture("backup.csv", "base64").then((fileContent) => {
          cy.get(".sc-erUUZj").attachFile(
            { fileContent, fileName: "backup.csv", mimeType: "text/csv" },
            { subjectType: "drag-n-drop" }
          );

        cy.get("button > p").contains("Submit").click({ force: true });
        cy.get(workforceSelector.toastMessage).should("contain", "File type unsupported");
      });
  });

  it("Should not allow adding company document which expiry date is already done", () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
	cy.get(':nth-child(3) > .sc-fqkvVR').click()
    cy.get('button').contains('Add Certification').click();

    cy.get('[placeholder="Expiry Date"]').click();

    cy.get(".rmdp-day")
      .filter(".rmdp-disabled")
      .should("exist");

    cy.get(".rmdp-day.rmdp-disabled").first().click({ force: true });
    cy.get('header p').contains('Add Certification').click();

    cy.get('[placeholder="Expiry Date"]')
      .invoke("val")
      .should("eq", "");
  });

  it("Should not allow adding company document which expiry date is older than issued date", () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
	cy.get(':nth-child(3) > .sc-fqkvVR').click()

    cy.get('button').contains('Add Certification').click();

    cy.get('[placeholder="Issued Date"]').click();
    cy.get(".rmdp-today").first().click();

    cy.get('[placeholder="Expiry Date"]').click();

    cy.get(".rmdp-day")
      .filter(".rmdp-disabled")
      .should("exist");

    cy.get(".rmdp-day.rmdp-disabled").first().click({ force: true });
    cy.get('header p').contains('Add Certification').click();

    cy.get('[placeholder="Expiry Date"]')
      .invoke("val")
      .should("eq", "");
  });



  it("Should not save company document when modal is closed without submitting", () => {
    const credID = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
	cy.get(':nth-child(3) > .sc-fqkvVR').click()

    cy.get("body").then(($body) => {
      cy.get('button').contains('Add Certification').click();
      cy.selectRandomOption('[name="documentType"]', '.sc-tagGq[role="button"]', 'documentType');
      cy.get('[name="credentialId"]').type(credID);
      cy.get('[placeholder="Issued Date"]').click();
      cy.get(".rmdp-today").first().click();

      cy.get("body").click(0, 0);
      cy.get("body").should("not.contain", credID);
    });
  });

  it("Download uploaded company document - validate downloaded file name", () => {
    cy.get(workforceSelector.tableRow)
      .eq(0)
      .click({ force: true });
	  cy.get(':nth-child(3) > .sc-fqkvVR').click()
  
    cy.get('.sc-cRmqLi.bpifwg, .sc-cRmqLi.dEhqLz')
      .eq(0)
      .click({ force: true });
  
    cy.get('.sc-fvtFIe iframe', { timeout: 30000 })
      .filter('[src*="s3"], [src*="cloudfront"]')
      .should('have.length.greaterThan', 0)
      .first()
      .invoke('attr', 'src')
      .then((src) => {
        const fileName = decodeURIComponent(src.split('/').pop());
        cy.log(`Expected filename from URL: ${fileName}`);
		cy.get('.sc-aXZVg.liAmio button')
  .eq(0)
  .scrollIntoView()  // scrolls vertically to bring it into view
  .click();          // normal click, no force needed
  
        cy.contains('p', 'Download')
          .should('be.visible')
          .click({force: true});
  
        const downloadsFolder = Cypress.config('downloadsFolder');
        const filePath = path.join(downloadsFolder, fileName);
  
        cy.readFile(filePath, { timeout: 20000 }).should('exist');
      });
  });

  it("Editing the existing company document and add a jpeg document", () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    cy.get(':nth-child(3) > .sc-fqkvVR').click()
    cy.get('.sc-cRmqLi.dEhqLz,.sc-cRmqLi.bpifwg').eq(0).click();

    cy.get('.sc-aXZVg.liAmio button svg').eq(0).click();

    cy.get('button p').contains('Remove').click();
    cy.fixture("document.jpg", "base64").then((fileContent) => {
      cy.get(".sc-erUUZj").attachFile(
        { fileContent, fileName: "document.jpg", mimeType: "image/jpeg" },
        { subjectType: "drag-n-drop" }
      );
    });
    cy.get('img[src^="blob:https://uat.kwant.ai"]')
      .scrollIntoView()
      .should('be.visible');
  });

});