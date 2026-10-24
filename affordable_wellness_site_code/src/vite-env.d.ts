/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_ID?: string;
  readonly VITE_PRODUCT_SERVER_API?: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface PostAffiliateSale {
  setOrderID: (id: string) => void;
  setTotalCost: (cost: string) => void;
  setProductID?: (id: string) => void;
  setAffiliateID?: (id: string) => void;
  setCurrencyCode?: (code: string) => void;
}

interface PostAffTrackerStatic {
  setAccountId: (id: string) => void;
  track: () => void;
  createSale: () => PostAffiliateSale;
  register: () => void;
}

// Google Tag Manager dataLayer type definitions
interface Window {
  PostAffTracker?: PostAffTrackerStatic;
  dataLayer?: Array<{
    event?: string;
    ecommerce?: {
      transaction_id?: string;
      value?: number;
      currency?: string;
      items?: Array<{
        item_id?: string | number;
        item_name?: string;
        price?: number;
        quantity?: number;
      }>;
    };
    [key: string]: any;
  }>;
  google?: {
    maps: {
      places: {
        Autocomplete: new (
          inputField: HTMLInputElement,
          options?: {
            types?: string[];
            componentRestrictions?: { country: string };
          }
        ) => {
          addListener: (event: string, callback: () => void) => void;
          getPlace: () => {
            formatted_address?: string;
            address_components?: Array<{
              long_name: string;
              short_name: string;
              types: string[];
            }>;
          };
        };
      };
    };
  };
}
