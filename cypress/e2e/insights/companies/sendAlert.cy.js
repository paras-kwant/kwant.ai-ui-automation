/// <reference types="cypress" />
import { searchPage } from "../../../pages/insights/companies/search";
import companiesHelper from "../../../support/helper/companiesHelper";
import { workforceSelector } from "../../../support/workforceSelector";

describe("Insight-Company Module - Send Alert Functionality", { tags: ["Epic:WorkForce", "Feature:Search", "Module:Insight-Company"] }, () => {

  beforeEach(() => {
    cy.intercept("POST", "/api/insight/company/table*").as("companiesApi");
    cy.intercept('GET', '**/api/projectConfigs**').as('getConfig');

    cy.loginAndVisit(() => companiesHelper.visitCompaniesInsightPage('5007477836'));

    cy.wait('@getConfig').then(({ request }) => {
      cy.wrap({
        'x-auth-token': request.headers['x-auth-token'],
        'x-auth-project': Number(request.headers['x-auth-project'])
      }).as('authHeaders');
    });
  });

  it(
    "Insight-Company - Send General Communication and Verify Remaining Alerts & Twilio SMS",
    { tags: ["Story:Send General Communication", "Severity:critical", "UI"] },
    () => {
      const randomText = Math.random().toString(36).substring(2, 12);

      cy.get(workforceSelector.tableRow).should('have.length.greaterThan', 1);
      cy.get(workforceSelector.tableRow).eq(1).as('selectedRow');

      cy.get('@selectedRow').find('input[type="checkbox"]').check({ force: true });

      cy.get('@selectedRow').find('.personal-info-content__title').invoke('text').then((text) => {
        const companyName = text.trim();

        cy.get('.personal-info-content__title')
          .contains(companyName)
          .should('be.visible');

        cy.intercept('GET', '**/projectTaskTrade/detail/*').as('getDetail');
        cy.get('button').contains('Full Profile').click();

        cy.wait('@getDetail').then((interception) => {
          const companyId = interception.request.url.split('/').pop();

          cy.get('@authHeaders').then((authHeaders) => {
            cy.request({
              method: 'GET',
              url: `https://uat.kwant.ai/api/projectTaskTrade/detail/${companyId}`,
              headers: authHeaders,
              failOnStatusCode: false,
            }).then((getResponse) => {
              expect(getResponse.status).to.eq(200);
              const company = getResponse.body;

              cy.request({
                method: 'PUT',
                url: 'https://uat.kwant.ai/api/projectTaskTrades',
                headers: { ...authHeaders, 'Content-Type': 'application/json' },
                body: {
                  id: company.id,
                  projectId: company.projectId,
                  name: company.name,
                  email: company.email,
                  phone: Cypress.env('TWILIO_NUMBER'),
                },
                failOnStatusCode: false,
              }).then((putResponse) => {
                expect(putResponse.status).to.eq(200);
              });

              cy.get('body').click('topLeft');
              cy.get('@selectedRow').find('input[type="checkbox"]').check({ force: true });
              cy.contains('button p', 'Send Alert').click();
              cy.get('[label="Message Type"] [placeholder="Select"]').click();
              cy.contains('General Communication').click();
              cy.get('textarea').type(randomText);

              cy.get('footer p').eq(0).invoke('text').then((text) => {
                const match = text.match(/Remaining Alerts:\s*(\d+)\/\d+/);
                if (!match) throw new Error(`Could not parse Remaining Alerts from text: "${text}"`);
                const remainingBefore = parseInt(match[1], 10);

                cy.get(workforceSelector.confirmSendAlertButton).click();
                cy.get('h4').should('contain.text', 'Alert was successfully sent!');
                cy.get('body').click('topLeft');
                cy.get('@selectedRow').find('input[type="checkbox"]').check({ force: true });

                cy.contains('button p', 'Send Alert').click();
                cy.wait(1000);

                cy.get('footer p').eq(0).invoke('text').then((updatedText) => {
                  const updatedMatch = updatedText.match(/Remaining Alerts:\s*(\d+)\/\d+/);
                  if (!updatedMatch) throw new Error(`Could not parse Remaining Alerts after sending: "${updatedText}"`);
                  const remainingAfter = parseInt(updatedMatch[1], 10);
                  expect(remainingAfter).to.eq(remainingBefore - 1);
                });

                const twilioNumber = Cypress.env('TWILIO_NUMBER');
                const accountSid = Cypress.env('TWILIO_ACCOUNT_SID');
                const authToken = Cypress.env('TWILIO_AUTH_TOKEN');
                const expectedFrom = Cypress.env('EXPECTED_FROM');

                const pollTwilio = (retries = 5) => {
                  return new Cypress.Promise((resolve, reject) => {
                    const check = (remaining) => {
                      cy.request({
                        method: 'GET',
                        url: `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
                        auth: { user: accountSid, pass: authToken },
                        qs: { To: twilioNumber, PageSize: 20 },
                        failOnStatusCode: false,
                      }).then((res) => {
                        if (res.status === 200 && res.body.messages.length > 0) {
                          const msg = res.body.messages.find(
                            (m) => m.from === expectedFrom && m.direction === 'inbound' && m.body.includes(randomText)
                          );
                          if (msg) { resolve(msg); return; }
                        }
                        if (remaining === 0) {
                          reject('Incoming SMS not found in Twilio logs after retries');
                        } else {
                          setTimeout(() => check(remaining - 1), 3000);
                        }
                      });
                    };
                    check(retries);
                  });
                };

                cy.wait(5000);
                pollTwilio().then((latestSMS) => {
                  expect(latestSMS).to.exist;
                  expect(latestSMS.body).to.include(randomText);
                  expect(latestSMS.from).to.eq(expectedFrom);
                  expect(latestSMS.to).to.eq(twilioNumber);
                  expect(latestSMS.direction).to.eq('inbound');
                });
              });
            });
          });
        });
      });
    }
  );

  it(
    "Insight-Company - Enforces maximum character limit for General Communication messages",
    { tags: ["Story:Max Character Limit General Communication", "Severity:critical", "UI", "Module:WorkForce-Company"] },
    () => {
      cy.get(workforceSelector.tableRow).should('have.length.greaterThan', 1);
      cy.get(workforceSelector.tableRow).eq(1).find('input[type="checkbox"]').check({ force: true });

      cy.contains('button p', 'Send Alert').click();
      cy.get('[label="Message Type"] [placeholder="Select"]').click();
      cy.contains('General Communication').click();

      cy.get('textarea[placeholder="Type message here..."]')
        .parent()
        .parent()
        .find('p')
        .contains('/')
        .invoke('text')
        .then((text) => {
          const maxLength = Number(text.split('/')[1]);
          const overLimitMessage = 'A'.repeat(maxLength + 10);
          cy.get('textarea').clear().type(overLimitMessage).invoke('val').should('have.length', maxLength);
        });
    }
  );

  it(
    "Insight-Company - Modify and Save Existing Alert Template Successfully",
    { tags: ["Story:Modify and Save Alert Template", "Severity:normal", "UI"] },
    () => {
      cy.get(workforceSelector.tableRow).should('have.length.greaterThan', 1);
      cy.get(workforceSelector.tableRow).eq(1).find('input[type="checkbox"]').check({ force: true });

      cy.contains('button p', 'Send Alert').click();
      cy.get('[label="Message Type"] [placeholder="Select"]').click();
      cy.get('[role="button"]').contains('Alert').click();
      cy.get('[placeholder="Select Template"]').click();
      cy.get('.select_item_container [role="button"]').eq(0).click();
      cy.get('[placeholder="Select Template"]').invoke('val').then((text) => {
        cy.get('#save-as-template').check();
        cy.get('[placeholder="Add Template Name"]').type(text);
        cy.get('button p').contains('Save').click();
        cy.get('p').contains('Do you want to overwrite the template name').should('be.visible');
        cy.get('button p').contains('Confirm').click();
        cy.get('button p').contains('Saved').should('be.visible');
      });
    }
  );

  it(
    "Insight-Company - Send Alert With Special Characters (Valid Company)",
    { tags: ["Story:Alert With Special Characters", "Severity:normal", "UI"] },
    () => {
      const specialCharMessage = "!@#$%^&*()_+{}|:\"<>?-=[]\\;',./`~";
      cy.intercept('GET', '**/projectTaskTrade/detail/*').as('getDetail');

      cy.get(workforceSelector.tableRow).should('have.length.greaterThan', 1);
      cy.get(workforceSelector.tableRow).eq(1).as('selectedRow');

      cy.get('@selectedRow').find('input[type="checkbox"]').check({ force: true });

      cy.get('@selectedRow').find('.personal-info-content__title').invoke('text').then((text) => {
        const companyName = text.trim();

        cy.get('.personal-info-content__title')
          .contains(companyName)
          .should('be.visible');

        cy.get('button').contains('Full Profile').click();

        cy.wait('@getDetail').then((interception) => {
          const companyId = interception.request.url.split('/').pop();

          cy.get('@authHeaders').then((authHeaders) => {
            cy.request({
              method: 'GET',
              url: `https://uat.kwant.ai/api/projectTaskTrade/detail/${companyId}`,
              headers: authHeaders,
              failOnStatusCode: false,
            }).then(({ body: company }) => {
              cy.request({
                method: 'PUT',
                url: 'https://uat.kwant.ai/api/projectTaskTrades',
                headers: { ...authHeaders, 'Content-Type': 'application/json' },
                body: {
                  id: company.id,
                  projectId: company.projectId,
                  name: company.name,
                  email: company.email,
                  phone: Cypress.env('TWILIO_NUMBER'),
                },
                failOnStatusCode: false,
              }).then((putResponse) => {
                expect(putResponse.status).to.eq(200);
                cy.get('body').click('topLeft');
                cy.get('@selectedRow').find('input[type="checkbox"]').check({ force: true });

                cy.contains('button p', 'Send Alert').click();
                cy.get('[label="Message Type"] [placeholder="Select"]').click();
                cy.contains('General Communication').click();
                cy.get('textarea').type(specialCharMessage);
                cy.get(workforceSelector.confirmSendAlertButton).click();
                cy.get('h4').should('contain.text', 'Alert was successfully sent!');
              });
            });
          });
        });
      });
    }
  );

  it(
    "Insight-Company - Send Alert Button Should Not Be Visible When No Company Selected",
    { tags: ["Story:Send Alert Button Visibility", "Severity:normal", "UI"] },
    () => {
      cy.get('button').contains('Send Alert').should('not.exist');
    }
  );

  it(
    "Insight-Company - Send Alert should Fails When Company Has No Phone",
    { tags: ["Story:Alert With Special Characters - Missing Phone", "Severity:normal", "UI"] },
    () => {
      const specialCharMessage = "!@#$%^&*()_+{}|:\"<>?-=[]\\;',./`~";
      cy.intercept('GET', '**/projectTaskTrade/detail/*').as('getDetail');

      cy.get(workforceSelector.tableRow).should('have.length.greaterThan', 1);
      cy.get(workforceSelector.tableRow).eq(1).as('selectedRow');

      cy.get('@selectedRow').find('input[type="checkbox"]').check({ force: true });

      cy.get('@selectedRow').find('.personal-info-content__title').invoke('text').then((text) => {
        const companyName = text.trim();

        cy.get('.personal-info-content__title')
          .contains(companyName)
          .should('be.visible');

        cy.get('button').contains('Full Profile').click();

        cy.wait('@getDetail').then((interception) => {
          const companyId = interception.request.url.split('/').pop();

          cy.get('@authHeaders').then((authHeaders) => {
            cy.request({
              method: 'GET',
              url: `https://uat.kwant.ai/api/projectTaskTrade/detail/${companyId}`,
              headers: authHeaders,
              failOnStatusCode: false,
            }).then(({ body: company }) => {
              cy.request({
                method: 'PUT',
                url: 'https://uat.kwant.ai/api/projectTaskTrades',
                headers: { ...authHeaders, 'Content-Type': 'application/json' },
                body: {
                  id: company.id,
                  projectId: company.projectId,
                  name: company.name,
                  email: null,
                  phone: null,
                },
                failOnStatusCode: false,
              }).then((putResponse) => {
                expect(putResponse.status).to.eq(200);
                cy.get('body').click('topLeft');
                cy.get('@selectedRow').find('input[type="checkbox"]').check({ force: true });

                cy.contains('button p', 'Send Alert').click();
                cy.get('[label="Message Type"] [placeholder="Select"]').click();
                cy.get('[role="button"]').contains('Alert').click();
                cy.get('textarea').type(specialCharMessage);
                cy.get(workforceSelector.confirmSendAlertButton).click();
                cy.get(workforceSelector.toastMessage).contains('None of the selected company(s) have phone number added.');
              });
            });
          });
        });
      });
    }
  );

  it(
    "Insight-Company - Cancelling Alert Resets Fields and Closes Modal",
    { tags: ["Story:Cancel Alert Reset Fields", "Severity:normal", "UI"] },
    () => {
      const randomText = Math.random().toString(36).substring(2, 12);

      cy.get(workforceSelector.tableRow).should('have.length.greaterThan', 1);
      cy.get(workforceSelector.tableRow).eq(1).find('input[type="checkbox"]').check({ force: true });

      cy.get('button').contains('Send Alert').click();
      cy.get('h1').contains('Send Alert').should('be.visible');
      cy.get('[label="Message Type"] [placeholder="Select"]').click();
      cy.contains('General Communication').click();
      cy.get('textarea[placeholder="Type message here..."]').type(randomText);
      cy.get('button p').contains('Cancel').click();

      cy.get('body').then(($body) => {
        if ($body.find("h1:contains('Send Alert')").length > 0) {
          throw new Error('Send Alert modal is still visible after clicking Cancel!');
        }
      });

      cy.get('button').contains('Send Alert').click();
      cy.get('section h1').contains('Send Alert').should('be.visible');
      cy.get('[label="Message Type"] [placeholder="Select"]').click();
      cy.contains('General Communication').click();
      cy.get('textarea[placeholder="Type message here..."]').should('have.value', '');
    }
  );

});