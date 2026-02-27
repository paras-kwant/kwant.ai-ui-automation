// cypress/pages/workforce/addWorkerPage.js
import { addWorkerSelector } from '../../selector/addWorker.js';
import { workforceSelector } from '../../support/workforceSelector';
import { generateWorkerData } from '../../fixtures/workerData.js';

class accessControle2ePage {


get capturePhotoButton()
{
return cy.get(workforceSelector.captureButton)
} 

get submitPhoto(){
	return cy.get(workforceSelector.submitPhotoButton)
}


captureAndSubmitPhoto(){
	this.capturePhotoButton.click()
	cy.wait(1000)
	this.submitPhoto.click()
}
}


export default new accessControle2ePage();
