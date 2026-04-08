/// <reference types="cypress" />

import companyProfilePage from '../../../pages/insights/workers/workerProfileView'

describe("Insights Company - Company Profile View", { tags: ["Epic:WorkForce", "Feature:WorkforceDashboard", "Module:Insights-Company"] }, () => {

  beforeEach(() => {
    companyProfilePage.interceptGetConfig();
    companyProfilePage.interceptTaskDetail();

    companyProfilePage.visit('500526306');
    companyProfilePage.switchToCardLayout();
    companyProfilePage.captureAuthHeaders();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Company Selection Display
  // ─────────────────────────────────────────────────────────────────────────

  it('Insights-Worker - Verify selected company name appears in onsite selection panel', {
    tags: ["Story:Company Selection Display", "Severity:critical", "UI", "Module:Insights-Company"]
  }, () => {
    companyProfilePage.selectRandomCompanyRow();

    cy.get('@companyName').then((companyName) => {
      companyProfilePage.assertCompanyNameVisible(companyName);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Full Profile Opens
  // ─────────────────────────────────────────────────────────────────────────

  it('Insights-Worker - Verify company full profile opens with correct details', {
    tags: ["Story:Open Company Profile", "Severity:critical", "UI", "Module:Insights-Company"]
  }, () => {
    companyProfilePage.selectRandomCompanyRow();

    cy.get('@companyName').then((companyName) => {
      companyProfilePage.clickFullProfile();
      companyProfilePage.assertProfileNameVisible(companyName);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // General Details vs API
  // ─────────────────────────────────────────────────────────────────────────

  it('Insights-Worker - Validate company general details match API data', () => {
    companyProfilePage.interceptGetWorker();
    companyProfilePage.selectRandomCompanyRow();

    cy.get('@companyName').then((companyName) => {
      companyProfilePage.clickFullProfile();
      companyProfilePage.assertProfileNameVisible(companyName);

      companyProfilePage.waitForGetWorker().then((interception) => {
        const workerId = companyProfilePage.extractWorkerIdFromURL(interception.request.url);

        companyProfilePage.captureGeneralDetails().then((generalDetails) => {
          cy.get('@authHeaders').then((authHeaders) => {
            companyProfilePage.validateGeneralDetailsAgainstAPI(generalDetails, authHeaders, workerId);
          });
        });
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Status Colors vs API
  // ─────────────────────────────────────────────────────────────────────────

  it('Insight-Worker - Verify Company Row Status Colors Match Expected Values', () => {
    companyProfilePage.interceptGetWorker();
    companyProfilePage.selectRandomRowForStatus();

    companyProfilePage.clickFullProfile();

    companyProfilePage.waitForGetWorker().then((interception) => {
      const workerId = companyProfilePage.extractWorkerIdFromURL(interception.request.url);

      cy.get('@statusColor').then((statusColor) => {
        cy.get('@authHeaders').then((authHeaders) => {
          companyProfilePage.validateStatusColorAgainstAPI(statusColor, authHeaders, workerId);
        });
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Documents vs API
  // ─────────────────────────────────────────────────────────────────────────

  it('Insights-Worker - Validate document records with strict API matching', {
    tags: ["Story:Document Verification", "Severity:blocker", "API", "Module:Insights-Company"]
  }, () => {
    companyProfilePage.interceptGetWorker();
    companyProfilePage.selectRandomCompanyRow();

    cy.get('@companyName').then((companyName) => {
      companyProfilePage.clickFullProfile();
      companyProfilePage.assertProfileNameVisible(companyName);

      companyProfilePage.waitForGetWorker().then((interception) => {
        const workerId = companyProfilePage.extractWorkerIdFromURL(interception.request.url);
        cy.log(`✅ workerId: ${workerId}`);
        cy.wait(2000);

        companyProfilePage.clickDocumentPage();

        cy.get('@authHeaders').then((authHeaders) => {
          companyProfilePage.assertDocumentsEmptyOrValidate(authHeaders, workerId);
        });
      });
    });
  });

});