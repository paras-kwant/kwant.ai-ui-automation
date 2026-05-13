import { workforceSelector } from "../../support/workforceSelector";

const SafetyAuditPage = {

  // ─── Selectors ─────────────────────────────────────────────────────────────
  selectors: {
    alertTypeFilter:      (label) => `.filter-alert-select-container [label="${label}"]`,
    alertTypeLabel:       '.alert-type-label',
    calendarContainer:    '.filter-alert-calender-container',
    // TODO: replace with data-status="unresolved" / data-status="resolved" once frontend adds it
    unresolvedRow:        'section [data-testid="table_tr"] .sc-hKinHC.hWPvpK',
    resolvedRow:          'section [data-testid="table_tr"] .sc-hKinHC.jcllaP',
    auditTableRow:        `section ${workforceSelector.tableRow}`,
    auditRowCheckbox:     `section ${workforceSelector.tableRow} [type="checkbox"]`,
    headerCheckbox:       'section .header-checkbox-container [type="checkbox"]',
    cellContent:          '.cell-content',
    selectedCountLabel:   '.selected-container .default__label',
    selectedLabel:        '.label.default__label',
    commentPanel:         '.comment-body-container__display-comment-container',
    commentItem:          '.comment-item-body__content',
    commentInput:         '[placeholder="comment"]',
    commentHeader:        '.comment-header-container',
    emptyState:           '.empty-body__title',
    tableWrapper:         '.table-wrapper',
    alertTooltip:         'div.tooltip-container.right-center span',
    workerName:           '.personal-info-content__title',
  },

  // ─── Navigation ────────────────────────────────────────────────────────────
  openDrawer: (rowIndex = 0) => {
    cy.get(workforceSelector.tableRow).eq(rowIndex).click({ force: true });
    cy.get(workforceSelector.SafetyAuditPage).click();
  },

  openCommentPanel: (rowIndex = 0) => {
    cy.get(`section ${workforceSelector.tableRow}`).eq(rowIndex).find('svg').last().click();
  },

  // ─── Filter Actions ────────────────────────────────────────────────────────
  switchAlertFilter: (currentLabel, targetType) => {
    cy.get(`.filter-alert-select-container [label="${currentLabel}"]`).should('be.visible').click();
    cy.contains('.alert-type-label', targetType).click();
  },

  // ─── Alert Assertions ──────────────────────────────────────────────────────
  verifyEmptyState: () => {
    cy.get('.empty-body__title').should('contain', 'No safety notifications yet!');
  },

  verifyUnresolvedRowsExist: () => {
    cy.get('section [data-testid="table_tr"] .sc-hKinHC.hWPvpK').should('exist');
  },

  verifyResolvedRowsNotExist: () => {
    cy.get('section [data-testid="table_tr"] .sc-hKinHC.jcllaP').should('not.exist');
  },

  verifyResolvedRowsOrEmpty: () => {
    cy.get('body').then(($body) => {
      if ($body.find('section [data-testid="table_tr"] .sc-hKinHC.jcllaP').length > 0) {
        cy.get('section [data-testid="table_tr"] .sc-hKinHC.jcllaP').should('exist');
      } else {
        SafetyAuditPage.verifyEmptyState();
      }
    });
  },

  verifyAlertInResolvedList: (alertText) => {
    cy.get('.table-wrapper').eq(1).within(() => {
      cy.get(`${workforceSelector.tableRow} .cell-content`).then(($cells) => {
        const texts = $cells.toArray().map((el) => el.innerText.trim());
        expect(texts.filter((t) => t === alertText).length).to.equal(1);
      });
    }).scrollTo('bottom', { duration: 1000, ensureScrollable: false });
  },

  verifyAlertAbsentFromList: (alertText) => {
    cy.get('body').then(($body) => {
      if ($body.find(`section ${workforceSelector.tableRow}`).length > 0) {
        cy.get(`section ${workforceSelector.tableRow} .cell-content`).then(($cells) => {
          const texts = $cells.toArray().map((el) => el.innerText.trim());
          expect(texts.filter((t) => t === alertText).length).to.equal(0);
        });
      } else {
        SafetyAuditPage.verifyEmptyState();
      }
    });
  },

  getFirstAlertText: () => {
    return cy
      .get(`section ${workforceSelector.tableRow} .cell-content`)
      .eq(0)
      .invoke('text')
      .then((t) => t.trim());
  },

  // ─── Alert Actions ─────────────────────────────────────────────────────────
  checkFirstAlert: () => {
    cy.get(`section ${workforceSelector.tableRow} [type="checkbox"]`).eq(0).check({ force: true });
  },

  checkAllAlerts: () => {
    cy.get('section .header-checkbox-container [type="checkbox"]').first().check({ force: true });
  },

  resolveSelectedAlerts: () => {
    cy.contains('button p', 'Resolve').click();
    cy.contains('.delete-dialog-footer button p', 'Resolve').click();
    cy.get(workforceSelector.toastMessage).should('contain', 'Resolved successfully');
  },

  deleteSelectedAlerts: () => {
    cy.contains('button p', 'Delete').click();
    cy.contains('.delete-dialog-footer button p', 'Delete').click();
    cy.get(workforceSelector.toastMessage).should('contain', 'Deleted successfully');
  },

  // ─── Comment Actions ───────────────────────────────────────────────────────
  addRandomComment: (commentPrefix = 'Auto comment') => {
    const randomComment = `${commentPrefix} - ${Cypress._.random(1000, 9999)}`;
    cy.get('body').then(($body) => {
      if ($body.find('.comment-item-body__content').length === 0) {
        cy.get('textarea').clear().type(randomComment);
        cy.contains('button p', 'Add Comment').click();
        cy.get('.comment-item-body__content').eq(0).should('contain.text', randomComment);
      }
    });
    return cy.wrap(randomComment);
  },

  ensureCommentExists: () => {
    cy.get('body').then(($body) => {
      if ($body.find('.comment-item-body__content').length === 0) {
        SafetyAuditPage.addRandomComment();
      }
    });
  },

  editFirstComment: () => {
    const editedComment = `Edited comment - ${Cypress._.random(1000, 9999)}`;
    cy.get('.comment-body-container__display-comment-container')
      .scrollTo('top', { duration: 1000, ensureScrollable: false });
    cy.get('.comment-item-body__content').eq(0).realHover();
    cy.get('button p').contains('Edit').click({ force: true });
    cy.get('.comment-body-container__display-comment-container')
      .scrollTo('top', { duration: 1000, ensureScrollable: false });
    cy.get('[placeholder="comment"]').clear().type(editedComment);
    cy.contains('button p', 'Update').click();
    cy.get('.comment-body-container__display-comment-container')
      .scrollTo('top', { ensureScrollable: false });
    cy.get('.comment-item-body__content').eq(0).should('contain.text', editedComment);
    return cy.wrap(editedComment);
  },

  deleteFirstComment: () => {
    cy.get('.comment-body-container__display-comment-container')
      .scrollTo('top', { ensureScrollable: false });
    return cy.get('.comment-item-body__content').eq(0).invoke('text').then((text) => {
      const trimmed = text.trim();
      cy.get('.comment-item-body__content').eq(0).realHover();
      cy.get('button p').contains('Delete').click({ force: true });
      cy.contains('.delete-dialog-footer button p', 'Delete').click();
      cy.get(workforceSelector.toastMessage).contains('Comment deleted successfully!');
      return cy.wrap(trimmed);
    });
  },

  // ─── Setup (call once in before()) ────────────────────────────────────────
  applyAllSafetyAlertFilters: () => {
    cy.contains(workforceSelector.tableColumn, 'Safety Alert')
      .find('.table-header-filter-btn')
      .click();

    cy.get('[class*="select_item_container"]').within(() => {
      cy.get('label[for^=":r"]').then(($labels) => {
        const indicesToClick = [];
        $labels.each((index, label) => {
          const text = Cypress.$(label)
            .find('span[type="onDropdown"]')
            .last()
            .text()
            .trim();
          if (text !== 'None') indicesToClick.push(index);
        });
        indicesToClick.forEach((index) => {
          cy.get('label[for^=":r"]').eq(index).click();
        });
      });
    });

    cy.get('p').contains('Filters:').click();
    cy.contains(workforceSelector.tableColumn, 'Safety Alert')
      .trigger('mouseover')
      .find('.sorting-icon')
      .click({ force: true });

    cy.get('.loader-image').should('not.exist');
  },

  openSafetyAuditDrawer: () => {
    cy.get(workforceSelector.tableRow).eq(1).click({ force: true });
    cy.get(workforceSelector.SafetyAuditPage).click();
  },
};

export default SafetyAuditPage;
