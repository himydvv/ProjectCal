"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/lib/supabase";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"]; 

export default function TaskDistributionChart() {
  const [data, setData] = useState<{name: string, value: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const { data: rpcData, error } = await supabase.rpc('get_task_distribution');
      if (!error && rpcData) {
         const formatted = rpcData.map((d: any) => ({
           name: d.recurrence_type === 'all_days' ? 'Routines (All Days)' : 
                 d.recurrence_type === 'specific_day' ? 'Deep Work (Specific)' : d.recurrence_type,
           value: Number(d.total_hours) || 0
         })).filter((d: { value: number }) => d.value > 0); // Only show segments with > 0 hours
         setData(formatted);
      } else if (error) {
         console.error("Error fetching task distribution:", error);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="glass-panel p-6 flex flex-col gap-6 w-full h-full">
      <div>
        <h3 className="text-xl font-bold tracking-tight">Time Distribution</h3>
        <p className="text-sm opacity-60">Routines vs Deep Work</p>
      </div>

      <div className="h-64 w-full">
        {isLoading ? (
          <div className="w-full h-full flex justify-center items-center opacity-50">
            <div className="animate-pulse flex gap-2">
              <div className="w-2 h-2 rounded-full bg-current"></div>
              <div className="w-2 h-2 rounded-full bg-current"></div>
              <div className="w-2 h-2 rounded-full bg-current"></div>
            </div>
          </div>
        ) : data.length === 0 ? (
           <div className="w-full h-full flex justify-center items-center opacity-50 text-center px-4">
             <p className="text-sm">Complete some tasks to see distribution.</p>
           </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [`${Number(value).toFixed(1)} hrs`, "Time Spent"]}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                  backdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  color: 'currentColor'
                }}
                itemStyle={{ color: 'currentColor' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', opacity: 0.8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
