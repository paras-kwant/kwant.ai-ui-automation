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

              expect(uiAverage).to.be.closeTo(avgWorkerHours, 0.3);

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



it('Insights-Company - Validate Avg Daily Work Hours graph tooltip content matches backend API data on hover', ()=>{
  cy.intercept(
    "POST",
    "**/api/insight/company/graphWorkforceZoneCategoryHour"
  ).as("getWorkerHours")

  cy.wait(3000)
  cy.contains("Avg Daily Work Hours").click()

  cy.wait("@getWorkerHours").then(({ response }) => {
    const graphData = response.body || []
    const filteredData = graphData.filter(
      d => !(d.workPhaseTimeHour === 0 && d.slackTimeHour === 0)
    )
    
    const totalBars = filteredData.length
    cy.log(`Valid records (excluding 0/0): ${totalBars}`)
    cy.log(`Total records from API: ${totalBars}`)

    const validatedDates = new Set()

    const validateTooltip = (tooltipText, matchedData) => {
      cy.get('[role="dialog"]').within(() => {
        cy.contains(matchedData.date).should('exist')
        cy.contains(matchedData.workPhaseTimeHour.toString()).should('exist')
        if (matchedData.slackTimeHour === 0 || matchedData.slackTimeHour === 0.0) {
          cy.contains('N/A').should('exist')
        } else {
          cy.contains(matchedData.slackTimeHour.toString()).should('exist')
        }
      })
    }

    cy.get('.recharts-rectangle.productive')
      .should('have.length', totalBars)
      .then(() => {
        Cypress._.times(totalBars, (index) => {

          cy.get('.recharts-rectangle.productive')
            .eq(index)
            .then(($rect) => {
              const width = $rect[0].getBoundingClientRect().width
              const height = $rect[0].getBoundingClientRect().height

              if (width === 0 || height === 0) {
                cy.log(`⚠️ Skipping index ${index} - zero size`)
                return
              }

              // ✅ first try center hover
              cy.get('.recharts-rectangle.productive')
                .eq(index)
                .realHover({ position: 'center' })
                .wait(400)

              cy.get('[role="dialog"]').then(($tooltip) => {
                const tooltipText = $tooltip.text()

                if (!tooltipText.includes('Invalid Date')) {
                  const matchedData = graphData.find(d => tooltipText.includes(d.date))
                  if (matchedData) {
                    validatedDates.add(matchedData.date)
                    cy.log(`✅ [CENTER] Matched: ${matchedData.date} | workPhase: ${matchedData.workPhaseTimeHour} | slack: ${matchedData.slackTimeHour}`)
                    validateTooltip(tooltipText, matchedData)
                  } else {
                    throw new Error(`❌ No API match found for tooltip: "${tooltipText}"`)
                  }
                } else {
                  cy.log(`⚠️ Center hover invalid for index ${index}, retrying with bottom...`)

                  cy.get('.recharts-rectangle.productive')
                    .eq(index)
                    .realHover({ position: 'bottom' })
                    .wait(400)

                  cy.get('[role="dialog"]').then(($tooltipRetry) => {
                    const retryTooltipText = $tooltipRetry.text()
                    cy.log(`Retry tooltip text for index ${index + 1}: ${retryTooltipText}`)

                    if (!retryTooltipText.includes('Invalid Date')) {
                      const matchedData = graphData.find(d => retryTooltipText.includes(d.date))
                      if (matchedData) {
                        validatedDates.add(matchedData.date)
                        cy.log(`✅ [BOTTOM] Matched: ${matchedData.date} | workPhase: ${matchedData.workPhaseTimeHour} | slack: ${matchedData.slackTimeHour}`)
                        validateTooltip(retryTooltipText, matchedData)
                      } else {
                        throw new Error(`❌ No API match found for retry tooltip: "${retryTooltipText}"`)
                      }
                    } else {
                      cy.log(`⚠️ Bottom hover also invalid for index ${index} - skipping`)
                    }
                  })
                }
              })
            })
        })

        cy.then(() => {
          const allDates = filteredData.map(d => d.date)
          const missedDates = allDates.filter(d => !validatedDates.has(d))

          if (missedDates.length > 0) {
            missedDates.forEach(date => {
              const missed = graphData.find(d => d.date === date)
              cy.log(`❌ MISSED: ${missed.date} | day: ${missed.day} | workPhase: ${missed.workPhaseTimeHour} | slack: ${missed.slackTimeHour}`)
            })
            throw new Error(`❌ These dates were never validated: ${missedDates.join(', ')}`)
          }

          cy.log(`✅ All ${validatedDates.size}/${totalBars} dates validated successfully!`)
        })
      })
  })
})


it('Insights-Company - Verify Workforce Consistency graph is visible', ()=>{
  cy.wait(3000)
  cy.contains("Workforce Consistency").click()
  cy.get('.recharts-cartesian-grid').should('be.visible')
})

it('Insights-Company - Verify Avg Daily Workers tooltip on hover', ()=>{
  cy.wait(3000)
  cy.get('p').contains('Avg Daily Workers').parent().parent().find('svg').eq(1).realHover()
  cy.contains('Avg. number of daily active workers.').should('be.visible')
})

it('Insights-Company - Verify Avg Daily Work Hours tooltip on hover', ()=>{
  cy.wait(3000)
  cy.get('p').contains('Avg Daily Work Hours').parent().parent().find('svg').eq(1).realHover()
  cy.contains('Avg. hours each workers puts in daily.').should('be.visible')
})

it('Insights-Company - Verify Workforce Consistency tooltip on hover', ()=>{
  cy.wait(3000)
  cy.get('p').contains('Workforce Consistency').parent().parent().find('svg').eq(1).realHover()
  cy.contains('Consistency in your workforce based on attendance and repeat workers.').should('be.visible')
})


it('Insights-Company - Verify Workforce Variance dialog is visible on Avg Daily Workers graph hover', () => {
  cy.get('[name="Workforce Variance"]').first().realHover()
  cy.get('[role="dialog"]').should('be.visible').within(() => {
    cy.contains('span', 'Actual Workforce').should('be.visible')
    cy.contains('span', 'Budgeted Workforce').should('be.visible')
    cy.contains('span', 'Workforce Variance').should('be.visible')
  })
})
})