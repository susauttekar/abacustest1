import { LightningElement ,api,wire} from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import modal from "@salesforce/resourceUrl/custommodalcss";
import { CloseActionScreenEvent } from "lightning/actions";
import { loadStyle } from "lightning/platformResourceLoader";

export default class ProductBundleMain extends LightningElement {
  @api  recordId; 
     connectedCallback() {
    loadStyle(this, modal);
  }
  closeAction() {
    this.dispatchEvent(new CloseActionScreenEvent());
  }
    renderedCallback() {
        console.log('rendered------------');
        console.log(this.recordId + ' is provided');
    }
     get inputVariables() {
        return [
            {
                name: 'recordId',
                type: 'String',
                value: this.recordId
            }
        ];
    }
handleStatusChange(event) {
    console.log("event detail",event.detail.status);
 
if(event.detail.status === "FINISHED") {
 
    //Get the flow output variable and store it.
    const outputVariables = event.detail.outputVariables;
     const event = new ShowToastEvent({
          title: 'Message',
          message: 'Inventory Allocated.',
          variant: 'success',
        });
        this.dispatchEvent(event);
        this.closeModal();
        eval("$A.get('e.force:refreshView').fire()");
        
                }
            }
             @wire(CurrentPageReference)
 getStateParameters(currentPageReference) {
     if (currentPageReference) {
         this.recordId = currentPageReference.state.recordId;
          console.log(this.recordId + ' is wire');
     }
 }
}