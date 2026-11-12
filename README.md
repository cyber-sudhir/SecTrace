# SecTrace
### Unified Digital Forensics Automation & Scripting Framework

**Investigate. Preserve. Correlate. Verify. Report.**

SecTrace is an evidence-centric digital forensics workspace designed to streamline digital investigation workflows through centralized case management, evidence acquisition, integrity verification, explainable analysis, investigation tracking, and structured report generation.

Developed in the context of **Smart India Hackathon (SIH) 2026**, under **Problem Statement PS 26148 – NTRO**, SecTrace explores how multiple digital forensic investigation activities can be organized within a unified and traceable workspace.

<p align="center">
  <img src="https://img.shields.io/badge/Framework-Next.js-black?logo=next.js" />
  <img src="https://img.shields.io/badge/UI-React-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql" />
  <img src="https://img.shields.io/badge/ORM-Drizzle-CA8A04" />
  <img src="https://img.shields.io/badge/Integrity-SHA--256-2E8B57" />
  <img src="https://img.shields.io/badge/Status-Demo-orange" />
</p>

---

## Overview

Digital forensic investigations often involve multiple activities, including case management, evidence collection, preservation, integrity verification, analysis, correlation, and reporting.

SecTrace brings these activities together in a single workspace, providing investigators with a structured environment to manage cases and examine digital evidence.

The current implementation is a functional demonstration built using **Next.js, React, PostgreSQL, and Drizzle ORM**.

The platform focuses on evidence traceability, transparent rule-based analysis, and organized investigation workflows rather than claiming fully automated or court-certified forensic capabilities.

## Key Features

### 1. Case Management
- Create and manage investigation cases.
- Update case assignments, severity, and status.
- Maintain centralized case-related information.
- Organize investigation activities within individual cases.

### 2. Evidence Acquisition
- Upload multiple evidence files.
- Store original file bytes in the database.
- Calculate SHA-256 hashes during evidence acquisition.
- Associate uploaded evidence with investigation cases.
- Support bounded file uploads.

### 3. Evidence Integrity Verification
- Verify stored evidence against its recorded acquisition hash.
- Optionally compare evidence against an expected SHA-256 hash.
- Identify hash mismatches and potential integrity failures.
- Display verification results within the investigation workspace.

### 4. Evidence Repository
- Centralized evidence management.
- Search and filter evidence records.
- Filter by investigation case, file type, and integrity status.
- Access stored evidence through dedicated endpoints.

### 5. Local Forensic Analysis
- Perform transparent, rule-based analysis.
- Identify supported hash verification failures.
- Detect suspicious filenames using configured rules.
- Search supported text indicators.
- Generate explainable analysis results without external AI services.

### 6. Findings & Investigation Triage
- Create investigation findings.
- Review and track identified issues.
- Update and resolve findings.
- Organize investigation outcomes.

### 7. Evidence Graph & Timeline
- Explore case-linked evidence relationships.
- Visualize available investigation connections.
- Review recorded activities through a UTC-based timeline.

### 8. Audit History
- Track operational events.
- Review recent workspace activities.
- Export available audit records in CSV format.

### 9. PDF Report Generation
- Generate downloadable investigation reports.
- Preserve report data using generation-time snapshots.
- Retrieve previously generated reports.

### 10. Analyst Workspace
- Responsive investigation dashboard.
- Global search functionality.
- Analyst profile management.
- Configurable feature switches.
- Centralized access to investigation tools.

---

## Investigation Workflow

SecTrace follows a structured investigation model:

```mermaid
flowchart TD
    A[Case Creation] --> B[Evidence Ingestion]
    B --> C[Evidence Preservation]
    C --> D[Forensic Parsing]
    D --> E[Detection]
    E --> F[Correlation]
    F --> G[Investigation Triage]
    G --> H[Report Generation]
```

**Important:** This diagram represents the broader investigation model. The current implementation supports selected stages, including case management, evidence ingestion, SHA-256 verification, local rule-based analysis, findings, timeline activities, and reporting. Comprehensive forensic parsing and advanced automated correlation are not yet implemented.

---

## System Architecture

SecTrace follows a layered application architecture:

```mermaid
flowchart TD
    A[Analyst / Investigator] --> B[Next.js App Router]
    B --> C[React User Interface]
    C --> D[Application API]
    D --> E[Drizzle ORM]
    E --> F[(PostgreSQL Database)]
    
    D --> G[Evidence Processing]
    G --> H[SHA-256 Verification]
    D --> I[Local Rule-Based Analysis]
    D --> J[PDF Report Generation]
```

### Technology Stack

| Component | Technology |
|---|---|
| Frontend Framework | Next.js |
| UI Library | React |
| Application Routing | Next.js App Router |
| Programming Languages | TypeScript / JavaScript |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Evidence Integrity | SHA-256 |
| Analysis | Local Rule-Based Engine |
| Reporting | PDF Generation |
| Package Manager | npm |
| Runtime | Node.js |

---

## Getting Started

Follow these instructions to run SecTrace locally.

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/cyber-sudhir/SecTrace.git
```

Navigate to the project directory:

```bash
cd SecTrace
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root directory.

Add your PostgreSQL database connection string:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME"
```

Replace the placeholders with your actual database credentials.

### 4. Apply Database Schema

Run the following command to apply the database schema:

```bash
npx drizzle-kit push
```

### 5. Start the Development Server

```bash
npm run dev
```

Open the application in your browser:

```text
http://localhost:3000
```

**Note:** The first workspace request initializes synthetic demonstration data.

### Environment Security

- Never commit `.env` files.
- Never expose database credentials.
- Use environment variables for sensitive configuration.
- Use synthetic evidence for demonstrations.

---

## API Reference

SecTrace provides application endpoints for workspace operations, evidence management, health checks, and report retrieval.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Database health check |
| GET | `/api/workspace` | Retrieve workspace metadata |
| GET | `/api/workspace?export=audit` | Export audit records as CSV |
| POST | `/api/workspace` | Execute workspace actions |
| POST | `/api/evidence` | Upload evidence files |
| GET | `/api/evidence/:id` | Download stored evidence |
| GET | `/api/reports/:id` | Download generated PDF reports |

### Workspace Operations

The workspace POST endpoint supports actions related to:

- Case management
- Findings management
- Evidence verification
- Local analysis
- Analyst profile management
- Feature configuration
- Report generation

### Evidence Upload Limits

The current demonstration implementation supports:

| Restriction | Limit |
|---|---:|
| Maximum files per request | 10 |
| Maximum individual file size | 20 MB |
| Maximum total request size | 50 MB |

---

## Testing & Validation

Run the following commands from the project root directory to validate the application.

### Type Generation

```bash
npx next typegen
```

### TypeScript Validation

```bash
npm exec tsc -- --noEmit --pretty false
```

### Production Build

```bash
npm run build
```

### Smoke Testing

```bash
node scripts/smoke-test.mjs
```

### Workflow Testing

For workflow testing, use an isolated demonstration database:

```bash
node scripts/workflow-test.mjs
```

**Warning:** Workflow tests restore demonstration state. Never execute their cleanup operations against a production database or a database being used concurrently.

---

## Evidence Integrity & Analysis Methodology

### SHA-256 Integrity Verification

SecTrace uses SHA-256 hashing to verify whether stored evidence bytes match their recorded acquisition digest.

The verification process helps identify changes to the stored file contents relative to the recorded hash.

However, a matching hash does not independently establish:

- The authenticity of the original source.
- The correctness of the acquisition process.
- The absence of manipulation before acquisition.
- Legal admissibility of the evidence.

### Explainable Local Analysis

The current analysis engine uses predefined local rules and configured indicators.

It does not currently depend on external AI services, machine learning inference, or third-party analysis APIs.

Analysis results are intended to support investigation and triage rather than replace expert forensic examination.

### Report Integrity

Generated reports preserve generation-time data snapshots.

However, reports are not digitally signed, and the current audit records are not cryptographically tamper-proof.

---

## Security Limitations & Responsible Deployment

**Current implementation status: Demonstration environment.**

SecTrace is currently an unauthenticated, shared demonstration application.

It is not designed for handling confidential, classified, or sensitive real-world digital evidence.

Before production deployment, the following security controls are necessary:

- Authentication and secure session management.
- Role-Based Access Control (RBAC).
- Case-level authorization and tenant isolation.
- Encrypted evidence storage.
- Secure and streamed file uploads.
- Evidence retention and backup policies.
- Independently protected, tamper-evident audit records.
- Secure secrets and configuration management.
- Request throttling and upload restrictions.
- Comprehensive application security testing.

### Current Storage Limitation

For this bounded demonstration, uploaded file bytes are Base64-encoded and stored in PostgreSQL.

This approach is not intended for scalable production evidence storage.

**Disclaimer:** SecTrace is an experimental forensic workflow demonstration, not a certified digital forensic platform.

---

## Development Roadmap

The following improvements are planned development directions:

| Area | Planned Enhancement |
|---|---|
| Authentication | Secure login and session management |
| Authorization | RBAC and case-level access control |
| Chain of Custody | Tamper-evident evidence handling records |
| Forensic Parsing | Specialized parsers for approved forensic artifacts |
| Timeline Analysis | Improved event correlation and reconstruction |
| Analysis Engine | Reproducible and extensible analysis rules |
| Evidence Storage | Scalable encrypted object storage |
| Audit Security | Independently protected audit records |
| Report Integrity | Stronger report verification and digital signatures |
| Production Readiness | Comprehensive security testing and deployment controls |

These enhancements are planned and should not be interpreted as existing functionality.

---

## Smart India Hackathon 2026

SecTrace is developed in the context of the following Smart India Hackathon problem statement:

| Detail | Information |
|---|---|
| Program | Smart India Hackathon 2026 |
| Problem Statement | PS 26148 |
| Organization | National Technical Research Organisation (NTRO) |
| Domain | Digital Forensics |
| Project | Unified Digital Forensics Automation & Scripting Framework |

The project explores a unified approach to digital investigation workflows in response to the stated problem.

This project description does not imply official endorsement, adoption, or deployment by NTRO or any government organization.

---

## Responsible Use

SecTrace is intended for authorized digital forensic research, educational demonstrations, and controlled testing.

Users are responsible for:

- Obtaining proper authorization before examining digital evidence.
- Protecting personal and confidential information.
- Following applicable privacy and data protection requirements.
- Maintaining appropriate evidence-handling procedures.
- Using synthetic datasets for demonstrations and testing.

Do not upload classified, confidential, or sensitive real-world evidence to the current demonstration environment.

---

## License

No license has currently been specified for this repository.

A `LICENSE` file should be added before granting reuse, modification, or redistribution permissions.

Until then, no open-source reuse or redistribution permission should be assumed.

---

## Project Identity

**SecTrace — Bringing digital investigation workflows into one traceable workspace.**

*Investigate with structure. Preserve with integrity. Analyze with transparency.*

**NTRO**
