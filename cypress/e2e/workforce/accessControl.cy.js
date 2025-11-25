/// <reference types="cypress" />
import { workforceSelector } from "../../support/workforceSelector";
import "cypress-real-events/support";

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
  // Login and select project before each test
  before(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title').contains(Cypress.env('PROJECT_NAME')).click();
    });
    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);
  });


  beforeEach(() => {
    cy.closeUploadDownloadDrawerIfOpen();
  });

  /**
   * Test 1: Validate that all main UI elements are visible on the Access Control page
   */
  it("should display all main UI elements correctly", () => {

    // Open first worker and go to Access Control
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.AccessControl().click();

    // Check section header
    cy.get("p").contains("Access Control").should("be.visible");

    // Validate labels
    const expectedLabels = ["Device", "Last Seen On", "Last Seen Time", "NFC"];
    expectedLabels.forEach((label) => {
      cy.get(".hover-hoc-container__label").contains(label).should("exist");
    });

    // Validate toggles
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

    // Validate hoverable edit icon
    cy.get(".hover-hoc-container__input__display-value")
      .eq(0)
      .realHover()
      .find("svg")
      .invoke("show")
      .should("be.visible");

    // Validate buttons
    cy.contains("button p", "Disable").should("be.visible");
    cy.get(workforceSelector.updateButton).should("be.visible");
    cy.contains("button p", "Print Badge").should("be.visible");
  });

  /**
   * Test 2: Validate editing and updating the assigned device
   */
  it("should allow assigning a random device and persist the value", () => {

    // Open first worker and go to Access Control
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.AccessControl().click();
    cy.wait(1000);

    // Open device edit and select a random device
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

    // Store the selected device name
    cy.get(".hover-hoc-container__input__display-value")
      .eq(0)
      .invoke("text")
      .then((deviceName) => {
        const assignedDevice = deviceName.trim();
        cy.wrap(assignedDevice).as("assignedDevice");
        cy.log(`Device assigned: ${assignedDevice}`);
      });

    // Update and validate toast message
    cy.get(workforceSelector.updateButton).click();
    workforceSelector
      .toastMessage("Successfully updated employee.")
      .should("be.visible");

    // Re-open worker and verify the device persists
    cy.get("aside button svg").click(); // Close drawer
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.AccessControl().click();
    cy.get(".hover-hoc-container__input__display-value")
      .eq(0)
      .should("not.have.text", "-");
  });

  /**
   * Test 3: Validate disabling a device removes it from the field
   */
  it("should disable the device and remove it from the field", () => {

    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.AccessControl().click();

    // Click disable button twice (confirm)
    cy.contains("button p", "Disable").click();
    cy.contains("button p", "Disable").click();

    // Validate toast message and field value
    workforceSelector
      .toastMessage()
      .contains("Worker disabled successfully")
      .should("be.visible");

    cy.get(".hover-hoc-container__input__display-value").eq(0).should("have.text", "-");
  });

  /**
   * Test 4: Motion Mode toggle requires assigned device
   */
  it("should show error toast when enabling Motion Mode without a device", () => {

    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.AccessControl().click();

    // Attempt to enable Motion Mode
    cy.contains(".toggle-label", "Motion Mode")
      .parent()
      .find('input[type="checkbox"]')
      .check({ force: true });

    // Validate error toast
    workforceSelector
      .toastMessage()
      .contains("Motion Mode can only be enabled after assigning the device")
      .should("be.visible");
  });

  /**
   * Test 5: Validate Print Badge triggers required assets
   */
  it("should load all assets when Print Badge is clicked", () => {

    // Open first worker and Access Control
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.AccessControl().click();

    cy.intercept('GET', '**/WALBRIDGE2016-Banner.jpg*').as('banner');

    cy.contains('button', 'Print Badge', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    cy.wait('@banner').its('response.statusCode').should('eq', 200);
  });

  /**
   * Test 6: Ensure one device can only be assigned to one worker
   */
  it("should prevent assigning the same device to multiple workers", () => {

    // Step 1: First worker - assign device if empty
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
          // Assign random device
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

    // Step 2: Second worker - attempt to assign same device
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

      // Validate error message
      cy.contains(
        "p",
        "Sorry, no results were found matching your search criteria."
      ).should("be.visible");
    });
  });
});
