/// <reference types="cypress" />
import { workforceSelector } from "../../support/workforceSelector";
class AccessControlPage {
	// ─── Selectors ────────────────────────────────────────────────────────────
  
	get tableRow() {
	  return cy.get(workforceSelector.tableRow); 
	}
  
	get accessControlTab() {
	  return cy.get(workforceSelector.accessControlPage); 
	}
  
	get updateButton() {
	  return cy.get(workforceSelector.updateButton); 
	}
  
	get toastMessage() {
	  return cy.get(workforceSelector.toastMessage); 
	}
  
	get tableColumn() {
	  return '[data-cy="table-column"]'; 
	}
  
	get deviceDisplayValue() {
	  return '.hover-hoc-container__input__display-value';
	}
  
	get deviceEditIcon() {
	  return '.edit-icon > svg';
	}
  
	get deviceSelectPlaceholder() {
	  return '[placeholder="Select Device"]';
	}
  
	get deviceSelectOptions() {
	  return '.select_item_container [role="button"]';
	}
  
	get drawerCloseButton() {
	  return 'aside button svg';
	}
  
	get disableButton() {
	  return "button p";
	}
  
	get toggleLabel() {
	  return '.toggle-label';
	}
  
	get hoverLabel() {
	  return '.hover-hoc-container__label';
	}
  
	get columnSettingsButton() {
	  return '.icon-button button';
	}
  
	get resetToDefaultButton() {
	  return 'button p';
	}
  
	get saveButton() {
	  return 'button p';
	}
  
	// ─── Actions ──────────────────────────────────────────────────────────────
  
	/**
	 * Click on a table row by index
	 */
	clickTableRow(index = 0) {
	  this.tableRow.eq(index).click({ force: true });
	}
  
	/**
	 * Navigate to the Access Control tab
	 */
	navigateToAccessControl() {
          this.accessControlTab.click();
	}
  
	/**
	 * Open column settings and configure required columns visibility
	 */
	configureColumnSettings() {
	  cy.wait(1000);
	  cy.get(this.columnSettingsButton).first().click();
	  cy.contains(this.resetToDefaultButton, 'Reset to default').click();
	  cy.wait(5000);
	  cy.get('[data-rbd-draggable-id="placeWorkTime"] [type="checkbox"]').click();
	  cy.get('[data-rbd-draggable-id="rfid"] [type="checkbox"]').click();
	  cy.get('[data-rbd-draggable-id="battery"] [type="checkbox"]').click();
	  cy.wait(1000);
	  cy.contains(this.saveButton, 'Save').should('be.visible').click();
	}
  
	/**
	 */
	openDeviceEditMode() {
	  cy.get(this.deviceDisplayValue)
		.eq(0)
		.realHover()
		.find(this.deviceEditIcon)
		.first()
		.should('be.visible')
		.click({ force: true });
	}
  
	selectRandomDevice() {
	  cy.selectRandomOption(
		this.deviceSelectPlaceholder,
		this.deviceSelectOptions,
		'device'
	  );
	}
  
	getDeviceName() {
	  return cy.get(this.deviceDisplayValue).eq(0).invoke('text');
	}
  

	clickUpdate() {
	  this.updateButton.click();
	}
  

	disableWorker() {
	  cy.contains(this.disableButton, 'Disable').click();
	  cy.contains(this.disableButton, 'Disable').click();
	}
  

	closeDrawer() {
	  cy.get(this.drawerCloseButton).click();
	}
  

	enableToggle(toggleName) {
	  cy.contains(this.toggleLabel, toggleName)
		.parent()
		.find('input[type="checkbox"]')
		.check({ force: true });
	}
  

	assertExpectedLabels(labels) {
	  labels.forEach((label) => {
		cy.get(this.hoverLabel).contains(label).should('exist');
	  });
	}
  

	assertExpectedToggles(toggles) {
	  toggles.forEach((toggle) => {
		cy.get(this.toggleLabel).contains(toggle).should('exist');
	  });
	}
  

	assertToast(message) {
	  this.toastMessage.contains(message).should('be.visible');
	}
  
	assertDeviceIsEmpty() {
	  cy.get(this.deviceDisplayValue).eq(0).should('have.text', '-');
	}
  
	assertDeviceIsAssigned() {
	  cy.get(this.deviceDisplayValue).eq(0).should('not.have.text', '-');
	}
  

	searchAndSelectDevice(deviceName) {
	  cy.get(this.deviceSelectPlaceholder).type(deviceName);
  
	  cy.get('body').then(($body) => {
		const $option = $body
		  .find(this.deviceSelectOptions)
		  .filter((_, el) => el.innerText.includes(deviceName));
  
		if ($option.length) {
		  cy.wrap($option.first()).click();
		  return true;
		}
		return false;
	  });
	}
  
	openWorkerAccessControl(rowIndex = 0) {
	  this.clickTableRow(rowIndex);
	  this.navigateToAccessControl();
	}
  }
  
  export default new AccessControlPage();