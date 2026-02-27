// cypress/fixtures/workerData.js

export const generateWorkerData = () => {
  return {
    firstName: `John${Math.floor(Math.random() * 100000000)}`,
    lastName: 'Doe',
    projectTaskTradeName: "ABG",
    projectTaskTradeId: "1228"
  };
};

export function generateCompanyData() {
  const randomId = Math.floor(Math.random() * 1000000);
  return {
    companyName: `TestCompany${randomId}`,
    email: `test${randomId}@example.com`,
    zipCode: "44600",
    certificates: "ISO 9001",
    primaryTrade: "Electrical",
    phoneNumber: `+9779868${Math.floor(100000 + Math.random() * 899999)}`,
    address: generateRandomWorldAddress(), // ✅ Dynamic London address
    projectId: "500526306" // ✅ ADD THIS
    // OR dynamically:
    // projectId: Cypress.env("PROJECT_ID")
  };
}

export const generateRandomEmail = () => {
  return `user${Math.floor(Math.random() * 100000000)}@example.com`;
};

export function generateRandomWorldAddress() {
  const streets = [
    'Main Street', 'High Street', 'Elm Street', 'Maple Avenue', 'Park Avenue',
    'Sunset Boulevard', 'Oak Lane', 'King\'s Road', 'Queen Street', 'Victoria Road',
    'Broadway', 'Church Street', 'Hill Road', 'Lakeview Drive', 'River Road'
  ];

  const cities = [
    'London, UK', 'New York, USA', 'Paris, France', 'Tokyo, Japan', 'Sydney, Australia',
    'Berlin, Germany', 'Toronto, Canada', 'Barcelona, Spain', 'Dubai, UAE', 'Singapore'
  ];

  const street = streets[Math.floor(Math.random() * streets.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];

  return `${street}, ${city}`;
}

export function generateTemplateName() {
  return `Template${Math.floor(Math.random() * 1000000)}`;
}

export function generateCredentialID(length = 16) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}


