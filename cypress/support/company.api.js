export const createCompany = (companyData) => {
	return cy.request({
	  method: "POST",
	  url: "/api/companies",
	  body: companyData,
	}).then((res) => {
	  expect(res.status).to.eq(201);
	  return res.body;
	});
  };
  
  export const deleteCompany = (companyId) => {
	return cy.request({
	  method: "DELETE",
	  url: `/api/companies/${companyId}`,
	  failOnStatusCode: false,
	});
  };
  