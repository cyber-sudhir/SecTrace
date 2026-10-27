SecTrace

Unified Digital Forensics Automation & Scripting Framework

Investigate. Preserve. Correlate. Verify. Report.

An evidence-centric digital forensics workspace for investigation case management, evidence integrity verification, explainable analysis, and forensic reporting.

Smart India Hackathon 2026 · PS 26148 · NTRO

"Next.js" (https://img.shields.io/badge/Next.js-App_Router-black?logo=next.js) "React" (https://img.shields.io/badge/React-UI-61DAFB?logo=react) "PostgreSQL" (https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql) "Drizzle ORM" (https://img.shields.io/badge/Drizzle-ORM-C5F74F) "SHA-256" (https://img.shields.io/badge/Integrity-SHA--256-2E8B57) "Status" (https://img.shields.io/badge/Status-Demo_Implementation-orange)

"Overview" (#overview) · "Features" (#key-features) · "Architecture" (#system-architecture) · "Installation" (#getting-started) · "API" (#api-reference) · "Testing" (#testing) · "Roadmap" (#roadmap)

---

Table of Contents

- "Overview" (#overview)
- "Problem Statement" (#problem-statement)
- "Project Objectives" (#project-objectives)
- "Key Features" (#key-features)
- "Investigation Workflow" (#investigation-workflow)
- "System Architecture" (#system-architecture)
- "Technology Stack" (#technology-stack)
- "Getting Started" (#getting-started)
- "Configuration" (#configuration)
- "Demo Dataset" (#demo-dataset)
- "API Reference" (#api-reference)
- "Analysis Engine and Plugins" (#analysis-engine-and-plugins)
- "Evidence Integrity and Reporting" (#evidence-integrity-and-reporting)
- "Testing" (#testing)
- "Repository Structure" (#repository-structure)
- "Security Considerations" (#security-considerations)
- "Limitations" (#limitations)
- "Roadmap" (#roadmap)
- "Responsible Use" (#responsible-use)
- "SIH Project Context" (#sih-project-context)
- "Contributing" (#contributing)
- "License" (#license)

---

Overview

SecTrace is a digital forensics investigation platform developed in the context of Smart India Hackathon (SIH) 2026, Problem Statement PS 26148, NTRO.

The platform brings core investigation workflows into a centralized workspace, helping analysts manage cases, ingest digital evidence, record acquisition hashes, verify stored file integrity, review analysis findings, inspect investigation activity, and generate reports.

SecTrace is designed around an evidence-centric workflow in which investigation records, evidence items, findings, and reports are connected through a consistent application interface.

The current implementation is a functional demonstration built with Next.js, React, PostgreSQL, and Drizzle ORM. It demonstrates core case-management, evidence-handling, integrity-verification, local-analysis, audit-history, and reporting workflows.

The project establishes a foundation for future forensic automation, artifact parser integrations, reproducible analysis, stronger chain-of-custody controls, and scalable evidence storage.

«Project status: SecTrace is a demonstration application. It is not a certified forensic suite or a production-ready system for handling classified or confidential evidence.»

Problem Statement

Digital investigations can involve evidence from multiple sources, integrity checks, timelines, analyst findings, investigation notes, and report preparation.

When these activities are performed through disconnected tools or manual processes, maintaining consistent records and tracing conclusions back to supporting evidence can become difficult.

SecTrace explores a unified approach to these challenges through:

- Centralized investigation management: Organize cases, evidence, findings, and reports in one workspace.
- Evidence integrity: Calculate and verify SHA-256 hashes of acquired files.
- Investigation traceability: Associate evidence and findings with relevant cases and operational events.
- Explainable analysis: Present rule-based indicators for analyst review.
- Structured reporting: Preserve report-generation snapshots and provide downloadable PDFs.
- Modular workflows: Configure selected application features through built-in switches.

These capabilities demonstrate an integrated investigation workflow. They do not independently establish source authenticity, legal admissibility, or forensic soundness.

Project Objectives

1. Develop a centralized workspace for digital investigation case management.
2. Support evidence acquisition and SHA-256 integrity verification.
3. Maintain searchable evidence records linked to investigation cases.
4. Organize findings, timeline events, and operational activity.
5. Provide transparent, locally executed analysis rules.
6. Support analyst-driven review and resolution of findings.
7. Generate downloadable PDF reports from saved snapshots.
8. Establish a foundation for future forensic automation and parser integrations.
9. Identify the security and scalability controls required for production deployment.

Key Features

1. Case Management

- Create and edit investigation cases.
- Manage case assignments, severity, and status.
- View dashboard summaries and recent activity.
- Associate evidence and findings with relevant cases.
- Navigate case-linked investigation records.

2. Digital Evidence Repository

- Import multiple files into an investigation case.
- Store original uploaded file bytes within the demo environment.
- Calculate SHA-256 acquisition hashes.
- Optionally compare a single uploaded file against a supplied expected hash.
- Verify individual evidence items or run repository-wide verification.
- Search and filter evidence by case, file type, and integrity status.
- Download stored evidence as an attachment.
- Record supported evidence-download events.

3. Evidence Integrity Verification

SecTrace records an acquisition-time SHA-256 hash and can recalculate the hash of stored bytes during verification.

The resulting comparison helps identify whether stored content differs from the content represented by the recorded digest.

Integrity failures can be surfaced as findings when the relevant workspace feature is enabled.

A matching hash does not independently prove who created a file, whether its source is trustworthy, or whether the acquisition procedure was performed correctly.

4. Explainable Local Analysis

- Run a transparent local rule-based analysis engine.
- Identify supported evidence hash failures.
- Flag suspicious filename patterns.
- Inspect eligible text files for configured indicators.
- Generate reviewable findings from supported rules.
- Deduplicate existing rule-generated findings during sequential runs.

Analysis results are indicators, not definitive malware verdicts or calibrated threat probabilities.

5. Findings and Analyst Triage

- Create and update investigation findings.
- Review and resolve findings through the available workflow.
- Associate findings with relevant cases.
- Support analyst-driven assessment of generated indicators.

6. Evidence Relationships and Timeline

- Display case-linked evidence relationships in a graph interface.
- Review investigation events using a UTC-based timeline.
- Connect evidence, findings, and case context.
- Inspect operational activity associated with supported workspace actions.

7. Audit History

- Display operational events in a read-only interface.
- Record supported actions, including evidence and report downloads.
- Export the latest 250 audit events to CSV.
- Apply formula-injection protection to CSV exports.

The current audit storage is not cryptographically tamper-proof and is not independently protected against privileged database modification.

8. Investigation Reporting

- Create report records from workspace information.
- Preserve generation-time report snapshots.
- Generate downloadable PDF reports.
- Serve reports from saved snapshots.
- Record report-download activity.
- Apply confidential markings to new report snapshots when the relevant plugin is enabled.

Reports are not digitally signed or independently certified.

9. Responsive Analyst Workspace

- Dark dashboard interface.
- Responsive layouts and mobile navigation.
- Keyboard-accessible dialogs.
- Global search using "Ctrl + K" on Windows/Linux or "Cmd + K" on macOS.
- Pagination for supported lists.
- Feedback notifications.
- Persisted workspace-wide analyst profile.
- Functional built-in plugin switches.

Investigation Workflow

SecTrace follows an eight-stage investigation lifecycle as its broader workflow model:

CASE
  |
  v
INGEST
  |
  v
PRESERVE
  |
  v
PARSE
  |
  v
CORRELATE
  |
  v
DETECT
  |
  v
TRIAGE
  |
  v
REPORT

Stage| Purpose| Current implementation
Case| Establish the investigation record| Case creation and management
Ingest| Collect digital artifacts| Multi-file uploads
Preserve| Record and check integrity| Stored file bytes and SHA-256 verification
Parse| Extract relevant artifact information| Limited local text checks
Correlate| Connect investigation records| Case-linked evidence and findings
Detect| Identify potential indicators| Local rule-based checks
Triage| Review results| Finding review and resolution workflows
Report| Document investigation information| Saved report snapshots and PDF generation

Scope clarification: Comprehensive forensic parsing, advanced automated correlation, and specialized disk-image, memory, EVTX, or PCAP analysis are not claimed as implemented in the current demo.

System Architecture

SecTrace uses Next.js App Router for the web application and server-side routes, with PostgreSQL for persistence and Drizzle ORM for database access.

+------------------------------------------+
|             Analyst Interface            |
|          Desktop / Tablet / Mobile       |
+---------------------+--------------------+
                      |
                      v
+------------------------------------------+
|           Next.js App Router             |
|                  React                   |
|                                          |
| Dashboard | Cases | Evidence | Findings  |
| Analysis  | Timeline | Audit | Reports   |
+---------------------+--------------------+
                      |
                      v
+------------------------------------------+
|             Application API              |
|                                          |
| Workspace Actions | Evidence Uploads     |
| Verification       | Report Downloads    |
+---------------------+--------------------+
                      |
                      v
+------------------------------------------+
|                Drizzle ORM               |
+---------------------+--------------------+
                      |
                      v
+------------------------------------------+
|                PostgreSQL                |
|                                          |
| Cases | Evidence | Findings | Activity   |
| Profile | Report Snapshots               |
+------------------------------------------+

Architecture Characteristics

- PostgreSQL stores persistent workspace records.
- Drizzle ORM handles database access and schema management.
- Server-side routes process workspace actions and evidence operations.
- SHA-256 verification compares stored content with recorded acquisition hashes.
- Local rules generate explainable analysis indicators.
- PDF downloads use saved report snapshots.
- Synthetic demonstration records are initialized on the first workspace request.

Uploaded evidence bytes are Base64-encoded in PostgreSQL in the current implementation. Production deployments should use encrypted object storage and streamed uploads.

Technology Stack

Layer| Technology
Web framework| Next.js App Router
Frontend| React
Application language| TypeScript / JavaScript
Database| PostgreSQL
Database access| Drizzle ORM
Schema management| Drizzle Kit
Evidence integrity| SHA-256
Analysis| Local rule-based checks
Reporting| PDF generation
Audit export| CSV
Browser testing| Playwright / Chromium

Getting Started

Prerequisites

Install the following:

- Node.js compatible with the project's Next.js dependencies.
- npm.
- PostgreSQL.
- Git.

1. Clone the repository

Replace the placeholders with your actual repository URL and directory name.

git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_REPOSITORY_DIRECTORY>

2. Install dependencies

npm install

3. Configure the database

Create a ".env" file in the project root:

DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME"

Replace the sample values with your PostgreSQL connection details.

Never commit ".env" files, database credentials, or other secrets to GitHub.

4. Apply the database schema

npx drizzle-kit push

Ensure "DATABASE_URL" points to the intended development database before applying the schema.

5. Start the development server

npm run dev

Open the local URL displayed in your terminal, typically:

http://localhost:3000

The first workspace request initializes synthetic demonstration data. Subsequent changes are persisted in the configured database.

Configuration

Environment Variables

Variable| Required| Purpose
"DATABASE_URL"| Yes| PostgreSQL connection string
"TEST_BASE_URL"| For alternate test targets| Base URL used by browser tests when testing a different preview

Do not expose database credentials through client-side environment variables.

Use an isolated database for workflow testing.

Evidence Upload Limits

Limit| Value
Maximum files per upload request| 10
Maximum file size| 20 MB per file
Maximum combined upload size| 50 MB
Maximum file size inspected by local text checks| 512 KB

These limits describe the current demonstration implementation and should be reviewed before deployment.

Demo Dataset

The initial synthetic workspace dataset contains:

Item| Initial state
Cases| 15
Open cases| 12
Evidence samples| 84
Samples with verified hashes| 81
Pending files| 2
Intentionally modified sample| 1
Open critical findings| 5

These values describe the initial seed, not guaranteed live counts. The dataset changes as users interact with the workspace.

Sample binary/capture filenames contain harmless demonstration text rather than actual executables or forensic images. Seed records must not be treated as real investigative evidence.

API Reference

The API supports the current demonstration workspace. It is not an authenticated production API.

Health and Workspace

Method| Endpoint| Description
"GET"| "/api/health"| Database health check
"GET"| "/api/workspace"| Public workspace metadata, excluding stored file bytes and report snapshots
"GET"| "/api/workspace?export=audit"| CSV export of the latest 250 audit events
"POST"| "/api/workspace"| Executes supported workspace actions

Supported Workspace Actions

"POST /api/workspace" supports these action names:

create-case
update-case
create-finding
update-finding
verify-evidence
verify-all
run-analysis
toggle-plugin
update-profile
create-report

Request payload fields must match the schemas expected by the application implementation.

Evidence Endpoints

Method| Endpoint| Description
"POST"| "/api/evidence"| Multipart evidence upload
"GET"| "/api/evidence/:id"| Downloads stored evidence bytes as an attachment

The upload endpoint accepts:

- "caseId" — associated investigation case.
- "files" — uploaded evidence files.
- "expectedHash" — optional expected digest for a single-file comparison.

Report Endpoint

Method| Endpoint| Description
"GET"| "/api/reports/:id"| Downloads a PDF generated from the saved report snapshot

Evidence and report downloads record supported operational events.

Downloaded files are served as attachments with "nosniff" protection. Imported files are not executed by the application.

Analysis Engine and Plugins

Local Rule-Based Analysis

The navigation item labelled AI Analysis opens a local rule-based analysis interface.

No external AI service is configured, and no model inference is claimed.

The current analysis engine checks:

- Stored evidence hash failures.
- Suspicious filename patterns.
- Configured text indicators in eligible files up to 512 KB.

Results are explainable indicators that require analyst review.

A flagged file is not automatically malicious, and an unflagged file is not guaranteed to be safe.

Sequential analysis runs deduplicate existing rule-generated findings.

Built-in Plugin Switches

The built-in switches control selected workspace behaviors:

- Automatic verification during evidence import.
- Availability of local analysis.
- Creation of findings for integrity failures.
- Confidential markings in newly created PDF report snapshots.

These are application-level feature switches, not a secure third-party plugin sandbox.

Evidence Integrity and Reporting

SHA-256 Verification

SHA-256 hashes provide a mechanism for comparing file content against a recorded digest.

If the recalculated digest matches the acquisition-time digest, the checked bytes match the bytes represented by that recorded hash.

A matching hash alone does not prove:

- Who created or supplied the original file.
- Whether the source was trustworthy.
- Whether the evidence is complete.
- Whether acquisition was performed correctly.
- Whether chain-of-custody requirements were met.
- Whether the evidence is legally admissible.

Audit History

The application provides a read-only audit-history interface and does not expose a normal UI/API action for editing existing events.

However, the underlying audit storage is not cryptographically tamper-proof and is not independently protected against privileged database changes.

Report Snapshots

Reports preserve the workspace information captured at generation time. Subsequent downloads use the saved snapshot rather than silently rebuilding the report from mutable current data.

This application-level behavior does not provide cryptographic immutability, digital signatures, or independent certification.

Testing

Run the following checks from the project root:

npx next typegen
npm exec tsc -- --noEmit --pretty false
npm run build

Smoke Test

Start the application or preview first, then run:

node scripts/smoke-test.mjs

Workflow Test

Use an isolated local/demo database:

node scripts/workflow-test.mjs

Workflow tests create temporary QA records, validate persistence and downloads, and restore the original demo state using Drizzle.

Do not run workflow cleanup against a production database or a database being used concurrently.

Browser Tests

Install Playwright's Chromium dependencies:

npx playwright install --with-deps chromium

Set "TEST_BASE_URL" when browser tests should target a different preview. Screenshots and temporary fixtures are stored in the ignored "artifacts/" directory.

Repository Structure

The following is a conceptual overview. Verify the exact directory names against the current repository.

SecTrace/
├── app/
│   ├── api/
│   │   ├── health/
│   │   ├── workspace/
│   │   ├── evidence/
│   │   └── reports/
│   └── ...
├── components/
├── drizzle/
├── scripts/
│   ├── smoke-test.mjs
│   └── workflow-test.mjs
├── artifacts/              # Ignored test artifacts
├── .env                    # Local configuration; never commit
├── drizzle.config.*
├── package.json
└── README.md

Security Considerations

SecTrace is currently an unauthenticated, shared demonstration application. Do not upload real confidential evidence, classified information, or sensitive personal data.

Before production deployment, implement and independently review the following controls.

Identity and Access Control

- Authenticated sessions and secure identity management.
- Role-based authorization.
- Tenant isolation and per-case access controls.
- Least-privilege application and database permissions.

Evidence Protection

- Encrypted object storage with managed encryption keys.
- Streamed uploads for larger evidence files.
- Retention, backup, restoration, and secure-deletion policies.
- Documented evidence acquisition and chain-of-custody procedures.

Audit and Reporting

Independently protected, tamper-evident audit storage.

Cryptographic integrity protection for audit events.

Report integrity verification and digital signatures where appropriate.

Reproducible analysis metadata and tool-version records.

Operational Security

Request throttling and abuse prevention.

Hardened secrets management.

Input validation and secure error handling.

Dependency and security testing.

Monitoring, incident response, and deployment hardening.

The current workspace-wide profile and unauthenticated access model are unsuitable for sensitive multi-user operations.

Limitations

The current demonstration has several deliberate limitations:

No authentication, role-based authorization, or tenant isolation.

Workspace-wide analyst profile.

Evidence bytes stored in PostgreSQL as Base64.

No cryptographically tamper-proof audit ledger.

No digital signatures on reports.

No configured external AI service or model inference.

Limited local text checks rather than a comprehensive forensic parser pipeline.

No claim of certified forensic validity or guaranteed legal admissibility.

These limitations should be addressed before considering production deployment.

Roadmap

Potential future development areas include:

Secure identity: Authentication, role-based access, tenant isolation, and case-level permissions.

Evidence storage: Encrypted object storage, streamed uploads, and controlled retention.

Chain of custody: Tamper-evident event chains, acquisition manifests, and independent audit protection.

Forensic parsers: Safely isolated parsers for approved artifacts such as Windows event logs and PCAP files.

Timeline correlation: Normalized UTC events and repeatable correlation rules.

Detection integrations: Optional analysis modules with explainable results and documented limitations.

Reproducible analysis: Versioned runs, captured configuration, and tool-version metadata.

Report integrity: Report hashes, signature support, and verification instructions.

Production readiness: Monitoring, backup and recovery, access reviews, and independent security assessments.

These are proposed future directions, not claims about existing functionality.

Responsible Use

Use SecTrace only with data you are authorized to collect and analyze.

For demonstrations, prefer synthetic or appropriately sanitized files. Follow applicable laws, organizational policies, privacy requirements, and evidence-handling procedures.

For real investigations, use approved forensic procedures and validated tools. Preserve original evidence, document acquisition conditions, restrict access, and independently verify important findings.

SIH Project Context

Field

Details

Program

Smart India Hackathon 2026

Problem Statement

PS 26148

Organization

NTRO

Project

SecTrace

Domain

Digital Forensics and Investigation Automation

SecTrace is developed in the context of this problem statement. This association does not imply official endorsement, selection, deployment, or adoption unless independently confirmed.

Contributing

Contributions that improve usability, test coverage, documentation, evidence handling, and analysis explainability are welcome.

Fork the repository.

Create a focused feature branch.

Implement and document your changes.

Add or update relevant tests.

Run the applicable validation commands.

Submit a pull request describing the changes and testing performed.

Do not include real evidence, credentials, personal information, API keys, or sensitive investigation artifacts in issues, pull requests, screenshots, or test fixtures.

License

No license is specified in this README.

Add an appropriate LICENSE file before inviting reuse or redistribution. Until a license is selected and added, do not assume the repository grants permission to reuse or redistribute its code.

SecTrace — Bringing digital investigation workflows into one traceable workspace.

Developed in the context of SIH 2026 · PS 26148 · NTRO