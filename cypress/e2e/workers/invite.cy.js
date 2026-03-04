/// <reference types="cypress" />
import { workforceSelector } from "../../support/workforceSelector";
import workerHelper from '../../support/helper/workerHelper.js';
import { generateWorkerData } from '../../fixtures/workerData.js';

describe(
  "Worker Onboarding Email Validation",
  { tags: ["Epic:WorkForce", "Feature:OnboardingInvite", "Module:Workforce-Worker"] },
  () => {
    let authHeaders = {};
    let authCaptured = false;

    beforeEach(() => {
      if (!authCaptured) {
        cy.intercept('GET', '/api/projectConfigs', (req) => {
          authHeaders = {
            'x-auth-token': req.headers['x-auth-token'],
            'x-auth-project': req.headers['x-auth-project']
          };
        }).as('getConfig');
      }

      cy.loginAndVisit(() => workerHelper.visitWorkersPage());

      if (!authCaptured) {
        cy.wait('@getConfig').then(() => {
          authCaptured = true;
        });
      }

      cy.cleanUI();
    });

    it(
      "Send Onboarding Invite - No Worker Selected",
      { tags: ["Story:Onboarding Invite No Worker Selected Shows Toast", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.get('.personal-info-content__title').should('be.visible');

        cy.contains("button p", "Send Onboarding Invite").click();
        cy.get(workforceSelector.toastMessage).contains("To use this and more actions, please select workers by pressing checkboxes.").should('be.visible');
      }
    );

    it(
      'Send onboarding invite and verify email delivery and content',
      { tags: ["Story:Onboarding Invite Email Delivery And Content", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.readFile('cypress/fixtures/createdWorker.json').then((workerData) => {
          const { firstName, lastName } = workerData;
          const fullName = `${firstName} ${lastName}`;

          cy.get(workforceSelector.searchInput).clear().type(fullName);
          cy.get(workforceSelector.tableRow).first().should('be.visible');
          cy.get('.personal-info-content__title').contains(fullName).should('be.visible');
          workforceSelector.selectAllCheckbox().check({ force: true });

          cy.contains("button p", "Send Onboarding Invite").click();
          cy.log('📧 Checking email...');
          cy.wait(30000);

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
            // expect(body).to.include('badge');
            // expect(body).to.include(firstName.toLowerCase());
            cy.log(firstName);
          });
        });
      }
    );

    it(
      'Send Onboarding Invite - Maximum Workers',
      { tags: ["Story:Onboarding Invite Maximum Workers", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.readFile('cypress/fixtures/createdWorker.json').then((workerData) => {
          const { firstName, lastName } = workerData;
          const fullName = `${lastName}`;

          cy.get(workforceSelector.searchInput).clear().type(fullName);
          cy.get(workforceSelector.tableRow).contains(fullName).should('be.visible');
          workforceSelector.selectAllCheckbox().check({ force: true });
          cy.get('.personal-info-content__title').contains(fullName).should('be.visible');

          cy.contains("button p", "Send Onboarding Invite").click();
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
          });
        });
      }
    );

    it(
      'Send onboarding invite, verify email delivery, and accept the invitation link',
      { tags: ["Story:Onboarding Invite Accept Invitation Link", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.get('.personal-info-content__title').should('be.visible');

        cy.readFile('cypress/fixtures/createdWorker.json').then((workerData) => {
          const { firstName, lastName } = workerData;
          const fullName = `${firstName} ${lastName}`;

          cy.get(workforceSelector.searchInput).clear().type(fullName);
          cy.get('.personal-info-content__title').contains(fullName).should('be.visible');

          cy.get('.header-checkbox-container [type="checkbox"]').eq(0).check({ force: true });

          cy.contains("button p", "Send Onboarding Invite").click();
          cy.log('📧 Checking email...');
          cy.wait(5000);

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

            onboardingLink = onboardingLink
              .replace(/=3D/g, '=')
              .replace(/["'>]/g, '')
              .replace(/\s/g, '')
              .trim();

            cy.log(`🔗 Invitation link: ${onboardingLink}`);

            cy.visit(onboardingLink);
            cy.contains('button', 'Accept Work Invite')
              .scrollIntoView()
              .should('be.visible')
              .click();

            cy.get('.onboarding-title').contains('What is your contact number?').should('be.visible');
            cy.log('🎉 Worker successfully accepted the onboarding invitation!');
          });
        });
      }
    );

    it(
      "Send onboarding invite - Worker with no email",
      { tags: ["Story:Onboarding Invite Worker Without Email Shows Error", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.reload();

        const workerData = generateWorkerData({});
        cy.log(workerData);

        cy.request({
          method: 'POST',
          url: '/api/worker/save',
          headers: authHeaders,
          body: workerData
        });

        cy.wait(3000);

        const { firstName, lastName } = workerData;

        cy.get(workforceSelector.searchInput).clear().type(`${firstName} ${lastName}`);
        cy.wait(2000);

        cy.get('.header-checkbox-container [type="checkbox"]').eq(0).check({ force: true });

        cy.contains("button p", "Send Onboarding Invite").click();

        cy.get(workforceSelector.toastMessage)
          .contains("No email or phone added for the worker")
          .should("be.visible");
      }
    );

    it(
      'Verify that the status of onboarding is SENT on the worker page.',
      { tags: ["Story:Onboarding Invite Status Shows Sent", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.get('.personal-info-content__title').should('be.visible');

        cy.readFile('cypress/fixtures/createdWorker.json').then((workerData) => {
          const { firstName, lastName } = workerData;
          const fullName = `${firstName} ${lastName}`;

          cy.get(workforceSelector.searchInput).clear().type(fullName);
          cy.get('.personal-info-content__title').contains(fullName).should('be.visible');

          cy.contains("button p", "Send Onboarding Invite").click();
          cy.get('.small__label').contains('Sent').scrollIntoView().should('be.visible');
        });
      }
    );

  }
);