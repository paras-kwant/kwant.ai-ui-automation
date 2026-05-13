describe('BOBAI', ()=>{
	beforeEach(() => {
	cy.login()
	cy.visit('https://uat.kwant.ai/projects/5007477836/bob-ai-assistant')
  });

	it('BOB AI - Verify landing page UI elements are visible',{tags:['@smoke']}, ()=>{
		cy.get('h2').contains('Bob, the AI Assistant!').should('be.visible')
		cy.get('p').contains('Generate a report...').should('be.visible')
		cy.get('p').contains('Ask a question...').should('be.visible')
		cy.get('[placeholder="Enter your prompt here..."]').should('be.visible')
	})

	it('BOB AI - Verify AI response to "hi" prompt contains project ID',{tags:['@smoke']}, ()=>{
		cy.wait(4000)
		cy.get('[placeholder="Enter your prompt here..."]').type('hi')
		cy.get('[clip-path="url(#send_svg__a)"]').click({force:true})

		cy.contains('p', 'Bob AI Assistant')
			.siblings('div')
			.find('p', { timeout: 60000 })
			.should('contain', '5007477836')
	})


})