import { db } from "@/db";
import { cases, evidence, findings, activity, reports, plugins, settings } from "@/db/schema";
import { ensureWorkspace } from "@/db/seed";
import { and, asc, desc, eq, getTableColumns } from "drizzle-orm";
import { createHash } from "node:crypto";
import type { AnalystProfile, CaseStatus, Severity, WorkspaceData, ReportSnapshot } from "@/lib/types";

export class ApiError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
const reference = (prefix: string, id: number) => `${prefix}-${String(id).padStart(3, "0")}`;
export function requiredText(value: unknown, name: string, max = 200) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) throw new ApiError(`${name} is required (maximum ${max} characters).`);
  return value.trim();
}
export function validId(value: unknown) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw new ApiError("A valid record ID is required.");
  return id;
}
const severityOf = (value: unknown): Severity => {
  if (!["critical", "high", "medium", "low"].includes(String(value))) throw new ApiError("Choose a valid severity.");
  return value as Severity;
};
const statusOf = (value: unknown): CaseStatus => {
  if (!["critical", "active", "review", "closed"].includes(String(value))) throw new ApiError("Choose a valid case status.");
  return value as CaseStatus;
};
const defaultProfile: AnalystProfile = { name: "Sudhir K.", role: "Lead Analyst", email: "sudhir.k@sectrace.local" };

export async function getWorkspace(): Promise<WorkspaceData> {
  await ensureWorkspace();
  const { data: privateData, ...publicEvidence } = getTableColumns(evidence);
  void privateData;
  const { snapshot: privateSnapshot, ...publicReport } = getTableColumns(reports);
  void privateSnapshot;
  const [caseRows, evidenceRows, findingRows, events, reportRows, pluginRows, profileRows] = await Promise.all([
    db.select().from(cases).orderBy(desc(cases.createdAt)),
    db.select(publicEvidence).from(evidence).orderBy(asc(evidence.id)),
    db.select().from(findings).orderBy(desc(findings.createdAt)),
    db.select().from(activity).orderBy(desc(activity.createdAt)).limit(250),
    db.select(publicReport).from(reports).orderBy(desc(reports.createdAt)),
    db.select().from(plugins).orderBy(asc(plugins.id)),
    db.select().from(settings).where(eq(settings.key, "profile")),
  ]);
  const caseReference = (id: number) => caseRows.find((c) => c.id === id)?.reference || reference("CSE", id);
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const weekAgo = Date.now() - 7 * 86400000;
  const techniqueCounts = new Map<string, number>();
  for (const item of evidenceRows) if (item.technique) techniqueCounts.set(item.technique, (techniqueCounts.get(item.technique) || 0) + 1);
  return {
    cases: caseRows.map((c) => ({ ...c, reference: c.reference || reference("CSE", c.id), evidenceCount: evidenceRows.filter((e) => e.caseId === c.id).length })),
    evidence: evidenceRows.map((e) => ({ ...e, reference: e.reference || reference("EVD", e.id), caseReference: caseReference(e.caseId) })),
    findings: findingRows.map((f) => ({ ...f, reference: f.reference || reference("FND", f.id), caseReference: caseReference(f.caseId) })),
    activity: events,
    reports: reportRows.map((r) => ({ ...r, reference: r.reference || reference("RPT", r.id), caseReference: caseReference(r.caseId) })),
    plugins: pluginRows,
    profile: (profileRows[0]?.value as AnalystProfile) || defaultProfile,
    stats: {
      activeCases: caseRows.filter((c) => c.status !== "closed").length,
      totalEvidence: evidenceRows.length,
      verifiedHashes: evidenceRows.filter((e) => e.integrity === "verified").length,
      criticalFindings: findingRows.filter((f) => f.severity === "critical" && f.status === "open").length,
      pendingHashes: evidenceRows.filter((e) => e.integrity === "pending").length,
      failedHashes: evidenceRows.filter((e) => e.integrity === "failed").length,
      newCasesThisWeek: caseRows.filter((c) => new Date(c.createdAt).getTime() > weekAgo).length,
      evidenceToday: evidenceRows.filter((e) => new Date(e.createdAt).getTime() >= today.getTime()).length,
    },
    techniques: Array.from(techniqueCounts, ([id, count]) => ({ id, count })),
  };
}

export async function performAction(input: Record<string, unknown>) {
  await ensureWorkspace();
  switch (input.action) {
    case "create-case": {
      const title = requiredText(input.title, "Case title", 100);
      const description = typeof input.description === "string" ? input.description.trim().slice(0, 4000) : "";
      const severity = severityOf(input.severity || "medium");
      const assignee = requiredText(input.assignee || "Sudhir K.", "Assignee", 80);
      const result = await db.transaction(async (tx) => {
        const [row] = await tx.insert(cases).values({ title, description, severity, assignee, status: severity === "critical" ? "critical" : "active" }).returning();
        const ref = reference("CSE", row.id);
        await tx.update(cases).set({ reference: ref }).where(eq(cases.id, row.id));
        await tx.insert(activity).values({ kind: "case", title: "New investigation opened", description: `${ref} · ${title}`, caseId: row.id });
        return { id: row.id, reference: ref };
      });
      return { message: `${result.reference} created successfully.`, ...result };
    }
    case "update-case": {
      const id = validId(input.id);
      const [existing] = await db.select().from(cases).where(eq(cases.id, id));
      if (!existing) throw new ApiError("Case not found.", 404);
      const title = input.title === undefined ? existing.title : requiredText(input.title, "Case title", 100);
      const status = input.status === undefined ? existing.status : statusOf(input.status);
      const severity = input.severity === undefined ? existing.severity : severityOf(input.severity);
      const description = input.description === undefined ? existing.description : String(input.description).trim().slice(0, 4000);
      const assignee = input.assignee === undefined ? existing.assignee : requiredText(input.assignee, "Assignee", 80);
      await db.transaction(async (tx) => {
        await tx.update(cases).set({ title, status, severity, description, assignee, updatedAt: new Date().toISOString() }).where(eq(cases.id, id));
        await tx.insert(activity).values({ kind: "case", title: "Case details updated", description: `${existing.reference} · ${title} · ${status}`, caseId: id });
      });
      return { message: `${existing.reference} updated.` };
    }
    case "verify-evidence":
    case "verify-all": {
      const id = input.action === "verify-evidence" ? validId(input.id) : null;
      const result = await db.transaction(async (tx) => {
        const rows = id ? await tx.select().from(evidence).where(eq(evidence.id, id)) : await tx.select().from(evidence);
        if (!rows.length) throw new ApiError("No evidence found to verify.", 404);
        const [alertPlugin] = await tx.select().from(plugins).where(eq(plugins.id, "integrity-alerts"));
        let verified = 0; let failed = 0;
        for (const row of rows) {
          const actual = createHash("sha256").update(Buffer.from(row.data, "base64")).digest("hex");
          const integrity = actual === row.sha256 ? "verified" as const : "failed" as const;
          await tx.update(evidence).set({ integrity }).where(eq(evidence.id, row.id));
          if (integrity === "verified") verified++; else {
            failed++;
            if (alertPlugin?.enabled) {
              const source = `integrity:${row.id}`;
              const [found] = await tx.select({ id: findings.id }).from(findings).where(eq(findings.source, source));
              if (!found) {
                const [finding] = await tx.insert(findings).values({ caseId: row.caseId, title: `Integrity mismatch: ${row.name}`, description: `The stored content of ${row.reference} does not match its acquisition SHA-256 hash. Expected: ${row.sha256}. Computed: ${actual}. Preserve the original evidence and investigate the custody history.`, severity: "critical", confidence: 100, source }).returning();
                await tx.update(findings).set({ reference: reference("FND", finding.id) }).where(eq(findings.id, finding.id));
              }
            }
          }
        }
        await tx.insert(activity).values({ kind: failed ? "alert" : "verify", title: failed ? "Evidence integrity check: mismatch found" : "SHA-256 integrity verified", description: `${verified} verified · ${failed} failed${id ? ` · ${rows[0].name}` : " · complete vault scan"}`, caseId: id ? rows[0].caseId : null });
        return { verified, failed };
      });
      return { message: `${result.verified} file${result.verified === 1 ? "" : "s"} verified${result.failed ? `; ${result.failed} hash mismatch${result.failed === 1 ? "" : "es"} detected.` : ". Integrity checks passed."}`, ...result };
    }
    case "create-finding": {
      const caseId = validId(input.caseId);
      const title = requiredText(input.title, "Finding title", 160);
      const description = requiredText(input.description, "Description", 4000);
      const severity = severityOf(input.severity);
      const [selected] = await db.select().from(cases).where(eq(cases.id, caseId));
      if (!selected) throw new ApiError("Case not found.", 404);
      const result = await db.transaction(async (tx) => {
        const [row] = await tx.insert(findings).values({ caseId, title, description, severity, technique: typeof input.technique === "string" ? input.technique.slice(0, 20) : "", source: "manual" }).returning();
        const ref = reference("FND", row.id);
        await tx.update(findings).set({ reference: ref }).where(eq(findings.id, row.id));
        await tx.insert(activity).values({ kind: "finding", title: "Analyst finding recorded", description: `${ref} · ${selected.reference} · ${title}`, caseId });
        return ref;
      });
      return { message: `${result} recorded.` };
    }
    case "update-finding": {
      const id = validId(input.id);
      if (!["open", "reviewed", "resolved"].includes(String(input.status))) throw new ApiError("Choose a valid finding status.");
      const [row] = await db.select().from(findings).where(eq(findings.id, id));
      if (!row) throw new ApiError("Finding not found.", 404);
      await db.transaction(async (tx) => {
        await tx.update(findings).set({ status: input.status as "open" | "reviewed" | "resolved" }).where(eq(findings.id, id));
        await tx.insert(activity).values({ kind: "finding", title: `Finding ${input.status}`, description: `${row.reference} · ${row.title}`, caseId: row.caseId });
      });
      return { message: `${row.reference} marked as ${input.status}.` };
    }
    case "run-analysis": {
      const [engine] = await db.select().from(plugins).where(eq(plugins.id, "local-analysis"));
      if (!engine?.enabled) throw new ApiError("Enable the Local Rule Engine in Plugins before running an analysis.", 409);
      const caseId = input.caseId ? validId(input.caseId) : null;
      if (caseId) { const [selected] = await db.select({ id: cases.id }).from(cases).where(eq(cases.id, caseId)); if (!selected) throw new ApiError("Case not found.", 404); }
      const result = await db.transaction(async (tx) => {
        const rows = caseId ? await tx.select().from(evidence).where(eq(evidence.caseId, caseId)) : await tx.select().from(evidence);
        let detected = 0;
        for (const row of rows) {
          const content = row.size <= 524288 ? Buffer.from(row.data, "base64").toString("utf8") : "";
          const hashFailed = row.integrity === "failed";
          const suspiciousName = /malware|payload|ransom|suspicious|powershell/i.test(row.name);
          const contentMatch = /encodedcommand|invoke-expression|powershell\s+-enc|DEMO INDICATOR|password\s*=|credential dump/i.test(content);
          if (!hashFailed && !suspiciousName && !contentMatch) continue;
          const source = `rules:${row.id}`;
          const [existing] = await tx.select({ id: findings.id }).from(findings).where(eq(findings.source, source));
          if (existing) continue;
          const technique = /pcap|traffic/i.test(row.name) ? "T1041" : "T1059";
          const title = hashFailed ? `Hash mismatch requires review: ${row.name}` : `Suspicious indicator: ${row.name}`;
          const description = `Local rule-based analysis of ${row.reference}. ${hashFailed ? "The acquisition hash does not match the stored file." : contentMatch ? "A configured suspicious text indicator was matched in the file content." : "The filename matched a suspicious-name rule; this alone does not confirm malicious content."} ${row.isSample ? "This is synthetic demonstration evidence. " : ""}Analyst validation is required. This check is not an AI model, antivirus scan, or a definitive malware verdict.`;
          const [finding] = await tx.insert(findings).values({ caseId: row.caseId, title, description, severity: hashFailed ? "critical" : "high", technique: hashFailed ? "" : technique, confidence: hashFailed ? 100 : contentMatch ? 85 : 60, source }).returning();
          await tx.update(findings).set({ reference: reference("FND", finding.id) }).where(eq(findings.id, finding.id));
          if (!hashFailed) await tx.update(evidence).set({ technique }).where(eq(evidence.id, row.id));
          detected++;
        }
        await tx.insert(activity).values({ kind: "analysis", title: "Local analysis completed", description: `${rows.length} files checked · ${detected} new findings · rule-based checks`, caseId });
        return { checked: rows.length, detected };
      });
      return { message: `Analysis complete. ${result.checked} files checked, ${result.detected} new findings.`, ...result };
    }
    case "toggle-plugin": {
      const id = requiredText(input.id, "Plugin ID");
      if (typeof input.enabled !== "boolean") throw new ApiError("A boolean enabled value is required.");
      const [row] = await db.select().from(plugins).where(eq(plugins.id, id));
      if (!row) throw new ApiError("Plugin not found.", 404);
      await db.transaction(async (tx) => {
        await tx.update(plugins).set({ enabled: input.enabled as boolean }).where(eq(plugins.id, id));
        await tx.insert(activity).values({ kind: "system", title: `Plugin ${input.enabled ? "enabled" : "disabled"}`, description: row.name });
      });
      return { message: `${row.name} ${input.enabled ? "enabled" : "disabled"}.` };
    }
    case "update-profile": {
      const name = requiredText(input.name, "Name", 80);
      const role = requiredText(input.role, "Role", 60);
      const email = requiredText(input.email, "Email", 160);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError("Enter a valid email address.");
      await db.transaction(async (tx) => {
        await tx.insert(settings).values({ key: "profile", value: { name, role, email } }).onConflictDoUpdate({ target: settings.key, set: { value: { name, role, email } } });
        await tx.insert(activity).values({ kind: "system", title: "Analyst profile updated", description: `${name} · ${role}` });
      });
      return { message: "Analyst profile saved." };
    }
    case "create-report": {
      const caseId = validId(input.caseId);
      const title = requiredText(input.title, "Report title", 160);
      const result = await db.transaction(async (tx) => {
        const [selected] = await tx.select().from(cases).where(eq(cases.id, caseId));
        if (!selected) throw new ApiError("Case not found.", 404);
        const rows = await tx.select({ reference: evidence.reference, name: evidence.name, sha256: evidence.sha256, integrity: evidence.integrity, size: evidence.size }).from(evidence).where(eq(evidence.caseId, caseId));
        const found = await tx.select({ reference: findings.reference, title: findings.title, description: findings.description, severity: findings.severity, status: findings.status }).from(findings).where(eq(findings.caseId, caseId));
        const [profile] = await tx.select().from(settings).where(eq(settings.key, "profile"));
        const [watermark] = await tx.select().from(plugins).where(eq(plugins.id, "report-watermark"));
        const snapshot: ReportSnapshot = { case: { ...selected, reference: selected.reference! }, evidence: rows.map((e) => ({ ...e, reference: e.reference! })), findings: found.map((f) => ({ ...f, reference: f.reference! })), analyst: (profile?.value as AnalystProfile)?.name || "Analyst", watermark: watermark?.enabled ?? false };
        const [row] = await tx.insert(reports).values({ caseId, title, snapshot }).returning();
        const ref = reference("RPT", row.id);
        await tx.update(reports).set({ reference: ref }).where(eq(reports.id, row.id));
        await tx.insert(activity).values({ kind: "report", title: "Investigation report generated", description: `${selected.reference} · ${ref} · immutable PDF snapshot`, caseId });
        return { id: row.id, reference: ref };
      });
      return { message: `${result.reference} is ready to download.`, ...result };
    }
    default: throw new ApiError("Unknown workspace action.");
  }
}
