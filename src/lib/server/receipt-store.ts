import { randomUUID } from "node:crypto";

export type ReceiptRecord = {
  receiptId: string;
  receiptNumber: string;
  transactionId: string;
  issuedAt: string;
  farmerName: string;
  farmerId: string;
  mandiName: string;
  crop: string;
  grade: string;
  weightQuintals: number;
  mspRate: number;
  totalAmount: number;
  paymentMethod: string;
  photo: string;
};

type ReceiptStoreGlobal = typeof globalThis & {
  __mandiReceiptStore?: Map<string, ReceiptRecord>;
};

const receipts = ((globalThis as ReceiptStoreGlobal).__mandiReceiptStore ??= new Map());

export function createReceipt(input: Omit<ReceiptRecord, "receiptId" | "receiptNumber" | "transactionId" | "issuedAt">) {
  const now = new Date();
  const dateParts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const dateValues = Object.fromEntries(dateParts.map((part) => [part.type, part.value]));
  const datePart = `${dateValues.year}${dateValues.month}${dateValues.day}`;
  const receiptId = randomUUID();
  const suffix = receiptId.slice(0, 6).toUpperCase();
  const record: ReceiptRecord = {
    ...input,
    receiptId,
    receiptNumber: `MS-${datePart}-${suffix}`,
    transactionId: `TXN-${datePart}-${suffix}`,
    issuedAt: now.toISOString(),
  };

  receipts.set(receiptId, record);
  return record;
}

export function getReceipt(receiptId: string) {
  return receipts.get(receiptId) ?? null;
}
