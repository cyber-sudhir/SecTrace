import { getWorkspace, performAction, ApiError } from "@/lib/workspace";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    const data = await getWorkspace();
    if (new URL(request.url).searchParams.get("export") === "audit") {
      const cell = (value: string) => {
        const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
        return `"${safe.replace(/"/g, '""')}"`;
      };
      const csv = ["Event ID,Timestamp,Type,Event,Details", ...data.activity.map((a) => [String(a.id), a.createdAt, a.kind, a.title, a.description].map(cell).join(","))].join("\r\n");
      return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="sectrace-audit-log.csv"', "Cache-Control": "no-store" } });
    }
    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Workspace read failed:", error);
    return Response.json({ error: "Unable to load the workspace. Please try again." }, { status: 500 });
  }
}
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== new URL(request.url).host && new URL(origin).host !== request.headers.get("x-forwarded-host")) return Response.json({ error: "Cross-origin requests are not permitted." }, { status: 403 });
    const input: unknown = await request.json();
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new ApiError("Invalid request body.");
    return Response.json(await performAction(input as Record<string, unknown>));
  } catch (error) {
    if (error instanceof ApiError) return Response.json({ error: error.message }, { status: error.status });
    if (error instanceof SyntaxError) return Response.json({ error: "Invalid JSON request." }, { status: 400 });
    console.error("Workspace action failed:", error);
    return Response.json({ error: "The operation could not be completed. Please try again." }, { status: 500 });
  }
}
