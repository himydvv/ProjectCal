"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import { Task } from "@/lib/supabase";
import { format, parseISO } from "date-fns";
import { FiClock, FiPlayCircle, FiCheckCircle, FiCalendar, FiFileText, FiAlertTriangle } from "react-icons/fi";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const startTime = parseISO(task.start_time);
  const endTime = parseISO(task.end_time);

  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const checkLive = () => {
      const now = new Date().getTime();
      setIsLive(now >= startTime.getTime() && now <= endTime.getTime());
    };

    checkLive();
    const interval = setInterval(checkLive, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [startTime, endTime]);

  let statusText = "";
  let statusColor = "";
  
  const now = new Date().getTime();
  const isPast = now > endTime.getTime();

  if (task.status === "done") {
    const scheduledHours = (endTime.getTime() - startTime.getTime()) / 3600000;
    // Add small tolerance for floating point math
    if (task.actual_hours !== undefined && task.actual_hours !== null && task.actual_hours < (scheduledHours - 0.05)) {
      statusText = "Partially";
      statusColor = "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30";
    } else {
      statusText = "Done";
      statusColor = "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30";
    }
  } else if (isLive || task.status === "running") {
    statusText = "Running";
    statusColor = "bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-500/30";
  } else if (isPast) {
    statusText = "Overdue";
    statusColor = "bg-red-500/20 text-red-800 dark:text-red-300 border-red-500/30";
  } else {
    statusText = "Upcoming";
    statusColor = "bg-slate-500/20 text-slate-800 dark:text-slate-300 border-slate-500/30";
  }

  return (
    <div
      onClick={onClick}
      className={clsx(
        "glass-card p-5 flex flex-col gap-4 cursor-pointer w-full group relative overflow-hidden transition-all",
        isLive && task.status !== "done" && "ring-2 ring-emerald-500/50 shadow-emerald-500/10 shadow-xl",
        !isLive && task.status === "running" && "ring-2 ring-blue-500/50 shadow-blue-500/10 shadow-xl",
        task.status === "done" && "bg-black/5 dark:bg-white/5" // Subtle background instead of grayscale
      )}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
            {task.title}
          </h3>
          <div className="flex items-center gap-1.5 text-foreground/60 text-xs font-semibold">
            <FiClock className="text-[11px]" />
            <span>{format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <span className={clsx("flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full border", statusColor)}>
            {isLive && task.status !== "done" && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
              </span>
            )}
            {!isLive && task.status === "done" && <FiCheckCircle className="text-[10px]" />}
            {!isLive && task.status === "running" && <FiPlayCircle className="text-[10px]" />}
            {!isLive && isPast && task.status !== "done" && <FiAlertTriangle className="text-[10px]" />}
            {statusText}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-auto pt-2">
        {task.notes && task.notes.trim() !== "" && (
          <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full border bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20">
            <FiFileText className="text-[11px]" /> Note
          </span>
        )}
        
        <span className={clsx(
          "flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full border",
          task.type === "fixed" 
            ? "text-purple-700 dark:text-purple-300 bg-purple-500/10 border-purple-500/20" 
            : "text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/20"
        )}>
          {task.type === "fixed" ? "Fixed Time" : "Flexible"}
        </span>
      </div>
    </div>
  );
}
