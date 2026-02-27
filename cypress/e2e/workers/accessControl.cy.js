/// <reference types="cypress" />
import { workforceSelector } from "../../support/workforceSelector";
import "cypress-real-events/support";
import workerHelper from '../../support/helper/workerHelper.js';
import accessControlPage from "../../pages/workforce/accessControl.js";


// ─── Test Suite ──────────────────────────────────────────────────────────────

describe("Worker Module - Access Control Page Tests", () => {

  // ── Session + Page Setup ──────────────────────────────────────────────────

  before(() => {
    cy.viewport(1440, 900);
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title')
        .contains(Cypress.env('PROJECT_NAME'))
        .click();
    });
    workerHelper.visitWorkersPage();
  });

  before(() => {
    accessControlPage.configureColumnSettings();
  });

  beforeEach(() => {
    cy.cleanUI();
  });



  it("should display all main UI elements correctly", () => {
    accessControlPage.openWorkerAccessControl(0);

    cy.get("p").contains("Access Control").should("be.visible");

    accessControlPage.assertExpectedLabels([
      "Device", "Last Seen On", "Last Seen Time", "NFC", "Battery"
    ]);

    accessControlPage.assertExpectedToggles([
      "Motion Mode",
      "Flag",
      "Restricted",
      "Driving Permissions",
      "Camera Permissions",
    ]);

    cy.get(".hover-hoc-container__input__display-value")
      .eq(0)
      .realHover()
      .find("svg")
      .invoke("show")
      .should("be.visible");

    cy.contains("button p", "Disable").should("be.visible");
    cy.get(workforceSelector.updateButton).should("be.visible");
  });

  it("Validate the value in table should match inside the drawer page", () => {
    const tableValues = {};

    const fieldMapping = {
      'Device': 'Device',
      'Last Seen Location': 'Last Seen On',
      'Battery': 'Battery',
      'NFC': 'NFC'
    };

    cy.wait(2000);

    cy.get(workforceSelector.tableColumn).then(($headers) => {
      const columnIndices = {};

      $headers.each((i, el) => {
        const headerText = Cypress.$(el).text().trim();
        if (fieldMapping[headerText]) {
          columnIndices[headerText] = i;
          cy.log(`✅ "${headerText}" at column ${i}`);
        }
      });

      cy.get(workforceSelector.tableRow).eq(0).then(($row) => {
        Object.entries(columnIndices).forEach(([columnName, headerIndex]) => {
          const adjustedIndex = headerIndex - 1;
          cy.wrap($row)
            .find('.table_td')
            .eq(adjustedIndex)
            .invoke('text')
            .then((text) => {
              tableValues[columnName] = text.trim();
            });
        });
      });

    }).then(() => {
      accessControlPage.openWorkerAccessControl(0);
      cy.wait(1000);

      Object.entries(fieldMapping).forEach(([tableColumn, drawerField]) => {
        const expectedValue = tableValues[tableColumn];
        cy.getWorkerField(drawerField).should('have.text', expectedValue);
        cy.log(`✅ ${drawerField}: ${expectedValue}`);
      });

      cy.getWorkerField('Last Seen Time').should('be.visible');
    });
  });

  it("should allow assigning a random device and persist the value", () => {
    accessControlPage.openWorkerAccessControl(0);
    cy.wait(1000);

    accessControlPage.openDeviceEditMode();
    accessControlPage.selectRandomDevice();

    accessControlPage.getDeviceName().then((deviceName) => {
      cy.wrap(deviceName.trim()).as("assignedDevice");
      cy.log(`Device assigned: ${deviceName.trim()}`);
    });

    accessControlPage.clickUpdate();
    accessControlPage.assertToast("Successfully updated worker.");

    accessControlPage.closeDrawer();
    accessControlPage.openWorkerAccessControl(0);
    accessControlPage.assertDeviceIsAssigned();
  });

  it("should disable the device and remove it from the field", () => {
    accessControlPage.openWorkerAccessControl(0);
    accessControlPage.disableWorker();
    accessControlPage.assertToast("Worker disabled successfully");
    accessControlPage.assertDeviceIsEmpty();
  });

  it("should show error toast when enabling Motion Mode without a device", () => {
    accessControlPage.openWorkerAccessControl(0);
    accessControlPage.enableToggle("Motion Mode");
    accessControlPage.assertToast(
      "Motion Mode can only be enabled after assigning the device"
    );
  });

  it("should generate printable badge without API call", () => {
    accessControlPage.openWorkerAccessControl(0);

    cy.window().then((win) => {
      cy.spy(win.URL, 'createObjectURL').as('blobCreated');
    });

    cy.contains('button', 'Print Badge', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    cy.get('@blobCreated').should('have.been.calledOnce');
  });

  it.skip("should prevent assigning the same device to multiple workers", () => {
    cy.wait(4000);

    accessControlPage.openWorkerAccessControl(0);
    cy.wait(1000);

    accessControlPage.getDeviceName().then((text) => {
      const cleanText = text.replace(/\s/g, '');

      if (cleanText === "-") {
        accessControlPage.openDeviceEditMode();
        accessControlPage.selectRandomDevice();
        accessControlPage.clickUpdate();

        accessControlPage.getDeviceName().then((name) => {
          cy.wrap(name.trim()).as("assignedDevice");
        });
      } else {
        cy.wrap(text.trim()).as("assignedDevice");
      }
    });

    cy.get('body').click(0, 0);

    accessControlPage.openWorkerAccessControl(5);
    accessControlPage.openDeviceEditMode();

    cy.get("@assignedDevice").then((device) => {
      cy.get('[placeholder="Select Device"]').type(device);

      cy.get('body').then(($body) => {
        const $option = $body
          .find('.select_item_container [role="button"]')
          .filter((_, el) => el.innerText.includes(device));

        if ($option.length) {
          cy.wrap($option.first()).click();
          accessControlPage.clickUpdate();
          accessControlPage.assertToast(
            'This device has already been assigned to another worker. Please disable the worker before assigning it again.'
          );
        } else {
          cy.contains("p", "No results were found matching your search criteria.")
            .should("be.visible");
        }
      });
    });
  });

});