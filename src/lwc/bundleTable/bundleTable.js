import { LightningElement, api } from "lwc";
import { CloseActionScreenEvent } from "lightning/actions";

export default class BundleTable extends LightningElement {
  handleClose() {
    this.dispatchEvent(new CloseActionScreenEvent());
  }
  @api items = [];
  @api selectedRows = [];

  @api keyField = "Id";
  @api name = "bundleTable";
  get _selectedRows() {
    return this.selectedRows;
  }

  selectedProducts = [];
  get selectedCount() {
    return this.selectedRows.length ? this.selectedRows.length : "0";
  }
  get disabled() {
    return this.selectedProducts.length === 0;
  }
  handleRowAction(event) {
    const action = event.detail.action;
    const row = event.detail.row;
    let result = Array.from(this.selectedProducts);
    switch (action.name) {
      case "remove": {
        const rows = this.selectedProducts;
        const rowIndex = rows.findIndex(
          (e) => e[this.keyField] === row[this.keyField]
        );
        result = [...rows.slice(0, rowIndex), ...rows.slice(rowIndex + 1)];
        break;
      }
      default:
        break;
    }
    this.dispatchEvent(
      new CustomEvent("updateproducts", {
        detail: { products: result }
      })
    );
  }
  isLoading = false;
  editable;
  @api columns = [
    { label: "Name", fieldName: "Name", wrapText: "true" },
    //{ label: "Bundle", fieldName: "Bundle__c" },
    { label: "Family", fieldName: "Family", type: "text" },
    { label: "Quantity", fieldName: "Quantity", type: "number" },
    { label: "Sales Price", fieldName: "UnitPrice", type: "currency" },
    { label: "Price Term", fieldName: "SalesPriceTerm", type: "currency" },
    {
      label: "Set-Up Price",
      fieldName: "Setup_Fee_Product",
      type: "currency"
    },
    { label: "Comment", fieldName: "additionalDescription" }
  ];

  draftValues = [];

  async handleSave(event) {
    this.draftValues = [];
    this.dispatchEvent(
      new CustomEvent("save", {
        detail: event.detail
      })
    );
  }
  @api
  hideCheckboxColumn = false;
  handleRowSelection(event) {
    this.dispatchEvent(
      new CustomEvent("select", {
        detail: { items: event.detail.selectedRows, name: this.name }
      })
    );
  }
  get selected() {
    return this._selected.length ? this._selected : "none";
  }
  get selectedKeys() {
    return this._selectedRows?.length
      ? this._selectedRows.map((e) => e[this.keyField])
      : [];
  }
  draftValuesCustomDatatypes = [];

  customTypeChanged(event) {
    event.stopPropagation();
    let dataReceived = event.detail.data;
    this.updateDraftValues(
      {
        Id: dataReceived.context,
        [dataReceived.fieldName]: dataReceived.value ? dataReceived.value : null
      },
      dataReceived.fieldName
    );
  }
  updateDraftValues(updateItem, fieldName) {
    let hasNewDraftValueRecord = false;
    let copyDraftValuesCustomTypes = [...this.draftValuesCustomDatatypes];
    //store changed value to do operations
    //on save. This will enable inline editing &
    //show standard cancel & save button
    copyDraftValuesCustomTypes.forEach((item) => {
      if (item[this.keyField] === updateItem[this.keyField]) {
        item[fieldName] = updateItem[fieldName];
        hasNewDraftValueRecord = true;
      }
    });

    if (hasNewDraftValueRecord) {
      this.draftValuesCustomDatatypes = [...copyDraftValuesCustomTypes];
      this.draftValuesCustomDatatypes = this.mergeDraftValues([
        ...this.draftValues,
        ...this.draftValuesCustomDatatypes
      ]);
    } else {
      this.draftValuesCustomDatatypes = [
        ...copyDraftValuesCustomTypes,
        updateItem
      ];
    }

    this.draftValues = this.mergeDraftValues([
      ...this.draftValues,
      ...this.draftValuesCustomDatatypes
    ]);
  }
  mergeDraftValues(arr) {
    return arr.reduce((merged, current) => {
      let found = merged.find(
        (val) => val[this.keyField] === current[this.keyField]
      );
      if (found) {
        // merge the current object with the existing object
        Object.assign(found, current);
      } else {
        // add the current object to the merged object
        merged.push(current);
      }
      return merged;
    }, []);
  }
}