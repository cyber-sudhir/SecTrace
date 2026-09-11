import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const origin = new URL(base).origin;
const marker = `SECTRACE-QA-${Date.now()}`;
const workspace = async () => {
  const response = await fetch(`${base}/api/workspace`);
  assert.equal(response.status, 200);
  return response.json();
};
const action = async (body, status = 200) => {
  const response = await fetch(`${base}/api/workspace`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(body) });
  const result = await response.json();
  assert.equal(response.status, status, `${body.action}: ${JSON.stringify(result)}`);
  return result;
};
const upload = async (caseId, name, content, expectedHash = '') => {
  const form = new FormData(); form.set('caseId', String(caseId)); form.append('files', new Blob([content], { type: 'text/plain' }), name); if (expectedHash) form.set('expectedHash', expectedHash);
  const response = await fetch(`${base}/api/evidence`, { method: 'POST', headers: { Origin: origin }, body: form });
  const result = await response.json(); assert.equal(response.status, 201, JSON.stringify(result)); return result;
};
await mkdir('artifacts', { recursive: true });
const baseline = await workspace();
await writeFile('artifacts/qa-fixture.json', JSON.stringify({ marker, baseline }));
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const navigate = (name) => page.getByRole('navigation').getByRole('link', { name, exact: false }).click();
const postResponse = () => page.waitForResponse((r) => r.url().endsWith('/api/workspace') && r.request().method() === 'POST');
let failure;
try {
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'New Case', exact: true }).click();
  let dialog = page.getByRole('dialog');
  await dialog.getByLabel('Case title', { exact: false }).fill(`${marker} Investigation`);
  await dialog.getByLabel('Description', { exact: false }).fill('QA_ORIGINAL_CONTEXT: Evidence acquired for automated workflow verification.');
  await dialog.getByRole('radio', { name: 'high', exact: true }).check();
  let pending = postResponse();
  await dialog.getByRole('button', { name: 'Create case', exact: true }).click();
  assert.equal((await pending).status(), 200);
  await dialog.waitFor({ state: 'hidden' });
  let current = await workspace();
  const qaCase = current.cases.find((c) => c.title.startsWith(marker));
  assert.ok(qaCase, 'Case persisted'); assert.equal(qaCase.severity, 'high');
  console.log('PASS case creation:', qaCase.reference);

  await page.getByRole('textbox', { name: 'Search case name, ID, or analyst...' }).fill(marker);
  await page.locator('.case-table tbody tr').filter({ hasText: marker }).click();
  await page.getByRole('button', { name: 'Edit case', exact: true }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Case title', { exact: false }).fill(`${marker} Updated investigation`);
  pending = postResponse(); await dialog.getByRole('button', { name: 'Save changes', exact: true }).click();
  assert.equal((await pending).status(), 200); await dialog.waitFor({ state: 'hidden' });
  assert.equal((await workspace()).cases.find((c) => c.id === qaCase.id).title, `${marker} Updated investigation`);
  console.log('PASS case edit and database persistence');

  const original = Buffer.from('QA_ORIGINAL_FILE\npowershell -enc TEST_ONLY\nSafe synthetic test content.\n');
  const sha256 = createHash('sha256').update(original).digest('hex');
  await page.getByRole('button', { name: 'Import', exact: true }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Investigation', { exact: false }).selectOption(String(qaCase.id));
  await dialog.getByLabel('Choose evidence files', { exact: true }).setInputFiles({ name: 'suspicious_login.txt', mimeType: 'text/plain', buffer: original });
  await dialog.getByLabel('Expected SHA-256 hash', { exact: false }).fill(sha256);
  const uploadResponse = page.waitForResponse((r) => r.url().endsWith('/api/evidence') && r.request().method() === 'POST');
  await dialog.getByRole('button', { name: 'Import evidence', exact: true }).click();
  assert.equal((await uploadResponse).status(), 201); await dialog.waitFor({ state: 'hidden' });
  current = await workspace();
  const file = current.evidence.find((e) => e.caseId === qaCase.id && e.name === 'suspicious_login.txt');
  assert.ok(file); assert.equal(file.sha256, sha256); assert.equal(file.integrity, 'verified'); assert.equal(file.size, original.length);
  console.log('PASS evidence upload and real SHA-256 comparison');

  await page.goto(`${base}/?view=evidence&filter=case:${qaCase.id}`, { waitUntil: 'networkidle' });
  await page.locator('.file-name-button').filter({ hasText: file.name }).click();
  pending = postResponse(); await page.getByRole('button', { name: 'Verify integrity', exact: true }).click();
  assert.equal((await pending).status(), 200);
  let downloadEvent = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download file', exact: true }).click();
  let downloaded = await downloadEvent;
  assert.deepEqual(await readFile(await downloaded.path()), original, 'Download preserves original bytes');
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click();
  console.log('PASS integrity verification and original-byte download');

  await navigate('Findings');
  await page.getByRole('button', { name: 'Record finding', exact: true }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Investigation', { exact: false }).selectOption(String(qaCase.id));
  await dialog.getByLabel('Finding title', { exact: false }).fill(`${marker} Analyst observation`);
  await dialog.getByLabel('Observation & supporting context', { exact: false }).fill('Synthetic observation for review workflow testing.');
  await dialog.getByLabel('Severity', { exact: false }).selectOption('critical');
  await dialog.getByLabel('ATT&CK technique', { exact: false }).selectOption('T1059');
  pending = postResponse(); await dialog.getByRole('button', { name: 'Record finding', exact: true }).click();
  assert.equal((await pending).status(), 200); await dialog.waitFor({ state: 'hidden' });
  await page.locator('.finding-name-button').filter({ hasText: marker }).click();
  pending = postResponse(); await page.getByRole('button', { name: 'Mark reviewed', exact: true }).click();
  assert.equal((await pending).status(), 200);
  await page.getByRole('dialog').locator('.status-reviewed').waitFor();
  pending = postResponse(); await page.getByRole('button', { name: 'Resolve finding', exact: true }).click();
  assert.equal((await pending).status(), 200); await page.getByRole('dialog').waitFor({ state: 'hidden' });
  assert.equal((await workspace()).findings.find((f) => f.title.includes(marker)).status, 'resolved');
  console.log('PASS analyst finding creation, review, and resolution');

  await navigate('Plugins');
  const engine = page.getByRole('switch', { name: 'Enable Local Rule Engine', exact: true });
  if (await engine.getAttribute('aria-checked') === 'true') {
    pending = postResponse(); await engine.click(); assert.equal((await pending).status(), 200);
    await page.locator('[aria-label="Enable Local Rule Engine"][aria-checked="false"]').waitFor();
  }
  await action({ action: 'run-analysis', caseId: qaCase.id }, 409);
  pending = postResponse(); await engine.click(); assert.equal((await pending).status(), 200);
  await page.locator('[aria-label="Enable Local Rule Engine"][aria-checked="true"]').waitFor();
  await navigate('AI Analysis');
  await page.getByRole('combobox', { name: 'Analysis scope' }).selectOption(String(qaCase.id));
  pending = postResponse(); await page.getByRole('button', { name: 'Run analysis', exact: true }).click();
  const analyzed = await (await pending).json(); assert.equal(analyzed.checked, 1); assert.ok(analyzed.detected >= 1);
  const repeated = await action({ action: 'run-analysis', caseId: qaCase.id }); assert.equal(repeated.detected, 0, 'Sequential analysis does not duplicate findings');
  console.log('PASS persisted plugin switches, rule analysis, and deduplication');

  await action({ action: 'toggle-plugin', id: 'hash-verifier', enabled: false });
  const pendingUpload = await upload(qaCase.id, 'qa-pending.log', 'Pending verification fixture');
  assert.equal((await workspace()).evidence.find((e) => e.id === pendingUpload.ids[0]).integrity, 'pending');
  const checked = await action({ action: 'verify-evidence', id: pendingUpload.ids[0] }); assert.equal(checked.verified, 1);
  await action({ action: 'toggle-plugin', id: 'hash-verifier', enabled: true });
  const mismatched = await upload(qaCase.id, 'qa-mismatch.txt', 'Modified acquisition fixture', '0'.repeat(64));
  assert.equal(mismatched.failed, 1);
  const vaultCheck = await action({ action: 'verify-all' }); assert.ok(vaultCheck.failed >= 2, 'Bulk scan detects intentional mismatches');
  assert.equal((await workspace()).evidence.find((e) => e.id === mismatched.ids[0]).integrity, 'failed');
  console.log('PASS pending imports, mismatch alerts, and whole-vault verification');

  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Open analyst settings', exact: true }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Display name', { exact: false }).fill('QA Analyst');
  await dialog.getByLabel('Role', { exact: false }).fill('QA Reviewer');
  await dialog.getByLabel('Email address', { exact: false }).fill('qa@sectrace.test');
  pending = postResponse(); await dialog.getByRole('button', { name: 'Save profile', exact: true }).click();
  assert.equal((await pending).status(), 200); await dialog.waitFor({ state: 'hidden' });
  assert.equal((await workspace()).profile.name, 'QA Analyst');
  console.log('PASS workspace analyst settings');

  await action({ action: 'toggle-plugin', id: 'report-watermark', enabled: true });
  await navigate('Reports');
  await page.getByRole('button', { name: 'Generate report', exact: true }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Investigation', { exact: false }).selectOption(String(qaCase.id));
  await dialog.getByLabel('Report title', { exact: false }).fill(`${marker} Evidence snapshot`);
  pending = postResponse(); await dialog.getByRole('button', { name: 'Generate PDF report', exact: true }).click();
  assert.equal((await pending).status(), 200); await dialog.waitFor({ state: 'hidden' });
  const report = (await workspace()).reports.find((r) => r.title.startsWith(marker)); assert.ok(report);
  await action({ action: 'update-case', id: qaCase.id, description: 'QA_CHANGED_AFTER_SNAPSHOT' });
  downloadEvent = page.waitForEvent('download');
  await page.locator('.report-card').filter({ hasText: marker }).getByRole('link', { name: 'Download PDF', exact: true }).click();
  downloaded = await downloadEvent;
  const pdf = await readFile(await downloaded.path());
  assert.ok(pdf.subarray(0, 5).toString() === '%PDF-');
  const pdfText = pdf.toString('latin1');
  assert.ok(pdfText.includes('QA_ORIGINAL_CONTEXT')); assert.ok(!pdfText.includes('QA_CHANGED_AFTER_SNAPSHOT')); assert.ok(pdfText.includes('CONFIDENTIAL'));
  await action({ action: 'toggle-plugin', id: 'report-watermark', enabled: false });
  const plainReport = await action({ action: 'create-report', caseId: qaCase.id, title: `${marker} Plain report` });
  const plainPdf = Buffer.from(await (await fetch(`${base}/api/reports/${plainReport.id}`)).arrayBuffer());
  assert.ok(!plainPdf.toString('latin1').includes('CONFIDENTIAL'));
  console.log('PASS PDF downloads, immutable snapshots, and watermark behavior');

  await navigate('Audit Log');
  downloadEvent = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Export CSV', exact: true }).click();
  downloaded = await downloadEvent;
  const csv = await readFile(await downloaded.path(), 'utf8');
  assert.ok(csv.startsWith('Event ID,Timestamp,Type,Event,Details')); assert.ok(csv.includes(qaCase.reference));
  await action({ action: 'create-case', title: '', severity: 'invalid' }, 400);
  await action({ action: 'update-case', id: 99999999, status: 'active' }, 404);
  await action({ action: 'update-profile', name: 'Bad input', role: 'Analyst', email: 'not-an-email' }, 400);
  const missingEvidence = await fetch(`${base}/api/evidence/99999999`); assert.equal(missingEvidence.status, 404);
  const foreign = await fetch(`${base}/api/workspace`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://untrusted.invalid' }, body: JSON.stringify({ action: 'create-case', title: 'Cross-origin attempt', severity: 'low' }) });
  assert.equal(foreign.status, 403);
  assert.deepEqual(errors, []);
  console.log('PASS audit CSV, server validation, not-found handling, origin checks, and clean browser console');
  console.log('ALL END-TO-END WORKFLOWS PASSED');
} catch (error) {
  failure = error;
  await page.screenshot({ path: 'artifacts/workflow-failure.png', fullPage: false }).catch(() => {});
  console.error(error);
} finally {
  await browser.close();
  const cleanup = spawnSync('npx', ['tsx', 'scripts/cleanup-qa.ts'], { cwd: process.cwd(), encoding: 'utf8', env: process.env });
  console.log(cleanup.stdout); if (cleanup.stderr) console.error(cleanup.stderr);
  if (cleanup.status !== 0) failure ||= new Error('QA fixture cleanup failed. Run npx tsx scripts/cleanup-qa.ts.');
}
if (failure) process.exitCode = 1;
