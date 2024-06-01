import { LightningElement,api } from 'lwc';
import getAvailableProducts from "@salesforce/apex/ProductBundlerController.getAvailableProducts";

import {
  FlowAttributeChangeEvent,
  FlowNavigationBackEvent,
  FlowNavigationNextEvent,
} from 'lightning/flowSupport';
export default class ProductBundler2 extends LightningElement {
columns = [
    { label: "Name", fieldName: "Name" },
    { label: "Family", fieldName: "Family", type: "text" }/*,
    { label: "Qty", fieldName: "Quantity__c", type: "text" },
    {
      label: "Remove",
      type: "button",
      typeAttributes: {
        label: "Remove",
        name: "remove",
        variant: "destructive-text"
      }
    }*/
  ];
  productList;
  @api selectedIds;
  @api singleSelectedIds;
  apiFilter = "";

    connectedCallback() {
      const selectedId = this.selectedIds.split(',');

        getAvailableProducts({
      selectedProducts: selectedId
    })
      .then((data) => {
            this.productList = data;
            console.log('this.productList' + this.productList);
         
      })
      .catch((error) => {
        console.log('error: ', error);
      });
    }

     handleRowSelection(event) {
      this.selectedRows = event.detail.selectedRows;
      console.log('selectedKeys' + this.selectedKeys);
      this.singleSelectedIds= this.selectedKeys.join(',');
       console.log('selectedKEysString2' +  this.singleSelectedIds);
        const attributeChangeEvent2 = new FlowAttributeChangeEvent(
          'singleSelectedIds',
           this.singleSelectedIds
        ); 
         this.dispatchEvent(attributeChangeEvent2);

  }
  get selected() {
    return this._selected.length ? this._selected : 'none';
  }
  get selectedKeys() {
    return this.selectedRows?.length ? this.selectedRows.map((e) => e.Id) : [];
  }

}