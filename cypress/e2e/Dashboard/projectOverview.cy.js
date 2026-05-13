const localDateStr = (d) => {
    const year  = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day   = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const getCurrentWeekRange = () => {
    const now      = new Date()
    const sunday   = new Date(now)
    sunday.setDate(now.getDate() - now.getDay())
    const saturday = new Date(sunday)
    saturday.setDate(sunday.getDate() + 6)
    return { weekStartDate: localDateStr(sunday), endDate: localDateStr(saturday) }
}

const getLuzmoDashboardBody = () => {
    return cy.get('luzmo-embed-dashboard#main-dashboard')
        .shadow()
        .find('.luzmo-container-loader').should('not.be.visible')
        .then(() =>
            cy.get('luzmo-embed-dashboard#main-dashboard')
                .shadow()
                .find('iframe.luzmo-embed-dashboard')
                .its('0.contentDocument.body')
                .should('not.be.empty')
        )
}

describe('Dashboard - Project Overview', () => {
    before(() => {
        cy.login()
    })

    beforeEach(() => {
        cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/project-overview`)
    })

    it('should display the project overview page correctly', { tags: ['@smoke'] }, () => {
        const expectedLabels = [
            'Workers On-site Today',
            'Companies On-site Today',
            'Safety Alerts By Week',
            'Trades On-Site Today'
        ]

        cy.get('.top-nav-left-section').contains('Project Overview').should('be.visible')
        cy.get('luzmo-embed-dashboard#main-dashboard').should('be.visible')

        getLuzmoDashboardBody().then(($body) => {
            expectedLabels.forEach((label) => {
                cy.wrap($body).contains('.title.user-entry', label).should('be.visible')
            })
            cy.wrap($body).find('.master-number')
                .should('have.length', expectedLabels.length)
                .each(($el) => {
                    cy.wrap($el).should('be.visible')
                        .invoke('text').then((val) => cy.log(`Value: ${val.trim()}`))
                })
        })
    })

    it('should validate Workers On-site Today count in Luzmo matches API', { tags: ['@smoke'] }, () => {
        let authHeaders = {}
        cy.intercept('GET', '/api/projectConfigs', (req) => {
            authHeaders = {
                'x-auth-token':   req.headers['x-auth-token'],
                'x-auth-project': req.headers['x-auth-project']
            }
        }).as('projectConfigs')

        cy.reload()
        cy.wait('@projectConfigs')

        getLuzmoDashboardBody().then(($body) => {
            cy.wrap($body)
                .contains('.title.user-entry', 'Workers On-site Today')
                .closest('.number-object-outer-wrapper')
                .find('.master-number')
                .invoke('text')
                .then((uiValue) => {
                    const uiCount = parseInt(uiValue.trim(), 10)
                    cy.log(`UI Workers On-site Today: ${uiCount}`)

                    const { weekStartDate, endDate } = getCurrentWeekRange()
                    cy.log(`Week range: ${weekStartDate} → ${endDate}`)

                    cy.request({
                        method: 'POST',
                        url: `${Cypress.config('baseUrl')}/api/getEmployeeTrackingSummary`,
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
                        const apiCount = response.body.info.onsiteWorkers ?? 0
                        cy.log(`API Workers On-site: ${apiCount}`)
                        expect(uiCount).to.eq(apiCount)
                    })
                })
        })
    })
})
