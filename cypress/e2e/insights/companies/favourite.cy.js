/// <reference types="cypress" />
import { insightsFavouritePage } from "../../../pages/insights/companies/favourite";

describe("Insights Company - Favourite Page", () => {

  before(() => {
    cy.session("userSession", () => {
      cy.login();
      cy.get(".card-title").contains(Cypress.env("PROJECT_NAME")).click();
    });

    insightsFavouritePage.visitInsightsCompaniesPage();
    insightsFavouritePage.tableRow.should("be.visible");
    insightsFavouritePage.ensurePageIsFavourited();
  });

  // ─────────────────────────────────────────────────────────────────────────────

  it("Verify remove company from Favorite", () => {
    insightsFavouritePage.visitInsightsCompaniesPage();
    insightsFavouritePage.clickFavouriteButton();

    insightsFavouritePage.assertToastContains("Removed from favorite");
    insightsFavouritePage.assertFavouriteIconNotExists();
    insightsFavouritePage.assertFavouriteLinkNotExists();
  });

  // ─────────────────────────────────────────────────────────────────────────────

  it("Verify adding company as favourite", () => {
    insightsFavouritePage.clickFavouriteButton();

    insightsFavouritePage.assertToastContains("Added to favorite");
    insightsFavouritePage.assertFavouriteIconVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────────

  it("Verify Insights Company Page Accessibility from Favorites", () => {
    insightsFavouritePage.assertFavouriteLinkVisible();
    insightsFavouritePage.insightsFavouriteLink.click();
    insightsFavouritePage.assertUrlIncludesInsightsCompanies();
  });

  // ─────────────────────────────────────────────────────────────────────────────

  it("Verify Favorite Status Persistence", () => {
    insightsFavouritePage.visitInsightsCompaniesPage();
    insightsFavouritePage.assertFavouriteIconVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────────

  it("Verify that the latest company added to favorites is displayed at the top of the favorites list.", () => {
    insightsFavouritePage.favouriteButton.find('[fill="#FACC15"]').then(($icon) => {
      if ($icon.length === 0) {
        insightsFavouritePage.clickFavouriteButton();
      }
      insightsFavouritePage.assertFavouriteIsFirstInList();
    });
  });

});