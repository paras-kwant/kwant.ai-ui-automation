/// <reference types="cypress" />
import { workforceSelector } from "../../support/workforceSelector.js";
import workerHelper from "../../support/helper/workerHelper.js";
import companiesHelper from "../../support/helper/companiesHelper.js";

describe("Companies Alerts & SMS Communication Flow (UI + Twilio Integration)", () => {
  before(() => {
    cy.session("userSession", () => {
      cy.login();
      cy.get(".card-title").contains(Cypress.env("PROJECT_NAME")).click();
    });
	companiesHelper.visitCompaniesPage();

  });

  beforeEach(() => {
	cy.get('body').click(0, 0);
  });

  it("Sending Alert to company with Missing Contact Information", () => {

    cy.get(workforceSelector.searchInput).type('No Info Company')
    cy.get(workforceSelector.tableRow).contains('No Info Company').should('be.visible').click();
      cy.get(".header-checkbox-container [type='checkbox']").eq(0).check({ force: true });
      cy.contains('button p', 'Send Alert').click()
      
      cy.get('[label="Message Type"] [placeholder="Select"]').click();
      cy.contains("General Communication").click();
      cy.get("textarea").type(Math.random().toString(36).substring(2, 12));
      workforceSelector.sendAlert().click();
      workforceSelector
        .toastMessage()
        .should(
          "contain.text",
          "None of the selected company(s) have phone number added."
        );
    });


  it("Cancelling the Alert Sending Process", () => {
    cy.get(workforceSelector.searchInput).clear().type('No Info Company')
    cy.get(workforceSelector.tableRow).contains('No Info Company').should('be.visible').click();
      cy.get(".header-checkbox-container [type='checkbox']").eq(0).check({ force: true });
      cy.contains("button p", "Send Alert").click();
      cy.get('[label="Message Type"] [placeholder="Select"]').click();
      cy.get('[role="button"]').contains("Alert").click();
      cy.get("textarea").type(Math.random().toString(36).substring(2, 12));
      cy.get("button p").contains("Cancel").click();
      cy.get("p").contains("View Alerts History").should("not.exist");
    });

    it("Enforces maximum character limit for General Communication messages", () => {
      cy.get(workforceSelector.searchInput).clear().type('No Info Company')
      cy.get(workforceSelector.tableRow).contains('No Info Company').should('be.visible').click();


          cy.get(".header-checkbox-container [type='checkbox']")
            .first()
            .check({ force: true });
  
          cy.contains("button p", "Send Alert").click();
  
          cy.get('[label="Message Type"] [placeholder="Select"]').click();
          cy.contains("General Communication").click();
  
          cy.get('.sc-grmefH > .fOBBgu')
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
        }
      );
    }
  );


  it("Modifying and Saving an Existing Alert Template", () => {
    cy.get(workforceSelector.searchInput).clear().type('No Info Company')
      cy.get(workforceSelector.tableRow).contains('No Info Company').should("be.visible");

      cy.get(".header-checkbox-container [type='checkbox']").eq(0).check({ force: true });
      cy.contains("button p", "Send Alert").click();
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



    it("Sending a General Communication Message and verifying Remaining Alerts & Twilio SMS", () => {
      const randomText = Math.random().toString(36).substring(2, 12);
    
      cy.get(workforceSelector.searchInput).clear().type('AutoQA Labs')
      cy.get(workforceSelector.tableRow).contains('AutoQA Labs').should("be.visible").click();
    
            cy.get(".header-checkbox-container [type='checkbox']").eq(0).check({ force: true });
            cy.contains("button p", "Send Alert").click();
            
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
            cy.get('.sc-gJdVPJ').should("contain.text", "Alert was successfully sent!");
            cy.get('body').click(0, 0);

  
  
            cy.get(".header-checkbox-container [type='checkbox']").eq(0).check({ force: true });
            cy.contains("button p", "Send Alert").click();
            cy.wait(1000)
  
            cy.get("footer .sc-dhKdcB")
              .invoke("text")
              .then((updatedText) => {
                const updatedMatch = updatedText.match(/Remaining Alerts:\s*(\d+)\/\d+/);
                if (!updatedMatch) throw new Error(`Could not parse Remaining Alerts after sending alert: "${updatedText}"`);
                const remainingAfter = parseInt(updatedMatch[1], 10);
                expect(remainingAfter).to.eq(remainingBefore - 1);
              });
    
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

    it("Sending an Alert Message with Special Characters", () => {
        cy.get(workforceSelector.searchInput).clear().type('AutoQA Labs');
        cy.get(workforceSelector.tableRow).contains('AutoQA Labs').should("be.visible");
        cy.get(".header-checkbox-container [type='checkbox']").eq(0).check({ force: true });
        cy.contains("button p", "Send Alert").click();
        cy.get('[label="Message Type"] [placeholder="Select"]').click();
        cy.get('[role="button"]').contains("Alert").click();
        const specialCharMessage = "!@#$%^&*()_+{}|:\"<>?-=[]\\;',./`~";
        cy.get("textarea").type(specialCharMessage);
        workforceSelector.sendAlert().click();
      cy.get('.sc-gJdVPJ').should("contain.text", "Alert was successfully sent!");
    });

    it('Validating sending alert without selecting a company', ()=>{
      cy.contains('button p', 'Send Alert').click();
      cy.get('#toasts').should('contain.text', 'To use this and more actions, please select companies by pressing checkboxes.');
    })


  });