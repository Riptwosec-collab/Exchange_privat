import { DashboardShell } from "@/components/dashboard-shell";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <DashboardShell />
    </Suspense>
  );
}
