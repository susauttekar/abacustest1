import { LightningElement, api, wire } from "lwc";
// Import message service features required for publishing and the message channel
import { subscribe, MessageContext } from "lightning/messageService";
import bundler from "@salesforce/messageChannel/Bundler__c";
import ProductBundlerApp from "c/productBundlerApp";
import { RefreshEvent } from "lightning/refresh";
export default class ProductBundlerWrapper extends LightningElement {
  @api recordId;
  @api objectApiName;
  subscription = null;
  @wire(MessageContext)
  messageContext;

  // Encapsulate logic for LMS subscribe.
  subscribeToMessageChannel() {
    this.subscription = subscribe(this.messageContext, bundler, (message) =>
      this.handleMessage(message)
    );
  }
  // Standard lifecycle hooks used to sub/unsub to message channel
  connectedCallback() {
    this.subscribeToMessageChannel();
  }
  // Handler for message received by component
  handleMessage(message) {
    const isOpen = message.isOpen;
    if (isOpen) {
      const options = {
        recordId: this.recordId,
        objectApiName: this.objectApiName,
        size: "full"
      };
      ProductBundlerApp.open(options).then(() => {
        this.dispatchEvent(new RefreshEvent());
      });
    }
  }
}