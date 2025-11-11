// cypress/fixtures/workerData.js
export const generateWorkerData = () => {
  return {
    firstName: `John${Math.floor(Math.random() * 100000000)}`,
    lastName: 'Doe',
  };
};
