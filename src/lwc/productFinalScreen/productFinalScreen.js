import { LightningElement, api,track,wire } from 'lwc';
import saveOLIs from "@salesforce/apex/ProductBundlerController.saveOLIs";
import getFinalProducts from "@salesforce/apex/ProductBundlerController.getFinalProducts";
import OpportunityLineItem from "@salesforce/schema/OpportunityLineItem";

import {
  getObjectInfo,
  getPicklistValuesByRecordType
} from "lightning/uiObjectInfoApi";
import {
  FlowAttributeChangeEvent,
  FlowNavigationBackEvent,
  FlowNavigationNextEvent,
} from 'lightning/flowSupport';

export default class ProductFinalScreen extends LightningElement {
 @track headers0 = [
      {
      displayName: "Product",
      propertyName: "Name"
    },
    {
      displayName: "Quantity",
      propertyName: "Quantity"
    },
    {
      displayName: "Setup Fee - Product",
      propertyName: "Setup_Fee_Product__c"
    },
    {
      displayName: "Set-Up Fee - Product Discount",
      propertyName: "Set_Up_Fee_Product_Discount__c"
    },
    {
      displayName: "Sales Price",
      propertyName: "UnitPrice"
    },
    {
      displayName: "Sales Price Discount",
      propertyName: "Sales_Price_Discount__c"
    },
    {
      displayName: "Sales Price Term",
      propertyName: "Sales_Price_Term__c"
    },
     {
      displayName: "Comment",
      propertyName: "Comment__c	"
    }];
    @api recordId;
    @api selectedIDs1;
    @api selectedIDs2;
    finalIds;
    productList;
    
    get salesPriceTerm() {
        return [
            { label: 'One Time Fee', value: 'One Time Fee' },
            { label: 'Recurring Monthly', value: 'Recurring Monthly' },
            { label: 'Recurring Anually', value: 'Recurring Anually' },
        ];
    }
    @track picklistValues = {
    Sales_Price_Term__c: []};

     splitAndJoinStrings(str1, str2) {
    // Handle null or empty strings
    if (!str1 && !str2) {
        return ''; // Both strings are null or empty
    } else if (!str1) {
        return str2; // Return the non-null string
    } else if (!str2) {
        return str1; // Return the non-null string
    }

    // Splitting a comma-separated string into an array
    const array1 = str1.split(',');
    const array2 = str2.split(',');

    // Joining two arrays into one string
    const newArray = array1.concat(array2);
    //const newString = newArray.join(',');

    return newArray;
}

 async connectedCallback() {
   //  const array1 = this.selectedIDs1.split(',');
   // const array2 = this.selectedIDs2.split(',');
    this.finalIds =   this.splitAndJoinStrings(this.selectedIDs1, this.selectedIDs2);
    console.log(this.finalIds);
    try {
      await this.getFinalProducts();
      
    } catch (error) {
      console.log("Error fetching state.", error);
    }  
  }
  
    getFinalProducts(){
      getFinalProducts({
      selectedProducts: this.finalIds
    })
      .then((data) => {
            this.productList = data;
             this.productList = data.map((product, index) => ({
                ...product,
                lineNum: index + 1 
            }));
            console.log('this.productList' + this.productList);
            
         
      })
      .catch((error) => {
        console.log('error: ', error);
      });
    }

    @wire(getObjectInfo, { objectApiName: OpportunityLineItem })
  lineItemInfo;

    @wire(getPicklistValuesByRecordType, {
    objectApiName: OpportunityLineItem,
    recordTypeId: "$lineItemInfo.data.defaultRecordTypeId"
  })
  objectPicklists({ data, error }) {
    if (data?.picklistFieldValues) {
      try {
        const picklistData = Object.keys(data.picklistFieldValues).reduce(
          (acc, curr) => ({
            ...acc,
            [curr]: data.picklistFieldValues[curr].values
          }),
          {}
        );
        this.picklistValues = picklistData;
      } catch (e) {
        console.error(" An error occured within the lightning service", e);
      }
    }
    if (error) {
      console.error(" An error occured within the lightning service", error);
    }
  }
   async handleRemove(event) {
    const targetRecord = event.target.dataset.rowId;
    await deleteRecord(targetRecord);
    await this.getFinalProducts();
  }
  handleChange(event) {
    const targetRecord =
      event?.target?.dataset?.rowId ?? event.detail?.recordId;
    const fieldName = event?.target?.name ?? event.detailp?.name;
    const fieldValue = event?.target?.value ?? event.detail?.value;     
    for (let i = 0; i < this.productList.length; i++) {
      if (this.productList[i].Id == targetRecord) {
            this.productList[i][fieldName] = fieldValue;

            break;
      }
    }
    console.log('this.productList' + JSON.stringify(this.productList));
    /*if (event.detail?.value) {
      return this.handleSave({
        fieldName,
        value: event.detail.\,
        targetRecord
      });
    } else if (typeof event.target?.value !== undefined) {
      return this.handleSave({
        fieldName,
        value: event.target.value,
        targetRecord
      });
    }
    return null;*/
  }

   handleSave(event) {
      saveOLIs({
      records: this.productList,
      recordId: this.recordId
    })
      .then(result => {
        this.getRoleItems();
          this.productList = JSON.parse('  this.productList'+data);
         const navigateNextEvent = new FlowNavigationNextEvent();
          this.dispatchEvent(navigateNextEvent);

      })
      .catch(error => {
      });
   
  }



   

}