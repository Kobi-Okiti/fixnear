import { DashboardCards } from "../components/dashboard/dashboard-cards";
import { DashboardCharts } from "../components/dashboard/dashboard-charts";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl">Admin Dashboard</h1>
      <DashboardCards />
      <DashboardCharts />
    </div>
  );
}
