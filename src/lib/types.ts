export type View = "dashboard" | "cases" | "evidence" | "timeline" | "graph" | "analysis" | "attack" | "findings" | "reports" | "plugins" | "audit";
export type Severity = "critical" | "high" | "medium" | "low";
export type CaseStatus = "critical" | "active" | "review" | "closed";
export type Integrity = "verified" | "pending" | "failed";

export interface CaseRecord {
  id: number;
  reference: string;
  title: string;
  description: string;
  severity: Severity;
  status: CaseStatus;
  assignee: string;
  createdAt: string;
  updatedAt: string;
  evidenceCount: number;
}
export interface EvidenceRecord {
  id: number;
  reference: string;
  caseId: number;
  name: string;
  fileType: string;
  mimeType: string;
  size: number;
  sha256: string;
  integrity: Integrity;
  technique: string | null;
  createdAt: string;
  caseReference: string;
  isSample: boolean;
}
export interface FindingRecord {
  id: number;
  reference: string;
  caseId: number;
  title: string;
  description: string;
  severity: Severity;
  status: "open" | "reviewed" | "resolved";
  technique: string;
  confidence: number;
  source: string;
  createdAt: string;
  caseReference: string;
}
export interface ActivityRecord {
  id: number;
  kind: string;
  title: string;
  description: string;
  caseId: number | null;
  createdAt: string;
}
export interface ReportSnapshot {
  case: Omit<CaseRecord, "evidenceCount">;
  evidence: Array<Pick<EvidenceRecord, "reference" | "name" | "sha256" | "integrity" | "size">>;
  findings: Array<Pick<FindingRecord, "reference" | "title" | "description" | "severity" | "status">>;
  analyst: string;
  watermark: boolean;
}
export interface ReportRecord {
  id: number;
  reference: string;
  title: string;
  caseId: number;
  caseReference: string;
  createdAt: string;
}
export interface PluginRecord {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  version: string;
}
export interface AnalystProfile { name: string; role: string; email: string }
export interface WorkspaceData {
  cases: CaseRecord[];
  evidence: EvidenceRecord[];
  findings: FindingRecord[];
  activity: ActivityRecord[];
  reports: ReportRecord[];
  plugins: PluginRecord[];
  profile: AnalystProfile;
  stats: {
    activeCases: number;
    totalEvidence: number;
    verifiedHashes: number;
    criticalFindings: number;
    pendingHashes: number;
    failedHashes: number;
    newCasesThisWeek: number;
    evidenceToday: number;
  };
  techniques: Array<{ id: string; count: number }>;
}
export const TECHNIQUES = [
  { id: "T1059", name: "Command & Scripting", fullName: "Command and Scripting Interpreter", tactic: "Execution", color: "#4c9dff", description: "Adversaries may abuse command and script interpreters to execute commands, scripts, or binaries." },
  { id: "T1078", name: "Valid Accounts", fullName: "Valid Accounts", tactic: "Defense Evasion", color: "#9661ff", description: "Adversaries may obtain and abuse credentials of existing accounts as a means of gaining access." },
  { id: "T1027", name: "Obfuscated Files", fullName: "Obfuscated Files or Information", tactic: "Defense Evasion", color: "#00c89b", description: "Adversaries may make files difficult to discover or analyze by encrypting, encoding, or obfuscating content." },
  { id: "T1003", name: "OS Credential Dumping", fullName: "OS Credential Dumping", tactic: "Credential Access", color: "#f5b83f", description: "Adversaries may attempt to dump credentials to obtain account login and credential material." },
  { id: "T1041", name: "Exfiltration Over C2", fullName: "Exfiltration Over C2 Channel", tactic: "Exfiltration", color: "#fb526d", description: "Adversaries may steal data by exfiltrating it over an existing command and control channel." },
  { id: "T1566", name: "Phishing", fullName: "Phishing", tactic: "Initial Access", color: "#668ac5", description: "Adversaries may send phishing messages to gain access to victim systems." },
] as const;
export const VIEW_LABELS: Record<View, string> = { dashboard: "Dashboard", cases: "Cases", evidence: "Evidence Vault", timeline: "Timeline", graph: "Evidence Graph", analysis: "AI Analysis", attack: "ATT&CK Map", findings: "Findings", reports: "Reports", plugins: "Plugins", audit: "Audit Log" };
