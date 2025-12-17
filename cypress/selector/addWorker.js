export const addWorkerSelector = {
    addWorkerButton: () => cy.contains('button', 'Add Worker'),
  
    firstNameInput: () => cy.get('input[name="firstName"]'),
    lastNameInput: () => cy.get('input[name="lastName"]'),
    company: () => cy.get('input[name="company"]'),
  
    addMoreDetail: () => cy.contains('button', 'Add More Details'),
    submitWorkerButton:()=> cy.contains('footer [label="Add Worker"] button', 'Add Worker'),
    profileUploadIcon: () => cy.get('.upload-button__camera-icon'),
    imageUploader: () => cy.get('#worker_image_uploader'),
    profileImageUploadButton: () => cy.get('.upload-button__camera-icon'),
    addMoreDetail:()=> cy.contains('button', 'Add More Details'),
    toastMessage:()=>cy.get('.sc-kOPcWz'),
    emailInput:()=> cy.get('[name="email"]'),
    clickPictureButton:()=>cy.get('.hdcwLk > button > p'),
    phoneInput:()=>cy.get('[name="phone"]'),
    emailInput:()=> cy.get('[name="email"]'),
    addressInput:()=> cy.get('input[name=address]'),
    zipcodeInput:()=>cy.get('input[name=zipCode]'),
    dobInput:()=>cy.get('[placeholder="Select Date of Birth"]'),
    jobTitleInput:()=> cy.get('[name="title"]'),
    employeeIdInput:()=>cy.get('[name="employeeId"]'),
    dollarPerManHour:()=>cy.get('[name="dollarPerManHour"]'),
    addCertificationButton:()=> cy.contains('button', 'Add Certification'),
    credentialIdInput:()=>cy.get('[name="credentialId"]'),
    raceInput:()=>cy.get('[name="raceName"]'),
    emergencyContactNameInput:()=>cy.get('[name="emergencyContactName"]'),
    emergencyContactPhoneInput:()=>cy.get('[name="emergencyContactPhone"]'),
    emergencyContactAddressInput:()=>cy.get('[name="emergencyContactAddress"]'),
    submitButton:()=> cy.contains('button', 'Submit'),
    takeAPictureButton:()=>cy.get('.upload-button__upload-options__option').eq(1),
    submitPhotoButton:()=>cy.contains('button>p','Submit Photo'),


  };
  