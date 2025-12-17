/// <reference types="cypress" />
import { workforceSelector } from "../../support/workforceSelector";
import workerHelper from '../../support/helper/workerHelper.js';
import { generateWorkerData } from '../../fixtures/workerData.js';





describe("Worker Onboarding Email Validation", () => {
  before(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title')
        .contains(Cypress.env('PROJECT_NAME'))
        .click();
    });
    workerHelper.visitWorkersPage();
  })
  beforeEach(() => {
    cy.cleanUI()
  });
  it("Send Onboarding Invite - No Worker Selected", () => {
    cy.get('.personal-info-content__title').should('be.visible');
    cy.get(workforceSelector.overflowMenu).click();
    
    cy.contains(".dropdown-option", "Send Onboarding Invite").click();
    workforceSelector.toastMessage().contains("To use this and more actions, please select workers by pressing checkboxes.").should('be.visible')

  });

  it('Send onboarding invite and verify email delivery and content', () => {
    cy.readFile('cypress/fixtures/createdWorker.json').then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
    
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).first().should('be.visible');
      workforceSelector.selectAllCheckbox().check({ force: true });
      cy.get('.personal-info-content__title').contains(fullName).should('be.visible');  
    
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains('.dropdown-option', 'Send Onboarding Invite').click();
      cy.log('📧 Checking email...');
      cy.wait(10000)
    
      cy.task('getMostRecentEmail').then((email) => {
        if (!email) throw new Error('❌ NO EMAIL RECEIVED');
    
        const body = email.body.toLowerCase()
          .replace(/=\r\n/g, '')  
          .replace(/\r\n/g, ' ')  
          .replace(/\s+/g, ' ');
        
        const subject = email.subject.toLowerCase();
    
        cy.log(`📧 Email: ${email.subject}`);
        cy.log(email.body.substring(0, 300));
    
        expect(body || subject).to.include('onboarding');
        expect(body).to.include('lvl 10-11');
        expect(body).to.include('badge');
        expect(body).to.include(firstName.toLowerCase()); 
        cy.log(firstName)
      });
    });
  });


  it('Send Onboarding Invite - Maximum Workers', () => {
    cy.readFile('cypress/fixtures/createdWorker.json').then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${lastName}`;
    
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).first().should('be.visible');
      workforceSelector.selectAllCheckbox().check({ force: true });
      cy.get('.personal-info-content__title').contains(fullName).should('be.visible');  
    
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains('.dropdown-option', 'Send Onboarding Invite').click();
      cy.log('📧 Checking email...');
    
      cy.task('getMostRecentEmail').then((email) => {
        if (!email) throw new Error('❌ NO EMAIL RECEIVED');
    
        const body = email.body.toLowerCase()
          .replace(/=\r\n/g, '')  
          .replace(/\r\n/g, ' ')  
          .replace(/\s+/g, ' ');
        
        const subject = email.subject.toLowerCase();
    
        cy.log(`📧 Email: ${email.subject}`);
        cy.log(email.body.substring(0, 300));
    
        expect(body || subject).to.include('onboarding');
        expect(body).to.include('lvl 10-11');
        expect(body).to.include('badge');
        expect(body).to.include(firstName.toLowerCase()); 
        cy.log(firstName)
      });
    });
  });

  it('Send onboarding invite, verify email delivery, and accept the invitation link', () => {
    cy.get('.personal-info-content__title').should('be.visible');
    
    cy.readFile('cypress/fixtures/createdWorker.json').then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;

      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get('.personal-info-content__title').contains(fullName).should('be.visible');
    
      cy.get('.header-checkbox-container [type="checkbox"]').eq(0).check({ force: true });
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains('.dropdown-option', 'Send Onboarding Invite').click();
      cy.log('📧 Checking email...');
    
      cy.task('getMostRecentEmail').then((email) => {
        if (!email) throw new Error('❌ NO EMAIL RECEIVED');
    
        const body = email.body
          .replace(/=\r\n/g, '')
          .replace(/\r\n/g, ' ')
          .replace(/\s+/g, ' ');
  
        const lowerBody = body.toLowerCase();
        const subject = email.subject.toLowerCase();
    
        cy.log(`📧 Email: ${email.subject}`);
        cy.log(email.body.substring(0, 300));
  
        expect(lowerBody || subject).to.include('onboarding');
        expect(lowerBody).to.include(firstName.toLowerCase());
        expect(lowerBody).to.satisfy(b => b.includes('invite') || b.includes('invitation'));
        cy.log('✅ Email content validated!');
  
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const links = body.match(urlRegex);
  
        if (!links || links.length === 0) {
          throw new Error('❌ No link found in email body');
        }
  
        let onboardingLink = links.find(link =>
          link.includes('onboarding') || link.includes('accept')
        );
        
        if (!onboardingLink) {
          throw new Error('❌ No onboarding invitation link found');
        }
        
        // ✅ Clean the link properly
        onboardingLink = onboardingLink
          .replace(/=3D/g, '=')        
          .replace(/["'>]/g, '')       
          .replace(/\s/g, '')          
          .trim();
        
  
        cy.log(`🔗 Invitation link: ${onboardingLink}`);

        cy.visit(onboardingLink);
        cy.contains('button', 'Accept Work Invite')
        .scrollIntoView()       // 👈 scrolls down until the button is visible
        .should('be.visible')   // ensures it's actually visible
        .click();               // then clicks it
      
        cy.get('.onboarding-title').contains('What is your contact number?').should('be.visible')

        cy.log('🎉 Worker successfully accepted the onboarding invitation!');
      });
    });
  });
  



  it("Send onboarding invite - Worker with no email", () => {
    cy.wait(2000)
    let workerName;
    cy.wait(3000);
    cy.readFile("cypress/fixtures/noEmailWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      workerName = firstName;
      cy.get(workforceSelector.searchInput)
        .clear()
        .type(`${firstName} ${lastName}`);
      cy.wait(5000);
      cy.get('.header-checkbox-container [type="checkbox"]')
        .eq(0)
        .check({ force: true });
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains(".dropdown-option", "Send Onboarding Invite").click();
      cy.get(".sc-kOPcWz")
        .contains("No email or phone added for the worker")
        .should("be.visible");
    });
  });

  it("Sending Alert to Worker with Missing Contact Information", () => {
    cy.get(workforceSelector.tableRow).first().should('be.visible');

    cy.readFile("cypress/fixtures/noEmailWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.wait(2000);

      cy.get('.header-checkbox-container [type="checkbox"]')
        .eq(0)
        .check({ force: true });
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

  it("Sending a General Communication Message", () => {
    cy.get(workforceSelector.tableRow).first().should('be.visible');

    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.wait(2000);

      cy.get('.header-checkbox-container [type="checkbox"]')
        .eq(0)
        .check({ force: true });
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains(".dropdown-option", "Send Alert").click();
      cy.get('[label="Message Type"] [placeholder="Select"]').click();
      cy.contains("General Communication").click();
      cy.get("textarea").type(Math.random().toString(36).substring(2, 12));
      workforceSelector.sendAlert().click();
      workforceSelector
        .toastMessage()
        .should("contain.text", "Alert sent to 1 worker(s).");
    });
  });

  it("Send a Alert Message", () => {
    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).first().should('be.visible');

      cy.get('.header-checkbox-container [type="checkbox"]')
        .eq(0)
        .check({ force: true });
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains(".dropdown-option", "Send Alert").click();
      cy.get('[label="Message Type"] [placeholder="Select"]').click();
      cy.get('[role="button"]').contains("Alert").click();
      cy.get("textarea").type(Math.random().toString(36).substring(2, 12));
      workforceSelector.sendAlert().click();
      workforceSelector
        .toastMessage()
        .should("contain.text", "Alert sent to 1 worker(s).");
    });
  });

  it("Cancelling the Alert Sending Process", () => {
    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.wait(2000);
      cy.get('.header-checkbox-container [type="checkbox"]')
        .eq(0)
        .check({ force: true });
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains(".dropdown-option", "Send Alert").click();
      cy.get('[label="Message Type"] [placeholder="Select"]').click();
      cy.get('[role="button"]').contains("Alert").click();
      cy.get("textarea").type(Math.random().toString(36).substring(2, 12));
      cy.get("button p").contains("Cancel").click();
      cy.get("p").contains("View Alerts History").should("not.exist");
    });
  });

  // it.only("Sending Alert Message when no worker are on site", () => {
  //   cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);
  //   cy.get(workforceSelector.overflowMenu).click();
  //   cy.contains(".dropdown-option", "Send Alert").click();
  //   cy.get('[label="Message Type"] [placeholder="Select"]').click();
  //   cy.contains("General Communication").click();
  //   cy.get("textarea").type(Math.random().toString(36).substring(2, 12));
  //   workforceSelector.sendAlert().click();
  //   workforceSelector
  //     .toastMessage()
  //     .should("contain.text", "No worker(s) onsite today.");
  // });

  it("Verify the  View Alerts History on Send Alert flow", () => {
    cy.get(workforceSelector.tableRow).first().should('be.visible');

    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
      const alertMessage = Math.random().toString(36).substring(2, 12);

      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.wait(2000);
      cy.get('.header-checkbox-container [type="checkbox"]')
        .eq(0)
        .check({ force: true });
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains(".dropdown-option", "Send Alert").click();
      cy.get('[label="Message Type"] [placeholder="Select"]').click();
      cy.contains("General Communication").click();
      cy.get("textarea").type(alertMessage);
      workforceSelector.sendAlert().click();
      workforceSelector
        .toastMessage()
        .should("contain.text", "Alert sent to 1 worker(s).");

      cy.get("button p").contains("View Alerts History").click();
      workforceSelector
        .toastMessage()
        .contains("Alert report downloaded successfully.")
        .should("be.visible");
      cy.wait(3000);

      cy.task("getLatestDownloadedFile", {
        downloadsFolder: "cypress/downloads",
        prefix: "Alert-History-Report",
      }).then((filename) => {
        cy.readFile(`cypress/downloads/${filename}`, "utf8").then(
          (csvContent) => {
            const headers = csvContent.split("\n")[0];

            expect(headers).to.include('"S.No."');
            expect(headers).to.include('"Date"');
            expect(headers).to.include('"Message Text"');
            expect(headers).to.include('"Sent By"');
            expect(headers).to.include('"No. of Messages Sent"');
          }
        );

        cy.task("deleteFile", { filePath: `cypress/downloads/${filename}` });
      });
    });
  });

  it("Sending an Empty General Communication Message", () => {
    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;

      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.wait(2000);
      cy.get('.header-checkbox-container [type="checkbox"]')
        .eq(0)
        .check({ force: true });
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains(".dropdown-option", "Send Alert").click();
      cy.get('[label="Message Type"] [placeholder="Select"]').click();
      cy.contains("General Communication").click();
      workforceSelector.sendAlert().click();
      cy.get("p")
        .should("contain.text", "Please, fill the alert message input")
        .should("be.visible");
    });
  });

  it("Sending an Alert Message with Template", () => {
    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
      cy.get(workforceSelector.searchInput).clear().type(fullName);
     cy.get(workforceSelector.tableRow).first().should('be.visible');
      cy.get('.header-checkbox-container [type="checkbox"]')
        .eq(0)
        .check({ force: true });
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains(".dropdown-option", "Send Alert").click();
      cy.get('[label="Message Type"] [placeholder="Select"]').click();
      cy.get('[role="button"]').contains("Alert").click();
      cy.get('[placeholder="Select Template"]').click();
      cy.get(".sc-kdBSHD > :nth-child(2)").click();
      cy.get("textarea").invoke("val").should("have.length.greaterThan", 0);
      workforceSelector.sendAlert().click();
      workforceSelector
        .toastMessage()
        .should("contain.text", "Alert sent to 1 worker(s).");
    });
  });


  it("Sending an Alert Message with Special Characters",()=>{
    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).first().should('be.visible');
      cy.get('.header-checkbox-container [type="checkbox"]')
        .eq(0)
        .check({ force: true });
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains(".dropdown-option", "Send Alert").click();
      cy.get('[label="Message Type"] [placeholder="Select"]').click();
      cy.get('[role="button"]').contains("Alert").click();
      const specialCharMessage = "!@#$%^&*()_+{}|:\"<>?-=[]\\;',./`~";
      cy.get("textarea").type(specialCharMessage);
      workforceSelector.sendAlert().click();
      workforceSelector
        .toastMessage()
        .should("contain.text", "Alert sent to 1 worker(s).");
    });
  })


  it("Modifying and Sending an Alert Message with Template", () => {
    cy.readFile("cypress/fixtures/createdWorker.json").then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).first().should('be.visible');

      cy.get('.header-checkbox-container [type="checkbox"]')
        .eq(0)
        .check({ force: true });
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains(".dropdown-option", "Send Alert").click();
      cy.get('[label="Message Type"] [placeholder="Select"]').click();
      cy.get('[role="button"]').contains("Alert").click();
      cy.get('[placeholder="Select Template"]').click();
      cy.get(".sc-kdBSHD > :nth-child(2)").click();
      cy.get('[placeholder="Select Template"]')
        .invoke("val")
        .then((text) => {
          cy.log("Text is:", text);
          cy.get("#save-as-template").check();
          cy.get('[placeholder="Add Template Name"]').type(text);
          cy.get("button p").contains("Save").click();
          cy.get("p")
            .contains("Do you want to overwrite the template name")
            .should("be.visible");
          cy.get("button p").contains("Confirm").click();
          cy.get("button p").contains("Saved").should("be.visible");
        });
    });
  });

  it('Verify that the status of onboarding is SENT on the worker page.',()=>{
    cy.get('.personal-info-content__title').should('be.visible');
    cy.readFile('cypress/fixtures/createdWorker.json').then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
  
      // Search worker and send onboarding invite
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get('.personal-info-content__title').contains(fullName).should('be.visible');
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains('.dropdown-option', 'Send Onboarding Invite').click();
      cy.get('.small__label').contains('Sent').scrollIntoView().should('be.visible');

  })
  })
})