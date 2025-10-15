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
  
    cy.readFile('cypress/fixtures/createdWorker.json').then((workerData) => {
      const { firstName, lastName } = workerData;
      const fullName = `${firstName} ${lastName}`;
  
      // Search and select worker
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.wait(5000);
      cy.get('.header-checkbox-container [type="checkbox"]').eq(0).check({ force: true });
      cy.wait(5000);
  
      // Send invite
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains('.dropdown-option', 'Send Onboarding Invite').click();
      cy.log('📧 Checking email...');
  
      // Get most recent email
      cy.task('getMostRecentEmail').then((email) => {
        if (!email) throw new Error('❌ NO EMAIL RECEIVED');
  
        // Clean email body - remove line breaks and encoding artifacts
        const body = email.body.toLowerCase()
          .replace(/=\r\n/g, '')  // Remove quoted-printable line breaks
          .replace(/\r\n/g, ' ')  // Remove regular line breaks
          .replace(/\s+/g, ' ');  // Normalize spaces
        
        const subject = email.subject.toLowerCase();
  
        cy.log(`📧 Email: ${email.subject}`);
        cy.log(email.body.substring(0, 300));
  
        // Critical checks
        expect(body || subject).to.include('onboarding');
        expect(body).to.include('regression test');
        expect(body).to.include('badge');
        expect(body).to.satisfy(b => b.includes('invite') || b.includes('invitation'));
        
        if (!body.includes(firstName.toLowerCase())) throw new Error(`❌ Missing worker name "${firstName}"`);
  
        cy.log('✅ All validations passed!');
      });
    });
  });

  it('Send Onboarding Invite - No Worker Selected',()=>{
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