describe('Team Member API Test', () => {
  it('should call filterTeamMember API', () => {
 
    cy.visit('https://app.kwant.ai/')
    cy.get('[name="email"]').type(Cypress.env('EMAIL'))
    cy.get('[name="password"]').type(Cypress.env('PASSWORD'))
    cy.get('button p').click()
    cy.get('#project-card-container').eq(0).click()
    cy.get('a > .sc-djTQaJ > .icon-button').click()
    cy.get('a').contains('Team').click()
    cy.get('.personal-info-content').should('contain', 'Bipul Thapa')



    cy.intercept('POST', '/api/filterTeamMember*').as('apiCall')
    cy.reload() 

    cy.wait('@apiCall').then((req) => {
      cy.request({
        method: 'POST',
        url: '/api/filterTeamMember?page=0&size=100&sort=name',
        headers: {
          'x-auth-project': req.request.headers['x-auth-project'],
          'x-auth-token': req.request.headers['x-auth-token']
        },
        body: { "searchCriteriaList": [], "filterText": "" }
      }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body.teamMemberDTOS).to.have.length.above(0)
        
        const bipul = res.body.teamMemberDTOS.find(m => m.name.includes('Bipul Thapa'))
        expect(bipul).to.exist
        
        cy.log(`API returned ${res.body.teamMemberDTOS.length} team members`)
      })
    })
  })
})