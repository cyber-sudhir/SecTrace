import WorkspaceShell from "@/components/workspace-shell";
import { getWorkspace } from "@/lib/workspace";
import { VIEW_LABELS, type View } from "@/lib/types";

export const dynamic = "force-dynamic";
export default async function HomePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const requested = typeof params.view === "string" ? params.view : "dashboard";
  const view: View = Object.prototype.hasOwnProperty.call(VIEW_LABELS, requested) ? requested as View : "dashboard";
  const filter = typeof params.filter === "string" ? params.filter : "";
  const data = await getWorkspace();
  return <WorkspaceShell initialData={data} initialView={view} initialFilter={filter} />;
}
