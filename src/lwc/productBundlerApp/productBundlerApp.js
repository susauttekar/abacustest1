import { api, wire } from "lwc";
import LightningModal from "lightning/modal";
import getLineItems from "@salesforce/apex/ProductBundlerController.getLineItems";
import getPicklistOptions from "@salesforce/apex/ProductBundlerController.getPicklistOptions";
import Pricebook2 from "@salesforce/schema/Opportunity.Pricebook2Id";
import {
  createRecord,
  getFieldValue,
  getRecord,
  updateRecord
} from "lightning/uiRecordApi";

export default class ProductBundlerApp extends LightningModal {
  @api recordId;
  @api objectApiName;
  @api selectedIds;

  searchKey = "";
  apiFilter = "";
  finalProducts = [];
  searcherType = "bundles";
  @wire(getRecord, {
    recordId: "$recordId",
    optionalFields: [Pricebook2]
  })
  getPriceBook({ data }) {
    if (data) {
      this.priceBookId = getFieldValue(data, Pricebook2);
      this.recordTypeId = data.recordTypeId;
      if (!this.priceBookId) {
        this.currentStep = "pricebook";
      }
    }
  }

  /*@ sus@wire(getPicklistOptions, {
    objectName: "OpportunityLineItem",
    fieldName: "Sales_Price_Term__c"
  })*/

  @wire(getPicklistOptions, {
    objectName: "Product2",
    fieldName: "Sales_Price_Term__c"
  })
  getPriceTermOptions({ data }) {
    if (data) {
      this.priceTermOptions = data;
      this._colums = this.displayColumns;
    }
  }
  priceTermOptions = [];

  priceBookId = null;
  get submitLabel() {
    switch (this.currentStep) {
      case "products":
        return "Next";
      case "addendum":
        return "Submit";
      case "success":
        return "Close";

      default:
        return "Next";
    }
  }
  get priceTermCol() {
    return {
      label: "Sales Price Term",
      fieldName: "Sales_Price_Term__c",
      type: "picklist",
      typeAttributes: {
        options: JSON.stringify(this.priceTermOptions),
        placeholder: "Choose Term",
        fieldName: "Sales_Price_Term__c",
        context: { fieldName: "Sales_Price_Term__c" },
        product2Id:{ fieldName: "Product2Id" },
        bundleId: { fieldName: "Bundle__c" },
        quantity: { fieldName: "Quantity"}
      }
    };
  }
  _colums = [];

  get displayColumns() {
    return [
      {
        label: "Name",
        fieldName: "Name",
        type: "text"
      },
      {
        label: "Name",
        fieldName: "bundleName",
        type: "text"
      },
      {
        label: "Quantity",
        fieldName: "Quantity",
        type: "number",
        editable: true
      },

      {
        label: "Setup Fee Product",
        editable: true,
        fieldName: "Setup_Fee_Product",
        type: "currency"
      },
      {
        label: "Total Fees - Set Up",
        editable: true,
        fieldName: "Total_Fees_Set_Up__c",
        type: "currency"
      },
      this.priceTermCol,
      {
        label: "Sales Price",
        editable: true,
        fieldName: "UnitPrice",
        type: "currency"
      },
      {
        label: "Sales Price Discount",
        editable: true,
        fieldName: "Sales_Price_Discount__c",
        type: "currency"
      },
      {
        label: "Comment",
        editable: true,
        fieldName: "Comment",
        type: "text"
      }
    ];
  }
  get isPricebookStep() {
    return this.currentStep === "pricebook";
  }

  get existingColumns() {
    return [
      {
        label: "Name",
        fieldName: "Name",
        type: "text",
        wrapText: "true"
      },
      {
        label: "Bundle",
        fieldName: "bundleName",
        type: "text"
      },
      {
        label: "Quantity",
        fieldName: "Quantity",
        type: "number",
        editable: true
      },
      {
        label: "Setup Fee Product",
        fieldName: "Setup_Fee_Product__c",
        type: "currency",
        editable: true
      },
      {
        label: "Set Up Fee Product Discount",
        fieldName: "Set_Up_Fee_Product_Discount__c",
        type: "currency",
        editable: true
      },
      {
        label: "Unit Price",
        fieldName: "UnitPrice",
        type: "currency",
        editable: true
      },
      {
        label: "Sales Price Discount",
        fieldName: "Sales_Price_Discount__c",
        type: "currency",
        editable: true
      },
      this.priceTermCol,
      {
        label: "Comment",
        fieldName: "Comment__c",
        type: "text",
        editable: true
      }
    ];
  }

  get listFields() {
    return this.displayColumns.map((column) => column.fieldName);
  }

  @wire(getLineItems, {
    recordId: "$recordId"
  })
  getExistingProducts({ data }) {
    if (data) {
      this.existingProducts = data.map((e) => ({
        ...e,
        bundleName: e.Bundle__c ? e.Bundle__r?.Name : "",
        key: e.Id
      }));
    }
  }

  get showExisting() {
    return this.existingProducts.length > 0 && this.isAddendumStep;
  }

  existingProducts = [];

  get lineItemColumns() {
    return [
      { label: "Name", fieldName: "Name" },
      { label: "Quantity", fieldName: "Quantity", type: "number" },
      {
        label: "Setup Fee",
        fieldName: "Setup_Fee_Product",
        type: "currency"
      }
    ];
  }

  handlePrevious() {
    const currentStep = this.currentStep;
    switch (currentStep) {
      case "addendum":
        this.currentStep = "products";
        break;
      case "success":
        this.currentStep = "addendum";
        break;
      case "products":
        this.currentStep = "pricebook";
        break;
      default:
        break;
    }
  }

  selectedBundles = [];
  products = [];
  handleLoadBundle(event) {
    const { items, id, name } = event.detail;
    const bundle = {
      id: id,
      name,
      products: Array.isArray(items) ? items : [],
      selectedRows: []
    };
    this.selectedBundles = [...this.selectedBundles, bundle];
  }

  handleUpdateProducts(event) {
    const { items } = event.detail;
    if (Array.isArray(items)) {
      this.products = [...this.products, ...items];
    } else {
      this.products = [...this.products, items];
    }
  }
  handleUpdateFinalProducts(event) {
      console.log( '@ sus handle final product '+JSON.stringify(event));
    const { items } = event.detail;
    if (Array.isArray(items)) {
      this.finalProducts = [...this.finalProducts, ...items];
    } else {
      this.finalProducts = [...this.finalProducts, items];
    }
  }
  handleSearch(event) {
    const value = event.target.value;
    this.searchKey = value;
    this.debounceSearch();
  }
  debounceTimeout = null;

  handleSaveFinal(event) {
    console.log('@ sus 1 save data '+JSON.stringify((event.detail)));
    const records = event.detail.draftValues.slice().map((draftValue) => {
      const fields = Object.assign({}, draftValue);
      return { fields };
    });
    console.log('@ sus 2 records '+JSON.stringify((records)));
    console.log('@ sus 3 final Products '+JSON.stringify((this.finalProducts)));
    debugger;
    const updatedProducts = [];
    for (const finalProduct of this.finalProducts) {
      console.log('@ sus 4 final Product '+JSON.stringify((finalProduct)));
      const record = records.find(
        (recordTarget) => recordTarget.fields.key === finalProduct.key
      );
      console.log('@ sus 5 record '+JSON.stringify((record)));
      const product = Object.assign({}, finalProduct);
      console.log('@ sus 6 product '+JSON.stringify((product)));
      if (record) {
        console.log('@ sus 7 record.fields '+JSON.stringify((record.fields)));
        // eslint-disable-next-line guard-for-in
        for (const field in record.fields) {
          console.log('@ sus 8 field '+JSON.stringify((field)));
          if (field !== "key") {
            console.log('@ sus 9 '+JSON.stringify((field)));
            product[field] = record.fields[field];
          }
        }
      }
      updatedProducts.push(product);
    }
    this.finalProducts = updatedProducts;
  }

  async handleSaveExisting(event) {
    // Convert datatable draft values into record objects
    const records = event.detail.draftValues.slice().map((draftValue) => {
      const fields = Object.assign({}, draftValue);
      return { fields };
    });

    this.isLoading = true;
    try {
      // Update all records in parallel thanks to the UI API
      const recordUpdatePromises = records.map((record) =>
        updateRecord(record)
      );
      await Promise.all(recordUpdatePromises);
      const updateProducts = [];
      // Refresh Final Products   optimistically
      for (const updatedProduct of this.existingProducts) {
        const product = Object.assign({}, updatedProduct);
        const record = records.find(
          (recordTarget) => recordTarget.fields.Id === updatedProduct.Id
        );
        if (record) {
          // eslint-disable-next-line guard-for-in
          for (const field in record.fields) {
            if (field !== "Id") {
              product[field] = record.fields[field];
            }
          }
        }
        updateProducts.push(product);
      }
      this.existingProducts = updateProducts;
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  get selectedFinalProductKeys() {
    return this.finalProducts.map((product) => product.key ?? product.id);
  }

  handleFinalSelect(event) {
    const { items, name: id } = event.detail;
    const targetBundleIdx = this.selectedBundles.findIndex((e) => e.id === id);
    if (targetBundleIdx < 0) {
      console.error("TARGET BUNDLE ISSUE", targetBundleIdx);
    }

    this.selectedBundles[targetBundleIdx].selectedRows = items;
    const finalProducts = [];
    for (const bundle of this.selectedBundles) {
      for (const product of bundle.selectedRows) {
        finalProducts.push({
          ...product,
          Bundle__c: bundle.id,
          bundleName: bundle.name,
          Sales_Price_Term__c: product.SalesPriceTerm,
          Setup_Fee_Product__c: product.Setup_Fee_Product
        });
      }
    }
    this.finalProducts = finalProducts;
  }

  debounceSearch() {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    // Debounce API call by 1500ms
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.debounceTimeout = setTimeout(() => {
      // Update the api search filter once each 1 seconds
      this.apiFilter = this.searchKey;
    }, 1000);
  }

  currentStep = "products";
  get isProductStep() {
    return this.currentStep === "products";
  }
  get isAddendumStep() {
    return this.currentStep === "addendum";
  }

  get hasPrevious() {
    if (this.isSuccessStep) {
      return false;
    }
    return this.currentStep !== "products" && this.currentStep !== "pricebook";
  }

  handleSubmitEditForm() {
    const form = this.template.querySelector("lightning-record-edit-form");
    form.submit();
  }
  handleSuccess() {
    this.currentStep = "products";
  }

  async handleSubmit() {
    switch (this.currentStep) {
      case "pricebook": {
        this.handleSubmitEditForm();
        break;
      }
      case "products": {
        this.currentStep = "addendum";
        break;
      }
      case "addendum": {
        this.handleCreateItems();
        break;
      }
      case "success": {
        this.handleClose();
        break;
      }
      default:
        break;
    }
  }
  isLoading = false;

  get isSuccessStep() {
    return this.currentStep === "success";
  }

  successCounter = null;
  successCount = 5;

  disconnectedCallback() {
    if (this.successCounter) {
      clearInterval(this.successCounter);
    }
  }

  async handleCreateItems() {
    this.isLoading = true;
    try {
      const itemFields = this.existingColumns.map((column) => column.fieldName);
      const recordInputs = this.finalProducts.map((product) => {
        const updates = itemFields.reduce((acc, field) => {
          if (field === "Name") return acc;
          if (field === "bundleName") {
            acc.Bundle__c = product.Bundle__c;
            return acc;
          }
          acc[field] = product[field];
          return acc;
        }, {});
        return {
          fields: {
            ID__c: product.key,
            Product2Id: product.Product2Id,
            OpportunityId: this.recordId,
            PricebookEntryId: product.PricebookEntryId,
            ...updates
          },
          apiName: "OpportunityLineItem"
        };
      });
      await Promise.all(
        recordInputs.map((recordInput) => createRecord(recordInput))
      );
      this.currentStep = "success";
      if (this.successCounter) clearInterval(this.successCounter);
      // eslint-disable-next-line @lwc/lwc/no-async-operation
      this.successCounter = setInterval(() => {
        if (this.successCount === 0) {
          clearInterval(this.successCounter);
          this.handleClose();
        } else {
          this.successCount -= 1;
        }
      }, 1000);
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
  handleClose() {
    console.log("CLOSE");
    this.close();
  }
  bundleProducts = [];
  individualProducts = [];
  get disabled() {
    return this.bundleProducts.length === 0;
  }
}