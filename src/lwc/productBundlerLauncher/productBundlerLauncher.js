import { LightningElement, api, wire } from "lwc";
// Import message service features required for publishing and the message channel
import { publish, MessageContext } from "lightning/messageService";
import bundler from "@salesforce/messageChannel/Bundler__c";

export default class ProductBundlerLauncher extends LightningElement {
  @wire(MessageContext)
  messageContext;

  @api invoke() {
    const message = {
      isOpen: true
    };
    publish(this.messageContext, bundler, message);
  }
}