class WorkForceOSPage {
    kwantProjectScoreHeading = () => cy.get('p').contains('Kwant Project Score')
    companiesScoreHeading    = () => cy.get('p').contains('Companies Score')
    companiesScoreSearchInput = () => cy.get('[placeholder="Search"]')
    tableRow                  = () => cy.get('[data-testid="table_tr"]')
    customizeLayoutButton = () => cy.get('.hoc-container-body button svg').first()
    saveChangesButton     = () => cy.get('button p').contains('Save Changes')
	deleteButton =()=> cy.get('[data-rbd-draggable-id] svg[fill="#A1AFC0"]').eq(0)
	


    validatePageLoaded() {
        cy.get('body').should('not.contain.text', 'Unexpected Application Error')
        cy.get('body').should('not.contain.text', 'Something went wrong')
        cy.url().should('include', 'workforceOs')
        this.kwantProjectScoreHeading().should('be.visible')
        this.companiesScoreHeading().should('be.visible')
		this.companiesScoreSearchInput().should('be.visible')
        this.tableRow().eq(1).should('be.visible')
    }

    validateSaveButtonVisibleOnCustomizeLayout() {
    this.customizeLayoutButton().click()
    this.saveChangesButton().should('be.visible')
}

deleteAllCustomWidget(){
	cy.get('body').then(($body) => {
		if ($body.find('[data-rbd-draggable-id] svg[fill="#A1AFC0"]').length > 0) {
			this.deleteButton().scrollIntoView().click()
			this.deleteAllCustomWidget()
		} else {
			this.saveChangesButton().click()
			cy.get('[data-rbd-draggable-id]').should('not.exist')
		}
	})
}

addCustomWidget(){
	this.customizeLayoutButton().click()
	this.deleteAllCustomWidget()
	cy.wait(1000)
	this.customizeLayoutButton().click()
	cy.get('p').contains('Add widget').click({ force: true })
	cy.get('.select_item_container svg').then(($svgs) => {
		const randomIndex = Math.floor(Math.random() * $svgs.length)
		const widgetText = $svgs.eq(randomIndex).parent().text().trim()
		cy.log(widgetText)
		cy.get('.select_item_container svg').eq(randomIndex).click()
		this.saveChangesButton().click()
		cy.contains('.label_container', widgetText).should('be.visible')
	})
}

    addWorkersOnsiteWidget(authHeaders) {
        this.customizeLayoutButton().click()
        this.deleteAllCustomWidget()
        cy.wait(1000)
        this.customizeLayoutButton().click()
        cy.get('p').contains('Add widget').click({ force: true })
        cy.get('.select_item_container').contains('Workers On-site').click()
        this.saveChangesButton().click()

        cy.contains('.label_container', 'Workers On-site').should('be.visible')
            .closest('.stat_container')
            .find('.value_container')
            .invoke('text')
            .then((value) => {
                const uiWorkerCount = parseInt(value.trim(), 10)
                cy.log(`UI Workers On-site: ${uiWorkerCount}`)

                const now           = new Date()
                const dayOfWeek     = now.getDay()
                const sunday        = new Date(now)
                sunday.setDate(now.getDate() - dayOfWeek)
                const saturday      = new Date(sunday)
                saturday.setDate(sunday.getDate() + 6)

                const fmt           = (d) => d.toISOString().split('T')[0]
                const weekStartDate = fmt(sunday)
                const endDate       = fmt(saturday)

                cy.request({
                    method: 'POST',
                    url: 'https://uat.kwant.ai/api/getEmployeeTrackingSummary',
                    headers: { ...authHeaders, 'Content-Type': 'application/json' },
                    body: {
                        projectId:   String(Cypress.env('PROJECT_ID')),
                        weekStartDate,
                        endDate,
                        filterCriteria: [],
                        hourType:    'ZONETRANSITION',
                        name:        '',
                        workShift:   null
                    },
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.eq(200)
                    const apiWorkerCount = response.body.info.onsiteWorkers ?? 0
                    cy.log(`API Workers On-site: ${apiWorkerCount}`)
                    expect(uiWorkerCount).to.eq(apiWorkerCount)
                })
            })
    }

    addWorkerConsistencyWidget(authHeaders) {
        this.customizeLayoutButton().click()
        this.deleteAllCustomWidget()
        cy.wait(1000)
        this.customizeLayoutButton().click()
        cy.get('p').contains('Add widget').click({ force: true })
        cy.get('.select_item_container').contains('Worker Consistency').click()
        this.saveChangesButton().click()

        cy.contains('.label_container', 'Worker Consistency').should('be.visible')
            .closest('.stat_container')
            .find('.value_container')
            .invoke('text')
            .then((value) => {
                const uiValue = value.trim()
                cy.log(`UI Worker Consistency: ${uiValue}`)

                const now           = new Date()
                const dayOfWeek     = now.getDay()
                const sunday        = new Date(now)
                sunday.setDate(now.getDate() - dayOfWeek)
                const saturday      = new Date(sunday)
                saturday.setDate(sunday.getDate() + 6)

                const fmt           = (d) => d.toISOString().split('T')[0]
                const weekStartDate = fmt(sunday)
                const endDate       = fmt(saturday)

                cy.request({
                    method: 'POST',
                    url: 'https://uat.kwant.ai/api/getEmployeeTrackingSummary',
                    headers: { ...authHeaders, 'Content-Type': 'application/json' },
                    body: {
                        projectId:      String(Cypress.env('PROJECT_ID')),
                        weekStartDate,
                        endDate,
                        filterCriteria: [],
                        hourType:       'ZONETRANSITION',
                        name:           '',
                        workShift:      null
                    },
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.eq(200)
                    const apiValue = response.body.workerConsistency ?? 0
                    cy.log(`API Worker Consistency: ${apiValue}`)
                    expect(uiValue).to.eq(String(apiValue))
                })
            })
    }

    searchCompany(name) {
        this.companiesScoreSearchInput().clear().type(name)
    }
}

export const workForceOSPage = new WorkForceOSPage()