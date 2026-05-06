/// <reference types="cypress" />
import { workforceSelector } from "../../support/workforceSelector.js";
import workerHelper from "../../support/helper/workerHelper.js";
const PROJECT_ID = Cypress.env('PROJECT_ID');


describe(
  "Worker Alerts & SMS Communication Flow (UI + Twilio Integration)",
  { tags: ["Epic:WorkForce", "Feature:Alerts & SMS", "Module:Workforce-Worker"] },
  () => {
    beforeEach(() => {
      cy.loginAndVisit(() => workerHelper.visitWorkersPageForProject(PROJECT_ID));
    });

    it(
      "Sending Alert to Worker with Missing Contact Information",
      { tags: ["Story:Send Alert Missing Contact", "Severity:critical", "UI", "@smoke"] },
      () => {
        cy.get(workforceSelector.tableRow).first().should("be.visible");

        cy.readFile("cypress/fixtures/noEmailWorker.json").then((workerData) => {
          const { firstName, lastName } = workerData;
          const fullName = `${firstName} ${lastName}`;
          cy.get(workforceSelector.searchInput).clear().type(fullName);
          cy.get('.personal-info-content__title').contains(fullName).should("be.visible");
          cy.get(".header-checkbox-container [type='checkbox']").eq(0).check({ force: true });
          cy.get(workforceSelector.overflowMenu).click();
          cy.contains("button p", "Send Alert").click();
          cy.get('[label="Message Type"] [placeholder="Select"]').click({force:true});
          cy.contains("General Communication").click();
          cy.get("textarea").type(Math.random().toString(36).substring(2, 12));
          cy.get(workforceSelector.sendAlertButton).click();
          cy.get(workforceSelector.toastMessage)
            .should(
              "contain.text",
              "None of the selected worker(s) have phone number added or no SMS consent provided."
            );
        });
      }
    );

    it.skip(
      "Sending a General Communication Message and verifying Remaining Alerts & Twilio SMS",
      { tags: ["Story:Send General Communication", "Severity:critical", "Twilio Integration", "Module:Workforce-Worker"] },
      () => {
        const randomText = Math.random().toString(36).substring(2, 12);

        cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
          const { firstName, lastName } = workerData;
          const fullName = `${firstName} ${lastName}`;

          cy.get(workforceSelector.searchInput).clear().type(fullName);
          cy.wait(2000);

          cy.get(workforceSelector.tableRow).first().click({ force: true });
          cy.get(workforceSelector.personalDetailsPage).click();
          cy.getWorkerField("Phone").click();

          cy.get('[name="phone"]').clear().type(Cypress.env("TWILIO_NUMBER"));

          cy.get("button p").contains("Update").click();
          cy.get(workforceSelector.toastMessage).should("contain", "Successfully updated worker");
          cy.get("button p").contains("Cancel").click();

          cy.get(".header-checkbox-container [type='checkbox']").eq(0).check({ force: true });
          cy.contains("button p", "Send Alert").click();

          cy.get('[label="Message Type"] [placeholder="Select"]').click();
          cy.contains("General Communication").click();
          cy.get("textarea").type(randomText);

          cy.get("footer p").contains("/")
            .should("exist")
            .invoke("text")
            .then((text) => {
              const match = text.match(/Remaining Alerts:\s*(\d+)\/\d+/);
              if (!match) throw new Error(`Could not parse Remaining Alerts from text: "${text}"`);
              const remainingBefore = parseInt(match[1], 10);

              cy.get(workforceSelector.sendAlertButton).click();
              cy.get(workforceSelector.toastMessage).should("contain.text", "Alert sent to 1 worker(s).");
              cy.get("button p").contains("Done").click();

              cy.get(".header-checkbox-container [type='checkbox']").eq(0).check({ force: true });
              cy.get("button p").contains("Send Alert").click();
              cy.wait(1000);

              cy.get("footer p").contains("/")
                .invoke("text")
                .then((updatedText) => {
                  const updatedMatch = updatedText.match(/Remaining Alerts:\s*(\d+)\/\d+/);
                  if (!updatedMatch) throw new Error(`Could not parse Remaining Alerts after sending alert: "${updatedText}"`);
                  const remainingAfter = parseInt(updatedMatch[1], 10);
                  expect(remainingAfter).to.eq(remainingBefore - 1);
                });

              cy.wait(5000);

              const twilioNumber = Cypress.env("TWILIO_NUMBER");
              const accountSid = Cypress.env("TWILIO_ACCOUNT_SID");
              const authToken = Cypress.env("TWILIO_AUTH_TOKEN");
              const expectedFrom = Cypress.env("EXPECTED_FROM");

              cy.task("getTwilioMessages", { accountSid, authToken, to: twilioNumber }).then((messages) => {
                const msg = messages.find((m) => m.body && m.body.includes(randomText));
                expect(msg, `Expected SMS containing "${randomText}"`).to.exist;
                expect(msg.body).to.include(randomText);
                expect(msg.from).to.eq(expectedFrom);
                expect(msg.to).to.eq(twilioNumber);
              });
            });
        });
      }
    );

    it(
      "Sending an Alert Message with Special Characters",
      { tags: ["Story:Alert With Special Characters", "Severity:normal", "Module:Workforce-Worker"] },
      () => {
        cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
          const { firstName, lastName } = workerData;
          const fullName = `${firstName} ${lastName}`;
          cy.get(workforceSelector.searchInput).clear().type(fullName);
          cy.get('.personal-info-content__title').contains(fullName).should("be.visible");

          cy.get(".header-checkbox-container [type='checkbox']").eq(0).check({ force: true });
          cy.contains("button p", "Send Alert").click();
          cy.get('[label="Message Type"] [placeholder="Select"]').click();
          cy.get('[role="button"]').contains("Alert").click();
          const specialCharMessage = "!@#$%^&*()_+{}|:\"<>?-=[]\\;',./`~";
          cy.get("textarea").type(specialCharMessage);
          cy.get(workforceSelector.sendAlertButton).click();
          cy.get(workforceSelector.toastMessage).should("contain.text", "Alert sent to 1 worker(s).");
        });
      }
    );

    it(
      "Sending an Alert Message with Template",
      { tags: ["Story:Send Alert Using Template", "Severity:normal", "@smoke"] },
      () => {
        cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
          const { firstName, lastName } = workerData;
          const fullName = `${firstName} ${lastName}`;
          cy.get(workforceSelector.searchInput).clear().type(fullName);
          cy.get(workforceSelector.tableRow).contains(fullName).should("be.visible");

          cy.get(".header-checkbox-container [type='checkbox']").eq(0).check({ force: true });
          cy.contains("button p", "Send Alert").click();
          cy.get('[label="Message Type"] [placeholder="Select"]').click();
          cy.get('[role="button"]').contains("Alert").click();
          cy.get('[placeholder="Select Template"]').click();
          cy.get('body').should('be.visible');
          // cy.get('[role="button"]').contains('Hello everyone').click();
          cy.get('section [role="button"]').first().click();
          cy.get("textarea").invoke("val").should("have.length.greaterThan", 0);
          cy.get(workforceSelector.sendAlertButton).click();
          cy.get(workforceSelector.toastMessage).should("contain.text", "Alert sent to 1 worker(s).");
        });
      }
    );

    it(
      "Modifying and Saving an Existing Alert Template",
      { tags: ["Story:Modify & Save Alert Template", "Severity:normal", "Module:Workforce-Worker"] },
      () => {
        cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
          const { firstName, lastName } = workerData;
          const fullName = `${firstName} ${lastName}`;
          cy.get(workforceSelector.searchInput).clear().type(fullName);
          cy.get(workforceSelector.tableRow).first().should("be.visible");

          cy.get(".header-checkbox-container [type='checkbox']").eq(0).check({ force: true });
          cy.contains("button p", "Send Alert").click();
          cy.get('[label="Message Type"] [placeholder="Select"]').click();
          cy.get('[role="button"]').contains("Alert").click();
          cy.get('[placeholder="Select Template"]').click();
          cy.get('[role="button"]').contains("Hello everyone").click();
          cy.get('[placeholder="Select Template"]')
            .invoke("val")
            .then((text) => {
              cy.get("#save-as-template").check();
              cy.get('[placeholder="Add Template Name"]').type(text);
              cy.get("button p").contains("Save").click();
              cy.get("p").contains("Do you want to overwrite the template name").should("be.visible");
              cy.get("button p").contains("Confirm").click();
              cy.get("button p").contains("Saved").should("be.visible");
            });
        });
      }
    );

    it(
      "Cancelling the Alert Sending Process",
      { tags: ["Story:Cancel Send Alert", "Severity:normal", "Module:Workforce-Worker"] },
      () => {
        cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
          const { firstName, lastName } = workerData;
          const fullName = `${firstName} ${lastName}`;
          cy.get(workforceSelector.searchInput).clear().type(fullName);
          cy.wait(2000);

          cy.get(".header-checkbox-container [type='checkbox']").eq(0).check({ force: true });
          cy.contains("button p", "Send Alert").click();
          cy.get('[label="Message Type"] [placeholder="Select"]').click();
          cy.get('[role="button"]').contains("Alert").click();
          cy.get("textarea").type(Math.random().toString(36).substring(2, 12));
          cy.get("button p").contains("Cancel").click();
          cy.get("p").contains("View Alerts History").should("not.exist");
        });
      }
    );

    it(
      "Verifying Alert History Download from Send Alert Flow",
      { tags: ["Story:Alert History Download", "Severity:normal", "Module:Workforce-Worker"] },
      () => {
        cy.get(workforceSelector.tableRow).first().should("be.visible");

        cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
          const { firstName, lastName } = workerData;
          const fullName = `${firstName} ${lastName}`;
          const alertMessage = Math.random().toString(36).substring(2, 12);

          cy.get(workforceSelector.searchInput).clear().type(fullName);
          cy.wait(2000);

          cy.get(".header-checkbox-container [type='checkbox']").eq(0).check({ force: true });
          cy.contains("button p", "Send Alert").click();
          cy.get('[label="Message Type"] [placeholder="Select"]').click();
          cy.contains("General Communication").click();
          cy.get("textarea").type(alertMessage);
          cy.get(workforceSelector.sendAlertButton).click();
          cy.get(workforceSelector.toastMessage).should("contain.text", "Alert sent to 1 worker(s).");

          cy.get("button p").contains("View Alerts History").click();
          cy.get(workforceSelector.toastMessage).contains("Alert report downloaded successfully.").should("be.visible");
          cy.wait(3000);

          cy.task("getLatestDownloadedFile", {
            downloadsFolder: "cypress/downloads",
            prefix: "Alert-History-Report",
          }).then((filename) => {
            cy.readFile(`cypress/downloads/${filename}`, "utf8").then((csvContent) => {
              const headers = csvContent.split("\n")[0];
              expect(headers).to.include('"S.No."');
              expect(headers).to.include('"Date"');
              expect(headers).to.include('"Message Text"');
              expect(headers).to.include('"Sent By"');
              expect(headers).to.include('"No. of Messages Sent"');
            });

            cy.task("deleteFile", { filePath: `cypress/downloads/${filename}` });
          });
        });
      }
    );

    it.skip(
      "Sending Alert to Onsite Worker and Verifying Inbound SMS via Twilio",
      { tags: ["Story:Send Alert Onsite Worker Twilio", "Severity:critical", "Twilio Integration", "Module:Workforce-Worker"] },
      () => {
        // Original skipped test content...
      }
    );

    it(
      "Validates maximum number of letters allowed in General Communication message",
      { tags: ["Story:Max Letters General Communication", "Severity:normal", "Module:Workforce-Worker"] },
      () => {
        cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
          const { firstName, lastName } = workerData;
          const fullName = `${firstName} ${lastName}`;
          const overLimitMessage = "A".repeat(170);

          cy.get(workforceSelector.searchInput).clear().type(fullName);
          cy.wait(2000);

          cy.get(".header-checkbox-container [type='checkbox']")
            .eq(0)
            .check({ force: true });

          cy.contains("button p", "Send Alert").click();

          cy.get('[label="Message Type"] [placeholder="Select"]').click();
          cy.contains("General Communication").click();

          cy.get("textarea")
            .clear()
            .type(overLimitMessage)
            .invoke("val")
            .should("have.length.at.most", 160);
        });
      }
    );

    it(
      "Enforces maximum character limit for General Communication messages",
      { tags: ["Story:Enforce Max Characters", "Severity:normal", "Module:Workforce-Worker"] },
      () => {
        cy.readFile("cypress/fixtures/createdWorker.json").then(
          ({ firstName, lastName }) => {
            const fullName = `${firstName} ${lastName}`;

            cy.get(workforceSelector.searchInput)
              .clear()
              .type(fullName);

            cy.wait(2000);

            cy.get(".header-checkbox-container [type='checkbox']")
              .first()
              .check({ force: true });

            cy.contains("button p", "Send Alert").click();

            cy.get('[label="Message Type"] [placeholder="Select"]').click();
            cy.contains("General Communication").click();

            cy.get("section p")
              .contains("/")
              .eq(0)
              .invoke("text")
              .then((text) => {
                cy.log(`Raw counter text: "${text}"`);
                const match = text.match(/\/\s*(\d+)/);
                expect(match, "Character limit should exist").to.not.be.null;
                const maxLength = Number(match[1]);
                cy.log(`Max allowed characters: ${maxLength}`);
                const overLimitMessage = "A".repeat(maxLength + 10);

                cy.get("textarea")
                  .clear()
                  .type(overLimitMessage, { delay: 0 })
                  .invoke("val")
                  .should("have.length", maxLength);
              });
          }
        );
      }
    );

  }
);