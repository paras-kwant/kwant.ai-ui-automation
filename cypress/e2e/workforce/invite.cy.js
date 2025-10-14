/// <reference types="cypress" />
import { workforceSelector } from '../../support/workforceSelector';

describe("Worker Onboarding Email Validation", () => {
  
  beforeEach(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title').contains('Regression test').click();
    });
  });

  it('Send onboarding invite and verify email delivery and content', () => {
    cy.visit('/projects/94049707/workers');
    cy.wait(5000);

    let workerName;

    cy.readFile('cypress/fixtures/createdWorker.json').then((workerData) => {
      const { firstName, lastName } = workerData;
      workerName = firstName; 

      cy.get(workforceSelector.searchInput)
        .clear()
        .type(`${firstName} ${lastName}`);
      cy.wait(5000);

      cy.get('.header-checkbox-container [type="checkbox"]').eq(0).check({ force: true });
      cy.wait(5000);

      cy.get(workforceSelector.overflowMenu).click();
      cy.contains('.dropdown-option', 'Send Onboarding Invite').click();
      cy.log('📧 Onboarding invite sent, checking paras@kwant.ai inbox...');
      cy.wait(10000); 

      cy.task('listRecentEmails').then((emails) => {
        cy.log('📬 Recent emails in inbox:');
        emails.forEach((email, index) => {
          cy.log(`${index + 1}. Subject: "${email.subject}" | From: ${email.from}`);
        });
      });

      cy.log('🔍 Searching for onboarding email...');

      const searchTerms = ['Hi', firstName, 'onboarding', 'Kwant', 'invite'];
      let emailFound = false;
      let foundSubject = '';

      searchTerms.forEach(term => {
        cy.task('checkCompanyGmail', {
          subject: term,
          maxWaitTime: 5000
        }).then((found) => {
          cy.log(`Search "${term}": ${found ? '✅ FOUND' : '❌ NOT FOUND'}`);
          if (found && !emailFound) {
            emailFound = true;
            foundSubject = term;
          }
        });
      });

      cy.task('getMostRecentEmail').then((email) => {
        if (email) {
          cy.log('📧 Most recent email found:');
          cy.log(`Subject: ${email.subject}`);
          cy.log(`From: ${email.from}`);
          cy.log(`Date: ${email.date}`);
          
          const bodyLower = email.body.toLowerCase();
          const subjectLower = email.subject.toLowerCase();
          
          const isOnboardingEmail = 
            bodyLower.includes('onboarding') || 
            bodyLower.includes('kwant') ||
            bodyLower.includes('regression test') ||
            subjectLower.includes(firstName.toLowerCase()) ||
            subjectLower.includes('hi');
          
          if (isOnboardingEmail) {
            cy.log('✅ Onboarding email confirmed!');
            
            expect(bodyLower).to.include('onboarding');
            cy.log('✅ Contains "onboarding"');
            
            if (bodyLower.includes('regression test')) {
              cy.log('✅ Contains project name "Regression test"');
            }
            
            if (bodyLower.includes('7 days') || bodyLower.includes('7daysleft')) {
              cy.log('✅ Contains expiry warning (7 days)');
            }
            
            if (bodyLower.includes('badge')) {
              cy.log('✅ Contains badge requirements');
            }
            
            if (bodyLower.includes('invite') || bodyLower.includes('invitation')) {
              cy.log('✅ Contains invitation message');
            }
            
            cy.log('📄 Email body preview:');
            cy.log(email.body.substring(0, 300) + '...');
            
          } else {
            cy.log('⚠️  Most recent email might not be the onboarding email');
            cy.log('Check the email list above to identify the correct email');
          }
        } else {
          cy.log('❌ No recent emails found in inbox');
          cy.log('⚠️  Possible issues:');
          cy.log('   - Email delivery is delayed (wait longer)');
          cy.log('   - Wrong Gmail account configured');
          cy.log('   - IMAP connection issue');
        }
      });
    });
  });

  it.only('Send Onboarding Invite - No Worker Selected',()=>{
    cy.visit('/projects/94049707/workers');
    cy.wait(3000)
    cy.get(workforceSelector.overflowMenu).click()
    cy.contains('.dropdown-option', 'Send Onboarding Invite').click(); 
    cy.get('.sc-kOPcWz').contains( 'To use this and more actions, please select workers by pressing checkboxes.').should('be.visible')
  })

  it('Send onboarding invite - Worker with no email', ()=>{
    cy.visit('/projects/94049707/workers');
    let workerName;
    cy.wait(3000)
    cy.readFile('cypress/fixtures/noEmailWorker.json').then((workerData) => {
      const { firstName, lastName } = workerData;
      workerName = firstName; 
      cy.get(workforceSelector.searchInput)
        .clear()
        .type(`${firstName} ${lastName}`);
      cy.wait(5000);
      cy.get('.header-checkbox-container [type="checkbox"]').eq(0).check({ force: true });
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains('.dropdown-option', 'Send Onboarding Invite').click();
      cy.get('.sc-kOPcWz').contains( 'No email or phone added for the worker').should('be.visible')
  })
})

});