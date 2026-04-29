/// <reference types="cypress" />
import { insightsFavouritePage } from "../../../pages/insights/workers/favourite";
import { workforceSelector } from "../../../support/workforceSelector";
import WorkerHelper from "../../../support/helper/workerHelper";

describe("Insights Workers - Favourite Page", { tags: ["Epic:WorkForce", "Feature:Favorites", "Module:Insights-Workers"] }, () => {
  beforeEach(() => {
    cy.loginAndVisit(() => WorkerHelper.visitWorkersInsightPage('500526306'));
  });

  it("Insights-Workers - Insight Workers Verify remove worker from Favorite", { tags: ["Story:Insights Workers Remove From Favorite", "Severity:critical", "UI", "Module:Insights-Workers"] }, () => {
    cy.get(workforceSelector.tableRow).should('be.visible');
    insightsFavouritePage.clickFavouriteButton();
    insightsFavouritePage.assertToastContains("Removed from favorite");
    insightsFavouritePage.assertFavouriteIconNotExists();
    insightsFavouritePage.assertFavouriteLinkNotExists();
  });

  it("Insights-Workers - Verify adding worker as favourite", { tags: ["Story:Insights Workers Add To Favorite", "Severity:critical", "UI", "Module:Insights-Workers"] }, () => {
    cy.get(workforceSelector.tableRow).should('be.visible');
    insightsFavouritePage.clickFavouriteButton();
    insightsFavouritePage.assertToastContains("Added to favorite");
    insightsFavouritePage.assertFavouriteIconVisible();
  });

  it("Insights-Workers - Verify Insights Workers Page Accessibility from Favorites", { tags: ["Story:Insights Workers Access From Favorites", "Severity:normal", "UI", "Module:Insights-Workers"] }, () => {
    cy.get(workforceSelector.tableRow).should('be.visible');
    insightsFavouritePage.assertFavouriteLinkVisible();
    insightsFavouritePage.insightsFavouriteLink.click();
    insightsFavouritePage.assertUrlIncludesInsightsCompanies();
  });

  it("Insights-Workers - Verify Favorite Status Persistence", { tags: ["Story:Insights Workers Favorite Status Persistence", "Severity:normal", "UI", "Module:Insights-Workers"] }, () => {
    cy.get(workforceSelector.tableRow).should('be.visible');
    insightsFavouritePage.visitInsightsCompaniesPage();
    insightsFavouritePage.assertFavouriteIconVisible();
  });

  it("Insights-Workers - Verify that the latest worker added to favorites is displayed at the top of the favorites list.", { tags: ["Story:Insights Workers Favorite List Order", "Severity:normal", "UI", "Module:Insights-Workers"] }, () => {
    cy.get(workforceSelector.tableRow).should('be.visible');
    insightsFavouritePage.favouriteButton.find('[fill="#FACC15"]').then(($icon) => {
      if ($icon.length === 0) {
        insightsFavouritePage.clickFavouriteButton();
      }
      insightsFavouritePage.assertFavouriteIsFirstInList();
    });
  });
});