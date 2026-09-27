import { getReceipt } from "@/lib/server/receipt-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ receiptId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { receiptId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(receiptId)) {
    return Response.json({ error: "Invalid receipt number" }, { status: 400 });
  }

  const record = getReceipt(receiptId);
  if (!record) return Response.json({ error: "Receipt not found or not verifiable" }, { status: 404 });

  return Response.json({
    verified: true,
    receiptId: record.receiptId,
    receiptNumber: record.receiptNumber,
    transactionId: record.transactionId,
    issuedAt: record.issuedAt,
    farmerName: record.farmerName,
    farmerId: record.farmerId,
    mandiName: record.mandiName,
    crop: record.crop,
    grade: record.grade,
    weightQuintals: record.weightQuintals,
    mspRate: record.mspRate,
    totalAmount: record.totalAmount,
    paymentMethod: record.paymentMethod,
  }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}