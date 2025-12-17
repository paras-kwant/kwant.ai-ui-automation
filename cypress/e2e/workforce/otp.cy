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
  });

  beforeEach(() => {
    cy.cleanUI();
  });

  it.only('Send onboarding invite, verify email, accept invite, and complete onboarding', () => {
    cy.get('.personal-info-content__title').should('be.visible');

    // Read worker data
    cy.readFile('cypress/fixtures/createdWorker.json').then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;

      // Search worker and send onboarding invite
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get('.personal-info-content__title').contains(fullName).should('be.visible');

      cy.get('.header-checkbox-container [type="checkbox"]').eq(0).check({ force: true });
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains('.dropdown-option', 'Send Onboarding Invite').click();
      cy.log('📧 Checking email...');

      // Get most recent email
      cy.task('getMostRecentEmail').then((email) => {
        if (!email) throw new Error('❌ NO EMAIL RECEIVED');

        const body = email.body.replace(/=\r\n/g, '').replace(/\r\n/g, ' ').replace(/\s+/g, ' ');
        const lowerBody = body.toLowerCase();
        const subject = email.subject.toLowerCase();

        expect(lowerBody || subject).to.include('onboarding');
        expect(lowerBody).to.include(firstName.toLowerCase());
        expect(lowerBody).to.satisfy(b => b.includes('invite') || b.includes('invitation'));

        const urlRegex = /(https?:\/\/[^\s]+)/g;
        let links = body.match(urlRegex);
        if (!links || links.length === 0) throw new Error('❌ No link found in email body');

        let onboardingLink = links.find(link => link.includes('onboarding') || link.includes('accept'));
        if (!onboardingLink) throw new Error('❌ No onboarding invitation link found');

        onboardingLink = onboardingLink.replace(/=3D/g, '=').replace(/["'>]/g, '').replace(/\s/g, '').trim();
        cy.log(`🔗 Invitation link: ${onboardingLink}`);

        // Visit onboarding link
        cy.visit(onboardingLink);

        cy.contains('button', 'Accept Work Invite')
          .scrollIntoView()
          .should('be.visible')
          .click();

        cy.wait(1000);
        cy.get('input[placeholder="Enter Contact Number"]')
          .type('+18044659268')  // Use verified personal number
        cy.wait(1000);

        cy.contains('button', 'Continue').click();


        cy.task('getTwilioOtp', {
          accountSid: Cypress.env('TWILIO_ACCOUNT_SID'),
          authToken: Cypress.env('TWILIO_AUTH_TOKEN'),
          to: '+18044659268' // your test phone number
        }).then(otp => {
          cy.log(`✅ OTP fetched: ${otp}`);
          cy.get('input[name="otp"]').type(otp);
          cy.contains('button', 'Continue').click();
        });
        

        // Complete remaining onboarding steps
        cy.get('.profession p').contains('QA').click();
        cy.contains('button', 'Continue').click();
        cy.contains('button', 'Continue').click();
        cy.contains('button', 'Continue').click();

        cy.get('[name="address"]').type('Kathmandu');
        cy.get('[name="zipCode"]').type('08484');
        cy.contains('button', 'Continue').click();

        cy.get('button', 'Open Camera').click();
        cy.wait(2000);
        cy.get('button', 'Take Photo').click();
        cy.get('button', 'Done').click();
      });
    });
  });
});
