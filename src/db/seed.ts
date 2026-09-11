import { db } from "@/db";
import { cases, evidence, findings, activity, plugins, reports, settings } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { createHash } from "node:crypto";
import type { CaseStatus, Severity, ReportSnapshot } from "@/lib/types";

let initialized: Promise<void> | undefined;
export function ensureWorkspace() {
  if (!initialized) initialized = seed().catch((error) => { initialized = undefined; throw error; });
  return initialized;
}
async function seed() {
  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(741829)`);
    const existing = await tx.select({ id: cases.id }).from(cases).limit(1);
    if (existing.length) return;
    const now = Date.now();
    const ago = (minutes: number) => new Date(now - minutes * 60000).toISOString();
    const caseSeeds: [string, string, string, Severity, CaseStatus, number][] = [
      ["CSE-009", "Exam Paper Leak", "College server breach — 2 suspects", "critical", "critical", 7],
      ["CSE-008", "Data Exfiltration", "HR database unauthorized access", "high", "active", 12],
      ["CSE-007", "Ransomware Incident", "Finance dept — encrypted files", "critical", "review", 23],
      ["CSE-006", "Insider Threat", "USB data transfer — employee", "medium", "active", 5],
      ["CSE-005", "Phishing Campaign", "Email spoofing — 40 targets", "high", "closed", 9],
      ["CSE-004", "Privilege Escalation", "Unauthorized administrator account activity", "critical", "critical", 4],
      ["CSE-003", "Network Intrusion", "Unrecognized traffic on the internal network", "high", "active", 4],
      ["CSE-002", "Credential Theft", "Compromised service account investigation", "high", "review", 3],
      ["CSE-001", "Website Defacement", "Public portal integrity investigation", "low", "closed", 3],
      ["CSE-015", "Cloud Access Review", "Unexpected access to cloud storage", "medium", "active", 3],
      ["CSE-014", "Suspicious PowerShell", "Endpoint command execution investigation", "high", "active", 3],
      ["CSE-013", "Database Anomaly", "Irregular queries in production logs", "medium", "review", 2],
      ["CSE-012", "Lateral Movement", "Remote service access across endpoints", "critical", "critical", 2],
      ["CSE-011", "Unapproved Software", "Unrecognized executable on managed device", "low", "active", 2],
      ["CSE-010", "Lost Device", "Corporate laptop incident review", "low", "closed", 2],
    ];
    const caseRows = await tx.insert(cases).values(caseSeeds.map((item, i) => ({ reference: item[0], title: item[1], description: item[2], severity: item[3], status: item[4], createdAt: ago(i < 3 ? 120 + i * 1440 : (i + 5) * 1440), updatedAt: ago(i * 80) }))).returning();
    const primaryNames = ["windows_events.evtx", "system.log", "suspicious_traffic.pcap", "user_registry.hiv", "malware_sample.exe", "exam_documents.zip", "server_access.log"];
    const otherNames = ["network_capture.pcap", "authentication.log", "disk_image.dd", "memory_dump.mem", "email_headers.eml", "access_records.csv", "browser_history.db", "shell_history.txt", "security_events.evtx", "incident_notes.txt", "process_list.csv", "registry_backup.hiv"];
    const techDistribution = [["T1059", 18], ["T1078", 14], ["T1027", 10], ["T1003", 8], ["T1041", 6], ["T1566", 4]] as const;
    const techIds: string[] = techDistribution.flatMap(([id, count]) => Array.from({ length: count }, () => id));
    let number = 0;
    const evidenceValues = caseRows.flatMap((row, caseIndex) => Array.from({ length: caseSeeds[caseIndex][5] }, (_, fileIndex) => {
      const i = number++;
      const name = caseIndex === 0 ? primaryNames[fileIndex] : `${fileIndex >= otherNames.length ? `${Math.floor(fileIndex / otherNames.length) + 1}_` : ""}${otherNames[fileIndex % otherNames.length]}`;
      const original = Buffer.from(`SecTrace demonstration evidence\nCase: ${row.reference}\nFile: ${name}\nRecord: ${i + 1}\nThis is a safe, synthetic sample for exploring the forensic workspace.\nNo real incident data or executable code is included.\n${i === 2 ? "DEMO INDICATOR: unusually large outbound transfer to an external host.\n" : ""}`);
      const stored = i === 4 ? Buffer.concat([original, Buffer.from("\nDEMO: content modified after acquisition to demonstrate a hash mismatch.")]) : original;
      return { reference: `EVD-${String(i + 1).padStart(3, "0")}`, caseId: row.id, name, fileType: name.split(".").pop()?.toUpperCase() || "FILE", mimeType: "application/octet-stream", size: stored.length, sha256: createHash("sha256").update(original).digest("hex"), data: stored.toString("base64"), integrity: i === 4 ? "failed" as const : i >= 82 ? "pending" as const : "verified" as const, technique: techIds[i] || null, isSample: true, createdAt: ago(i < 11 ? i * 3 + 1 : (Math.floor((i - 11) / 10) + 1) * 1440 + i) };
    }));
    const evidenceRows = await tx.insert(evidence).values(evidenceValues).returning();
    const findingSeeds: [number, string, string, Severity, string, number][] = [
      [4, "Spoofed sender domain", "Demonstration: email headers contain a lookalike sender domain. Validate the original message before taking action.", "medium", "T1566", 78],
      [3, "Removable media activity", "Demonstration: an unapproved USB device was connected during the incident window.", "medium", "T1041", 82],
      [1, "Off-hours login pattern", "Demonstration: the service account accessed the HR database outside its normal operating hours.", "high", "T1078", 91],
      [2, "Encoded command execution", "Demonstration: encoded commands were found in the synthetic endpoint event log.", "high", "T1059", 89],
      [5, "Administrator privilege abuse", "Demonstration: an unapproved account received elevated access. Review the change history.", "critical", "T1078", 95],
      [12, "Remote credential reuse", "Demonstration: the same service credentials were used across several endpoints.", "critical", "T1003", 94],
      [2, "Mass file encryption", "Demonstration: a rapid sequence of file rewrites is consistent with simulated ransomware activity.", "critical", "T1027", 98],
      [1, "Sensitive data transfer", "Demonstration: a large outbound transfer followed access to sensitive HR records.", "critical", "T1041", 96],
      [0, "Exam document exfiltration", "Demonstration: exam archive access correlates with unusual outbound traffic. Preserve the packet capture and review the access logs.", "critical", "T1041", 97],
    ];
    const findingRows = await tx.insert(findings).values(findingSeeds.map((f, i) => ({ reference: `FND-${String(i + 1).padStart(3, "0")}`, caseId: caseRows[f[0]].id, title: f[1], description: f[2], severity: f[3], technique: f[4], confidence: f[5], source: "demo", status: i < 2 ? "resolved" as const : "open" as const, createdAt: ago((8 - i) * 75 + 2) }))).returning();
    await tx.insert(plugins).values([
      { id: "hash-verifier", name: "SHA-256 Verifier", description: "Automatically verify the integrity of newly imported evidence against its acquisition hash.", enabled: true, version: "2.4.0" },
      { id: "local-analysis", name: "Local Rule Engine", description: "Run transparent, local checks for suspicious filenames, content indicators, and integrity mismatches.", enabled: true, version: "1.8.2" },
      { id: "integrity-alerts", name: "Integrity Alerts", description: "Create a critical finding when evidence fails a SHA-256 integrity check.", enabled: true, version: "1.3.0" },
      { id: "report-watermark", name: "Report Watermark", description: "Add a CONFIDENTIAL classification watermark to newly generated investigation reports.", enabled: true, version: "1.1.0" },
    ]);
    await tx.insert(settings).values({ key: "profile", value: { name: "Sudhir K.", role: "Lead Analyst", email: "sudhir.k@sectrace.local" } });
    for (const [index, caseIndex] of [2, 4, 1].entries()) {
      const selected = caseRows[caseIndex];
      const snapshot: ReportSnapshot = { case: { ...selected, reference: selected.reference! }, evidence: evidenceRows.filter((e) => e.caseId === selected.id).map((e) => ({ reference: e.reference!, name: e.name, sha256: e.sha256, integrity: e.integrity, size: e.size })), findings: findingRows.filter((f) => f.caseId === selected.id).map((f) => ({ reference: f.reference!, title: f.title, description: f.description, severity: f.severity, status: f.status })), analyst: "Sudhir K.", watermark: true };
      await tx.insert(reports).values({ reference: `RPT-${String(index + 1).padStart(3, "0")}`, title: `${selected.title} — Investigation Report`, caseId: selected.id, snapshot, createdAt: ago(60 + index * 1440) });
    }
    await tx.insert(activity).values([
      { kind: "finding", title: "Critical finding detected", description: "FND-009 generated for CSE-009", caseId: caseRows[0].id, createdAt: ago(2) },
      { kind: "analysis", title: "Unusual login pattern detected", description: "Sample anomaly score 0.91 · off-hours access", caseId: caseRows[1].id, createdAt: ago(8) },
      { kind: "upload", title: "suspicious_traffic.pcap uploaded", description: "Evidence added to CSE-009", caseId: caseRows[0].id, createdAt: ago(15) },
      { kind: "verify", title: "SHA-256 integrity verified", description: "windows_events.evtx · integrity OK", caseId: caseRows[0].id, createdAt: ago(21) },
      { kind: "report", title: "Investigation report generated", description: "CSE-007 · PDF report ready", caseId: caseRows[2].id, createdAt: ago(60) },
      { kind: "alert", title: "Chain of custody alert", description: "CSE-009 / EVD-005 · hash mismatch", caseId: caseRows[0].id, createdAt: ago(120) },
      { kind: "case", title: "New investigation opened", description: "Exam Paper Leak · assigned to Sudhir K.", caseId: caseRows[0].id, createdAt: ago(125) },
      { kind: "verify", title: "Evidence integrity verified", description: "Initial acquisition hashes stored", caseId: caseRows[1].id, createdAt: ago(1440) },
      { kind: "case", title: "Case moved to review", description: "CSE-007 · Ransomware Incident", caseId: caseRows[2].id, createdAt: ago(1500) },
    ]);
    await tx.update(cases).set({ updatedAt: ago(2) }).where(eq(cases.id, caseRows[0].id));
  });
}
