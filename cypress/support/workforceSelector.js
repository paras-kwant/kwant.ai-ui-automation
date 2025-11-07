export const workforceSelector = {
    addWorkerButton: 'button:contains("Add Worker")',
    submitWorkerButton:'.hdcwLk > button > p:contains("Add Worker")',
    profileImageUploadButton: '.upload-button__camera-icon',
    firstNameInput: 'input[name=firstName]',
    lastNameInput:'input[name=lastName]',
    companyNameInput:'input[name="company"]',
    searchInput:'#search-input',
    updateButton:'button >p:contains("Update")',
    submitButton:'button >p:contains("Submit")',
    saveButton:'button >p:contains("Save")',
    tableRow:'.sc-cRmqLi',
    tableColumn :'.sc-gwZKzw',
    clearFilterButton: '.label.default__label:contains("Clear All")',
    overflowMenu:'.icon-button .sc-cfxfcM.ibPbMT',
    toastMessage:'.sc-kOPcWz',
    toolTip:'.tooltip-content',
    pageOne:() => cy.contains('button', '1'),
    pageTwo: () => cy.contains('button', '2'),
    previousButton:()=> cy.get('.workers-footer button svg').eq(0).closest('button'),
    nextButton: () => cy.get('.workers-footer button svg').eq(1).closest('button'),
    sendAlert:()=>cy.get('.hdcwLk > button'),
    toastMessage:()=>cy.get('.sc-kOPcWz'), 

    DocumentsPage:()=>cy.get('.sc-jXbUNg.gDlPVv').eq(4),
    AddCertificationButton:()=>cy.get('button p').contains('Add Certification'),
    AddLicenceButton:()=>cy.get('button p').contains('Add Licence'),


    jobDetails:()=>cy.get('.sc-jXbUNg.gDlPVv').eq(3),




   personalDetails:()=>cy.get('.sc-jXbUNg.gDlPVv').eq(2),



  };
   