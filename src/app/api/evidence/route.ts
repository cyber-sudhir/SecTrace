import { db } from "@/db";
import { activity, cases, evidence, plugins, findings } from "@/db/schema";
import { ensureWorkspace } from "@/db/seed";
import { ApiError, validId } from "@/lib/workspace";
import { eq } from "drizzle-orm";
import { createHash } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== new URL(request.url).host && new URL(origin).host !== request.headers.get("x-forwarded-host")) throw new ApiError("Cross-origin uploads are not permitted.", 403);
    await ensureWorkspace();
    const form = await request.formData();
    const caseId = validId(form.get("caseId"));
    const files = form.getAll("files").filter((file): file is File => file instanceof File);
    const expectedHash = String(form.get("expectedHash") || "").trim().toLowerCase();
    if (!files.length || files.length > 10) throw new ApiError("Choose between 1 and 10 files.");
    if (files.some((f) => f.size > 20 * 1024 * 1024)) throw new ApiError("Each file must be 20 MB or smaller.");
    if (files.reduce((sum, f) => sum + f.size, 0) > 50 * 1024 * 1024) throw new ApiError("The combined upload must be 50 MB or smaller.");
    if (expectedHash && (!/^[a-f0-9]{64}$/.test(expectedHash) || files.length !== 1)) throw new ApiError("An expected SHA-256 hash requires one file and exactly 64 hexadecimal characters.");
    const [selected] = await db.select().from(cases).where(eq(cases.id, caseId));
    if (!selected) throw new ApiError("The selected case no longer exists.", 404);
    const [verifier] = await db.select().from(plugins).where(eq(plugins.id, "hash-verifier"));
    const [alerts] = await db.select().from(plugins).where(eq(plugins.id, "integrity-alerts"));
    const prepared = await Promise.all(files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const actualHash = createHash("sha256").update(buffer).digest("hex");
      const name = file.name.replace(/[\x00-\x1f]/g, "").slice(0, 255) || "unnamed-evidence";
      return { caseId, name, fileType: name.includes(".") ? name.split(".").pop()!.toUpperCase().slice(0, 20) : "FILE", mimeType: file.type || "application/octet-stream", size: file.size, data: buffer.toString("base64"), sha256: expectedHash || actualHash, integrity: !verifier?.enabled ? "pending" as const : expectedHash && expectedHash !== actualHash ? "failed" as const : "verified" as const, isSample: false };
    }));
    const ids = await db.transaction(async (tx) => {
      const created: number[] = [];
      for (const item of prepared) {
        const [row] = await tx.insert(evidence).values(item).returning({ id: evidence.id });
        const ref = `EVD-${String(row.id).padStart(3, "0")}`;
        await tx.update(evidence).set({ reference: ref }).where(eq(evidence.id, row.id));
        await tx.insert(activity).values({ kind: item.integrity === "failed" ? "alert" : "upload", title: item.integrity === "failed" ? "Imported evidence hash mismatch" : `${item.name} uploaded`, description: `${ref} · ${selected.reference} · ${item.integrity}`, caseId });
        if (item.integrity === "failed" && alerts?.enabled) {
          const [finding] = await tx.insert(findings).values({ caseId, title: `Integrity mismatch: ${item.name}`, description: `The imported file does not match the supplied acquisition hash (${item.sha256}). Preserve the source file and review its chain of custody.`, severity: "critical", confidence: 100, source: `integrity:${row.id}` }).returning({ id: findings.id });
          await tx.update(findings).set({ reference: `FND-${String(finding.id).padStart(3, "0")}` }).where(eq(findings.id, finding.id));
        }
        created.push(row.id);
      }
      await tx.update(cases).set({ updatedAt: new Date().toISOString() }).where(eq(cases.id, caseId));
      return created;
    });
    return Response.json({ message: `${files.length} evidence file${files.length === 1 ? "" : "s"} imported into ${selected.reference}.`, ids, failed: prepared.filter((e) => e.integrity === "failed").length }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) return Response.json({ error: error.message }, { status: error.status });
    console.error("Evidence import failed:", error);
    return Response.json({ error: "Unable to import evidence. Check your files and try again." }, { status: 500 });
  }
}
