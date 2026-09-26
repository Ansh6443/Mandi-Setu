import { advanceToken, getTokenState, undoTokenAdvance } from "@/lib/server/token-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ mandiId: string }>;
};

function isValidMandiId(mandiId: string) {
  return /^[a-z0-9-]{1,64}$/i.test(mandiId);
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { mandiId } = await params;
  if (!isValidMandiId(mandiId)) return Response.json({ error: "Invalid mandi id" }, { status: 400 });

  return Response.json(getTokenState(mandiId), {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const { mandiId } = await params;
  if (!isValidMandiId(mandiId)) return Response.json({ error: "Invalid mandi id" }, { status: 400 });

  let body: { action?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (body.action === "advance") {
    const result = advanceToken(mandiId);
    return Response.json(result, { status: result.requiresSetup ? 409 : 200 });
  }
  if (body.action === "undo") return Response.json(undoTokenAdvance(mandiId));
  return Response.json({ error: "Unknown token action" }, { status: 400 });
}