import { pgTable, serial, text, integer, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import type { Severity, CaseStatus, Integrity, ReportSnapshot } from "@/lib/types";

export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  reference: text("reference").unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  severity: text("severity").$type<Severity>().notNull().default("medium"),
  status: text("status").$type<CaseStatus>().notNull().default("active"),
  assignee: text("assignee").notNull().default("Sudhir K."),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});
export const evidence = pgTable("evidence", {
  id: serial("id").primaryKey(),
  reference: text("reference").unique(),
  caseId: integer("case_id").notNull().references(() => cases.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  fileType: text("file_type").notNull(),
  mimeType: text("mime_type").notNull().default("application/octet-stream"),
  size: integer("size").notNull(),
  sha256: text("sha256").notNull(),
  data: text("data").notNull(),
  integrity: text("integrity").$type<Integrity>().notNull().default("pending"),
  technique: text("technique"),
  isSample: boolean("is_sample").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => [index("evidence_case_idx").on(table.caseId)]);
export const findings = pgTable("findings", {
  id: serial("id").primaryKey(),
  reference: text("reference").unique(),
  caseId: integer("case_id").notNull().references(() => cases.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").$type<Severity>().notNull().default("medium"),
  status: text("status").$type<"open" | "reviewed" | "resolved">().notNull().default("open"),
  technique: text("technique").notNull().default(""),
  confidence: integer("confidence").notNull().default(0),
  source: text("source").notNull().default("manual"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => [index("findings_case_idx").on(table.caseId)]);
export const activity = pgTable("activity", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  caseId: integer("case_id").references(() => cases.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reference: text("reference").unique(),
  title: text("title").notNull(),
  caseId: integer("case_id").notNull().references(() => cases.id),
  snapshot: jsonb("snapshot").$type<ReportSnapshot>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});
export const plugins = pgTable("plugins", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  version: text("version").notNull().default("1.0.0"),
});
export const settings = pgTable("workspace_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
});
