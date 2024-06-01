import { LightningElement, api } from "lwc";

export default class CellCombobox extends LightningElement {
  @api options;
  @api value;
  @api fieldName;
  @api context;
  showPicklist = false;
  get _options() {
    return JSON.parse(this.options);
  }

  handleChange(event) {
    //show the selected value on UI
    // eslint-disable-next-line @lwc/lwc/no-api-reassignments
    this.value = event.detail.value;

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
            value: this.value
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