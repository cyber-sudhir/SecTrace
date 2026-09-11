import { db } from "@/db";
import { evidence, activity } from "@/db/schema";
import { ensureWorkspace } from "@/db/seed";
import { eq } from "drizzle-orm";
import { ApiError, validId } from "@/lib/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureWorkspace();
    const id = validId((await params).id);
    const [row] = await db.select().from(evidence).where(eq(evidence.id, id));
    if (!row) throw new ApiError("Evidence not found.", 404);
    await db.insert(activity).values({ kind: "download", title: "Evidence downloaded", description: `${row.reference} · ${row.name}`, caseId: row.caseId });
    const safeName = row.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    return new Response(new Uint8Array(Buffer.from(row.data, "base64")), { headers: { "Content-Type": "application/octet-stream", "Content-Disposition": `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(row.name)}`, "Content-Length": String(Buffer.from(row.data, "base64").length), "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof ApiError) return Response.json({ error: error.message }, { status: error.status });
    console.error("Evidence download failed:", error);
    return Response.json({ error: "Unable to download evidence." }, { status: 500 });
  }
}
