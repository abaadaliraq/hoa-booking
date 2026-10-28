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
          "تعذر تحميل مواعيد الزيارة حالياً. أعد المحاولة بعد قليل.",
      },
      { status: 503, headers: responseHeaders },
    );
  }
}
