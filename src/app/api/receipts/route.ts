import QRCode from "qrcode";
import { createReceipt } from "@/lib/server/receipt-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PHOTO_LENGTH = 5_000_000;

function isNonEmptyString(value: unknown, maximumLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maximumLength;
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 6_000_000) return Response.json({ error: "Receipt photo is too large" }, { status: 413 });

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid receipt data" }, { status: 400 });
  }

  const weightQuintals = Number(body.weightQuintals);
  const mspRate = Number(body.mspRate);
  const validPhoto = typeof body.photo === "string"
    && body.photo.length <= MAX_PHOTO_LENGTH
    && /^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(body.photo);
  if (
    !isNonEmptyString(body.farmerName, 120)
    || !isNonEmptyString(body.farmerId, 64)
    || !isNonEmptyString(body.mandiName, 120)
    || !isNonEmptyString(body.crop, 80)
    || !["A", "B", "C"].includes(String(body.grade))
    || !Number.isFinite(weightQuintals)
    || weightQuintals <= 0
    || !Number.isFinite(mspRate)
    || mspRate <= 0
    || !validPhoto
  ) {
    return Response.json({ error: "Receipt details are incomplete or invalid" }, { status: 400 });
  }

  const record = createReceipt({
    farmerName: body.farmerName.trim(),
    farmerId: body.farmerId.trim(),
    mandiName: body.mandiName.trim(),
    crop: body.crop.trim(),
    grade: String(body.grade),
    weightQuintals,
    mspRate,
    totalAmount: Math.round(weightQuintals * mspRate * 100) / 100,
    paymentMethod: "DBT",
    photo: body.photo as string,
  });
  const verificationUrl = new URL(`/receipt/verify/${record.receiptId}`, request.url).toString();

  try {
    const qrCode = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 220,
    });
    return Response.json({
      ...record,
      photo: undefined,
      qrCode,
      verificationUrl,
    }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch {
    return Response.json({ error: "Could not generate receipt verification QR" }, { status: 500 });
  }
}