import { rpc, responseHeaders, BookingServiceError } from "../../../../lib/exhibition/server";
export const runtime = "nodejs";
export async function GET() {
  try {
    return Response.json(
      { slots: await rpc("booking_slots", {}) },
      { headers: responseHeaders },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          "تعذر تحميل مواعيد الزيارة حالياً. أعد المحاولة بعد قليل.",
        support_code: error instanceof BookingServiceError
          ? error.supportCode
          : "CONNECTION",
      },
      { status: 503, headers: responseHeaders },
    );
  }
}
