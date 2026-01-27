/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from "../../support/workforceSelector";
import "cypress-real-events/support";
import workerHelper from '../../support/helper/workerHelper.js';

describe("Worker Module - Documents Page", () => {
  before(() => {
    cy.session('userSession', () => {
      cy.login();
    });
    workerHelper.visitWorkersPage();
  })
  
  beforeEach(() => {
    cy.cleanUI()
  });

  it("Verify the UI of the document", () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.DocumentsPage().click();

    cy.get("p").contains("Documents").should("be.visible");
    workforceSelector.AddCertificationButton().should("be.visible");

    const headers = ["Type", "Expiry Date", "Credential ID", "Actions"];

    cy.get(".sc-dhKdcB.gqyqmk").then(($els) => {
      const texts = [...$els].map((el) => el.innerText.trim());
      headers.forEach((header) => {
        expect(texts).to.include(header);
      });
    });
    
    cy.get(".sc-YysOf").contains("Licences").click();
    workforceSelector.AddLicenceButton().should("be.visible");

    const headerLicences = ["Type", "Expiry Date", "Credential ID", "Actions"];

    cy.get(".sc-dhKdcB.gqyqmk").then(($els) => {
      const texts = [...$els].map((el) => el.innerText.trim());
      headerLicences.forEach((header) => {
        expect(texts).to.include(header);
      });
    });
  });

  it("Validate the ui of the document form", () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.DocumentsPage().click();
    workforceSelector.AddCertificationButton().click();
    workforceSelector.submitButton().click()

    cy.get('[type="error"]')
      .contains("A document name is required.")
      .should("be.visible");
    cy.get(".sc-hzhJZQ.ejnGHX").should("have.attr", "disabled");

    cy.get('[placeholder="Issued Date"]').click();
    cy.get(".rmdp-today").first().click();

    cy.get('[name="expiresInPeriods"]').click();
    cy.get(".sc-kdBSHD > :nth-child(2)").click();

    const daysToAdd = 3;
    cy.get('input[type="number"]').clear().type(daysToAdd.toString());

    cy.get('[placeholder="Issued Date"]')
      .invoke("val")
      .then((issuedDateValue) => {
        cy.get('[placeholder="Expiry Date"]')
          .invoke("val")
          .then((expiryDateValue) => {
            cy.log("Issued Date:", issuedDateValue);
            cy.log("Expiry Date:", expiryDateValue);
            cy.log("Days to add:", daysToAdd);

            const issuedDate = new Date(issuedDateValue);
            const expectedDate = new Date(issuedDate);
            expectedDate.setDate(expectedDate.getDate() + daysToAdd);

            const expectedDateString = expectedDate.toLocaleDateString(
              "en-US",
              {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              }
            );

            cy.log("Expected Expiry Date:", expectedDateString);
            expect(expiryDateValue).to.equal(expectedDateString);
          });
      });

    cy.get("button p").contains("Back").click();
    cy.get("p").contains("Documents").should("be.visible");
  });

  it("Verify that the 1st field (No. of Period) of 'Expires In' should not accept the decimal number.", () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.DocumentsPage().click();
    workforceSelector.AddCertificationButton().click();

    cy.get('[placeholder="Issued Date"]').click();
    cy.get(".rmdp-today").first().click();
    cy.get('[name="expiresInPeriods"]').click();
    cy.get(".sc-kdBSHD > :nth-child(2)").click();
    cy.get('input[type="number"]').type("abcd");
    cy.get('input[type="number"]').should('have.value', '');

    cy.get('input[type="number"]').type(")^%$%");
    cy.get('input[type="number"]').should('have.value', '');
  });

  it("Verify that clicking on the 'X' on the 'Expires In' 2nd Field should remove the selected period.", () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.DocumentsPage().click();
    workforceSelector.AddCertificationButton().click();

    cy.get('[placeholder="Issued Date"]').click();
    cy.get(".rmdp-today").first().click();
    cy.get('[name="expiresInPeriods"]').click();
    cy.get(".sc-kdBSHD > :nth-child(2)").click();
    cy.get('input[type="number"]').type("3");
    cy.get('input[type="number"]').should('have.value', '3');
    cy.get('[placeholder="Period(s)"]').click()
    cy.get('[placeholder="Period(s)"]').should('have.attr', 'value', 'Day(s)');
    cy.get('.sc-hzhJZQ button').click()
    cy.get('[placeholder="Period(s)"]').should('have.attr', 'value', '');
  });

  it('Verify that updating the worker details and adding the documents and then refreshing the page should redirect to the worker list page without saving.', () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.DocumentsPage().click();
    workforceSelector.AddCertificationButton().click();

    cy.get('[placeholder="Issued Date"]').click();
    cy.get(".rmdp-today").first().click();

    cy.get('[name="expiresInPeriods"]').click();
    cy.get(".sc-kdBSHD > :nth-child(2)").click();

    cy.get('input[type="number"]').type("3");
    cy.get('input[type="number"]').should('have.value', '3');

    cy.get('[placeholder="Expiry Date"]')
      .invoke('val')
      .should('not.be.empty')

    cy.reload();

    workforceSelector.addWorkerButton().should('be.visible')
  });

  it("Verify that removing the 'Issued Date' should disable the 'Issued Date' but should not remove the populated 'Expiry Date'.", () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.DocumentsPage().click();
    workforceSelector.AddCertificationButton().click();

    cy.get('[placeholder="Issued Date"]').click();
    cy.get(".rmdp-today").first().click();

    cy.get('[name="expiresInPeriods"]').click();
    cy.get(".sc-kdBSHD > :nth-child(2)").click();

    cy.get('input[type="number"]').type("3");
    cy.get('input[type="number"]').should('have.value', '3');

    cy.get('[placeholder="Expiry Date"]')
      .invoke('val')
      .should('not.be.empty')
      .then((expiryDate) => {
        cy.wrap(expiryDate).as('expiryDateBefore');
      });

    cy.get('[placeholder="Issued Date"]').clear()
    cy.get('input[type="number"]').should('be.disabled');

    cy.get('@expiryDateBefore').then((expiryDate) => {
      cy.get('[placeholder="Expiry Date"]')
        .should('have.value', expiryDate);
    });
  });

  it("Displays yellow row and red warning icon for documents expiring within 7 days", () => {
    const credID = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
      workforceSelector.DocumentsPage().click();

      workforceSelector.AddCertificationButton().click();
      cy.selectRandomOption('[name="documentType"]', '.sc-tagGq[role="button"]', 'documentType')
      cy.get('[name="credentialId"]').type(credID);

      cy.get('[placeholder="Issued Date"]').click();
      cy.get(".rmdp-today").first().click();
      cy.get('[name="expiresInPeriods"]').click();
      cy.get(".sc-kdBSHD > :nth-child(2)").click();
      cy.get('input[type="number"]').type("3");

      cy.get('[placeholder="Expiry Date"]')
        .invoke("val")
        .then((expiryDate) => {
          cy.fixture("file.pdf", "base64").then((fileContent) => {
            cy.get(".sc-gObJpS").attachFile(
              { fileContent, fileName: "file.pdf", mimeType: "application/pdf" },
              { subjectType: "drag-n-drop" }
            );
          });
          cy.get('iframe[src^="blob:https://uat.kwant.ai"]').should('be.visible')
          cy.wait(1000)

          cy.get("button > p").contains("Submit").click();
          cy.get(".cell-content")
            .contains(credID)
            .closest(".sc-cRmqLi")
            .within(() => {
              cy.contains(expiryDate).find('svg[fill="#DF4242"]').should("exist");
              cy.contains("p", "Expiry Date ends soon. Please upload new certificate.");
            });
        });

      cy.get(".sc-jXbUNg.gDlPVv")
        .eq(4)
        .find('svg path[fill="#DF4242"]')
        .should("exist");
    });
  });

  it("Displays red row and red warning icon for documents expired", () => {
    const credID = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");
    
    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
      workforceSelector.DocumentsPage().click();

      workforceSelector.AddCertificationButton().click();
      cy.selectRandomOption('[name="documentType"]', '.sc-tagGq[role="button"]', 'documentType')
      cy.get('[placeholder="Issued Date"]').clear().type('11/12/2024')
      cy.get('[name="credentialId"]').type(credID);

      cy.get('[name="expiresInPeriods"]').click();
      cy.get(".sc-kdBSHD > :nth-child(2)").click();
      cy.get('input[type="number"]').type("0");

      cy.get('[placeholder="Expiry Date"]')
        .invoke("val")
        .then((expiryDate) => {
          cy.fixture("file.pdf", "base64").then((fileContent) => {
            cy.get(".sc-gObJpS").attachFile(
              { fileContent, fileName: "file.pdf", mimeType: "application/pdf" },
              { subjectType: "drag-n-drop" }
            );
          });
          cy.get('iframe[src^="blob:https://uat.kwant.ai"]').should('be.visible')
          cy.wait(1000)

          cy.get("button > p").contains("Submit").click({ force: true });
          cy.get(".cell-content")
            .contains(credID)
            .closest(".sc-cRmqLi")
            .within(() => {
              cy.contains(expiryDate).find('svg[fill="#DF4242"]').should("exist");
              cy.contains("p", "Expiry Date has ended. Please upload new certificate.");
            });
        });

      cy.get(".sc-jXbUNg.gDlPVv")
        .eq(4)
        .find('svg path[fill="#DF4242"]')
        .should("exist");
    });
  });

  it("Verify that expired or expiring document's expiry date is update to future date and updating it should display grey color row in the document list", () => {
    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;

      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
      workforceSelector.DocumentsPage().click();

      cy.get(".sc-cRmqLi.bpifwg")
        .eq(0)
        .find(".cell-content")
        .eq(2)
        .invoke("text")
        .then((originalCred) => {
          const origCred = originalCred.trim();
          cy.log(`Original Credential ID: ${origCred}`);

          cy.get(".sc-cRmqLi.bpifwg").eq(0).click();

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

              cy.contains('button p', 'Update').click({});
              workforceSelector.toastMessage().contains('Document updated successfully');

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
  });

  it('should update an existing certificate', () => {
    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;

      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
      workforceSelector.DocumentsPage().click();

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

              cy.contains('button p', 'Update').click({});
              workforceSelector.toastMessage().contains('Document updated successfully');

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
  });

  it("Deleting a certificate", () => {
    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;

      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
      workforceSelector.DocumentsPage().click();

      cy.get(".sc-cRmqLi.dEhqLz")
        .eq(0)
        .find(".cell-content")
        .invoke("text")
        .then((documentName) => {
          const docText = documentName.trim();
          cy.log(`Deleting document: ${docText}`);

          cy.get(".sc-cRmqLi.dEhqLz")
            .eq(0)
            .find(".sc-jXbUNg.jnXMtv")
            .eq(1)
            .click();

          cy.contains("button p", "Delete").click({ force: true });
          workforceSelector
            .toastMessage()
            .contains("Successfully deleted document.")
            .should("be.visible");

          cy.wait(2000)
          cy.get("body").then(($body) => {
            const rows = $body.find(".sc-cRmqLi.bpifwg, .sc-cRmqLi.dEhqLz");

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
                    cy.log('no svg found')
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
  });

  it("Verify expired licence shows red color for close date", () => {
    const credID = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
      workforceSelector.DocumentsPage().click();

      cy.get(".sc-YysOf").contains("Licences").click();
      workforceSelector.AddLicenceButton().click({ force: true });
      cy.get('[name="documentType"]').click();
      cy.get('[role="button"]').contains("Training").click();
      cy.get('[name="credentialId"]').type(credID);

      cy.get('[placeholder="Issued Date"]').click();
      cy.get('[placeholder="Expiry Date"]').click();
      cy.get(".sd:visible").first().click({ force: true });

      cy.get('[placeholder="Expiry Date"]')
        .invoke("val")
        .then((expiryDate) => {
          cy.fixture("file.pdf", "base64").then((fileContent) => {
            cy.get(".sc-gObJpS").attachFile(
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
      
      cy.get(".sc-jXbUNg.gDlPVv")
        .eq(4)
        .find('svg path[fill="#DF4242"]')
        .should("exist");
    });
  });

  it('send request renewal to the worker', () => {
    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;

      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
      workforceSelector.DocumentsPage().click();

      cy.get(".sc-YysOf").contains("Licences").click();

      cy.get(".sc-cRmqLi.bpifwg,.sc-cRmqLi.dEhqLz")
        .eq(0)
        .find(".cell-content")
        .invoke("text")
        .then((documentName) => {
          const docText = documentName.trim();
          cy.log(`document name: ${docText}`);

          cy.get(".sc-cRmqLi.bpifwg, .sc-cRmqLi.dEhqLz")
            .eq(0)
            .find(".sc-jXbUNg.jnXMtv")
            .eq(0)
            .click();

          workforceSelector
            .toastMessage()
            .contains("Renewal request sent successfully")
            .should("be.visible");

          cy.task("getMostRecentEmail").then((email) => {
            if (!email) throw new Error("❌ NO EMAIL RECEIVED");

            const body = email.body
              .toLowerCase()
              .replace(/=\r\n/g, "")
              .replace(/\r\n/g, " ")
              .replace(/=3d/g, "=")
              .replace(/=e2=80=8b/g, "")
              .replace(/<[^>]*>/g, " ")
              .replace(/\s+/g, " ")
              .trim();

            const subject = email.subject.toLowerCase();

            cy.log(`📧 Email Subject: ${email.subject}`);
            cy.log(`📧 Cleaned Body Preview: ${body.substring(0, 500)}`);
            cy.log(`👤 Full name from file: ${fullName}`);

            expect(subject).to.include("document renewal request");
            expect(subject).to.include("training");
            expect(body).to.include("license has expired");
            expect(body).to.include("needs to be renewed");
            expect(body).to.include("contact your project manager");

            expect(
              body.replace(/\s+/g, " ").toLowerCase()
            ).to.include(fullName.replace(/\s+/g, " ").toLowerCase());

            cy.log("✅ All validations passed!");
          });
        });
    });
  });

  it("Deleting a licence", () => {
    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
      workforceSelector.DocumentsPage().click();

      cy.get(".sc-jXbUNg.gDlPVv")
        .eq(4)
        .find('svg path[fill="#DF4242"]')
        .should("exist");
      cy.get(".sc-YysOf").contains("Licences").click();

      cy.get(".sc-cRmqLi.bpifwg, .sc-cRmqLi.dEhqLz")
        .eq(0)
        .find(".cell-content")
        .invoke("text")
        .then((documentName) => {
          const docText = documentName.trim();
          cy.log(`Deleting document: ${docText}`);

          cy.get(".sc-cRmqLi.bpifwg, .sc-cRmqLi.dEhqLz")
            .eq(0)
            .find(".sc-jXbUNg.jnXMtv")
            .eq(1)
            .click();

          cy.contains("button p", "Delete").click({ force: true });
          workforceSelector
            .toastMessage()
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
                  cy.get(".sc-jXbUNg.gDlPVv")
                    .eq(4)
                    .find('svg path[fill="#DF4242"]')
                    .should("exist");
                } else {
                  cy.get(".sc-jXbUNg.gDlPVv")
                    .eq(4)
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
  });

  it("adding with invalid file type", () => {
    const credID = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
      workforceSelector.DocumentsPage().click();

      workforceSelector.AddCertificationButton().click();
      cy.selectRandomOption('[name="documentType"]', '.sc-tagGq[role="button"]', 'documentType')
      cy.get('[name="credentialId"]').type(credID);

      cy.get('[placeholder="Issued Date"]').click();
      cy.get(".rmdp-today").first().click();
      cy.get('[name="expiresInPeriods"]').click();
      cy.get(".sc-kdBSHD > :nth-child(2)").click();
      cy.get('input[type="number"]').type("3");

      cy.get('[placeholder="Expiry Date"]')
        .invoke("val")
        .then((expiryDate) => {
          cy.fixture("backup.csv", "base64").then((fileContent) => {
            cy.get(".sc-gObJpS").attachFile(
              { fileContent, fileName: "backup.csv", mimeType: "text/csv" },
              { subjectType: "drag-n-drop" }
            );
          });

          cy.get("button > p").contains("Submit").click({ force: true });
          workforceSelector.toastMessage().should("contain", "File type unsupported");
        });
    });
  });

  it("Should not allow adding document which expire date is already done", () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });

    workforceSelector.DocumentsPage().click();
    workforceSelector.AddCertificationButton().click();

    cy.get('[placeholder="Expiry Date"]').click();

    cy.get(".rmdp-day")
      .filter(".rmdp-disabled")
      .should("exist");

    cy.get(".rmdp-day.rmdp-disabled").first().click({ force: true });
    cy.get('header p').contains('Add Certification').click()

    cy.get('[placeholder="Expiry Date"]')
      .invoke("val")
      .should("eq", "");
  });

  it("Should not allow adding document which expire date is older than issued date", () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });

    workforceSelector.DocumentsPage().click();

    workforceSelector.AddCertificationButton().click();

    cy.get('[placeholder="Issued Date"]').click();
    cy.get(".rmdp-today").first().click();

    cy.get('[placeholder="Expiry Date"]').click();

    cy.get(".rmdp-day")
      .filter(".rmdp-disabled")
      .should("exist");

    cy.get(".rmdp-day.rmdp-disabled").first().click({ force: true });
    cy.get('header p').contains('Add Certification').click()

    cy.get('[placeholder="Expiry Date"]')
      .invoke("val")
      .should("eq", "");
  });

  it("Should auto-calculate expiry date when Expires In is set", () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.DocumentsPage().click();
    workforceSelector.AddCertificationButton().click();

    cy.selectRandomOption('[name="documentType"]', '.sc-tagGq[role="button"]', 'documentType');
    cy.get('[name="credentialId"]').type("TEST123456");

    cy.get('[placeholder="Issued Date"]').click();
    cy.get(".rmdp-today").first().click();

    cy.get('[name="expiresInPeriods"]').click();
    cy.get(".sc-kdBSHD").contains("Day(s)").click();
    cy.get('input[type="number"]').clear({ force: true }).type("90");

    cy.get('[placeholder="Issued Date"]').invoke("val").then((issued) => {
      cy.get('[placeholder="Expiry Date"]').invoke("val").then((expiry) => {
        const issuedDate = new Date(issued);
        const expectedExpiry = new Date(issuedDate);
        expectedExpiry.setDate(expectedExpiry.getDate() + 90);

        const expectedStr = expectedExpiry.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric"
        });

        expect(expiry).to.equal(expectedStr);
      });
    });
  });

  it("Should not save document when modal is closed without submitting", () => {
    const credID = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.DocumentsPage().click();

    cy.get("body").then(($body) => {
      workforceSelector.AddCertificationButton().click();
      cy.selectRandomOption('[name="documentType"]', '.sc-tagGq[role="button"]', 'documentType');
      cy.get('[name="credentialId"]').type(credID);
      cy.get('[placeholder="Issued Date"]').click();
      cy.get(".rmdp-today").first().click();

      cy.get("body").click(0, 0);

      cy.get("body").should("not.contain", credID);
    });
  });

  
  it("Download uploaded document - validate downloaded file name", () => {
    cy.get(workforceSelector.tableRow)
      .eq(0)
      .click({ force: true });
  
    workforceSelector.DocumentsPage().click();
  
    cy.get('.sc-cRmqLi.bpifwg')
      .eq(0)
      .click({ force: true });
  
    // Find img inside .sc-fvtFIe container
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
          .click({ force: true });
  
        cy.contains('p', 'Download')
          .should('be.visible')
          .click();
  
        const downloadsFolder = Cypress.config('downloadsFolder');
        const filePath = path.join(downloadsFolder, fileName);
  
        cy.readFile(filePath, { timeout: 20000 }).should('exist');
      });
  });

  it("Editing the existing document and add a jpeg document", () => {

    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.DocumentsPage().click();
    cy.get('.sc-cRmqLi.bpifwg').eq(0).click();
    cy.get('.sc-aXZVg.liAmio button svg').eq(0).click();
    cy.get('button p').contains('Remove').click()
    cy.fixture("document.jpg", "base64").then((fileContent) => {
      cy.get(".sc-gObJpS").attachFile(
        { fileContent, fileName: "document.jpg", mimeType: "image/jpeg" },
        { subjectType: "drag-n-drop" }
      );
    });
    cy.get('img[src^="blob:https://uat.kwant.ai"]')
    .scrollIntoView()
    .should('be.visible')
  



  });

});