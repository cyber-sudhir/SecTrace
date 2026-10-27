SecTrace

Unified Digital Forensics Automation & Scripting Framework

Investigate. Preserve. Correlate. Verify. Report.

SecTrace is an evidence-centric digital forensics workspace for investigation management, evidence integrity verification, explainable analysis, and report generation.

SIH 2026 | PS 26148 | NTRO

"Next.js" (https://img.shields.io/badge/Next.js-App_Router-black?logo=next.js) "React" (https://img.shields.io/badge/React-UI-61DAFB?logo=react) "PostgreSQL" (https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql) "SHA-256" (https://img.shields.io/badge/Integrity-SHA--256-2E8B57) "Status" (https://img.shields.io/badge/Status-Demo-orange)

Overview

Developed in the context of Smart India Hackathon 2026, SecTrace explores a unified workflow for digital investigations, bringing case management, evidence acquisition, integrity verification, findings, timeline activity, and reporting into one workspace.

The current implementation is a functional demonstration built with Next.js, React, PostgreSQL, and Drizzle ORM.

Key Features

- Case Management: Create and update cases, assignments, severity, and status.
- Evidence Acquisition: Import multiple files, store original bytes, and calculate SHA-256 hashes.
- Integrity Verification: Verify evidence against recorded acquisition hashes and optionally compare an expected hash.
- Evidence Repository: Search and filter evidence by case, file type, and integrity status.
- Local Analysis: Identify supported hash failures, suspicious filenames, and configured text indicators.
- Findings & Triage: Create, review, and resolve investigation findings.
- Evidence Graph & Timeline: Explore case-linked relationships and UTC-based activity.
- Audit History: Review operational events and export recent records to CSV.
- PDF Reporting: Generate downloadable reports from saved snapshots.
- Workspace Tools: Responsive dashboard, global search, analyst profile, and configurable feature switches.

Investigation Workflow

Case → Ingest → Preserve → Parse
                        ↓
Report ← Triage ← Detect ← Correlate

The workflow represents the project's broader investigation model. Comprehensive forensic parsing and advanced automated correlation are not yet implemented.

System Architecture

Analyst Interface
       ↓
Next.js App Router + React
       ↓
Application API
       ↓
Drizzle ORM
       ↓
PostgreSQL

Core technologies: Next.js, React, TypeScript/JavaScript, PostgreSQL, Drizzle ORM, SHA-256, local rule-based analysis, and PDF generation.

Getting Started

Prerequisites: Node.js, npm, and PostgreSQL.

1. Clone the repository

git clone https://github.com/cyber-sudhir/SecTrace.git
cd SecTrace

2. Install dependencies

npm install

3. Configure ".env"

DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME"

4. Apply the database schema

npx drizzle-kit push

5. Start the application

npm run dev

Open "http://localhost:3000" in your browser. The first workspace request initializes synthetic demonstration data.

Never commit database credentials or ".env" files.

API Reference

Method| Endpoint| Purpose
GET| "/api/health"| Database health check
GET| "/api/workspace"| Workspace metadata
GET| "/api/workspace?export=audit"| Audit CSV export
POST| "/api/workspace"| Case, finding, verification, analysis, profile, plugin, and report actions
POST| "/api/evidence"| Evidence upload
GET| "/api/evidence/:id"| Evidence download
GET| "/api/reports/:id"| PDF report download

Evidence uploads support up to 10 files per request, 20 MB per file, and 50 MB total.

Testing

Run the following checks from the project root:

npx next typegen
npm exec tsc -- --noEmit --pretty false
npm run build
node scripts/smoke-test.mjs

For workflow testing, use an isolated demo database:

node scripts/workflow-test.mjs

Warning: Workflow tests restore demo state. Never run their cleanup against a production or concurrently used database.

Analysis and Evidence Integrity

The analysis engine uses transparent local rules. No external AI service or model inference is configured.

SHA-256 verification checks whether stored bytes match the recorded digest. It does not independently prove source authenticity, acquisition correctness, or legal admissibility.

Reports preserve their generation-time snapshots but are not digitally signed. Audit records are not cryptographically tamper-proof.

Security Limitations

SecTrace is an unauthenticated, shared demo. Do not upload confidential, classified, or sensitive real-world evidence.

Before production deployment, implement:

- Authentication, role-based access, and tenant isolation.
- Encrypted object storage and streamed uploads.
- Evidence retention and backup policies.
- Independently protected, tamper-evident audit records.
- Secure secrets management, request throttling, and security testing.

Uploaded file bytes are Base64-encoded in PostgreSQL for this bounded demonstration. The application is not a certified forensic platform.

Roadmap

- Secure authentication and case-level authorization.
- Tamper-evident chain-of-custody records.
- Specialized forensic parsers for approved artifacts.
- Improved timeline correlation and reproducible analysis.
- Scalable encrypted evidence storage.
- Stronger report integrity and production security controls.

These are planned development directions, not claims of existing functionality.

SIH Project Context

- Program: Smart India Hackathon 2026
- Problem Statement: PS 26148
- Organization: NTRO
- Domain: Digital Forensics and Investigation Automation

This project is developed in the context of the stated problem. This does not imply official endorsement or deployment.

Responsible Use

Use SecTrace only with authorized data. Follow applicable privacy, security, and evidence-handling requirements. Use synthetic data for demonstrations and validated forensic procedures for real investigations.

License

No license has been specified. Add a "LICENSE" file before granting reuse or redistribution permissions.

---

SecTrace — Bringing digital investigation workflows into one traceable workspace.
