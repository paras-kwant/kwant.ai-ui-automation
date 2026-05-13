class ZoneIQPage {

    // Selectors
    addPlanButton = () => cy.get('button p').contains('Add Plan')
    sendAlertButton = () => cy.get('button p').contains('Send Alert')
    statContainers = () => cy.get('.stat_container')
    labelContainer = ($container) => cy.wrap($container).find('.label_container')
    valueContainer = ($container) => cy.wrap($container).find('.value_container')
    dotsMenuButton = () => cy.get('.content_dots button')
    planNameText = () => cy.get('.expandable_dropdown_topsection button p')
    canvas = () => cy.get('canvas')
    downloadOption = () => cy.get('.select_item_container p').contains('Download')
    filterButton = () => cy.get('.content_filter')
    filterHeading = () => cy.get('h1').contains('Filters')
    filterDropdowns = () => cy.get('.select-container')

    verifyPageLoads() {
        cy.url().should('include', 'location/plan')
        this.addPlanButton().should('be.visible')
        this.sendAlertButton().should('be.visible')

        const expectedLabels = ['Workers on Floor', 'Companies on Floor', 'Sensors on Floor', 'Zones', 'Gateways']

        this.statContainers().should('have.length', expectedLabels.length)

        this.statContainers().each(($container, index) => {
            this.labelContainer($container).invoke('text').then((labelText) => {
                expect(labelText.trim()).to.eq(expectedLabels[index])
            })
            this.valueContainer($container).invoke('text').then((valueText) => {
                expect(valueText.trim()).to.match(/\d+/)
            })
        })
    }

    downloadPlanMap() {
        const DOWNLOADS_FOLDER = Cypress.config('downloadsFolder')

        this.dotsMenuButton().click()

        this.planNameText().invoke('text').then((text) => {
            const floorName = text.trim().split(' - ').pop().trim()
            cy.log(`Floor name: ${floorName}`)

            cy.task('deleteDownloadedFiles', {
                downloadsFolder: DOWNLOADS_FOLDER,
                pattern: floorName,
                extension: '.png'
            })

            this.canvas().should('be.visible')
            this.downloadOption().click()

            cy.wrap(null).then(() => {
                const checkFile = () =>
                    cy.task('getLatestDownloadedFile', {
                        downloadsFolder: DOWNLOADS_FOLDER,
                        prefix: floorName
                    }).then((fileName) => {
                        if (!fileName) {
                            cy.wait(1000)
                            return checkFile()
                        }
                        return fileName
                    })
                return checkFile()
            }).then((fileName) => {
                expect(fileName).to.include(floorName)
            })
        })
    }

    verifyFilterUI() {
        this.filterButton().click()
        this.filterHeading().should('be.visible')

        const labelList = ['Worker Name', 'Company Name', 'Cost Code', 'Pay Group', 'Job Title']
        labelList.forEach((label) => {
            this.filterDropdowns().contains(label).should('be.visible')
        })
    }
}

export default new ZoneIQPage()
