import { getTokenState, setMandiOpen, setupDailyMandi } from "@/lib/server/token-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ mandiId: string }>;
};

function isValidMandiId(mandiId: string) {
  return /^[a-z0-9-]{1,64}$/i.test(mandiId);
}

function isValidTime(value: string) {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { mandiId } = await params;
  if (!isValidMandiId(mandiId)) return Response.json({ error: "Invalid mandi id" }, { status: 400 });

  return Response.json(getTokenState(mandiId), {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { mandiId } = await params;
  if (!isValidMandiId(mandiId)) return Response.json({ error: "Invalid mandi id" }, { status: 400 });

  let body: { mandiOpen?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const current = getTokenState(mandiId);
  if (!current.setupCompletedAt) {
    return Response.json({ error: "Complete today's setup before changing mandi status" }, { status: 409 });
  }
  if (typeof body.mandiOpen !== "boolean") {
    return Response.json({ error: "Invalid mandi status" }, { status: 400 });
  }

  return Response.json(setMandiOpen(mandiId, body.mandiOpen));
}

export async function POST(request: Request, { params }: RouteContext) {
  const { mandiId } = await params;
  if (!isValidMandiId(mandiId)) return Response.json({ error: "Invalid mandi id" }, { status: 400 });

  let body: {
    capacity?: unknown;
    mandiOpen?: unknown;
    expectedOpenTime?: unknown;
    expectedCloseTime?: unknown;
    redoConfirmed?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const current = getTokenState(mandiId);
  if (current.setupCompletedAt && body.redoConfirmed !== true) {
    return Response.json({ error: "Today's setup is already active", requiresConfirmation: true }, { status: 409 });
  }

  const expectedOpenTime = typeof body.expectedOpenTime === "string" ? body.expectedOpenTime : current.expectedOpenTime;
  const expectedCloseTime = typeof body.expectedCloseTime === "string" ? body.expectedCloseTime : current.expectedCloseTime;
  if (
    typeof body.capacity !== "number"
    || !Number.isInteger(body.capacity)
    || body.capacity < 0
    || typeof body.mandiOpen !== "boolean"
    || !isValidTime(expectedOpenTime)
    || !isValidTime(expectedCloseTime)
  ) {
    return Response.json({ error: "Invalid daily setup values" }, { status: 400 });
  }

  return Response.json(setupDailyMandi(mandiId, {
    capacity: body.capacity,
    mandiOpen: body.mandiOpen,
    expectedOpenTime,
    expectedCloseTime,
  }));
}