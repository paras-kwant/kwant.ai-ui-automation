class DashboardPage {
	projectSearchInput = () => cy.get('[id="search-input"]')
	projectCard=()=>cy.get('#project-card-container')
	onsiteWorkerCount=()=>cy.get('.project-members-count')
	addNewProjectButton =()=>cy.get('[label="Add New Project"]')



	validateDashboardUI() {
	this.addNewProjectButton().should('be.visible')
	  this.projectSearchInput().should('be.visible')
	  this.projectCard().should('be.visible')

	  this.onsiteWorkerCount().each(($el) => {
      const text = $el.text().trim()
      const count = parseInt(text, 10)
      expect(count).to.not.be.NaN
       expect(count).to.be.greaterThan(-1)
})

	}
	ValidateAddNewProjectForm() {
		this.addNewProjectButton().click()

		const formLabels = ['General Details', 'Invite Users', 'Schedule', 'Additional Info']
		formLabels.forEach(label => {
			cy.get('label').contains(label).should('be.visible')
		})

	}
	
		}
  
  export const dashboardPage = new DashboardPage()