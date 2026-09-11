"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ArrowUpRight, Bot, Check, CheckCircle2, ChevronLeft, ChevronRight, CircleAlert, Clock3, Database, Download, FileText, Flag, Folder, Hash, LockKeyhole, Search, Settings2, ShieldCheck, X, XCircle, type LucideIcon } from "lucide-react";
import type { CaseRecord, Severity } from "@/lib/types";

export function timeAgo(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}
export function formatDate(value: string, includeTime = false) {
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC", ...(includeTime ? { hour: "2-digit", minute: "2-digit", hour12: false } : {}) });
}
export function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1048576) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1048576).toFixed(1)} MB`;
}
export function shortenHash(hash: string) { return `${hash.slice(0, 7)}…${hash.slice(-7)}`; }
export function StatusBadge({ status, noDot = false }: { status: string; noDot?: boolean }) {
  return <span className={`status-badge status-${status}`}>{!noDot && <span className="status-dot" />}{status.replace(/-/g, " ")}</span>;
}
export function SeverityBars({ severity, label = false }: { severity: Severity; label?: boolean }) {
  const count = { critical: 3, high: 2, medium: 2, low: 1 }[severity];
  return <span className={`severity severity-${severity}`} title={`${severity} severity`} aria-label={`${severity} severity`}><span className="severity-bars">{[1, 2, 3].map((n) => <i key={n} className={n <= count ? "filled" : ""} />)}</span>{label && <span className="severity-label">{severity}</span>}</span>;
}
export function IntegrityBadge({ status, full = false }: { status: string; full?: boolean }) {
  const Icon = status === "verified" ? CheckCircle2 : status === "failed" ? XCircle : Clock3;
  return <span className={`integrity-badge integrity-${status}`}><Icon size={13} strokeWidth={2.5} />{full ? status : status === "verified" ? "OK" : status === "failed" ? "FAIL" : "PENDING"}</span>;
}
export const EVENT_ICONS: Record<string, LucideIcon> = { finding: Flag, analysis: Bot, upload: Database, verify: ShieldCheck, report: FileText, alert: LockKeyhole, case: Folder, system: Settings2, download: Download };
export function EventIcon({ kind }: { kind: string }) { const Icon = EVENT_ICONS[kind] || Clock3; return <span className={`event-icon event-${kind}`}><Icon size={19} strokeWidth={1.8} /></span>; }
export function Panel({ title, action, children, className = "" }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}><header className="panel-header"><h2>{title}</h2>{action}</header>{children}</section>;
}
export function ViewAll({ onClick, label = "View all" }: { onClick: () => void; label?: string }) { return <button className="text-link" onClick={onClick}>{label}<ArrowRight size={13} /></button>; }
export function EmptyState({ title = "Nothing here yet", description = "Try adjusting your search or filters.", icon: Icon = Search, action }: { title?: string; description?: string; icon?: LucideIcon; action?: ReactNode }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={27} /></span><h3>{title}</h3><p>{description}</p>{action}</div>;
}
export function PageHeading({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p className="page-description">{description}</p></div>{actions && <div className="page-heading-actions">{actions}</div>}</div>;
}
export function SearchField({ value, onChange, placeholder = "Search..." }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <div className="search-field"><Search size={16} /><input aria-label={placeholder} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />{value && <button type="button" className="icon-button small" aria-label="Clear search" onClick={() => onChange("")}><X size={13} /></button>}</div>;
}
export function Pagination({ total, page, pageSize, setPage }: { total: number; page: number; pageSize: number; setPage: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return <div className="pagination"><span>Showing <strong>{total ? (page - 1) * pageSize + 1 : 0}–{Math.min(total, page * pageSize)}</strong> of <strong>{total}</strong> records</span><div><button className="icon-button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></button><span className="page-number">{page} <span>/ {pages}</span></span><button className="icon-button" aria-label="Next page" disabled={page >= pages} onClick={() => setPage(page + 1)}><ChevronRight size={16} /></button></div></div>;
}
export function CaseTable({ cases, compact = false, onOpen }: { cases: CaseRecord[]; compact?: boolean; onOpen: (id: number) => void }) {
  return <div className="table-scroll"><table className={`data-table case-table ${compact ? "compact" : ""}`}><thead><tr><th>Case ID</th><th>Name</th><th>Evidence</th><th>Severity</th><th>Status</th>{!compact && <th>Opened</th>}</tr></thead><tbody>{cases.map((item) => <tr key={item.id} className="clickable-row" tabIndex={0} onClick={() => onOpen(item.id)} onKeyDown={(e) => { if (e.key === "Enter") onOpen(item.id); }} aria-label={`Open ${item.reference}: ${item.title}`}><td><span className="reference">{item.reference}</span></td><td className="case-name-cell"><span className="cell-title">{item.title}</span><span className="cell-description">{item.description}</span></td><td><span className="file-count">{!compact && <Database size={13} />}{item.evidenceCount} <span>files</span></span></td><td><SeverityBars severity={item.severity} /></td><td><StatusBadge status={item.status} /></td>{!compact && <td><span className="table-date">{formatDate(item.createdAt)}</span><ArrowUpRight size={13} className="row-arrow" /></td>}</tr>)}</tbody></table></div>;
}
export function Modal({ title, children, onClose, wide = false, className = "" }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const nodes = ref.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]');
        if (!nodes?.length) return;
        const first = nodes[0]; const last = nodes[nodes.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", handleKey); previous?.focus(); };
  }, [onClose]);
  return createPortal(<div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><div className={`modal ${wide ? "modal-wide" : ""} ${className}`} role="dialog" aria-modal="true" aria-labelledby="dialog-title" ref={ref} tabIndex={-1}><header className="modal-header"><div className="modal-brand-mark"><Hash size={15} /></div><h2 id="dialog-title">{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={19} /></button></header>{children}</div></div>, document.body);
}
export function InlineNotice({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warning" | "success" }) {
  const Icon = tone === "warning" ? CircleAlert : tone === "success" ? Check : ShieldCheck;
  return <div className={`inline-notice notice-${tone}`}><Icon size={17} /><div>{children}</div></div>;
}
