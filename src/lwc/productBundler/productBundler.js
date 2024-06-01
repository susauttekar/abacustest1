import { LightningElement, api } from "lwc";
import ProductBundlerApp from "c/productBundlerApp";
import { CloseActionScreenEvent } from "lightning/actions";
// Import message service features required for publishing and the message channel
export default class ProductBundler extends LightningElement {
  @api recordId;
  @api objectApiName;
  @api selectedIds;
  isRendered = false;
  renderedCallback() {
    if (this.isRendered) {
      return;
    }
    this.openProductBundler();
    this.isRendered = true;
  }

  async openProductBundler() {
    const options = {
      recordId: this.recordId,
      objectApiName: this.objectApiName,
      size: "full"
    };
    await ProductBundlerApp.open(options);
    this.dispatchEvent(new CloseActionScreenEvent());
  }
}