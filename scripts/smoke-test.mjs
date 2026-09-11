import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
try {
  const response = await page.goto(base, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200, 'Dashboard renders');
  await page.evaluate(() => document.fonts.ready);
  const snapshot = await (await page.request.get(`${base}/api/workspace`)).json();
  assert.ok(snapshot.cases.length >= 15);
  assert.ok(snapshot.evidence.length >= 84);
  assert.ok(snapshot.evidence.every((item) => !('data' in item)), 'File bytes are excluded from workspace metadata');
  await page.screenshot({ path: 'artifacts/dashboard-desktop.png', fullPage: false });
  console.log('Desktop layout', await page.evaluate(() => ({ width: innerWidth, documentWidth: document.documentElement.scrollWidth, pageHeight: document.documentElement.scrollHeight, cards: [...document.querySelectorAll('.stat-value')].map((e) => e.textContent), fonts: document.fonts.status })));
  await page.setViewportSize({ width: 1280, height: 853 });
  await page.screenshot({ path: 'artifacts/dashboard-reference-size.png', fullPage: false });
  const navigation = [
    ['Cases', 'Case management'], ['Evidence Vault', 'Evidence vault'], ['Timeline', 'Investigation timeline'],
    ['Evidence Graph', 'Evidence graph'], ['AI Analysis', 'Analysis workspace'], ['ATT&CK Map', 'MITRE ATT&CK map'],
    ['Findings', 'Findings & observations'], ['Reports', 'Investigation reports'], ['Plugins', 'Plugins & capabilities'], ['Audit Log', 'Workspace audit log'],
  ];
  for (const [label, title] of navigation) {
    await page.getByRole('navigation').getByRole('link', { name: label, exact: false }).click();
    await page.getByRole('heading', { name: title, exact: true }).waitFor();
    console.log('PASS navigation:', label);
  }
  await page.goto(base, { waitUntil: 'networkidle' });
  const search = page.getByRole('combobox', { name: 'Search cases, evidence, and findings' });
  await search.fill('Exam Paper');
  await page.getByRole('option', { name: /Exam Paper Leak/ }).click();
  await page.getByRole('dialog').getByRole('heading', { name: 'Exam Paper Leak', exact: true }).waitFor();
  await page.screenshot({ path: 'artifacts/case-detail.png', fullPage: false });
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click();
  await page.getByRole('button', { name: 'New Case', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  await page.screenshot({ path: 'artifacts/create-case.png', fullPage: false });
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No horizontal mobile overflow');
  await page.screenshot({ path: 'artifacts/dashboard-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'Evidence Vault', exact: true }).click();
  await page.getByRole('heading', { name: 'Evidence vault', exact: true }).waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No evidence page mobile overflow');
  await page.screenshot({ path: 'artifacts/evidence-mobile.png', fullPage: true });
  assert.deepEqual(errors, [], 'No browser or hydration errors');
  console.log('PASS global search, dialogs, responsive layout, and clean browser console');
  console.log('WORKSPACE:', JSON.stringify(snapshot.stats));
} finally {
  await browser.close();
}
