import { LightningElement, api } from "lwc";

export default class CellCombobox extends LightningElement {
  @api options;
  @api value;
  @api fieldName;
  @api context;
  @api product2Id;
  @api bundleId;
  @api quantity;
  valuecell;
  showPicklist = false;
  get _options() {
    return JSON.parse(this.options);
  }

  handleChange(event) {
    //show the selected value on UI
    // eslint-disable-next-line @lwc/lwc/no-api-reassignments
    this.value = event.detail.value;
	console.log('@ sus pick 1 '+JSON.stringify((event.detail)));
	console.log('@ sus pick 2 '+JSON.stringify((this.context)));
	console.log('@ sus pick 3 '+JSON.stringify((this.fieldName)));
	console.log('@ sus pick 4 '+JSON.stringify((this.value)));
	console.log('@ sus pick 5 '+JSON.stringify((this.product2Id)));
	console.log('@ sus pick 6 '+JSON.stringify((this.bundleId)));
	console.log('@ sus pick 7 '+JSON.stringify((this.quantity)));

    //fire event to send context and selected value to the data table
    this.dispatchEvent(
      new CustomEvent("picklistchanged", {
        composed: true,
        bubbles: true,
        cancelable: true,
        detail: {
          data: {
            context: this.context,
            fieldName: this.fieldName,
            value: this.value,
            product2Id: this.product2Id,
            bundleId: this.bundleId,
            quantity: this.quantity
          }
        }
      })
    );

    this.closePicklist();
  }

  editPicklist() {
    this.showPicklist = true;
  }

  closePicklist() {
    this.showPicklist = false;
  }
}