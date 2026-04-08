// cypress/pages/insights/workers/companyProfile.js

import { workforceSelector } from '../../../support/workforceSelector';
import WorkerHelper from '../../../support/helper/workerHelper';

class CompanyProfilePage {

  // ─── Navigation ───────────────────────────────────────────────

  visit(clientId = '500526306') {
    cy.loginAndVisit(() => WorkerHelper.visitWorkersInsightPage(clientId));
  }

  switchToCardLayout() {
    cy.wait(1000);
    cy.get('.selector-item.last').should('be.visible').click();
    cy.get('.selector-item.last').should('have.class', 'active');
  }

  // ─── Intercepts ───────────────────────────────────────────────

  interceptGetConfig() {
    cy.intercept('GET', '**/api/projectConfigs**').as('getConfig');
  }

  interceptTaskDetail() {
    cy.intercept('GET', '**/api/projectTaskTrade/detail/**').as('taskDetail');
  }

  interceptGetWorker() {
    cy.intercept('GET', '**/api/worker/get/**').as('getWorker');
  }

  waitForGetWorker() {
    return cy.wait('@getWorker');
  }

  // ─── Auth Headers ─────────────────────────────────────────────

  captureAuthHeaders() {
    cy.wait('@getConfig').then(({ request }) => {
      cy.wrap({
        'x-auth-token': request.headers['x-auth-token'],
        'x-auth-project': Number(request.headers['x-auth-project'])
      }).as('authHeaders');
    });
  }

  // ─── Row Selection ────────────────────────────────────────────

  selectRandomCompanyRow() {
    cy.wait(4000);
    cy.get(workforceSelector.tableRow)
      .should('have.length.greaterThan', 0)
      .then(($rows) => {
        const randomIndex = $rows.length > 1
          ? Math.floor(Math.random() * ($rows.length - 1)) + 1
          : 0;
        const selectedRow = $rows[randomIndex];

        cy.wrap(selectedRow).scrollIntoView().should('be.visible');
        cy.wrap(selectedRow).find('input[type="checkbox"]').check({ force: true });

        cy.wrap(selectedRow)
          .find('.personal-info-content__title')
          .invoke('text')
          .then((text) => {
            const companyName = text.trim();
            cy.log(`✅ Selected company: ${companyName}`);
            cy.wrap(companyName).as('companyName');

            cy.get('.worker_insight_section .personal-info-content__title')
              .contains(companyName)
              .should('be.visible');
          });
      });
  }

  selectRandomRowForStatus() {
    cy.wait(3000);
    cy.get(workforceSelector.tableRow)
      .should('have.length.greaterThan', 0)
      .then(($rows) => {
        const randomIndex = $rows.length > 1
          ? Math.floor(Math.random() * ($rows.length - 1)) + 1
          : 0;
        const $selectedRow = Cypress.$($rows[randomIndex]);

        const statusColor = $selectedRow
          .find('.row_status_tooltip_container span')
          .first()
          .text()
          .trim()
          .toLowerCase();

        cy.log(`UI status color: "${statusColor || 'NONE'}"`);
        cy.wrap(statusColor).as('statusColor');

        cy.wrap($rows[randomIndex]).scrollIntoView().should('be.visible');
        cy.wrap($rows[randomIndex]).find('input[type="checkbox"]').check({ force: true });
      });
  }

  // ─── Profile Actions ──────────────────────────────────────────

  clickFullProfile() {
    cy.contains('button', 'Full Profile').click();
  }

  clickDocumentPage() {
    cy.get(workforceSelector.documentPage).click();
  }

  // ─── Profile Assertions ───────────────────────────────────────

  assertCompanyNameVisible(companyName) {
    cy.get('.worker_insight_section .personal-info-content__title')
      .contains(companyName)
      .should('be.visible');
  }

  assertProfileNameVisible(companyName) {
    cy.contains('p', companyName).should('be.visible');
  }

  // ─── General Details ──────────────────────────────────────────

  captureGeneralDetails() {
    const generalDetails = {};
    return cy.get('.hover-hoc-container')
      .each(($container) => {
        const label = $container.find('.hover-hoc-container__label').text().trim();
        const value = $container.find('.hover-hoc-container__input__display-value').text().trim();
        if (label) generalDetails[label] = value;
      })
      .then(() => cy.wrap(generalDetails));
  }

  validateGeneralDetailsAgainstAPI(generalDetails, authHeaders, workerId) {
    cy.request({
      method: 'GET',
      url: `https://uat.kwant.ai/api/worker/get/${workerId}`,
      headers: authHeaders
    }).then((apiResp) => {
      const apiData = apiResp.body || {};

      const fieldMapping = {
        'First Name': apiData.firstName,
        'Last Name': apiData.lastName,
        'Company': apiData.projectTaskTradeName,
        'Zip Code': apiData.zipCode,
        'Emergency Contact Name': apiData.emergencyContactName,
        'Emergency Contact Phone': apiData.emergencyContactPhone
      };

      Object.keys(fieldMapping).forEach((label) => {
        const uiRaw = generalDetails[label];
        const apiRaw = fieldMapping[label];

        if (uiRaw !== undefined) {
          const uiVal = uiRaw?.trim().toLowerCase() || '-';
          const apiVal = apiRaw ? apiRaw.toString().trim().toLowerCase() : '-';
          cy.log(`${label} → UI: ${uiVal} | API: ${apiVal}`);
          expect(uiVal, `${label} mismatch`).to.eq(apiVal);
        }
      });
    });
  }

  // ─── Status Color Validation ──────────────────────────────────

  validateStatusColorAgainstAPI(statusColor, authHeaders, workerId) {
    cy.request({
      method: 'GET',
      url: `https://uat.kwant.ai/api/worker/get/${workerId}`,
      headers: authHeaders,
      failOnStatusCode: true
    }).then((apiResp) => {
      expect(apiResp.status).to.eq(200);
      const worker = apiResp.body;
      cy.log('Worker API body: ' + JSON.stringify(worker));

      const isFlagged = worker.flag === true;
      const hasSafetyAudit = worker.hasSafetyAudit === true;
      const hasExpiredDocs = Array.isArray(worker.documents) &&
        worker.documents.some((doc) => doc.expired === true || doc.status === 'EXPIRED');
      const hasAccessIssue = Array.isArray(worker.accessStatus) &&
        worker.accessStatus.some((a) => a.status === false && a.message !== null);
      const isSafetyAlert = hasSafetyAudit || hasExpiredDocs || hasAccessIssue;

      cy.log(`isFlagged: ${isFlagged}`);
      cy.log(`isSafetyAlert: ${isSafetyAlert} (audit:${hasSafetyAudit}, expiredDocs:${hasExpiredDocs}, accessIssue:${hasAccessIssue})`);

      if (!statusColor) {
        expect(isFlagged, 'No UI status: flag should be false').to.be.false;
        expect(isSafetyAlert, 'No UI status: safety should be false').to.be.false;
        return;
      }
      if (statusColor === 'red') {
        expect(isFlagged, 'UI shows RED but worker.flag is false').to.be.true;
        return;
      }
      if (statusColor === 'yellow') {
        expect(isSafetyAlert, 'UI shows YELLOW but no safety alert found in API').to.be.true;
        return;
      }
      throw new Error(`Unhandled status color: "${statusColor}" — add a case for this.`);
    });
  }

  // ─── Document Validation ──────────────────────────────────────

  normalizeText(str) {
    if (!str) return '';
    str = str.toString().trim().toLowerCase();
    if (str === '-' || str === '') return 'placeholder';
    return str.replace(/\s+/g, ' ');
  }

  normalizeDate(dateStr) {
    if (!dateStr || dateStr === '-' || dateStr === '') return '';
    if (dateStr.includes('/')) {
      const [month, day, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    if (dateStr.includes('T')) return dateStr.split('T')[0];
    return dateStr;
  }

  captureDocumentRows() {
    const uiDocuments = [];
    return cy.get(workforceSelector.documentTableRow)
      .should('be.visible')
      .and('have.length.greaterThan', 0)
      .each(($row) => {
        const doc = {};
        cy.wrap($row).find('.cell-content').then(($cells) => {
          doc.name = $cells.eq(0).text().trim();
          doc.expiry = $cells.eq(1).text().trim();
          doc.credentialId = $cells.eq(2).text().trim();
          uiDocuments.push(doc);
        });
      })
      .then(() => {
        cy.log('📄 Captured UI documents: ' + JSON.stringify(uiDocuments));
        return cy.wrap(uiDocuments);
      });
  }

  validateDocumentsAgainstAPI(uiDocuments, authHeaders, workerId) {
    cy.request({
      method: 'GET',
      url: `https://uat.kwant.ai/api/worker/get/${workerId}`,
      headers: authHeaders,
      failOnStatusCode: true
    }).then((apiResp) => {
      expect(apiResp.status).to.eq(200);
      const apiDocs = apiResp.body.documents || [];
      cy.log('📌 API documents count: ' + apiDocs.length);

      if (uiDocuments.length === 0) {
        cy.log('⚠️ No document rows found in UI — validating API also returns empty documents');
        expect(apiDocs.length, '❌ UI shows no documents but API returned documents').to.eq(0);
        cy.log('✅ Confirmed: No documents in UI and API both match');
        return;
      }

      uiDocuments.forEach((uiDoc) => {
        cy.log(`🔍 Validating document: ${uiDoc.name}`);

        const match = apiDocs.find(
          (apiDoc) => this.normalizeText(apiDoc.documentType) === this.normalizeText(uiDoc.name)
        );

        if (!match) throw new Error(`❌ No API match found for document: ${uiDoc.name}`);

        const apiExpiry = this.normalizeDate(match.expiryDate || '-');
        const uiExpiry = this.normalizeDate(uiDoc.expiry || '-');
        if (apiExpiry !== uiExpiry) {
          throw new Error(`❌ Expiry mismatch for ${uiDoc.name}: UI="${uiDoc.expiry}" vs API="${match.expiryDate}"`);
        }

        const apiCred = this.normalizeText(match.credentialId || '-');
        const uiCred = this.normalizeText(uiDoc.credentialId || '-');
        if (uiCred !== apiCred) {
          throw new Error(`❌ CredentialId mismatch for ${uiDoc.name}: UI="${uiDoc.credentialId}" vs API="${match.credentialId}"`);
        }

        cy.log(`✔ Validated: ${uiDoc.name} | Expiry: ${apiExpiry} | CredentialId: ${apiCred}`);
      });

      cy.log('🎯 All documents validated successfully!');
    });
  }

  assertDocumentsEmptyOrValidate(authHeaders, workerId) {
    cy.get('body').then(($body) => {
      const hasRows = $body.find(workforceSelector.documentTableRow).length > 0;

      if (!hasRows) {
        this.validateDocumentsAgainstAPI([], authHeaders, workerId);
      } else {
        this.captureDocumentRows().then((uiDocuments) => {
          this.validateDocumentsAgainstAPI(uiDocuments, authHeaders, workerId);
        });
      }
    });
  }

  // ─── API Request Helper ───────────────────────────────────────

  extractWorkerIdFromURL(url) {
    return url.split('/').pop();
  }
}

export default new CompanyProfilePage();