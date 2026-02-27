import { workforceSelector } from "../../../support/workforceSelector";

class InsightsFavouritePage {
  // ─── Selectors ───────────────────────────────────────────────────────────────

  get tableRow() {
    return cy.get(workforceSelector.tableRow);
  }

  get favouriteButton() {
    return cy.get(".top-nav-left-section [role='button']");
  }

  get favouriteIcon() {
    return cy.get('.top-nav-left-section [role="button"] [fill="#FACC15"]');
  }

  get toastMessage() {
    return cy.get(workforceSelector.toastMessage);
  }

  get insightsFavouriteLink() {
    return cy.get('[title="Insights"]');
  }

  // ─── Actions ─────────────────────────────────────────────────────────────────

  visitInsightsCompaniesPage() {
    cy.visit(`https://uat.kwant.ai/projects/${Cypress.env("PROJECT_ID")}/insights/companies`);
  }

  clickFavouriteButton() {
    this.favouriteButton.should("be.visible").click({ force: true });
  }

  ensurePageIsFavourited() {
    cy.get("body").then(($body) => {
      const favoriteExists = $body.find('[title="Insights"]').length > 0;
      if (favoriteExists) {
        cy.log("Already in favorites");
      } else {
        cy.log("Adding to favorites");
        this.clickFavouriteButton();
        this.assertToastContains("Added to favorite");
        this.insightsFavouriteLink.should("exist");
      }
    });
  }

  // ─── Assertions ──────────────────────────────────────────────────────────────

  assertToastContains(message) {
    this.toastMessage.contains(message).should("be.visible");
  }

  assertFavouriteIconVisible() {
    this.favouriteIcon.should("be.visible");
  }

  assertFavouriteIconNotExists() {
    cy.get('.top-nav-left-section [role="button"][fill="#FACC15"]').should("not.exist");
  }

  assertFavouriteLinkExists() {
    this.insightsFavouriteLink.should("exist");
  }

  assertFavouriteLinkNotExists() {
    this.insightsFavouriteLink.should("not.exist");
  }

  assertFavouriteLinkVisible() {
    this.insightsFavouriteLink.should("be.visible");
  }

  assertUrlIncludesInsightsCompanies() {
    cy.url().should("include", `/projects/${Cypress.env("PROJECT_ID")}/insights/companies`);
  }

  assertFavouriteIsFirstInList() {
    cy.get("[title]").eq(0).should("have.attr", "title", "Insights");
  }
}

export const insightsFavouritePage = new InsightsFavouritePage();