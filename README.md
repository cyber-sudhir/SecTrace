# SecTrace — Forensic Investigation Platform

A complete, responsive digital-forensics **demo workspace** inspired by the supplied dashboard reference. Built with Next.js App Router, React, PostgreSQL, and Drizzle ORM.

## Included

- Dark, responsive dashboard with live database counts, recent cases, activity, ATT&CK summaries, and evidence integrity.
- Case creation, editing, assignment, severity, and status management.
- Multi-file evidence imports, original-byte storage, SHA-256 acquisition hashes, optional expected-hash comparisons, verification, and downloads.
- Searchable evidence repository with case, type, and integrity filters.
- Case-linked evidence graph, UTC timeline, and read-only operational audit history with CSV export.
- Analyst findings, reviewed/resolved workflows, and a transparent local rule engine.
- Immutable report snapshots and real PDF generation/downloads.
- Persisted analyst profile and functional built-in plugin switches.
- Keyboard-accessible dialogs, global search (Ctrl/Cmd+K), mobile navigation, pagination, and feedback notifications.

## Development

1. Install dependencies with `npm install`.
2. Provide a local PostgreSQL `DATABASE_URL` in `.env`. Do not commit credentials.
3. Apply the schema with `npx drizzle-kit push`.
4. Start development with `npm run dev`.

The platform-managed environment bootstraps PostgreSQL before schema application. The first workspace request seeds synthetic demonstration data under a transaction/advisory lock. Subsequent requests retain all changes.

The seed contains 15 cases (12 open), 84 evidence samples, 81 verified hashes, 2 pending files, one intentionally modified sample, and five open critical findings. Sample binary/capture filenames contain harmless demonstration text, not actual executables or forensic images.

## Validation

- `npx next typegen`
- `npm exec tsc -- --noEmit --pretty false`
- `npm run build`
- `node scripts/smoke-test.mjs` against an already running preview
- `node scripts/workflow-test.mjs` against an isolated local/demo database

Browser tests require `npx playwright install --with-deps chromium`. Set `TEST_BASE_URL` to test a different preview. Workflow tests create temporary QA records, verify persistence/downloads, and restore the original demo state using Drizzle. **Do not run the workflow cleanup against a production or concurrently used database.** Screenshots and temporary fixtures are placed in the ignored `artifacts/` directory.

## API

- `GET /api/health` — database healthcheck.
- `GET /api/workspace` — public workspace metadata; excludes stored file bytes and report snapshots.
- `GET /api/workspace?export=audit` — CSV export of the latest 250 events, with formula-injection protection.
- `POST /api/workspace` — JSON actions: `create-case`, `update-case`, `create-finding`, `update-finding`, `verify-evidence`, `verify-all`, `run-analysis`, `toggle-plugin`, `update-profile`, `create-report`.
- `POST /api/evidence` — multipart `caseId`, `files`, and optional `expectedHash` (one file only).
- `GET /api/evidence/:id` — original-byte download as a non-executable attachment; records a download event.
- `GET /api/reports/:id` — PDF generated from the saved immutable report snapshot; records a download event.

Imports accept up to 10 files, 20 MB per file, and 50 MB total. Files are base64-encoded in PostgreSQL for this bounded demo. Larger deployments should use encrypted object storage and streamed uploads.

## Analysis and plugins

The AI Analysis navigation opens an explicitly labelled **local rule-based analysis** screen. No external AI service is configured and no model inference is claimed. Checks identify stored hash failures, suspicious filenames, and configured text indicators in files up to 512 KB. Results are explainable indicators for analyst review, not a malware verdict or a calibrated threat probability. Existing rule findings are deduplicated on sequential runs.

Plugin switches actually control automatic verification on import, local analysis availability, integrity-failure findings, and confidential markings in newly created PDF snapshots.

## Security boundaries

This application is an **unauthenticated, shared demo**, not a production evidence-management system. The profile is workspace-wide. Do not upload real confidential evidence.

Before production deployment, add authenticated sessions, tenant isolation, role-based authorization, request throttling, encrypted object storage, retention policies, backups, and independently protected/tamper-evident audit storage. Current operational events cannot be edited through the UI/API, but are not cryptographically tamper-proof. A matching hash proves that stored bytes match the acquisition hash; it does not establish source authenticity. Reports preserve their generation-time snapshot but are not digitally signed.

No API keys or secrets are hardcoded. Database credentials remain server-side. Download endpoints use attachment disposition and `nosniff`; imported files are never executed.
