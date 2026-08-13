"use client";

import PerformanceChart from "@/components/dashboard/PerformanceChart";
import TaskDistributionChart from "@/components/dashboard/TaskDistributionChart";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto h-full">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard & Analytics</h2>
          <p className="text-sm opacity-70 mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        <div className="md:col-span-2 flex">
          <PerformanceChart />
        </div>
        <div className="md:col-span-1 flex">
          <TaskDistributionChart />
        </div>
      </div>
    </div>
  );
}
