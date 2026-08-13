"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import clsx from "clsx";

export default function PerformanceChart() {
  const { isGuest } = useAuth();
  const [metric, setMetric] = useState<"total_hours" | "completion_ratio">("total_hours");
  const [data, setData] = useState<{date: string, total_hours: number, completion_ratio: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      if (isGuest) {
        setData([
          { date: "Mon", total_hours: 4, completion_ratio: 0.5 },
          { date: "Tue", total_hours: 6, completion_ratio: 0.7 },
          { date: "Wed", total_hours: 5, completion_ratio: 0.6 },
          { date: "Thu", total_hours: 8, completion_ratio: 0.9 },
          { date: "Fri", total_hours: 7, completion_ratio: 0.8 },
          { date: "Sat", total_hours: 2, completion_ratio: 1.0 },
          { date: "Sun", total_hours: 3, completion_ratio: 0.5 }
        ]);
        setIsLoading(false);
        return;
      }
      const { data: rpcData, error } = await supabase.rpc('get_performance_trend', { days_back: 7 });
      if (!error && rpcData) {
         const formatted = rpcData.map((d: any) => {
           // Parse the date (yyyy-mm-dd) correctly handling local timezone shifts
           const [year, month, day] = d.date.split('-');
           const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
           
           return {
             ...d,
             date: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
             total_hours: Number(d.total_hours) || 0,
             completion_ratio: Number(d.completion_ratio) || 0
           };
         });
         setData(formatted);
      } else if (error) {
         console.error("Error fetching performance trend:", error);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  // Determine trend color (green for increasing from yesterday, red/neutral for decreasing)
  const isUpwardTrend = data.length >= 2 ? data[data.length - 1][metric] >= data[data.length - 2][metric] : true;
  const strokeColor = isUpwardTrend ? "#10b981" : "#8b5cf6"; // Emerald vs Purple
  const fillColor = isUpwardTrend ? "url(#colorGreen)" : "url(#colorPurple)";

  return (
    <div className="glass-panel p-6 flex flex-col gap-6 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Performance</h3>
          <p className="text-sm opacity-60">7-day rolling trend</p>
        </div>
        
        <div className="flex bg-black/5 dark:bg-white/5 rounded-lg p-1 border border-foreground/10">
          <button 
            onClick={() => setMetric("total_hours")}
            className={clsx(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all", 
              metric === "total_hours" ? "bg-white dark:bg-black/40 shadow-sm" : "opacity-60 hover:opacity-100"
            )}
          >
            Hours
          </button>
          <button 
            onClick={() => setMetric("completion_ratio")}
            className={clsx(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all", 
              metric === "completion_ratio" ? "bg-white dark:bg-black/40 shadow-sm" : "opacity-60 hover:opacity-100"
            )}
          >
            Ratio
          </button>
        </div>
      </div>

      <div className="h-64 w-full -ml-4">
        {isLoading ? (
          <div className="w-full h-full flex justify-center items-center opacity-50">
            <div className="animate-pulse flex gap-2">
              <div className="w-2 h-2 rounded-full bg-current"></div>
              <div className="w-2 h-2 rounded-full bg-current"></div>
              <div className="w-2 h-2 rounded-full bg-current"></div>
            </div>
          </div>
        ) : data.length === 0 ? (
           <div className="w-full h-full flex justify-center items-center opacity-50">
             <p className="text-sm ml-4">No data available.</p>
           </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "currentColor", opacity: 0.5 }}
                dy={10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                  backdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  color: 'currentColor'
                }}
                itemStyle={{ color: 'currentColor' }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey={metric} 
                stroke={strokeColor}
                strokeWidth={3}
                fillOpacity={1} 
                fill={fillColor} 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
