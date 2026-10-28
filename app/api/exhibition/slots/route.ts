import { rpc, responseHeaders } from "../../../../lib/exhibition/server";
export const runtime = "nodejs";
export async function GET() {
  try {
    return Response.json(
      { slots: await rpc("booking_slots", {}) },
      { headers: responseHeaders },
    );
  } catch {
    return Response.json(
      {
        error:
          "المواعيد غير متاحة حالياً. سيفتح الحجز بعد اعتماد المواعيد والسعة.",
      },
      { status: 503, headers: responseHeaders },
    );
  }
}
