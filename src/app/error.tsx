"use client";

import { RefreshCw, ShieldAlert } from "lucide-react";

export default function WorkspaceError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="workspace-error"><section className="panel workspace-error-card"><span className="error-icon"><ShieldAlert size={31} strokeWidth={1.5} /></span><h1>Let’s reconnect your workspace.</h1><p>We couldn’t load the investigation workspace. Your stored evidence hasn’t been changed. Please try connecting again.</p><button className="button button-primary" onClick={reset}><RefreshCw size={15} />Try again</button><span className="mono">SECTRACE FORENSIC PLATFORM</span></section></main>;
}
