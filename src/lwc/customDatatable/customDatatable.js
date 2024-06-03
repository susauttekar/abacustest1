import LightningDatatable from "lightning/datatable";
import picklistEditable from "./templates/picklistEditable.html";
export default class CustomDatatable extends LightningDatatable {
  static customTypes = {
    picklist: {
      template: picklistEditable,
      standardCellLayout: true,
      typeAttributes: ["options", "fieldName", "context","product2Id","bundleId","quantity"]
    }
  };

}