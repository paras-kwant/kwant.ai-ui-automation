/// <reference types="cypress" />
import { validateRequest } from "twilio/lib/webhooks/webhooks";
import companiesHelper from "../../../support/helper/companiesHelper";
import { workforceSelector } from "../../../support/workforceSelector";

describe("Insights Company - Workforce Dashboard Cards", { tags: ["Epic:WorkForce", "Feature:WorkforceDashboard", "Module:Insights-Company"] }, () => {

  beforeEach(() => {
    cy.loginAndVisit(() => companiesHelper.visitCompaniesInsightPage('5007477836'));
	cy.get('.selector-item.last').click()
  });

  it(
	"Insights-Company - Verify Companies On-site today card",
	{
	  tags: [
		"Story:Insights Company Workforce Dashboard Cards Accurate Data",
		"Severity:critical",
		"UI",
		"Module:Insights-Company",
	  ],
	},
	() => {
  
	  cy.intercept(
		"POST",
		"**/api/insight/company/graphAverageWorkersPerDay"
	  ).as("getWorkforceDashboard");
  
	  cy.wait("@getWorkforceDashboard").then(({ response }) => {

		const graphData = response.body;
	  
		const activeDays = graphData.filter(day => day.actualWorkforce > 0);
	  
		const totalWorkers = activeDays.reduce((sum, day) => {
		  return sum + day.actualWorkforce;
		}, 0);
	  
		let expectedAverage = 0;
	  
		if (activeDays.length > 0) {
		  expectedAverage = Math.floor(totalWorkers / activeDays.length);
		}
	
		cy.log("Total Workers:", totalWorkers);
		cy.log("Active Days:", activeDays.length);
		cy.log("Expected Average:", expectedAverage);
		cy.wait(1000)
	  
		cy.contains("Avg Daily Workers")
		  .parent()
		  .parent()
		  .parent()
		  .find(".stat_value")
		  .invoke("text")
		  .then((uiValue) => {
	  
			const uiAverage = parseInt(uiValue.trim());
	  
			expect(uiAverage).to.eq(expectedAverage);
	  
		  });
	  
	  });
  
	}
  );
    it(
      "Insights-Company - Verify Average Worker Hours Daily Card",
      {
        tags: [
          "Story:Insights Company Average Worker Hours Daily",
          "Severity:critical",
          "UI",
          "Module:Insights-Company",
        ],
      },
      () => {

        cy.intercept(
          "POST",
          "**/api/insight/company/graphAverageWorkersPerDay"
        ).as("getWorkers");

        cy.intercept(
          "POST",
          "**/api/insight/company/graphWorkforceZoneCategoryHour"
        ).as("getWorkerHours");

        let totalWorkers = 0;
        let activeDaysCount = 0;

        cy.wait("@getWorkers").then(({ response }) => {

          const graphData = response.body || [];

          const activeDays = graphData.filter(day => day.actualWorkforce > 0);

          totalWorkers = activeDays.reduce((sum, day) => {
            return sum + day.actualWorkforce;
          }, 0);

          activeDaysCount = activeDays.length;

          cy.log("Total Workers:", totalWorkers);
          cy.log("Active Days:", activeDaysCount);

        });
		cy.wait(1000)

        cy.contains("Avg Daily Work Hours").click();

        cy.wait("@getWorkerHours").then(({ response }) => {

          const hourData = response.body || [];

          const activeHourDays = hourData.filter(day => day.workPhaseTimeHour > 0);

          const totalHours = activeHourDays.reduce((sum, day) => {
            return sum + day.workPhaseTimeHour;
          }, 0);

          let avgWorkerHours = 0;

          if (activeHourDays.length > 0 && totalWorkers > 0) {
			avgWorkerHours = +(totalHours / totalWorkers).toFixed(1);
          }

          cy.log("Total Hours:", totalHours);
          cy.log("Total Workers:", totalWorkers);
          cy.log("Active Hour Days:", activeHourDays.length);
          cy.log("Expected Avg Worker Hours:", avgWorkerHours);
		  cy.wait(2000)

          cy.contains("Avg Daily Work Hours")
            .parent()
            .parent()
            .parent()
            .find(".stat_value")
            .invoke("text")
            .then((uiValue) => {

              const uiAverage = parseFloat(uiValue.trim());

              expect(uiAverage).to.be.closeTo(avgWorkerHours, 0.1);

            });

        });

      }
    );
    it("Insights-company - Verify Workforce Consistency Card", () => {
      cy.contains("Workforce Consiste")
        .parent()
        .parent()
        .parent()
        .find(".stat_value")
        .invoke("text")
        .should("match", /^\d+(\.\d+)?%$/); // assert % value
    });
    
    

	it(
  "Insights-Company - average daily worker line in the graph should be displayed with the correct value",
  {
    tags: [
      "Story:Insights Company Average Worker Hours Daily",
      "Severity:critical",
      "UI",
      "Module:Insights-Company",
    ],
  },
  () => {
    cy.wait(3000);

    cy.contains("Avg Daily Workers")
      .parent()
      .parent()
      .parent()
      .find(".stat_value")
      .invoke("text") // use text() for div/span
      .then((textValue) => {
        const value = parseFloat(textValue.replace(/,/g, ""));
        cy.log("Avg Daily Workers value from UI:", value);

        // Now check that the reference line's 'y' attribute equals this value
        cy.get('line.recharts-reference-line-line')
          .should('exist')
          .invoke('attr', 'y') // get the y attribute
          .then((lineY) => {
            const lineYValue = parseFloat(lineY);
            expect(lineYValue).to.eq(value); // directly compare
          });
      });
  }
);


});