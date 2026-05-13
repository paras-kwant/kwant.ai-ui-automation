import { workForceOSPage } from '../../pages/workForceOS/workForceOS'

describe('WorkForceOS', () => {
    let authHeaders = {}

    before(() => {
        cy.login()
    })

    beforeEach(() => {
        cy.intercept('GET', '/api/projectConfigs', (req) => {
            authHeaders = {
                'x-auth-token': req.headers['x-auth-token'],
                'x-auth-project': req.headers['x-auth-project']
            }
        }).as('getConfig')

        cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/project-overview`)
        cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workforceOs`)
    })

    it('WorkForceOS - Verify that the workforce OS page loads successfully', { tags: ['Story:WorkForceOS Page Load', 'Severity:critical', '@smoke'] }, () => {
        workForceOSPage.validatePageLoaded()
    })

    it('WorkForceOS - Validate that save button is visible when user customize layout', () => {
		workForceOSPage.validatePageLoaded()
		workForceOSPage.validateSaveButtonVisibleOnCustomizeLayout()
    })

it('WorkForceOS - Verify Removing all the Custom widget', ()=>{
	workForceOSPage.validatePageLoaded()
	workForceOSPage.validateSaveButtonVisibleOnCustomizeLayout()
	workForceOSPage.deleteAllCustomWidget()
})

it('WorkForceOS - Validate Adding customize widget', ()=>{
	workForceOSPage.validatePageLoaded()
	workForceOSPage.addCustomWidget()
})

it('WorkForceOS - Validate the Kwant Project Score is accurate',{tags:['@smoke']}, ()=>{
	cy.intercept('GET' , 'https://uat.kwant.ai/api/workforceOS/getProjectMetrices').as('projectScoreAPI')
	workForceOSPage.validatePageLoaded()
	cy.wait('@projectScoreAPI').then(({ response }) => {
		expect(response.statusCode).to.eq(200)

		const metrics     = response.body.metricsDTOS
		const healthScore = metrics.find(m => m.name === 'HEALTH_SCORE')

		const todayScore     = Math.round(parseFloat(healthScore.value))
		const yesterdayScore = Math.round(parseFloat(healthScore.value) - healthScore.change)
		const lastMonthScore = Math.round(parseFloat(healthScore.value) - healthScore.lastMonthChange)

		cy.log(`Today's Score     : ${todayScore}`)
		cy.log(`Yesterday's Score : ${yesterdayScore}`)
		cy.log(`Last Month's Score: ${lastMonthScore}`)

		const roundedYesterdayChange = Math.round(Math.abs(healthScore.change))
		const roundedLastMonthChange = Math.round(Math.abs(healthScore.lastMonthChange))

		// Yesterday change
		if (roundedYesterdayChange < 1) {
			cy.contains('No change').should('be.visible')
			cy.contains('than yesterday').should('be.visible')
		} else {
			cy.contains(`${roundedYesterdayChange}`).should('be.visible')
			cy.contains('than yesterday').should('be.visible')
		}

		if (roundedLastMonthChange < 1) {
			cy.contains('No change').should('be.visible')
			cy.contains('than last month').should('be.visible')
		} else {
			cy.contains(`${roundedLastMonthChange}`).should('be.visible')
			cy.contains('than last month').should('be.visible')
		}
	})
})

it('delete all the customize tab and add Add workers On-site ', {tags: ['@smoke']}, () => {
	let headers = {}
	cy.intercept('GET', '**/api/workforceOS/getProjectMetrices**', (req) => {
		headers = {
			'x-auth-token':   req.headers['x-auth-token'],
			'x-auth-project': req.headers['x-auth-project']
		}
	}).as('workforceMetrics')
	workForceOSPage.validatePageLoaded()
	cy.wait('@workforceMetrics').then(() => {
		workForceOSPage.addWorkersOnsiteWidget(headers)
	})
})
// it.skip('delete all the customize tab and add Worker Consistency', {tags: ['@smoke']}, function() {
// 	this.skip()
// 	let headers = {}
// 	cy.intercept('GET', '**/api/workforceOS/getProjectMetrices**', (req) => {
// 		headers = {
// 			'x-auth-token':   req.headers['x-auth-token'],
// 			'x-auth-project': req.headers['x-auth-project']
// 		}
// 	}).as('workforceMetrics')
// 	workForceOSPage.validatePageLoaded()
// 	cy.wait('@workforceMetrics').then(() => {
// 		workForceOSPage.addWorkerConsistencyWidget(headers)
// 	})
// })






})