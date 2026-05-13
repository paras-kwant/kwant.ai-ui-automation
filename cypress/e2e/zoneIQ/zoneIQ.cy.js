import zoneIQPage from '../../pages/zoneIQ/zoneIQ'

describe('ZoneIQ', ()=>{
    before(() => {
        cy.login()
    })

    beforeEach(() => {
        cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/location/plan`)
})

it('ZoneIQ - Verify that the zoneIQ page Loads successfully',{tags:['@smoke']}, ()=>{
	zoneIQPage.verifyPageLoads()
})

it('ZoneIQ - Validate Plan map file can be downloaded', {}, ()=>{
	zoneIQPage.downloadPlanMap()
})

it('ZoneIQ - Validate the filter ui opens up when clicked',{tags:[]},()=>{
	zoneIQPage.verifyFilterUI()
})

})