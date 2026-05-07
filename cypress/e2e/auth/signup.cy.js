import workerHelper from '../../support/helper/workerHelper'

describe('Sign Up', () => {

  before(() => {
    cy.loginAndVisit(() => workerHelper.visitWorkersPageForProject('94049707'));
  })

  it('should send invite and navigate to sign up page',{tags:"@smoke"}, () => {
    cy.on("uncaught:exception", () => false);

    cy.get('[data-testid="settings-button"]').click()
    cy.get('a p').contains('Team').click()
    cy.get('[label="Add Member"]').click()
    const randomEmail = `paras+${Date.now()}@kwant.ai`
cy.get('[placeholder="Enter Email to send invite"]').type(randomEmail)
    cy.get('[placeholder="Select Company Name"]').click()
    cy.get('[role="button"]').first().click()
    cy.get('[placeholder="Select Role"]').click()
    cy.get('[role="button"]').first().click()
    cy.get('[label="Send Invite"]').click()
    cy.wait(10000)

    cy.task("getMostRecentEmail").then((fullEmail) => {
      const bodyText = fullEmail.body || "";
      const urlMatch = bodyText.match(/https?:\/\/[^\s"<>\r\n]+/gi);
      const acceptUrl = urlMatch?.find((url) =>
        url.toLowerCase().includes("sign-up?key=")
      );

      if (!acceptUrl) throw new Error("❌ Accept Invite link not found");
      cy.log(`🔗 Accept URL: ${acceptUrl}`);

      // Store URL for other tests
      cy.wrap(acceptUrl).as('inviteUrl')
      Cypress.env('inviteUrl', acceptUrl)
    })
  })

  beforeEach(() => {
    cy.on("uncaught:exception", () => false);

    // Visit the stored invite URL before each test
    const url = Cypress.env('inviteUrl')
    if (url) {
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.visit(url)
      cy.url().should("include", "/sign-up")
      cy.get('[placeholder="Enter password"]').should("be.visible")
    }
  })

  const checkRule = (label, valid) => {
    cy.get('.icon-label').contains(label)
      .closest('.icon-label')
      .find('svg path')
      .should('have.attr', 'fill', valid ? '#2DA160' : '#F05252');
  };
  
  it('shows errors for both first and last name when left empty on submit', () => {
    cy.get('button p').contains('Create Account').click();
	cy.get('[type="error"]').contains('First name is required').should('be.visible');
	cy.get('[type="error"]').contains('Last name is required').should('be.visible');
  })

  it('shows last name required error when only last name is missing', () => {
    cy.get('[placeholder="Enter first name"]').clear().type('paras');
	cy.get('[placeholder="Enter last name"]').clear();
	cy.get('button p').contains('Create Account').click();
	cy.get('[type="error"]').contains('Last name is required').should('be.visible');

  })

  it('shows first name required error when only first name is missing', () => {
    cy.get('[placeholder="Enter first name"]').clear();
	cy.get('[placeholder="Enter last name"]').clear().type('auth test');
	cy.get('button p').contains('Create Account').click();
	cy.get('[type="error"]').contains('First name is required').should('be.visible');
  })


  it('shows password required error when password is left empty on submit', () => {
    cy.get('button p').contains('Create Account').click();
	cy.get('[type="error"]').contains('Password is required').should('be.visible');
  })
  it('toggles password visibility when the show/hide icon is clicked', () => {
    cy.get('[placeholder="Enter password"]').type("Abcdefg1!");
	cy.get('[placeholder="Enter password"]').should('have.attr', 'type', 'password');

	cy.get('[placeholder="Enter password"]').parent().find('[role="button"]').click()

	cy.get('[placeholder="Enter password"]').should('have.attr', 'type', 'text');
	cy.get('[placeholder="Enter password"]').parent().find('[role="button"]').click()
	cy.get('[placeholder="Enter password"]').should('have.attr', 'type', 'password');

  })
  it('marks uppercase, lowercase, and number rules as unmet when password contains only spaces', () => {
    cy.get('[placeholder="Enter password"]').clear().type('          '); 
		checkRule('8 characters', true);
		checkRule('One uppercase', false);
		checkRule('One lowercase', false);
		checkRule('One number', false);
		checkRule('One special case character', true);
  
	cy.get('button p').contains('Create Account').click();
  
	cy.get('[type="error"]')
	  .should('be.visible')
	  .and('contain', 'Password must meet the requirements'); 
  
  });



  it('marks 8 character rule as unmet when password is shorter than 8 characters', () => {
    cy.get('[placeholder="Enter password"]').clear().type("Ab1!");
    checkRule('8 characters', false);
    checkRule('One uppercase', true);
    checkRule('One lowercase', true);
    checkRule('One number', true);
    checkRule('One special case character', true);
  })

  it('marks uppercase rule as unmet when password has no uppercase letter', () => {
    cy.get('[placeholder="Enter password"]').clear().type("abcdefg1!");
    checkRule('8 characters', true);
    checkRule('One uppercase', false);
    checkRule('One lowercase', true);
    checkRule('One number', true);
    checkRule('One special case character', true);
  })

  it('marks lowercase rule as unmet when password has no lowercase letter', () => {
    cy.get('[placeholder="Enter password"]').clear().type("ABCDEFG1!");
    checkRule('8 characters', true);
    checkRule('One uppercase', true);
    checkRule('One lowercase', false);
    checkRule('One number', true);
    checkRule('One special case character', true);
  })

  it('marks number rule as unmet when password has no numeric digit', () => {
    cy.get('[placeholder="Enter password"]').clear().type("Abcdefgh!");
    checkRule('8 characters', true);
    checkRule('One uppercase', true);
    checkRule('One lowercase', true);
    checkRule('One number', false);
    checkRule('One special case character', true);
  })

  it('marks special character rule as unmet when password has no special character', () => {
    cy.get('[placeholder="Enter password"]').clear().type("Abcdefg1");
    checkRule('8 characters', true);
    checkRule('One uppercase', true);
    checkRule('One lowercase', true);
    checkRule('One number', true);
    checkRule('One special case character', false);
  })

  it('marks all password rules as met when password meets every requirement', () => {
    cy.get('[placeholder="Enter password"]').clear().type("Abcdefg1!");
    checkRule('8 characters', true);
    checkRule('One uppercase', true);
    checkRule('One lowercase', true);
    checkRule('One number', true);
    checkRule('One special case character', true);
  })


  
  it('returns 400 when password exceeds 100 characters', () => {
    cy.intercept('POST', '**/api/signup/register').as('registerRequest');
  
    cy.get('[placeholder="Enter first name"]').type('paras');
    cy.get('[placeholder="Enter last name"]').type('auth test');
    cy.get('[placeholder="Enter Phone"]').type('9868757379');
  
    const pwd = 'A'.repeat(98) + 'a1!';
    cy.get('[placeholder="Enter password"]').clear().type(pwd);
  
    cy.get('[name="agreeToTerms"]').check({ force: true });
    cy.get('[name="smsConsent"]').check({ force: true });
  
    cy.get('button p').contains('Create Account').click();
  
    cy.wait('@registerRequest')
      .its('response.statusCode')
      .should('eq', 400);
  });

})