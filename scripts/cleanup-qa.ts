import "dotenv/config";
import { readFile } from "node:fs/promises";
import { db, pool } from "@/db";
import { activity, cases, evidence, findings, plugins, reports, settings } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import type { WorkspaceData } from "@/lib/types";

async function main() {
  const fixture: { marker: string; baseline: WorkspaceData } = JSON.parse(await readFile("artifacts/qa-fixture.json", "utf8"));
  if (!/^SECTRACE-QA-\d+$/.test(fixture.marker)) throw new Error("Refusing to clean an invalid QA fixture.");
  await db.transaction(async (tx) => {
    const rows = await tx.select({ id: cases.id, title: cases.title }).from(cases);
    const qaIds = rows.filter((c) => c.title.startsWith(fixture.marker)).map((c) => c.id);
    if (qaIds.length) {
      await tx.delete(reports).where(inArray(reports.caseId, qaIds));
      await tx.delete(activity).where(inArray(activity.caseId, qaIds));
      await tx.delete(cases).where(inArray(cases.id, qaIds));
    }
    // Restore only pre-existing records changed by the vault-wide QA verification.
    for (const item of fixture.baseline.evidence) {
      await tx.update(evidence).set({ integrity: item.integrity, technique: item.technique }).where(eq(evidence.id, item.id));
    }
    const originalFindingIds = new Set(fixture.baseline.findings.map((f) => f.id));
    const extraIntegrity = (await tx.select().from(findings)).filter((f) => !originalFindingIds.has(f.id) && f.source.startsWith("integrity:") && fixture.baseline.evidence.some((e) => f.source === `integrity:${e.id}`));
    if (extraIntegrity.length) await tx.delete(findings).where(inArray(findings.id, extraIntegrity.map((f) => f.id)));
    for (const plugin of fixture.baseline.plugins) await tx.update(plugins).set({ enabled: plugin.enabled }).where(eq(plugins.id, plugin.id));
    await tx.update(settings).set({ value: fixture.baseline.profile }).where(eq(settings.key, "profile"));
    const originalEventIds = new Set(fixture.baseline.activity.map((a) => a.id));
    const qaTitles = new Set(["Plugin disabled", "Plugin enabled", "Analyst profile updated", "Evidence integrity check: mismatch found", "SHA-256 integrity verified"]);
    const extraEvents = (await tx.select().from(activity)).filter((a) => !originalEventIds.has(a.id) && qaTitles.has(a.title));
    if (extraEvents.length) await tx.delete(activity).where(inArray(activity.id, extraEvents.map((a) => a.id)));
  });
  console.log("QA fixture removed; original demo evidence, findings, profile, and plugin settings restored.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => pool.end());
