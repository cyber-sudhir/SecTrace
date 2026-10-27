<div align="center">SecTrace

Unified Digital Forensics Automation & Scripting Framework

Investigate. Preserve. Correlate. Verify. Report.

An evidence-centric digital forensics workspace designed to streamline investigation case management, evidence integrity verification, explainable analysis, and forensic reporting.

SIH 2026 · Problem Statement PS 26148 · NTRO

"Overview" (#overview) · "Features" (#key-features) · "Architecture" (#system-architecture) · "Installation" (#getting-started) · "API" (#api-reference) · "Roadmap" (#roadmap)

</div>---

<div align="center">"Next.js" (https://img.shields.io/badge/Next.js-App_Router-black?logo=next.js)
"React" (https://img.shields.io/badge/React-UI-61DAFB?logo=react&logoColor=black)
"TypeScript" (https://img.shields.io/badge/TypeScript-Application-3178C6?logo=typescript&logoColor=white)
"PostgreSQL" (https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
"Drizzle ORM" (https://img.shields.io/badge/Drizzle-ORM-C5F74F)
"SHA-256" (https://img.shields.io/badge/Integrity-SHA--256-2E8B57)
"Status" (https://img.shields.io/badge/Status-Demo_Implementation-orange)

</div>Overview

SecTrace is a digital forensics investigation platform developed in the context of Smart India Hackathon (SIH) 2026, Problem Statement PS 26148, NTRO.

The project explores a unified workflow for managing digital investigations, preserving acquired evidence, verifying file integrity, organizing findings, correlating case-related information, and generating investigation reports.

Instead of treating each activity as a disconnected task, SecTrace brings these workflows into a centralized workspace with persistent records, explainable analysis indicators, and traceable operational events.

The current implementation is a functional demonstration built with Next.js, React, PostgreSQL, and Drizzle ORM. It demonstrates core investigation workflows while establishing a foundation for future forensic parser integrations, stronger chain-of-custody controls, and scalable evidence management.

«Project scope: SecTrace is a demonstration platform, not a certified forensic suite or a production-ready system for handling classified or confidential evidence.»

Problem Context

Digital investigations may involve numerous evidence files, different artifact types, integrity checks, investigation timelines, analyst findings, and report preparation.

When these activities rely on disconnected tools and manual processes, maintaining consistent records and connecting observations to their supporting evidence can become difficult.

SecTrace addresses this workflow challenge through five core principles:

- Centralization: Manage cases, evidence, findings, and reports in one workspace.
- Integrity: Calculate and verify SHA-256 hashes of acquired files.
- Traceability: Associate operational events and investigation artifacts with cases.
- Explainability: Present rule-based analysis indicators that analysts can review.
- Reproducibility: Preserve report-generation snapshots and documented investigation context.

The objective is to demonstrate how these capabilities can form the foundation of a more integrated digital-forensics workflow.

Project Objectives

1. Build a centralized digital investigation workspace.
2. Organize cases, evidence records, findings, and investigation activity.
3. Support evidence acquisition and SHA-256 integrity verification.
4. Provide searchable evidence management and case-linked relationships.
5. Implement transparent, locally executed analysis rules.
6. Maintain operational activity records and UTC-based timelines.
7. Generate downloadable PDF reports from saved snapshots.
8. Establish a modular foundation for future forensic automation and integrations.

Key Features

1. Investigation Case Management

- Create, edit, and organize investigation cases.
- Manage case assignments, severity, and status.
- View dashboard summaries and recent investigation activity.
- Associate evidence records and findings with relevant cases.
- Navigate case-linked evidence relationships.

2. Digital Evidence Management

- Import multiple files into an investigation case.
- Store original file bytes within the bounded demo environment.
- Calculate SHA-256 acquisition hashes.
- Optionally compare a single uploaded file against a supplied expected hash.
- Verify individual evidence items or run repository-wide verification.
- Search and filter evidence by case, file type, and integrity status.
- Download stored evidence as a non-executable attachment.

3. Evidence Integrity Verification

SecTrace records an acquisition-time SHA-256 hash and can recalculate the hash of stored bytes during verification.

The resulting comparison helps identify whether the stored content differs from the content represented by its recorded acquisition hash.

Integrity failures can be surfaced for analyst review, depending on the configured workspace settings.

4. Explainable Local Analysis

- Execute a transparent, local rule-based analysis engine.
- Identify supported hash-integrity failures.
- Flag suspicious filename patterns.
- Inspect eligible text files for configured indicators.
- Create reviewable findings from supported rule results.
- Deduplicate existing rule-generated findings during sequential runs.

Important: Analysis results are indicators for investigation, not definitive malware verdicts or calibrated threat probabilities.

5. Findings and Analyst Triage

- Create and update investigation findings.
- Review and resolve findings through the available workflow.
- Connect findings to relevant investigation cases.
- Support analyst-driven assessment of generated indicators.

6. Evidence Relationships and Timeline

- Explore case-linked evidence relationships through a graph interface.
- Review investigation activity in a UTC-based timeline.
- Keep related evidence and findings organized around investigation cases.
- Export recent operational audit events to CSV.

7. Audit History

- Display operational events through a read-only interface.
- Record supported actions, including evidence and report downloads.
- Export the latest 250 audit events.
- Apply CSV formula-injection protections to audit exports.

The current audit history is not cryptographically tamper-proof. Read-only access through the application does not prevent privileged database modification.

8. Investigation Reporting

- Generate report records from workspace information.
- Preserve generation-time report snapshots.
- Produce actual downloadable PDF reports.
- Download reports from their saved snapshots.
- Record report download activity.
- Apply confidential markings to newly generated report snapshots when the corresponding plugin is enabled.

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

System Architecture

SecTrace uses a Next.js App Router application with server-side API routes, a PostgreSQL database, and Drizzle ORM.

┌──────────────────────────────────────────┐
│             Analyst Interface            │
│         Desktop / Tablet / Mobile        │
└─────────────────────┬────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────┐
│          Next.js App Router + React      │
│                                          │
│ Dashboard · Cases · Evidence · Findings  │
│ Analysis · Timeline · Audit · Reports    │
└─────────────────────┬────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────┐
│              Application API             │
│                                          │
│ Workspace Actions · Evidence Uploads     │
│ Integrity Verification · Report Downloads│
└─────────────────────┬────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────┐
│              Drizzle ORM                 │
└─────────────────────┬────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────┐
│               PostgreSQL                 │
│                                          │
│ Cases · Evidence · Findings · Activity   │
│ Profile · Report Snapshots               │
└──────────────────────────────────────────┘

Architecture Characteristics

- PostgreSQL provides persistent workspace storage.
- Drizzle ORM handles database access and schema management.
- Server-side routes process workspace actions and evidence operations.
- Evidence verification uses SHA-256 digest comparisons.
- Local analysis rules produce reviewable indicators.
- Report downloads use saved generation-time snapshots.

Evidence bytes are Base64-encoded in PostgreSQL in the current demonstration. A production deployment should use encrypted object storage and streamed uploads.

Investigation Workflow

The broader project follows an eight-stage investigation lifecycle:

CASE
  │
  ▼
INGEST
  │
  ▼
PRESERVE
  │
  ▼
PARSE
  │
  ▼
CORRELATE
  │
  ▼
DETECT
  │
  ▼
TRIAGE
  │
  ▼
REPORT

Stage| Purpose| Current implementation
Case| Establish an investigation record| Case creation and management
Ingest| Collect digital artifacts| Multi-file uploads
Preserve| Record and check integrity| Stored bytes and SHA-256 verification
Parse| Extract relevant artifact information| Limited local text checks; no comprehensive parser pipeline
Correlate| Connect related investigation records| Case-linked evidence and findings
Detect| Identify potential indicators| Local rule-based checks
Triage| Review investigation results| Finding review and resolution workflows
Report| Document investigation information| Saved report snapshots and PDF generation

This lifecycle describes the project's overall direction. It does not imply that comprehensive forensic parsing, automated correlation, or advanced detection capabilities are already implemented.

Technology Stack

Component| Technology
Web framework| Next.js App Router
Frontend| React
Application language| TypeScript / JavaScript
Database| PostgreSQL
ORM| Drizzle ORM
Schema management| Drizzle Kit
Integrity verification| SHA-256
Analysis engine| Local rule-based checks
Reporting| PDF generation
Audit export| CSV
Browser testing| Playwright / Chromium

Getting Started

Prerequisites

Ensure the following are installed:

- Node.js compatible with the project's dependencies.
- npm.
- PostgreSQL.
- Git.

1. Clone the repository

Replace the placeholders with your actual GitHub repository URL and directory name.

git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_REPOSITORY_DIRECTORY>

2. Install dependencies

npm install

3. Configure environment variables

Create a ".env" file in the project root:

DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME"

Replace the sample values with your PostgreSQL connection details.

Never commit ".env" files, database credentials, or other secrets to GitHub.

4. Apply the database schema

npx drizzle-kit push

Confirm that "DATABASE_URL" points to your intended development database before applying the schema.

5. Start the development server

npm run dev

Open the local URL displayed in your terminal, typically:

http://localhost:3000

The first workspace request initializes synthetic demonstration data. Subsequent changes are persisted in the configured database.

Configuration and Demo Data

Evidence Upload Limits

The current implementation enforces the following limits:

Limit| Value
Maximum files per upload request| 10
Maximum size per file| 20 MB
Maximum combined upload size| 50 MB
Maximum file size inspected by local text checks| 512 KB

Evidence bytes are Base64-encoded in PostgreSQL for this bounded demonstration. This storage design is not intended for large-scale forensic repositories.

Initial Synthetic Dataset

The initial workspace seed contains:

Item| Initial state
Cases| 15
Open cases| 12
Evidence samples| 84
Samples with verified hashes| 81
Pending files| 2
Intentionally modified sample| 1
Open critical findings| 5

These are initial seed values, not live or guaranteed counts. The dataset changes as workspace operations are performed.

The sample filenames contain harmless demonstration content rather than actual executables or forensic images. They must not be treated as real investigative evidence.

API Reference

The current API supports the demonstration workspace and is not an authenticated production API.

Health and Workspace

Method| Endpoint| Description
"GET"| "/api/health"| Database health check
"GET"| "/api/workspace"| Public workspace metadata, excluding stored file bytes and report snapshots
"GET"| "/api/workspace?export=audit"| CSV export of the latest 250 audit events
"POST"| "/api/workspace"| Executes supported workspace actions

Supported Workspace Actions

"POST /api/workspace" supports the following action names:

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

The exact JSON payload fields must match the application's route implementation.

Evidence Endpoints

Method| Endpoint| Description
"POST"| "/api/evidence"| Multipart evidence upload
"GET"| "/api/evidence/:id"| Download stored evidence bytes

The upload endpoint accepts multipart fields:

- "caseId" — associated investigation case.
- "files" — uploaded evidence files.
- "expectedHash" — optional expected digest for a single-file comparison.

Report Endpoint

Method| Endpoint| Description
"GET"| "/api/reports/:id"| Downloads a PDF generated from the saved report snapshot

Evidence and report downloads record supported operational events.

Downloaded files are served as attachments with "nosniff" protection. Imported files are not executed by the application.

Analysis Engine and Plugin System

Local Rule-Based Analysis

The navigation section labelled AI Analysis opens a local rule-based analysis interface.

No external AI service is configured, and no model inference is claimed.

The current analysis engine checks:

- Stored evidence hash failures.
- Suspicious filename patterns.
- Configured text indicators in eligible files up to 512 KB.

Results should be interpreted as explainable indicators requiring analyst review.

A flagged file is not automatically malicious, and an unflagged file is not guaranteed to be safe.

Built-in Plugin Switches

The built-in switches control selected workspace behaviors:

- Automatic verification during evidence import.
- Availability of local analysis.
- Creation of findings for integrity failures.
- Confidential markings in newly created PDF report snapshots.

These are application-level feature switches, not isolated third-party plugins or a secure plugin execution framework.

Evidence Integrity and Reporting

SHA-256 Integrity Verification

SHA-256 hashes provide a mechanism for comparing file content against a recorded digest.

If the recalculated digest matches the acquisition-time digest, the checked bytes match the bytes represented by that recorded hash.

However, a matching hash alone does not prove:

- The original source or creator of a file.
- The authenticity or completeness of the evidence.
- The correctness of the acquisition procedure.
- An uninterrupted chain of custody.
- Legal admissibility or compliance with forensic standards.

Audit Records

The application provides a read-only audit-history interface and does not expose a normal UI/API action for editing existing events.

The underlying audit storage is not cryptographically tamper-proof and is not independently protected against privileged database changes.

Report Snapshots

Reports are generated from saved snapshots, preserving the information captured at report-generation time.

This prevents a later download from simply rebuilding the report from changing workspace data. It does not provide digital signatures, cryptographic immutability, or independent certification.

Validation and Testing

Run the following validation commands from the repository root:

npx next typegen
npm exec tsc -- --noEmit --pretty false
npm run build

Smoke Test

Start the application or preview first, then execute:

node scripts/smoke-test.mjs

Workflow Test

Use an isolated local or demonstration database:

node scripts/workflow-test.mjs

Workflow tests create temporary QA records, validate persistence and downloads, and restore the original demo state using Drizzle.

«Warning: Do not run workflow-test cleanup against a production database or a database being used concurrently.»

Browser Testing

Install Playwright's Chromium dependencies:

npx playwright install --with-deps chromium

Set "TEST_BASE_URL" when testing a preview other than the default target. Screenshots and temporary fixtures are stored in the ignored "artifacts/" directory.

Repository Structure

The following is a conceptual overview. Confirm the exact file and directory names against the current repository.

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

Before production deployment, the following controls are required.

Identity and Access Control

- Authenticated sessions and secure identity management.
- Role-based authorization.
- Tenant isolation and per-case access controls.
- Least-privilege database and application permissions.

Evidence Protection

- Encrypted object storage and managed encryption keys.
- Streamed uploads for larger evidence files.
- Retention, backup, restoration, and secure-deletion policies.
- Documented evidence acquisition and chain-of-custody procedures.

Audit and Reporting

- Independently protected, tamper-evident audit storage.
- Cryptographic integrity protection for audit events.
- Report integrity verification and digital signatures where appropriate.
- Reproducible analysis metadata and tool-version records.

Operational Security

- Request throttling and abuse prevention.
- Hardened secrets management.
- Input validation and secure error handling.
- Dependency and security testing.
- Monitoring, incident response, and deployment hardening.

The current workspace-wide profile and unauthenticated access model are not suitable for sensitive multi-user operations.

Roadmap

Potential future development areas include:

Secure identity: authentication, role-based access, tenant isolation, and case-level permissions.

Advanced evidence ingestion: encrypted object storage, streaming, and controlled evidence retention.

Chain of custody: tamper-evident event chains, acquisition manifests, and independent audit protection.

Forensic parsers: safely isolated parsers for approved artifacts, including Windows event logs and PCAP files.

Timeline correlation: normalized UTC events and repeatable correlation rules.

Detection integrations: optional analysis modules with explainable results and documented limitations.

Reproducible analysis: versioned runs, captured configuration, and tool metadata.

Report integrity: report hashes, signature support, and verification instructions.

Production readiness: access reviews, monitoring, backup and recovery, and independent security assessments.

These items are proposed directions, not claims about existing functionality.

Responsible Use

Use SecTrace only with data you are authorized to collect and analyze.

For demonstrations, prefer synthetic or appropriately sanitized files. Follow applicable laws, organizational policies, privacy requirements, and evidence-handling procedures.

For real investigations, rely on approved forensic processes and validated tools. Preserve original evidence, document acquisition conditions, restrict access, and independently verify important findings.

SIH 2026 Context

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

SecTrace is developed in the context of this problem statement. This association does not imply official endorsement, selection, deployment, or adoption unless separately confirmed.

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

Add an appropriate LICENSE file before inviting reuse or redistribution. Until a license is selected and added, do not assume that the repository grants permission to reuse or redistribute its code.

<div align="center">

SecTrace — Bringing digital investigation workflows into one traceable workspace.

Built in the context of SIH 2026 · PS 26148 · NTRO

</div>