export const DEMO_FARMER_ID = "MH-26032-4812";

export const STORAGE_KEYS = {
  officerAuthenticated: "officer-authenticated",
  language: "mandi-setu-language",
  mspRates: "mandi-setu-msp-rates",
} as const;

export function receiptStorageKey(farmerId: string) {
  return `mandi-setu-weighment-receipt-${farmerId.trim()}`;
}
