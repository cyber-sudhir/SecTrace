"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { ArrowRight, Bot, CheckCircle2, ChevronRight, CircleAlert, Clock3, Database, FileText, Flag, Folder, Grid2X2, Info, List, LoaderCircle, Menu, MoreVertical, Network, Plug, Plus, Search, ShieldCheck, Target, Upload, X, type LucideIcon } from "lucide-react";
import { WorkspaceContext, type ActionResult, type ModalState } from "@/components/workspace-context";
import Dashboard from "@/components/dashboard";
import WorkspaceViews from "@/components/workspace-views";
import WorkspaceModals from "@/components/workspace-modals";
import { VIEW_LABELS, type View, type WorkspaceData } from "@/lib/types";

const NAVIGATION: { label: string; items: { id: View; icon: LucideIcon }[] }[] = [
  { label: "Main", items: [{ id: "dashboard", icon: Grid2X2 }, { id: "cases", icon: Folder }, { id: "evidence", icon: Database }] },
  { label: "Analysis", items: [{ id: "timeline", icon: Clock3 }, { id: "graph", icon: Network }, { id: "analysis", icon: Bot }, { id: "attack", icon: Target }] },
  { label: "Output", items: [{ id: "findings", icon: Flag }, { id: "reports", icon: FileText }] },
  { label: "System", items: [{ id: "plugins", icon: Plug }, { id: "audit", icon: List }] },
];
const SUBTITLES: Record<View, string> = { dashboard: "Overview", cases: "Investigations", evidence: "Repository", timeline: "Chronology", graph: "Relationships", analysis: "Intelligence", attack: "Techniques", findings: "Observations", reports: "Documentation", plugins: "Extensions", audit: "Event history" };
interface Toast { id: number; message: string; type: "success" | "error" | "info" }

export default function WorkspaceShell({ initialData, initialView = "dashboard", initialFilter = "" }: { initialData: WorkspaceData; initialView?: View; initialFilter?: string }) {
  const [data, setData] = useState(initialData);
  const [view, setView] = useState<View>(initialView);
  const [filter, setFilter] = useState(initialFilter);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [busy, setBusy] = useState(false);
  const [connected, setConnected] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const toastTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const closeModal = useCallback(() => setModal(null), []);
  const openModal = useCallback((next: ModalState) => { setModal(next); setSearchOpen(false); setQuery(""); setMobileOpen(false); }, []);
  const notify = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((previous) => [...previous.slice(-2), { id, message, type }]);
    toastTimers.current.push(setTimeout(() => setToasts((previous) => previous.filter((t) => t.id !== id)), type === "error" ? 8000 : 5000));
  }, []);
  useEffect(() => () => toastTimers.current.forEach(clearTimeout), []);
  const navigate = useCallback((next: View, nextFilter = "") => {
    setView(next); setFilter(nextFilter); setMobileOpen(false); setSearchOpen(false); setQuery("");
    const params = new URLSearchParams(); if (next !== "dashboard") params.set("view", next); if (nextFilter) params.set("filter", nextFilter);
    const url = params.toString() ? `/?${params}` : "/";
    window.history.pushState(null, "", url); window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/workspace", { cache: "no-store" });
      if (!response.ok) throw new Error("Workspace sync failed.");
      const fresh: WorkspaceData = await response.json(); setData(fresh); setConnected(true);
    } catch (error) { setConnected(false); throw error; }
  }, []);
  const runAction = useCallback(async (input: Record<string, unknown>, options?: { close?: boolean; silent?: boolean }): Promise<ActionResult | null> => {
    setBusy(true);
    try {
      const response = await fetch("/api/workspace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "The action could not be completed.");
      await refresh(); if (options?.close) closeModal(); if (!options?.silent) notify(result.message || "Workspace updated.", result.failed ? "error" : "success");
      return result as ActionResult;
    } catch (error) { notify(error instanceof Error ? error.message : "Something went wrong. Please try again.", "error"); return null; } finally { setBusy(false); }
  }, [refresh, closeModal, notify]);
  useEffect(() => {
    const timer = setInterval(() => { if (document.visibilityState === "visible") refresh().catch(() => {}); }, 30000);
    const onPop = () => { const params = new URLSearchParams(window.location.search); const next = params.get("view") || "dashboard"; setView(Object.prototype.hasOwnProperty.call(VIEW_LABELS, next) ? next as View : "dashboard"); setFilter(params.get("filter") || ""); setModal(null); };
    window.addEventListener("popstate", onPop);
    return () => { clearInterval(timer); window.removeEventListener("popstate", onPop); };
  }, [refresh]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && !modal) { e.preventDefault(); searchRef.current?.focus(); setSearchOpen(true); }
      if (e.key === "Escape") { setSearchOpen(false); setMobileOpen(false); searchRef.current?.blur(); }
    };
    const onClick = (e: globalThis.MouseEvent) => { if (!searchContainerRef.current?.contains(e.target as Node)) setSearchOpen(false); };
    document.addEventListener("keydown", onKey); document.addEventListener("mousedown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, [modal]);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase(); if (!q) return [];
    return [
      ...data.cases.filter((c) => `${c.reference} ${c.title} ${c.description}`.toLowerCase().includes(q)).slice(0, 4).map((c) => ({ title: c.title, subtitle: c.reference, kind: "Cases", icon: Folder, modal: { type: "case-detail", id: c.id } as ModalState })),
      ...data.evidence.filter((e) => `${e.reference} ${e.name} ${e.sha256} ${e.caseReference}`.toLowerCase().includes(q)).slice(0, 4).map((e) => ({ title: e.name, subtitle: `${e.reference} · ${e.caseReference}`, kind: "Evidence", icon: Database, modal: { type: "evidence-detail", id: e.id } as ModalState })),
      ...data.findings.filter((f) => `${f.reference} ${f.title} ${f.caseReference}`.toLowerCase().includes(q)).slice(0, 3).map((f) => ({ title: f.title, subtitle: `${f.reference} · ${f.caseReference}`, kind: "Findings", icon: Flag, modal: { type: "finding-detail", id: f.id } as ModalState })),
    ];
  }, [query, data]);
  const followNav = (event: MouseEvent<HTMLAnchorElement>, next: View) => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && event.button === 0) { event.preventDefault(); navigate(next); } };
  const initials = data.profile.name.split(" ").filter(Boolean).map((part) => part[0]).slice(0, 2).join("");
  const criticalCases = data.cases.filter((c) => c.status === "critical").length;
  const context = { data, view, initialFilter: filter, busy, navigate, openModal, closeModal, runAction, refresh, notify };
  return <WorkspaceContext.Provider value={context}><div className="app-shell" data-view={view}>
    <a className="skip-link" href="#main-content">Skip to workspace</a>
    {mobileOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
      <a className="brand" href="/" onClick={(e) => followNav(e, "dashboard")} aria-label="SecTrace dashboard"><span className="brand-name">Sec<span>Trace</span><i /></span><span className="brand-subtitle">FORENSIC PLATFORM</span></a>
      <nav className="sidebar-navigation" aria-label="Main navigation">{NAVIGATION.map((group) => <div className="nav-group" key={group.label}><h2>{group.label}</h2>{group.items.map((item) => { const badge = item.id === "cases" ? criticalCases : item.id === "analysis" ? data.stats.pendingHashes : 0; return <a key={item.id} href={item.id === "dashboard" ? "/" : `/?view=${item.id}`} className={`nav-item ${view === item.id ? "nav-active" : ""}`} aria-current={view === item.id ? "page" : undefined} onClick={(e) => followNav(e, item.id)}><item.icon size={19} strokeWidth={1.65} /><span>{VIEW_LABELS[item.id]}</span>{badge > 0 && <span className="nav-badge">{badge}</span>}</a>; })}</div>)}</nav>
      <div className="sidebar-bottom"><div className="workspace-status"><span className={connected ? "live-dot" : "offline-dot"} /><span>{connected ? "Workspace operational" : "Reconnecting to workspace"}</span><ShieldCheck size={13} /></div><button className="profile-button" onClick={() => openModal({ type: "profile" })} aria-label="Open analyst settings"><span className="avatar">{initials}</span><span className="profile-copy"><strong>{data.profile.name}</strong><span>{data.profile.role}</span></span><MoreVertical size={17} /></button></div>
    </aside>
    <header className="topbar"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={21} /></button><h1>{VIEW_LABELS[view]}<span className="breadcrumb-slash">/</span><span className="breadcrumb-current">{SUBTITLES[view]}</span></h1><div className={`header-search ${searchOpen ? "search-is-open" : ""}`} ref={searchContainerRef} onClick={() => searchRef.current?.focus()}><Search size={16} strokeWidth={1.8} /><input ref={searchRef} aria-label="Search cases, evidence, and findings" placeholder="Search cases, evidence..." value={query} onFocus={() => setSearchOpen(true)} onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); setHighlighted(0); }} onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((current) => Math.min(results.length - 1, current + 1)); } else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted((current) => Math.max(0, current - 1)); } else if (e.key === "Enter" && results[highlighted]) { e.preventDefault(); openModal(results[highlighted].modal); } }} autoComplete="off" role="combobox" aria-expanded={searchOpen && !!query.trim()} aria-controls="global-search-results" />{query || searchOpen ? <button className="search-clear" onClick={(e) => { e.stopPropagation(); setQuery(""); setSearchOpen(false); searchRef.current?.blur(); }} aria-label="Close search"><X size={13} /></button> : <kbd>⌘ K</kbd>}{searchOpen && !!query.trim() && <div className="global-search-results" id="global-search-results" role="listbox" onClick={(e) => e.stopPropagation()}><div className="search-result-heading">Workspace search<span>{results.length} results</span></div>{results.length ? results.map((result, i) => <div key={`${result.kind}-${result.subtitle}`}>{(i === 0 || results[i - 1].kind !== result.kind) && <div className="search-category">{result.kind}</div>}<button className={`global-search-result ${highlighted === i ? "highlighted" : ""}`} role="option" aria-selected={highlighted === i} onMouseEnter={() => setHighlighted(i)} onClick={() => openModal(result.modal)}><result.icon size={17} /><span><strong>{result.title}</strong><small>{result.subtitle}</small></span><ArrowRight size={13} /></button></div>) : <div className="no-search-results"><Search size={23} /><strong>No matches found</strong><span>Try a case ID, filename, hash, or finding.</span></div>}<div className="search-help"><span>↑ ↓ to navigate</span><span>↵ to open</span><span>esc to close</span></div></div>}</div><div className="header-actions"><button className="button header-import" onClick={() => openModal({ type: "import" })} title="Import evidence"><Upload size={16} /><span>Import</span></button><button className="button button-primary header-new-case" onClick={() => openModal({ type: "case-create" })}><Plus size={19} strokeWidth={1.8} /><span>New Case</span></button></div>{busy && <span className="request-progress" />}</header>
    <main className="workspace-main" id="main-content"><div className="workspace-content">{view === "dashboard" ? <Dashboard /> : <WorkspaceViews key={`${view}-${filter}`} view={view} />}</div></main>
    <WorkspaceModals modal={modal} />
    <div className="toast-stack" aria-live="polite">{toasts.map((toast) => { const Icon = toast.type === "success" ? CheckCircle2 : toast.type === "error" ? CircleAlert : Info; return <div key={toast.id} className={`toast toast-${toast.type}`} role={toast.type === "error" ? "alert" : "status"}><span><Icon size={19} /></span><p>{toast.message}</p><button aria-label="Dismiss notification" onClick={() => setToasts((previous) => previous.filter((t) => t.id !== toast.id))}><X size={14} /></button></div>; })}</div>
  </div></WorkspaceContext.Provider>;
}
