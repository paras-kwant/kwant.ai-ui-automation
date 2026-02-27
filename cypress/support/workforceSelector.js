

export const workforceSelector = {
    addWorkerButton: () => cy.contains('button', 'Add Worker'),


    firstNameInput: () => cy.get('input[name="firstName"]'),
    lastNameInput: () => cy.get('input[name="lastName"]'),
    companyNameInput: () => cy.get('input[name="company"]'),
    addMoreDetail:()=> cy.contains('button', 'Add More Details'),
    submitWorkerButton:()=> cy.contains('footer [label="Add Worker"] button', 'Add Worker'),

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
    credentialIdInput:()=>cy.get('[name="credentialId"]'),
    submitButton:()=> cy.contains('button', 'Submit'),
    takeAPictureButton:()=>cy.get('.upload-button__upload-options__option').eq(1),
    clickPictureButton:()=>cy.get('.hdcwLk > button > p'),
    submitPhotoButton:()=>cy.contains('button>p','Submit Photo'),

    // profileImageUploadButton: '.upload-button__camera-icon',
    // firstNameInput: 'input[name=firstName]',
    // lastNameInput:'input[name=lastName]',
    // companyNameInput:'input[name="company"]',
    searchInput:'[placeholder="Search"]',


    updateButton:'button p:contains("Update")',
    jobDetailsPage: '[data-testid="job-details-tab"] > *',
    personalDetailsPage: '[data-testid="personal-details-tab"] >',
    accessControlPage: '[data-testid="access-control-tab"] > *',
    generalDetailsPage: '[data-testid="general-details-tab"] > *',
    documentPage: '[data-testid="documents-tab"] > *',
    fieldSettingPage: '[data-testid="fields-settings-tab"] > *',
    SafetyAuditPage: '[data-testid="safety-audit-tab"] > *',
    
    AccessControl:()=>cy.get('.sc-iGgWBj.sc-gsFSXq:eq(4)'),
    SafetyAudit:()=>cy.get('.sc-iGgWBj.sc-gsFSXq:eq(5)'),
    documentUploadInput:()=>'button.sc-stxIr',

    saveButton:'button p:contains("Save")',
    tableRow:'[data-testid="table_tr"]*',
    
    tableColumn :'[data-testid="table-column"]*',
    clearFilterButton: '.label.default__label:contains("Clear All")',
    overflowMenu:'.filters-header-container__right-section .icon-button',
    toastMessage:'[id="toasts"]',
    toolTip:'.tooltip-content',
    pageOne:() => cy.contains('button', '1'),
    pageTwo: () => cy.contains('button', '2'),
    pageThree: () => cy.contains('button', '3'),
    pageFour: () => cy.contains('button', '4'),
    previousButton:()=> cy.get('[data-testid="table-pagination"] button').eq(0),
    nextButton: () => cy.get('.workers-footer button svg').eq(1).closest('button'),
    // lastPageButton:()=> cy.get('.workbutton.sc-ktJbId.dbOXEy:nth-child(6)'),
    lastPageButton:() => cy.get('[data-testid="table-pagination"] button')
    .not(':has(svg)')
    .last(),
    // toastMessage:()=>cy.get('[id="toasts"]'), 


    FieldSetting:()=>cy.get('.sc-jXbUNg.gDlPVv:nth-child(7)'),
    AddCertificationButton:()=>cy.get('button p').contains('Add Certification'),
    AddLicenceButton:()=>cy.get('button p').contains('Add Licence'),


   selectAllCheckbox: () => cy.get('.header-checkbox-container [type="checkbox"]').eq(0),


   nameFilter: () => cy.contains('.sc-cvalOF', 'Name').parent().find('.table-header-filter-btn svg'),

   captureButton:'button p:contains("Capture Photo")',
   submitPhotoButton:'button p:contains("Submit Photo")',
   addMoreDetailsButton:'button p:contains("Add more details")',
   dragAndDrop:'button:contains("Choose File")',
   submitCompanyButton: 'footer [label="Add Company"] button, .right_button_section [label="Add Company"] button',
   addCompanyButton:'[label="Add Company"] button', 
   companyDocumentPage: '[data-testid="documents-tab"] > *',
   companyWorkerPage: '[data-testid="workers-tab"] > *',
   submitButton:'button p:contains("Submit")',
   documentTableRow:'[overflow="scroll"] [data-testid="table_tr"]*',   
   removeButton: 'button p:contains("Remove")',
   submitButton:'button p:contains("Submit")',
   sendAlertButton:'button p:contains("Send Alert")',
   confirmSendAlertButton:'footer [label="Send Alert"]',
   cancelButton:'button p:contains("Cancel")',
   licencesTab: '.sc-bVVIoq:contains("Licences")',
   CertificationsTab: '.sc-bVVIoq:contains("Certifications")',
   addCertificationButton: 'button p:contains("Add Certification")',
   backButton: 'button p:contains("Back")',
   sendAlertButton:'footer button p:contains("Send Alert")'
  };


  // .sc-drFUgV new row
  // .sc-dfauwV  new column