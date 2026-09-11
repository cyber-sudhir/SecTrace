"use client";

import { createContext, useContext } from "react";
import type { View, WorkspaceData } from "@/lib/types";

export type ModalState =
  | { type: "case-create" }
  | { type: "case-edit"; id: number }
  | { type: "case-detail"; id: number }
  | { type: "import"; caseId?: number }
  | { type: "evidence-detail"; id: number }
  | { type: "finding-detail"; id: number }
  | { type: "finding-create"; caseId?: number }
  | { type: "report-create"; caseId?: number }
  | { type: "profile" }
  | { type: "technique"; id: string }
  | { type: "event"; id: number };
export interface ActionResult { message: string; id?: number; reference?: string; checked?: number; detected?: number; verified?: number; failed?: number }
export interface WorkspaceContextValue {
  data: WorkspaceData;
  view: View;
  initialFilter: string;
  busy: boolean;
  navigate: (view: View, filter?: string) => void;
  openModal: (modal: ModalState) => void;
  closeModal: () => void;
  runAction: (input: Record<string, unknown>, options?: { close?: boolean; silent?: boolean }) => Promise<ActionResult | null>;
  refresh: () => Promise<void>;
  notify: (message: string, type?: "success" | "error" | "info") => void;
}
export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("Workspace components must be inside their provider.");
  return context;
}
