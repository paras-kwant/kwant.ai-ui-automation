/// <reference types="cypress" />
import { workforceSelector } from "../../support/workforceSelector.js";
import workerHelper from "../../support/helper/workerHelper.js";

describe("Worker Alerts & SMS Communication Flow (UI + Twilio Integration)", () => {
  before(() => {
    cy.session("userSession", () => {
      cy.login();
      cy.get(".card-title").contains(Cypress.env("PROJECT_NAME")).click();
    });
    workerHelper.visitWorkersPage();
  });

  beforeEach(() => {
    cy.cleanUI();
  });

  it("Sending Alert to Worker with Missing Contact Information", () => {
    cy.get(workforceSelector.tableRow).first().should("be.visible");

    cy.readFile("cypress/fixtures/noEmailWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.wait(2000);

      cy.get(".header-checkbox-container [type='checkbox']").eq(0).check({ force: true });
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains(".dropdown-option", "Send Alert").click();
      cy.get('[label="Message Type"] [placeholder="Select"]').click();
      cy.contains("General Communication").click();
      cy.get("textarea").type(Math.random().toString(36).substring(2, 12));
      workforceSelector.sendAlert().click();
      workforceSelector
        .toastMessage()
        .should(
          "contain.text",
          "None of the selected worker(s) have phone number added or no SMS consent provided."
        );
    });
  });

  it("Sending a General Communication Message and verifying Remaining Alerts & Twilio SMS", () => {
    const randomText = Math.random().toString(36).substring(2, 12);
    const twilioNumber = Cypress.env("TWILIO_NUMBER");
  
    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
  
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.wait(2000);
  
      cy.get(workforceSelector.tableRow).first().click({ force: true });
      workforceSelector.personalDetails().click();
      cy.getWorkerField("Phone").click();
      cy.get('[name="phone"]').clear().type(Cypress.env("TWILIO_NUMBER"));
      cy.get("button p").contains("Update").click();
      cy.get(workforceSelector.toastMessage).should("contain", "Successfully updated employee.");
      cy.get("button p").contains("Cancel").click();
  
          cy.get(".header-checkbox-container [type='checkbox']").eq(0).check({ force: true });
          cy.get(workforceSelector.overflowMenu).click();
          cy.contains(".dropdown-option", "Send Alert").click();
          
          cy.get('[label="Message Type"] [placeholder="Select"]').click();
          cy.contains("General Communication").click();
          cy.get("textarea").type(randomText);
          cy.get("footer .sc-dhKdcB")
          .should("exist")
          .invoke("text")
          .then((text) => {
            const match = text.match(/Remaining Alerts:\s*(\d+)\/\d+/);
            if (!match) throw new Error(`Could not parse Remaining Alerts from text: "${text}"`);
            const remainingBefore = parseInt(match[1], 10);
          workforceSelector.sendAlert().click();
          workforceSelector.toastMessage().should("contain.text", "Alert sent to 1 worker(s).");
          cy.get('button p').contains('Done').click();


          cy.get(".header-checkbox-container [type='checkbox']").eq(0).check({ force: true });
          cy.get(workforceSelector.overflowMenu).click();
          cy.contains(".dropdown-option", "Send Alert").click();

          cy.get("footer .sc-dhKdcB")
            .invoke("text")
            .then((updatedText) => {
              const updatedMatch = updatedText.match(/Remaining Alerts:\s*(\d+)\/\d+/);
              if (!updatedMatch) throw new Error(`Could not parse Remaining Alerts after sending alert: "${updatedText}"`);
              const remainingAfter = parseInt(updatedMatch[1], 10);
              expect(remainingAfter).to.eq(remainingBefore - 1);
            });
  
          // Twilio inbound SMS verification
          const twilioNumber = Cypress.env("TWILIO_NUMBER");
          const accountSid = Cypress.env("TWILIO_ACCOUNT_SID");
          const authToken = Cypress.env("TWILIO_AUTH_TOKEN");
          const expectedFrom = Cypress.env("EXPECTED_FROM");
          const expectedMessageSnippet = randomText;
  
          const pollTwilio = (retries = 5) => {
            return new Cypress.Promise((resolve, reject) => {
              const check = (remaining) => {
                cy.request({
                  method: "GET",
                  url: `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
                  auth: { user: accountSid, pass: authToken },
                  qs: { To: twilioNumber, PageSize: 10 },
                  failOnStatusCode: false,
                }).then((res) => {
                  if (res.status === 200 && res.body.messages.length > 0) {
                    const msg = res.body.messages.find(
                      (m) => m.from === expectedFrom && m.direction === "inbound"
                    );
                    if (msg) {
                      resolve(msg);
                      return;
                    }
                  }
                  if (remaining === 0) {
                    reject("Incoming SMS not found in Twilio logs after retries");
                  } else {
                    setTimeout(() => check(remaining - 1), 3000);
                  }
                });
              };
              check(retries);
            });
          };
          cy.wait(5000)
  
          pollTwilio().then((latestSMS) => {
            expect(latestSMS).to.exist;
            expect(latestSMS.body).to.include(expectedMessageSnippet);
            expect(latestSMS.from).to.eq(expectedFrom);
            expect(latestSMS.to).to.eq(twilioNumber);
            expect(latestSMS.direction).to.eq("inbound");
          });
        });
    });
  });
  

  it("Sending an Alert Message with Special Characters", () => {
    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).first().should("be.visible");

      cy.get(".header-checkbox-container [type='checkbox']").eq(0).check({ force: true });
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains(".dropdown-option", "Send Alert").click();
      cy.get('[label="Message Type"] [placeholder="Select"]').click();
      cy.get('[role="button"]').contains("Alert").click();
      const specialCharMessage = "!@#$%^&*()_+{}|:\"<>?-=[]\\;',./`~";
      cy.get("textarea").type(specialCharMessage);
      workforceSelector.sendAlert().click();
      workforceSelector.toastMessage().should("contain.text", "Alert sent to 1 worker(s).");
    });
  });

  it("Sending an Alert Message with Template", () => {
    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).first().should("be.visible");

      cy.get(".header-checkbox-container [type='checkbox']").eq(0).check({ force: true });
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains(".dropdown-option", "Send Alert").click();
      cy.get('[label="Message Type"] [placeholder="Select"]').click();
      cy.get('[role="button"]').contains("Alert").click();
      cy.get('[placeholder="Select Template"]').click();
      cy.get(".sc-kdBSHD > :nth-child(2)").click();
      cy.get("textarea").invoke("val").should("have.length.greaterThan", 0);
      workforceSelector.sendAlert().click();
      workforceSelector.toastMessage().should("contain.text", "Alert sent to 1 worker(s).");
    });
  });

  it("Modifying and Saving an Existing Alert Template", () => {
    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).first().should("be.visible");

      cy.get(".header-checkbox-container [type='checkbox']").eq(0).check({ force: true });
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains(".dropdown-option", "Send Alert").click();
      cy.get('[label="Message Type"] [placeholder="Select"]').click();
      cy.get('[role="button"]').contains("Alert").click();
      cy.get('[placeholder="Select Template"]').click();
      cy.get(".sc-kdBSHD > :nth-child(2)").click();
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
  });

  it("Cancelling the Alert Sending Process", () => {
    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.wait(2000);

      cy.get(".header-checkbox-container [type='checkbox']").eq(0).check({ force: true });
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains(".dropdown-option", "Send Alert").click();
      cy.get('[label="Message Type"] [placeholder="Select"]').click();
      cy.get('[role="button"]').contains("Alert").click();
      cy.get("textarea").type(Math.random().toString(36).substring(2, 12));
      cy.get("button p").contains("Cancel").click();
      cy.get("p").contains("View Alerts History").should("not.exist");
    });
  });

  it("Verifying Alert History Download from Send Alert Flow", () => {
    cy.get(workforceSelector.tableRow).first().should("be.visible");

    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
      const alertMessage = Math.random().toString(36).substring(2, 12);

      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.wait(2000);

      cy.get(".header-checkbox-container [type='checkbox']").eq(0).check({ force: true });
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains(".dropdown-option", "Send Alert").click();
      cy.get('[label="Message Type"] [placeholder="Select"]').click();
      cy.contains("General Communication").click();
      cy.get("textarea").type(alertMessage);
      workforceSelector.sendAlert().click();
      workforceSelector.toastMessage().should("contain.text", "Alert sent to 1 worker(s).");

      cy.get("button p").contains("View Alerts History").click();
      workforceSelector.toastMessage().contains("Alert report downloaded successfully.").should("be.visible");
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
  });

  it("Sending Alert to Onsite Worker and Verifying Inbound SMS via Twilio", () => {
    const randomText = Math.random().toString(36).substring(2, 12);
  
    cy.contains(".sc-fremEr", "Site Status").scrollIntoView().find("svg").click();
    cy.get(".sc-eldPxv.bVwlNE").contains("On-site").click();
    cy.get('.default__label').contains("Site Status: 1").should('be.visible')
    cy.wait(5000)
  
    cy.get('body').then(($body) => {
      if ($body.find(workforceSelector.tableRow).length === 0) {
        cy.log("No onsite workers available for testing.");
      } else {
        cy.get(workforceSelector.tableRow).first().click({ force: true });
        workforceSelector.personalDetails().click();
        cy.getWorkerField("Phone").click();
        cy.get('[name="phone"]').clear().type(Cypress.env("TWILIO_NUMBER"));
        cy.get("button p").contains("Update").click();
        cy.get(workforceSelector.toastMessage).should("contain", "Successfully updated employee.");
        cy.get("button p").contains("Cancel").click();
        cy.get(workforceSelector.overflowMenu).click();
        cy.contains(".dropdown-option", "Send Alert").click();


        cy.get('[label="Message Type"] [placeholder="Select"]').click();
        cy.contains("General Communication").click();
        cy.get("textarea").type(randomText);
        workforceSelector.sendAlert().click();
        cy.get(workforceSelector.toastMessage).contains("Alert sent to").should("be.visible");
  
        const twilioNumber = Cypress.env("TWILIO_NUMBER");
        const accountSid = Cypress.env("TWILIO_ACCOUNT_SID");
        const authToken = Cypress.env("TWILIO_AUTH_TOKEN");
        const expectedFrom = Cypress.env("EXPECTED_FROM");
        const expectedMessageSnippet = randomText;
  
        const pollTwilio = (retries = 5) => {
          return new Cypress.Promise((resolve, reject) => {
            const check = (remaining) => {
              cy.request({
                method: "GET",
                url: `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
                auth: { user: accountSid, pass: authToken },
                qs: { To: twilioNumber, PageSize: 10 },
                failOnStatusCode: false,
              }).then((res) => {
                if (res.status === 200 && res.body.messages.length > 0) {
                  const msg = res.body.messages.find(
                    (m) => m.from === expectedFrom && m.direction === "inbound"
                  );
                  if (msg) {
                    resolve(msg);
                    return;
                  }
                }
                if (remaining === 0) {
                  reject("Incoming SMS not found in Twilio logs after retries");
                } else { 
                  setTimeout(() => check(remaining - 1), 3000);
                }
              });
            };
            check(retries);
          });
        };
        cy.wait(2000)
  
        pollTwilio().then((latestSMS) => {
          expect(latestSMS).to.exist;
          expect(latestSMS.body).to.include(expectedMessageSnippet);
          expect(latestSMS.from).to.eq(expectedFrom);
          expect(latestSMS.to).to.eq(twilioNumber);
          expect(latestSMS.direction).to.eq("inbound");
        });
      }
    });
  });

  it("Validates maximum number of letters allowed in General Communication message", () => {
    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
  
      const overLimitMessage = "A".repeat(170);
  
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.wait(2000);
  
      cy.get(".header-checkbox-container [type='checkbox']")
        .eq(0)
        .check({ force: true });
  
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains(".dropdown-option", "Send Alert").click();
  
      cy.get('[label="Message Type"] [placeholder="Select"]').click();
      cy.contains("General Communication").click();
  
      cy.get("textarea")
        .clear()
        .type(overLimitMessage)
        .invoke("val")
        .should("have.length.at.most", 160);
    });
  });



  it.only(
    "Enforces maximum character limit for General Communication messages",
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
  
          cy.get(workforceSelector.overflowMenu).click();
          cy.contains(".dropdown-option", "Send Alert").click();
  
          cy.get('[label="Message Type"] [placeholder="Select"]').click();
          cy.contains("General Communication").click();
  
          cy.get(".sc-dhKdcB.fOBBgu.sc-ijanKN.edANdR")
            .invoke("text")
            .then((text) => {
              const maxLength = Number(text.split("/")[1]);
  
              cy.log(`Max allowed characters: ${maxLength}`);
  
              const overLimitMessage = "A".repeat(maxLength + 10);
  
              cy.get("textarea")
                .clear()
                .type(overLimitMessage)
                .invoke("val")
                .should("have.length", maxLength);
            });
        }
      );
    }
  );
  
  
  
});
