"use client";

import { useState } from "react";
import { ArrowUp, ArrowUpRight, ChevronDown, Database, Flag, FolderClosed, RefreshCw, ShieldCheck, LockKeyhole } from "lucide-react";
import { useWorkspace } from "@/components/workspace-context";
import { CaseTable, EventIcon, IntegrityBadge, Panel, shortenHash, timeAgo, ViewAll } from "@/components/ui";
import { TECHNIQUES } from "@/lib/types";

export default function Dashboard() {
  const { data, navigate, openModal, refresh, notify } = useWorkspace();
  const [range, setRange] = useState("7");
  const [refreshing, setRefreshing] = useState(false);
  const { stats } = data;
  const cards = [
    { label: "Active cases", value: stats.activeCases, icon: FolderClosed, color: "cyan", trend: `${stats.newCasesThisWeek} opened this week`, positive: true, onClick: () => navigate("cases", "open") },
    { label: "Evidence files", value: stats.totalEvidence, icon: Database, color: "amber", trend: `${stats.evidenceToday} added today`, positive: true, onClick: () => navigate("evidence") },
    { label: "Verified hashes", value: stats.verifiedHashes, icon: ShieldCheck, color: "green", trend: `${stats.pendingHashes + stats.failedHashes} require attention`, positive: false, onClick: () => navigate("evidence", "verified") },
    { label: "Critical findings", value: stats.criticalFindings, icon: Flag, color: "rose", trend: "Needs your review", positive: false, onClick: () => navigate("findings", "critical") },
  ];
  const techniqueCounts = TECHNIQUES.map((technique) => ({ ...technique, count: data.evidence.filter((e) => e.technique === technique.id && (range === "all" || Date.now() - new Date(e.createdAt).getTime() < Number(range) * 86400000)).length }));
  const maximum = Math.max(21, ...techniqueCounts.map((t) => t.count + 2));
  return <div className="dashboard-view">
    <div className="stats-grid">{cards.map((card) => <button className={`stat-card stat-${card.color}`} key={card.label} onClick={card.onClick}><div className="stat-label">{card.label}<ArrowUpRight size={14} className="stat-arrow" /></div><div className="stat-main"><span className="stat-value">{card.value.toString().padStart(2, "0")}</span><card.icon className="stat-icon" size={36} strokeWidth={1.5} /></div><div className={`stat-trend ${card.positive ? "trend-positive" : ""}`}>{card.positive ? <ArrowUp size={13} strokeWidth={2.5} /> : card.color === "rose" ? <span className="tiny-dot" /> : <span className="trend-count">{stats.pendingHashes + stats.failedHashes}</span>}{card.color === "green" ? "require attention" : card.trend}</div></button>)}</div>
    <div className="dashboard-middle">
      <Panel title="Recent cases" className="recent-cases-panel" action={<ViewAll onClick={() => navigate("cases")} />}><CaseTable cases={data.cases.slice(0, 5)} compact onOpen={(id) => openModal({ type: "case-detail", id })} />{data.cases.length < 5 && <button className="add-case-empty" onClick={() => openModal({ type: "case-create" })}>Open a new investigation <ArrowUpRight size={15} /></button>}</Panel>
      <Panel title="Live activity" className="activity-panel" action={<span className="live-indicator"><span />Live</span>}><div className="activity-list">{data.activity.slice(0, 6).map((item) => <button className="activity-item" key={item.id} onClick={() => openModal({ type: "event", id: item.id })}><EventIcon kind={item.kind} /><span className="activity-copy"><span className="activity-title">{item.title}</span><span className={`activity-description ${item.kind === "alert" ? "alert-description" : ""}`}>{item.description}</span></span><time className="activity-time" suppressHydrationWarning>{timeAgo(item.createdAt)}</time></button>)}</div></Panel>
    </div>
    <div className="dashboard-bottom">
      <Panel title="Top ATT&CK techniques" className="techniques-panel" action={<div className="range-select"><select aria-label="Technique date range" value={range} onChange={(e) => setRange(e.target.value)}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="all">All time</option></select><ChevronDown size={11} /></div>}><div className="technique-chart">{techniqueCounts.map((technique) => <button className="technique-row" key={technique.id} onClick={() => openModal({ type: "technique", id: technique.id })}><span className="technique-label"><span>{technique.id}</span><i>—</i>{technique.name}</span><span className="technique-track"><span style={{ width: `${technique.count / maximum * 100}%`, background: technique.color, boxShadow: `0 0 9px ${technique.color}20` }} /></span><span className="technique-count">{technique.count}</span></button>)}</div><div className="chart-caption"><span className="tiny-dot" />Observed across your evidence</div></Panel>
      <Panel title="Evidence integrity" className="integrity-panel" action={<ViewAll onClick={() => navigate("evidence")} />}><div className="table-scroll"><table className="data-table integrity-table"><thead><tr><th>Evidence name</th><th>Hash <span>(SHA-256)</span></th><th>Status</th></tr></thead><tbody>{data.evidence.slice(0, 5).map((item) => <tr key={item.id} className="clickable-row" tabIndex={0} onClick={() => openModal({ type: "evidence-detail", id: item.id })} onKeyDown={(e) => { if (e.key === "Enter") openModal({ type: "evidence-detail", id: item.id }); }} aria-label={`Inspect ${item.name}`}><td><span className="evidence-filename">{item.name}</span></td><td><span className="hash-preview">{shortenHash(item.sha256)}</span></td><td><IntegrityBadge status={item.integrity} /></td></tr>)}</tbody></table></div></Panel>
    </div>
    <footer className="workspace-footer"><span><LockKeyhole size={11} />Demo workspace<span className="footer-dot">·</span>Synthetic sample data</span><button disabled={refreshing} onClick={async () => { setRefreshing(true); try { await refresh(); notify("Workspace is up to date.", "info"); } catch { notify("Unable to refresh the workspace.", "error"); } finally { setRefreshing(false); } }}><RefreshCw size={11} className={refreshing ? "spin" : ""} />{refreshing ? "Syncing workspace..." : "Auto-sync enabled"}<span className="footer-dot">·</span>All times UTC</button></footer>
  </div>;
}
