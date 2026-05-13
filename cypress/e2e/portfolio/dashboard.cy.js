import {dashboardPage} from '../../pages/portfolio/dashboard'

describe("Portfolio Dashboard - Overview Validation", { tags: ["Epic:Portfolio", "Feature:Dashboard", "Module:Portfolio-Dashboard"] }, () => {

  beforeEach(() => {
	cy.login()
	cy.visit('/')
  });

  it('Portfolio-Dashboard  - Dashboard section as we login ', { tags: ["Story:Overview Section Visibility", "Severity:critical", "UI", "@smoke"] }, () => {
	dashboardPage.validateDashboardUI()
  });

  it('Portfolio-Dashboard  - Validate the adding project form  ', { tags: ["Story:Validate Project Count", "Severity:critical", "UI", "@smoke"] }, () => {
	dashboardPage.ValidateAddNewProjectForm()
  })

});