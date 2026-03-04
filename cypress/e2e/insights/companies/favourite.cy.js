/// <reference types="cypress" />
import { insightsFavouritePage } from "../../../pages/insights/companies/favourite";
import companiesHelper from "../../../support/helper/companiesHelper";
import { workforceSelector } from "../../../support/workforceSelector";

describe("Insights Company - Favourite Page", { tags: ["Epic:WorkForce", "Feature:Favorites", "Module:Insights-Company"] }, () => {

  beforeEach(() => {
    cy.loginAndVisit(() => companiesHelper.visitCompaniesInsightPage('500526306'));
  });

  it(" Insights-Company - Insight Compay Verify remove company from Favorite", { tags: ["Story:Insights Company Remove From Favorite", "Severity:critical", "UI", "Module:Insights-Company"] }, () => {
    cy.get(workforceSelector.tableRow).should('be.visible');
    insightsFavouritePage.clickFavouriteButton();
    insightsFavouritePage.assertToastContains("Removed from favorite");
    insightsFavouritePage.assertFavouriteIconNotExists();
    insightsFavouritePage.assertFavouriteLinkNotExists();
  });

  it("Insights-Company - Verify adding company as favourite", { tags: ["Story:Insights Company Add To Favorite", "Severity:critical", "UI", "Module:Insights-Company"] }, () => {
    cy.get(workforceSelector.tableRow).should('be.visible');
    insightsFavouritePage.clickFavouriteButton();
    insightsFavouritePage.assertToastContains("Added to favorite");
    insightsFavouritePage.assertFavouriteIconVisible();
  });

  it("Insights-Company - Verify Insights Company Page Accessibility from Favorites", { tags: ["Story:Insights Company Access From Favorites", "Severity:normal", "UI", "Module:Insights-Company"] }, () => {
    cy.get(workforceSelector.tableRow).should('be.visible');
    insightsFavouritePage.assertFavouriteLinkVisible();
    insightsFavouritePage.insightsFavouriteLink.click();
    insightsFavouritePage.assertUrlIncludesInsightsCompanies();
  });

  it("Insights-Company - Verify Favorite Status Persistence", { tags: ["Story:Insights Company Favorite Status Persistence", "Severity:normal", "UI", "Module:Insights-Company"] }, () => {
    cy.get(workforceSelector.tableRow).should('be.visible');
    insightsFavouritePage.visitInsightsCompaniesPage();
    insightsFavouritePage.assertFavouriteIconVisible();
  });

  it("Insights-Company - Verify that the latest company added to favorites is displayed at the top of the favorites list.", { tags: ["Story:Insights Company Favorite List Order", "Severity:normal", "UI", "Module:Insights-Company"] }, () => {
    cy.get(workforceSelector.tableRow).should('be.visible');
    insightsFavouritePage.favouriteButton.find('[fill="#FACC15"]').then(($icon) => {
      if ($icon.length === 0) {
        insightsFavouritePage.clickFavouriteButton();
      }
      insightsFavouritePage.assertFavouriteIsFirstInList();
    });
  });

});