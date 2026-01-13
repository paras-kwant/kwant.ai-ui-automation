/// <reference types="cypress" />
import { workforceSelector } from "../../support/workforceSelector";
import "cypress-real-events/support";
import workerHelper from '../../support/helper/workerHelper.js';


Cypress.Commands.add('closeUploadDownloadDrawerIfOpen', () => {
  cy.wait(1000)
  cy.get('body').then(($body) => {
    const $icon = $body.find('.sc-krNlru svg, aside button');

    if ($icon.length === 0) {
      cy.log('Drawer icon not found');
      return;
    }
    if (!$icon.is(':visible')) {
      cy.log('Drawer icon found but not visible');
      return;
    }
    cy.wrap($icon).click({ force: true });
  });
});

describe("Worker Module - Access Control Page Tests", () => {
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
    cy.cleanUI()
  });
  beforeEach(() => {
    cy.closeUploadDownloadDrawerIfOpen();
  });

  it("should display all main UI elements correctly", () => {

    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.AccessControl().click();

    cy.get("p").contains("Access Control").should("be.visible");

    const expectedLabels = ["Device", "Last Seen On", "Last Seen Time", "NFC"];
    expectedLabels.forEach((label) => {
      cy.get(".hover-hoc-container__label").contains(label).should("exist");
    });

    const expectedToggles = [
      "Motion Mode",
      "Flag",
      "Restricted",
      "Driving Permissions",
      "Camera Permissions",
    ];
    expectedToggles.forEach((toggle) => {
      cy.get(".toggle-label").contains(toggle).should("exist");
    });

    cy.get(".hover-hoc-container__input__display-value")
      .eq(0)
      .realHover()
      .find("svg")
      .invoke("show")
      .should("be.visible");

    cy.contains("button p", "Disable").should("be.visible");
    cy.get(workforceSelector.updateButton).should("be.visible");
    cy.contains("button p", "Print Badge").should("be.visible");
  });


  it("should allow assigning a random device and persist the value", () => {

    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.AccessControl().click();
    cy.wait(1000);

    cy.get(".hover-hoc-container__input__display-value")
      .eq(0)
      .realHover()
      .find(".edit-icon > svg")
      .first()
      .should("be.visible")
      .click({ force: true });

    cy.selectRandomOption(
      '[placeholder="Select Device"]',
      ".sc-tagGq[role='button']",
      "device"
    );

    cy.get(".hover-hoc-container__input__display-value")
      .eq(0)
      .invoke("text")
      .then((deviceName) => {
        const assignedDevice = deviceName.trim();
        cy.wrap(assignedDevice).as("assignedDevice");
        cy.log(`Device assigned: ${assignedDevice}`);
      });

    cy.get(workforceSelector.updateButton).click();
    workforceSelector
      .toastMessage("Successfully updated employee.")
      .should("be.visible");

    cy.get("aside button svg").click(); // 
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.AccessControl().click();
    cy.get(".hover-hoc-container__input__display-value")
      .eq(0)
      .should("not.have.text", "-");
  });


  it("should disable the device and remove it from the field", () => {

    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.AccessControl().click();

    cy.contains("button p", "Disable").click();
    cy.contains("button p", "Disable").click();

    workforceSelector
      .toastMessage()
      .contains("Worker disabled successfully")
      .should("be.visible");

    cy.get(".hover-hoc-container__input__display-value").eq(0).should("have.text", "-");
  });


  it("should show error toast when enabling Motion Mode without a device", () => {

    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.AccessControl().click();

    cy.contains(".toggle-label", "Motion Mode")
      .parent()
      .find('input[type="checkbox"]')
      .check({ force: true });

    workforceSelector
      .toastMessage()
      .contains("Motion Mode can only be enabled after assigning the device")
      .should("be.visible");
  });

 it("should generate printable badge without API call", () => {

  cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
  workforceSelector.AccessControl().click();

  cy.window().then((win) => {
    cy.spy(win.URL, 'createObjectURL').as('blobCreated');
  });

  cy.contains('button', 'Print Badge', { timeout: 10000 })
    .should('be.visible')
    .click({ force: true });

  cy.get('@blobCreated').should('have.been.calledOnce');
});


  it("should prevent assigning the same device to multiple workers", () => {

    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.AccessControl().click();
    cy.wait(1000);

    cy.get(".hover-hoc-container__input__display-value")
      .eq(0)
      .invoke("text")
      .then((text) => {
        const cleanText = text.replace(/\s/g, '');
        let devicename;

        if (cleanText === "-") {
          cy.get(".hover-hoc-container__input__display-value")
            .eq(0)
            .realHover()
            .find(".edit-icon > svg")
            .first()
            .click({ force: true });

          cy.selectRandomOption(
            '[placeholder="Select Device"]',
            ".sc-tagGq[role='button']",
            "device"
          );

          cy.contains('button p', 'Update').click();

          cy.get(".hover-hoc-container__input__display-value")
            .eq(0)
            .invoke("text")
            .then((name) => {
              devicename = name.trim();
              cy.wrap(devicename).as("assignedDevice");
            });
        } else {
          devicename = text.trim();
          cy.wrap(devicename).as("assignedDevice");
        }
      });

    cy.get(workforceSelector.tableRow).eq(1).click({ force: true });
    workforceSelector.AccessControl().click();

    cy.get(".hover-hoc-container__input__display-value")
      .eq(0)
      .realHover()
      .find(".edit-icon > svg")
      .first()
      .click({ force: true });

    cy.get("@assignedDevice").then((device) => {
      cy.get('[placeholder="Select Device"]').type(device);

      cy.contains(
        "p",
        "Sorry, no results were found matching your search criteria."
      ).should("be.visible");
    });
  });
});
