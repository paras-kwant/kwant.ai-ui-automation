/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from "../../support/workforceSelector";
import "cypress-real-events/support";


describe("Worker Module - Documents Page", () => {
  beforeEach(() => {
    cy.session("userSession", () => {
      cy.login();
      cy.get(".card-title").contains("Regression test").click();
    });
  });


  
  it("Verify the UI of the document", () => {
    cy.visit("/projects/94049707/workers");
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
    cy.visit("/projects/94049707/workers");
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.DocumentsPage().click();
    workforceSelector.AddCertificationButton().click();
    cy.get("button p").contains("Submit").click();

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

    // cy.wait(500);

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

  it("Displays yellow row and red warning icon for documents expiring within 7 days", () => {
    const credID = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

    cy.visit("/projects/94049707/workers");

    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      // cy.wait(1000);
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.DocumentsPage().click();

    // Add Certification
    workforceSelector.AddCertificationButton().click();
    cy.get('[name="documentType"]').click();
    cy.get('[role="button"]').contains("CA").click();
    cy.get('[name="credentialId"]').type(credID);

    // Set Dates
    cy.get('[placeholder="Issued Date"]').click();
    cy.get(".rmdp-today").first().click();
    cy.get('[name="expiresInPeriods"]').click();
    cy.get(".sc-kdBSHD > :nth-child(2)").click();
    cy.get('input[type="number"]').type("3");

    // Upload document and submit
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
          .closest(".sc-cRmqLi") // go up to the parent that contains this credID
          .within(() => {
            // Check that expiry date has a red SVG
            cy.contains(expiryDate).find('svg[fill="#DF4242"]').should("exist");

            // Check that expiry message appears inside the same parent
            cy.contains(
              "p",
              "Expiry Date ends soon. Please upload new certificate."
            );
          });
      });

    cy.get(".sc-jXbUNg.gDlPVv")
      .eq(4)
      .find('svg path[fill="#DF4242"]')
      .should("exist");
  });

  it("Displays red row and red warning icon for documents expiring within 7 days", () => {
    const credID = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

    cy.visit("/projects/94049707/workers");
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.DocumentsPage().click();

    // Add Certification
    workforceSelector.AddCertificationButton().click();
    cy.get('[name="documentType"]').click();
    cy.get('[role="button"]').contains("CA").click();
    cy.get('[name="credentialId"]').type(credID);

    // Set Dates
    cy.get('[placeholder="Issued Date"]').click();
    cy.get(".rmdp-today").first().click();
    cy.get('[name="expiresInPeriods"]').click();
    cy.get(".sc-kdBSHD > :nth-child(2)").click();
    cy.get('input[type="number"]').type("0");

    // Upload document and submit
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
          .closest(".sc-cRmqLi") // go up to the parent that contains this credID
          .within(() => {
            // Check that expiry date has a red SVG
            cy.contains(expiryDate).find('svg[fill="#DF4242"]').should("exist");

            // Check that expiry message appears inside the same parent
            cy.contains(
              "p",
              "Expiry Date has ended. Please upload new certificate."
            );
          });
      });

    cy.get(".sc-jXbUNg.gDlPVv")
      .eq(4)
      .find('svg path[fill="#DF4242"]')
      .should("exist");
  });
})
  it('should update an existing certificate', () => {
    cy.visit("/projects/94049707/workers");
  
    // Step 1: Open first worker and go to Documents page
    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      // cy.wait(1000);
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.DocumentsPage().click();
  
    // Step 2: Capture the Credential ID before editing
    cy.get(".sc-cRmqLi.dEhqLz, .sc-cRmqLi.bpifwg")
      .eq(0)
      .find(".cell-content")
      .eq(2) // assuming index 2 is the credential ID column
      .invoke("text")
      .then((originalCred) => {
        const origCred = originalCred.trim();
        cy.log(`Original Credential ID: ${origCred}`);
  
        // Step 3: Open document in edit mode
        cy.get(".sc-cRmqLi.dEhqLz, .sc-cRmqLi.bpifwg").eq(0).click();
  
        // Step 4: Edit expiry date
        cy.get('.hover-hoc-container__input__display-value')
          .eq(3)
          .realHover()
          .find('svg')
          .invoke('show')
          .should('be.visible')
          .click({ force: true });
  
        // cy.wait(1000);
        cy.get('[placeholder="Select Expiry date"]').clear().type('11/03/2026');
        cy.get('body').click(); // Blur input to trigger save
        // cy.wait(1000);
  
        // Step 5: Verify field changed
        cy.get('.hover-hoc-container__input__display-value')
          .eq(3)
          .should('contain.text', '11/03/2026')
          .invoke('text')
          .then((newDate) => {
            const updatedDate = newDate.trim();
            cy.log(`Updated Expiry Date: ${updatedDate}`);
  
            // Step 6: Save the document
            cy.get('button p').contains('Update').click();
            workforceSelector.toastMessage().contains('Document updated successfully');
  
            // Step 7: Verify table now contains that credential ID with new date
            // cy.wait(1000);
            cy.get(".sc-cRmqLi.dEhqLz, .sc-cRmqLi.bpifwg")
              .each(($row) => {
                const credCell = $row.find('.cell-content').eq(2);
                if (credCell.text().trim() === origCred) {
                  // ✅ Found the correct credential row
                  cy.wrap($row)
                    .find('.cell-content')
                    .eq(1) // assuming column 1 is expiry date
                    .should('contain.text', updatedDate);
                }
              });
          });
      });
  });
})
  

it("Deleting a certificate", () => {
  cy.visit("/projects/94049707/workers");

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

            // Verify that deleted doc no longer appears
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
                  cy.get(".sc-jXbUNg.gDlPVv")
                    .eq(4)
                    .find('svg path[fill="#DF4242"]')
                    .should("not.exist");
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

    cy.visit("/projects/94049707/workers");
    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      // cy.wait(1000);
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.DocumentsPage().click();
    // cy.wait(1000);

    // Add Licence
    cy.get(".sc-YysOf").contains("Licences").click();
    workforceSelector.AddLicenceButton().click({ force: true });
    cy.get('[name="documentType"]').click();
    cy.get('[role="button"]').contains("Training").click();
    cy.get('[name="credentialId"]').type(credID);

    // Set Dates
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

        // Validate red SVG for expiry
        cy.get(".cell-content")
          .contains(credID)
          .closest(".sc-cRmqLi.bpifwg")
          .within(() => {
            cy.contains(expiryDate).find('svg[fill="#DF4242"]').should("exist");
          });
      });
    cy.get(".sc-jXbUNg.gDlPVv")
      .eq(4)
      .find('svg path[fill="#DF4242"]')
      .should("exist");
  });
})

it('send request renewal to the worker', () => {
  cy.visit("/projects/94049707/workers");
  cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
    const { firstName, lastName } = workerData;
    const fullName = `${firstName} ${lastName}`;

    cy.get(workforceSelector.searchInput).clear().type(fullName);
    // cy.wait(1000);
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.DocumentsPage().click();
    // cy.wait(1000);

    // Add Licence
    cy.get(".sc-YysOf").contains("Licences").click();

    cy.get(".sc-cRmqLi.bpifwg")
      .eq(0)
      .find(".cell-content")
      .invoke("text")
      .then((documentName) => {
        const docText = documentName.trim();
        cy.log(`document name: ${docText}`);

        cy.get(".sc-cRmqLi.bpifwg")
          .eq(0)
          .find(".sc-jXbUNg.jnXMtv")
          .eq(0)
          .click();

        workforceSelector
          .toastMessage()
          .contains("Renewal request sent successfully")
          .should("be.visible");

        // Wait for email to arrive
        // cy.wait(1000);

        // Verify renewal email was received
        cy.task("getMostRecentEmail").then((email) => {
          if (!email) throw new Error("❌ NO EMAIL RECEIVED");

          // Clean and normalize the email body
          const body = email.body
            .toLowerCase()
            .replace(/=\r\n/g, "") // quoted-printable line breaks
            .replace(/\r\n/g, " ")
            .replace(/=3d/g, "=")
            .replace(/=e2=80=8b/g, "") // zero-width space
            .replace(/<[^>]*>/g, " ") // remove HTML tags
            .replace(/\s+/g, " ") // normalize spaces
            .trim();

          const subject = email.subject.toLowerCase();

          cy.log(`📧 Email Subject: ${email.subject}`);
          cy.log(`📧 Cleaned Body Preview: ${body.substring(0, 500)}`);
          cy.log(`👤 Full name from file: ${fullName}`);

          // Assertions - verify email content
          expect(subject).to.include("document renewal request");
          expect(subject).to.include("training");
          expect(body).to.include("license has expired");
          expect(body).to.include("needs to be renewed");
          expect(body).to.include("contact your project manager");

          // 🔥 Normalize both to avoid false negatives
          expect(
            body.replace(/\s+/g, " ").toLowerCase()
          ).to.include(fullName.replace(/\s+/g, " ").toLowerCase());

          cy.log("✅ All validations passed!");
        });
      });
  });
});

  it("Deleting a licence", () => {
    cy.visit("/projects/94049707/workers");
    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      // cy.wait(1000);
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.DocumentsPage().click();

    cy.get(".sc-jXbUNg.gDlPVv")
      .eq(4)
      .find('svg path[fill="#DF4242"]')
      .should("exist");
    cy.get(".sc-YysOf").contains("Licences").click();

    cy.get(".sc-cRmqLi.bpifwg")
      .eq(0)
      .find(".cell-content")
      .invoke("text")
      .then((documentName) => {
        const docText = documentName.trim();
        cy.log(`Deleting document: ${docText}`);

        cy.get(".sc-cRmqLi.bpifwg")
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
            // cy.get(".sc-jXbUNg.gDlPVv")
            //   .eq(4)
            //   .find('svg path[fill="#DF4242"]')
            //   .should("not.exist");
          }
        });
      });
  });
})
  
});
