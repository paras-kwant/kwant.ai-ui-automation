/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import companiesHelper from '../../support/helper/companiesHelper';
import { workforceSelector } from '../../support/workforceSelector';

describe("Companies Module - column", () => {

  before(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title')
        .contains(Cypress.env('PROJECT_NAME'))
        .click();
    });
    companiesHelper.visitCompaniesPage();
  });
  before(() => {
    cy.get('.icon-button button').eq(0).click();
    cy.get('[data-rbd-draggable-id="email"] input[type="checkbox"]')
      .then(($checkbox) => {
        if ($checkbox.prop('checked')) {
          cy.wrap($checkbox).click();
          cy.contains('button p', 'Save').click();
        } else {
          cy.log('Email column already OFF');
          cy.get('.sc-krNlru svg').click();
        }
      });
  });
  beforeEach(()=>{
    cy.get('body').then($body => {
        if ($body.find('aside button svg, .sc-krNlru svg').length > 0) {
          cy.get('aside button svg, .sc-krNlru svg').first().click({ force: true });
        }
  })
})
beforeEach(() => {
  cy.get('.sc-kOPcWz').should('not.exist');

})
  
  
  it('Validate adding and updating column settings', () => {
    cy.get('.icon-button button').eq(0).click();
    cy.get(workforceSelector.tableColumn)
    .contains('E Mail')
    .should('not.exist');
    cy.get('[data-rbd-draggable-id="email"] input[type="checkbox"]')
      .should('exist')
      .click();
  
    cy.contains('button p', 'Save').click();
  
    cy.get('.sc-kOPcWz')
      .should('be.visible')
      .and('contain.text', 'Column settings updated successfully');  
    cy.get(workforceSelector.tableColumn)
      .contains('E Mail')
      .should('exist');

    //disabling the email once again

    cy.get('.icon-button button').eq(0).click();
    cy.get('[data-rbd-draggable-id="email"] input[type="checkbox"]')
      .should('exist')
      .click();
    cy.contains('button p', 'Save').click();
  });

  it('Open Add New Column drawer and verify initial UI state', ()=>{
    cy.get('.icon-button button').eq(0).click();
    cy.get('button p').contains('Add New Column').click()
    cy.get('[placeholder="Add Field Name"]').should('be.visible')
    cy.get('[placeholder="Select"]').click()
    cy.get('div[role="button"].sc-tagGq')
  .should('have.length', 5)
  .each(($el) => {
    expect($el.text().trim()).to.be.oneOf([
      'Free Text',
      'Numeric',
      'Calendar',
      'Boolean',
      'Dropdown'
    ]);
  });
  cy.get('[label="Clear"] button').should('be.disabled')
  cy.get('[label="Add"] button').should('be.disabled')
  })
  
  
  it('Verify that clicking in “clear” clears the input boxes,', ()=>{
    cy.get('.icon-button button').eq(0).click();
    cy.get('.columns-drawer-header').contains('Column Settings').should('be.visible')
    cy.get('button p').contains('Add New Column').click()
    cy.get('[placeholder="Add Field Name"]').then(($input) => {
        const randomValue = `field_${Cypress._.random(1000, 9999)}`;
        cy.wrap($input)
          .type(randomValue)
          .should('have.value', randomValue);
      });
    cy.get('[label="Clear"] button').click()
    cy.get('[placeholder="Add Field Name"]')
  .should('have.value', '');
  })

it('Verify that clicking on the back button navigates back to the column setting page.', ()=>{
    cy.get('.icon-button button').eq(0).click()
    cy.get('.columns-drawer-header').contains('Column Settings').should('be.visible')
    cy.get('button p').contains('Add New Column').click()
    cy.get('button p').contains('Add New Column').should('not.exist')
    cy.get('.add-column-container__footer__left').contains('Back').click()
    cy.get('button p').contains('Add New Column').should('be.visible')
})




it('Displays checked columns in table preserving drawer order', () => {
  cy.get('.icon-button button').eq(0).click();
  cy.get('.columns-drawer-header').contains('Column Settings').should('be.visible');

  const checkedTexts = [];
  cy.get('[data-rbd-draggable-id]')
  .eq(0)
  .find('.columns-drawer-content__column-option__left').invoke('text').then((checkedText)=>{
    cy.log('Checked Text:', checkedText);
  cy.get('[data-rbd-draggable-id]')
  .eq(0)
  .find('input[type="checkbox"]')
  .uncheck({ force: true });


  cy.get('[data-rbd-draggable-id]').should('exist').each(($draggable) => {
    cy.wrap($draggable).within(() => {
      cy.get('input[type="checkbox"]').then(($checkbox) => {
        if ($checkbox.is(':checked')) {
          cy.get('.columns-drawer-content__column-option__left')
            .invoke('text')
            .then((text) => checkedTexts.push(text.trim()));
        }
      });
    });
  });

  cy.get('button p').contains('Save').click();

cy.get(workforceSelector.tableColumn).then(($cols) => {
  const tableTexts = [...$cols].map(el => el.innerText.trim());

  cy.log('Table Columns:', tableTexts.join(', '));
  cy.log('Drawer Checked Columns:', checkedTexts.join(', '));

  let startIndex = 0; 

  checkedTexts.forEach((drawerCol) => {
    const indexInTable = tableTexts.indexOf(drawerCol, startIndex);

    expect(indexInTable, `Column "${drawerCol}" should appear in table in order`).to.be.greaterThan(-1);

    startIndex = indexInTable + 1;
  });
});

cy.get('.icon-button button').eq(0).click();
cy.get('.columns-drawer-header').contains('Column Settings').should('be.visible');
cy.get('[data-rbd-draggable-id]')
  .contains('.columns-drawer-content__column-option__left', checkedText)
  .closest('[data-rbd-draggable-id]')
  .find('input[type="checkbox"]')
  .check({ force: true });
cy.get('button p').contains('Save').click();

})
})

it('Validate drag and drop column feature', () => {
  cy.get('.icon-button button').eq(0).click();
  cy.wait(1000);

  cy.get('.columns-drawer-content__column-option__left')
    .then($els => $els.map((i, el) => el.innerText.trim()).get())
    .then(orderBefore => {
      cy.log('Initial Order:', orderBefore);


      cy.get('[data-rbd-draggable-id]').eq(1).invoke('text').then((draggableColumn)=>{
        cy.log('Dragging Column:', draggableColumn.trim());

      cy.get('[data-rbd-draggable-id]').eq(1).then($draggable => {
        cy.get('.columns-drawer-content__column-option').eq(2).then($target => {
          const sourceRect = $draggable[0].getBoundingClientRect();
          const targetRect = $target[0].getBoundingClientRect();
          const startX = sourceRect.left + sourceRect.width / 2;
          const startY = sourceRect.top + sourceRect.height / 2;
          const endX = targetRect.left + targetRect.width / 2;
          const endY = targetRect.top + targetRect.height / 2;

          cy.wrap($draggable).trigger('touchstart', {
            touches: [{ clientX: startX, clientY: startY }],
            targetTouches: [{ clientX: startX, clientY: startY }],
            changedTouches: [{ clientX: startX, clientY: startY }],
            force: true
          }).wait(200);

          for (let i = 1; i <= 8; i++) {
            const currentX = startX + ((endX - startX) * i / 8);
            const currentY = startY + ((endY - startY) * i / 8);

            cy.wrap($draggable).trigger('touchmove', {
              touches: [{ clientX: currentX, clientY: currentY }],
              targetTouches: [{ clientX: currentX, clientY: currentY }],
              changedTouches: [{ clientX: currentX, clientY: currentY }],
              force: true
            }).wait(100);
          }

          cy.wrap($draggable).trigger('touchend', {
            touches: [],
            targetTouches: [],
            changedTouches: [{ clientX: endX, clientY: endY }],
            force: true
          });

          cy.wait(1000)
          cy.get('.columns-drawer-content__column-option__left')
            .should($els => {
              const orderAfter = $els.map((i, el) => el.innerText.trim()).get();
              expect(orderAfter, 'Column order should change').to.not.deep.equal(orderBefore);
            });
        });
      });
      cy.wait(1000);
      cy.get(workforceSelector.saveButton).click()

      cy.get('.sc-gwZKzw').eq(6).invoke('text').then((text) => {
        expect(text.trim()).to.eq(draggableColumn.trim());
      })
  });
})

});

it('Verify S. No., and Name columns are frozen when the user is horizontally scrolling the page.',() => {

    cy.get('.table-wrapper') 
      .scrollTo('right', { duration: 500 });

    cy.get(workforceSelector.tableColumn)
      .contains('S.No')
      .should('be.visible');

    cy.get(workforceSelector.tableColumn)
      .contains('Company Name')
      .should('be.visible');
  }
);

it('Verify horizontal scroll availability based on number of table columns',
  () => {

    cy.get(workforceSelector.tableColumn).then($columns => {
      const columnCount = $columns.length;

      cy.get('.table-wrapper').then($wrapper => {
        const el = $wrapper[0];

        if (columnCount > 6) {
          expect(el.scrollWidth, 'scrollWidth').to.be.greaterThan(el.clientWidth);

          cy.wrap($wrapper)
            .scrollTo('right', { duration: 300 });

          cy.wrap($wrapper)
            .invoke('scrollLeft')
            .should('be.gt', 0);

        } else {
          expect(el.scrollWidth, 'scrollWidth')
            .to.equal(el.clientWidth);
        }
      });
    });
  }
);

})