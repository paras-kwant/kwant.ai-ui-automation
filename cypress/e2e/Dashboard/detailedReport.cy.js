describe('Dashboard - Detailed Report', () => {
    before(() => {
        cy.login()
    })

    beforeEach(() => {
		cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/project-overview`)
		cy.get('.top-nav-left-section').should('be.visible')
        cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/detailed-reports`)
		cy.url().should('include', 'detailed-reports')
    })


	it('should display the detailed report page correctly', { tags: ['@smoke'] }, () => {
		cy.get('.top-nav-left-section').contains('Detailed Reports').should('be.visible')
		cy.get('luzmo-embed-dashboard#detailed-report').shadow()
			.find('.luzmo-container-loader').should('not.be.visible')
		cy.get('luzmo-embed-dashboard#detailed-report').shadow()
			.find('iframe.luzmo-embed-dashboard')
			.its('0.contentDocument.body').should('not.be.empty')
			.then(($body) => {
				cy.wrap($body).find('h2').contains('Surf Avenue - Workforce Overview').should('be.visible')
				cy.wrap($body).find('span').contains('Export').scrollIntoView().should('be.visible').click()
				cy.wrap($body).find('span').contains('Download PNG').should('be.visible').click()
			})
			cy.readFile(`${Cypress.config('downloadsFolder')}/export.png`, { timeout: 30000 }).should('exist')
	})
})
