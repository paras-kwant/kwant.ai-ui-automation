/// <reference types="cypress" />
import { insightsFavouritePage } from "../../../pages/insights/companies/favourite";
import companiesHelper from "../../../support/helper/companiesHelper";
import { workforceSelector } from "../../../support/workforceSelector";

describe("Insights Company - Favourite Page", () => {

  beforeEach(() => {
    cy.loginAndVisit(() => companiesHelper.visitCompaniesInsightPage('500526306'));
  });

  // ─────────────────────────────────────────────────────────────────────────────

  it("Verify remove company from Favorite", () => {
    cy.get(workforceSelector.tableRow).should('be.visible')
    insightsFavouritePage.clickFavouriteButton();

    insightsFavouritePage.assertToastContains("Removed from favorite");
    insightsFavouritePage.assertFavouriteIconNotExists();
    insightsFavouritePage.assertFavouriteLinkNotExists();
  });

  // ─────────────────────────────────────────────────────────────────────────────

  it("Verify adding company as favourite", () => {
    cy.get(workforceSelector.tableRow).should('be.visible')

    insightsFavouritePage.clickFavouriteButton();
    insightsFavouritePage.assertToastContains("Added to favorite");
    insightsFavouritePage.assertFavouriteIconVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────────

  it("Verify Insights Company Page Accessibility from Favorites", () => {
    cy.get(workforceSelector.tableRow).should('be.visible')

    insightsFavouritePage.assertFavouriteLinkVisible();
    insightsFavouritePage.insightsFavouriteLink.click();
    insightsFavouritePage.assertUrlIncludesInsightsCompanies();
  });

  // ─────────────────────────────────────────────────────────────────────────────

  it("Verify Favorite Status Persistence", () => {
    cy.get(workforceSelector.tableRow).should('be.visible')

    insightsFavouritePage.visitInsightsCompaniesPage();
    insightsFavouritePage.assertFavouriteIconVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────────

  it("Verify that the latest company added to favorites is displayed at the top of the favorites list.", () => {
    cy.get(workforceSelector.tableRow).should('be.visible')

    insightsFavouritePage.favouriteButton.find('[fill="#FACC15"]').then(($icon) => {
      if ($icon.length === 0) {
        insightsFavouritePage.clickFavouriteButton();
      }
      insightsFavouritePage.assertFavouriteIsFirstInList();
    });
  });

});