export const workforceSelector = {
    addWorkerButton: () => cy.contains('button', 'Add Worker'),
    firstNameInput: () => cy.get('input[name="firstName"]'),
    lastNameInput: () => cy.get('input[name="lastName"]'),
    companyNameInput: () => cy.get('input[name="company"]'),
    addMoreDetail:()=> cy.contains('button', 'Add More Details'),
    submitWorkerButton:()=> cy.contains('.hdcwLk > button > p', 'Add Worker'),
    profileImageUploadButton: () => cy.get('.upload-button__camera-icon'),
    addressInput:()=> cy.get('input[name=address]'),
    zipcodeInput:()=>cy.get('input[name=zipCode]'),
    phoneInput:()=>cy.get('[name="phone"]'),
    emailInput:()=> cy.get('[name="email"]'),
    dobInput:()=>cy.get('[placeholder="Select Date of Birth"]'),
    raceInput:()=>cy.get('[name="raceName"]'),
    emergencyContactNameInput:()=>cy.get('[name="emergencyContactName"]'),
    emergencyContactPhoneInput:()=>cy.get('[name="emergencyContactPhone"]'),
    emergencyContactAddressInput:()=>cy.get('[name="emergencyContactAddress"]'),
    jobTitleInput:()=> cy.get('[name="title"]'),
    employeeIdInput:()=>cy.get('[name="employeeId"]'),
    dollarPerManHour:()=>cy.get('[name="dollarPerManHour"]'),
    addCertificationButton:()=> cy.contains('button', 'Add Certification'),
    credentialIdInput:()=>cy.get('[name="credentialId"]'),
    submitButton:()=> cy.contains('button', 'Submit'),
    takeAPictureButton:()=>cy.get('.upload-button__upload-options__option').eq(1),
    clickPictureButton:()=>cy.get('.hdcwLk > button > p'),
    submitPhotoButton:()=>cy.contains('button>p','Submit Photo'),

    // profileImageUploadButton: '.upload-button__camera-icon',
    // firstNameInput: 'input[name=firstName]',
    // lastNameInput:'input[name=lastName]',
    // companyNameInput:'input[name="company"]',
    searchInput:'#search-input',
    updateButton:'button >p:contains("Update")',
    // submitButton:'button >p:contains("Submit")',
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
    AccessControl:()=>cy.get('.sc-jXbUNg.gDlPVv').eq(5),
    SafetyAudit:()=>cy.get('.sc-jXbUNg.gDlPVv').eq(6),




   personalDetails:()=>cy.get('.sc-jXbUNg.gDlPVv').eq(2),



  };
   