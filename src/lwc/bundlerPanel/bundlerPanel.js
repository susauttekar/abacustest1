import getBundles from "@salesforce/apex/ProductBundlerController.getBundles";
import { LightningElement, api, wire } from "lwc";

export default class BundlerPanel extends LightningElement {
  @api recordId;
  handleSearch(event) {
    const value = event.target.value;
    this.searchKey = value;
    this.debounceSearch();
  }

  addedIds = new Set();
  apiFilter = "";
  searchKey = "";
  wiredBundles = { data: [] };
  @wire(getBundles, { bundleName: "$apiFilter", priceBookId: "$recordId" })
  getAvailableBundles(result) {
    this.wiredBundles = result;
    if (result.data) {
      this.renderBundles = result.data.map((bundle) => {
        return {
          ...bundle,
          visible: !this.addedIds.has(bundle.Id)
        };
      });
    }
  }
  get availableBundles() {
    if (this.wiredBundles.data) {
      return this.wiredBundles.data;
    }
    return [];
  }

  renderBundles = [];

  bundleProducts = [];
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
  handleAddBundle(event) {
    const id = event.target.dataset.id;
    const bundleName = event.target.dataset.name;
    const type = event.target.dataset.type;
    this.addedIds.add(id);

    let bundleProducts = [];
    if (type !== "bundle") {
      const selectedProduct = this.availableProducts.find(
        (product) => product.Id === id
      );
      if (selectedProduct) {
        bundleProducts = [
          ...this.bundleProducts,
          { ...selectedProduct, key: selectedProduct.Id }
        ];
      }
    } else {
      const selectedBundle = this.availableBundles.find(
        (bundle) => bundle.Id === id
      );
      if (selectedBundle && selectedBundle?.products) {
        const bundleProduts = selectedBundle.products.map((product) => {
          return {
            ...product
          };
        });
        bundleProducts = [...this.bundleProducts, ...bundleProduts];
      }
      this.renderBundles = this.availableBundles.map((bundle) => {
        return {
          ...bundle,
          visible: !this.addedIds.has(bundle.Id)
        };
      });
    }

    const evt = new CustomEvent("addbundle", {
      detail: { items: bundleProducts, id, name: bundleName }
    });
    this.dispatchEvent(evt);
  }
}