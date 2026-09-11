import { db } from "@/db";
import { reports, activity } from "@/db/schema";
import { ensureWorkspace } from "@/db/seed";
import { ApiError, validId } from "@/lib/workspace";
import { eq } from "drizzle-orm";
import { jsPDF } from "jspdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureWorkspace();
    const id = validId((await params).id);
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    if (!report) throw new ApiError("Report not found.", 404);
    const snapshot = report.snapshot;
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    pdf.setProperties({ title: report.title, author: snapshot.analyst, creator: "SecTrace Forensic Platform", subject: `${snapshot.case.reference} investigation snapshot` });
    let y = 42;
    const pageHeader = () => {
      pdf.setFillColor(7, 19, 35); pdf.rect(0, 0, 210, 29, "F");
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(21); pdf.setTextColor(242, 247, 255); pdf.text("Sec", 18, 18); pdf.setTextColor(0, 197, 233); pdf.text("Trace", 32.5, 18);
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(168, 188, 211); pdf.text("FORENSIC PLATFORM", 18, 24); pdf.text(report.reference || `RPT-${id}`, 190, 18, { align: "right" });
    };
    pageHeader();
    const ensureSpace = (height: number) => { if (y + height > 273) { pdf.addPage(); pageHeader(); y = 42; } };
    const write = (text: string, size = 10, bold = false, color: [number, number, number] = [57, 70, 89]) => {
      pdf.setFont("helvetica", bold ? "bold" : "normal"); pdf.setFontSize(size); pdf.setTextColor(...color);
      const clean = text.replace(/[—–]/g, "-").replace(/·/g, "/");
      const lines: string[] = pdf.splitTextToSize(clean, 174);
      for (const line of lines) { ensureSpace(size * 0.48 + 2); pdf.setFont("helvetica", bold ? "bold" : "normal"); pdf.setFontSize(size); pdf.setTextColor(...color); pdf.text(line, 18, y); y += size * 0.48; }
      y += 3;
    };
    const section = (text: string) => { y += 6; ensureSpace(16); pdf.setDrawColor(213, 224, 235); pdf.line(18, y - 3, 192, y - 3); write(text, 12, true, [5, 126, 153]); y += 2; };
    write("INVESTIGATION REPORT", 9, true, [5, 126, 153]);
    write(report.title, 22, true, [15, 29, 48]);
    write(`${snapshot.case.reference}  /  ${snapshot.case.status.toUpperCase()}  /  ${snapshot.case.severity.toUpperCase()} SEVERITY`, 9, true);
    write(`Generated: ${new Date(report.createdAt).toISOString().replace("T", " ").slice(0, 19)} UTC`);
    write(`Prepared by: ${snapshot.analyst}  |  Assigned analyst: ${snapshot.case.assignee}`);
    section("01  /  Case overview");
    write(snapshot.case.description || "No case description provided.");
    write(`${snapshot.evidence.length} evidence files  /  ${snapshot.findings.length} findings  /  ${snapshot.evidence.filter((e) => e.integrity === "verified").length} verified hashes`, 10, true);
    section("02  /  Evidence inventory & acquisition hashes");
    if (!snapshot.evidence.length) write("No evidence was attached to this case when the report was generated.");
    for (const item of snapshot.evidence) {
      ensureSpace(30);
      write(`${item.reference}  /  ${item.name}`, 10, true);
      write(`Integrity: ${item.integrity.toUpperCase()}  |  Stored size: ${item.size.toLocaleString("en-US")} bytes`, 9);
      write(`SHA-256: ${item.sha256}`, 8);
      y += 2;
    }
    section("03  /  Findings & analyst observations");
    if (!snapshot.findings.length) write("No findings were recorded at the time of report generation.");
    for (const finding of snapshot.findings) {
      ensureSpace(28);
      write(`${finding.reference}  /  ${finding.title}`, 11, true);
      write(`${finding.severity.toUpperCase()} SEVERITY  /  ${finding.status.toUpperCase()}`, 8, true, finding.severity === "critical" ? [191, 38, 67] : [91, 108, 130]);
      write(finding.description, 9);
      y += 3;
    }
    section("04  /  Report provenance");
    write("This report is an immutable snapshot of the case, evidence acquisition hashes, and findings at the recorded generation time. Later changes to the workspace are not included. Integrity verification compares stored file content against its acquisition hash; it does not establish the authenticity of the source. Rule-based indicators require analyst validation. Demonstration records, where present, are synthetic.", 9);
    const pages = pdf.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      pdf.setPage(p); pdf.setDrawColor(220, 228, 236); pdf.line(18, 281, 192, 281); pdf.setTextColor(117, 132, 151); pdf.setFont("helvetica", "normal"); pdf.setFontSize(8);
      pdf.text(snapshot.watermark ? "CONFIDENTIAL  /  SECTRACE FORENSIC PLATFORM" : "SECTRACE FORENSIC PLATFORM", 18, 287);
      pdf.text(`${p} / ${pages}`, 192, 287, { align: "right" });
    }
    await db.insert(activity).values({ kind: "download", title: "Report downloaded", description: `${report.reference} · ${snapshot.case.reference} · PDF`, caseId: report.caseId });
    return new Response(new Uint8Array(pdf.output("arraybuffer")), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="SecTrace-${snapshot.case.reference}-${report.reference}.pdf"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    if (error instanceof ApiError) return Response.json({ error: error.message }, { status: error.status });
    console.error("Report generation failed:", error);
    return Response.json({ error: "Unable to generate this PDF. Please try again." }, { status: 500 });
  }
}
