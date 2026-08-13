"use client";

import { useState, useEffect } from "react";
import { Task } from "@/lib/supabase";
import { FiX, FiAlertTriangle } from "react-icons/fi";
import clsx from "clsx";

interface TaskLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  onDelete: (id: string) => void;
  existingTasks: Task[];
  taskToEdit?: Task;
}

export default function TaskLogModal({ isOpen, onClose, onSave, onDelete, existingTasks, taskToEdit }: TaskLogModalProps) {
  const [title, setTitle] = useState(taskToEdit?.title || "");
  const [type, setType] = useState<"fixed" | "worked">(taskToEdit?.type || "fixed");
  const [recurrence, setRecurrence] = useState<"specific_day" | "all_days">(taskToEdit?.recurrence || "specific_day");
  const [date, setDate] = useState(taskToEdit ? new Date(taskToEdit.start_time).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(taskToEdit ? new Date(taskToEdit.start_time).toTimeString().slice(0,5) : "09:00");
  const [endTime, setEndTime] = useState(taskToEdit ? new Date(taskToEdit.end_time).toTimeString().slice(0,5) : "10:00");
  const [notes, setNotes] = useState(taskToEdit?.notes || "");
  const [actualHours, setActualHours] = useState<string>(taskToEdit?.actual_hours !== undefined && taskToEdit.actual_hours !== null ? String(taskToEdit.actual_hours) : "");
  const [status, setStatus] = useState<"upcoming" | "running" | "done">(taskToEdit?.status || "upcoming");

  const [hasCollision, setHasCollision] = useState(false);

  // Simple collision detection
  useEffect(() => {
    if (recurrence === "specific_day") {
      const selectedStart = new Date(`${date}T${startTime}`).getTime();
      const selectedEnd = new Date(`${date}T${endTime}`).getTime();

      const collision = existingTasks.some(t => {
        if (taskToEdit && t.id === taskToEdit.id) return false;
        
        // For specific day tasks, only check same day
        const tDate = new Date(t.start_time).toISOString().split('T')[0];
        if (t.recurrence === "specific_day" && tDate !== date) return false;

        const tStart = new Date(t.start_time).getTime();
        const tEnd = new Date(t.end_time).getTime();

        // Check time overlap
        // 1. New start is inside existing
        // 2. New end is inside existing
        // 3. New encompasses existing entirely
        const startInside = selectedStart >= tStart && selectedStart < tEnd;
        const endInside = selectedEnd > tStart && selectedEnd <= tEnd;
        const encompasses = selectedStart <= tStart && selectedEnd >= tEnd;

        return startInside || endInside || encompasses;
      });

      setHasCollision(collision);
    } else {
      setHasCollision(false); // Simplified for "all_days" in this prototype
    }
  }, [date, startTime, endTime, existingTasks, taskToEdit, recurrence]);

  // Reset state when modal opens with a new task
  useEffect(() => {
    if (isOpen) {
      setTitle(taskToEdit?.title || "");
      setType(taskToEdit?.type || "fixed");
      setRecurrence(taskToEdit?.recurrence || "specific_day");
      setDate(taskToEdit ? new Date(taskToEdit.start_time).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setStartTime(taskToEdit ? new Date(taskToEdit.start_time).toTimeString().slice(0,5) : "09:00");
      setEndTime(taskToEdit ? new Date(taskToEdit.end_time).toTimeString().slice(0,5) : "10:00");
      setNotes(taskToEdit?.notes || "");
      setActualHours(taskToEdit?.actual_hours !== undefined && taskToEdit.actual_hours !== null ? String(taskToEdit.actual_hours) : "");
      setStatus(taskToEdit?.status || "upcoming");
    }
  }, [isOpen, taskToEdit]);

  if (!isOpen) return null;

  const handleSave = () => {
    const start = new Date(`${date}T${startTime}`).toISOString();
    const end = new Date(`${date}T${endTime}`).toISOString();
    
    onSave({
      id: taskToEdit?.id || Math.random().toString(36).substring(7),
      title,
      type,
      recurrence,
      start_time: start,
      end_time: end,
      notes,
      actual_hours: actualHours ? parseFloat(actualHours) : undefined,
      status
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-transparent" onClick={onClose} />
      
      <div className="glass-panel w-full max-w-lg p-6 md:p-8 relative z-10 flex flex-col gap-6 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Log Task Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-foreground/10 rounded-full transition-colors">
            <FiX className="text-xl" />
          </button>
        </div>

        {hasCollision && (
          <div className="flex items-center gap-2 bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-xl border border-red-500/20">
            <FiAlertTriangle className="flex-shrink-0" />
            <span className="text-sm font-medium">Warning: This time slot collides with an existing task!</span>
          </div>
        )}

        <div className="flex flex-col gap-5">
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            placeholder="Task Title"
            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wider opacity-60 font-semibold">Type</label>
              <div className="flex bg-foreground/5 rounded-xl p-1 border border-foreground/10">
                <button 
                  onClick={() => setType("fixed")}
                  className={clsx("flex-1 py-2 text-sm rounded-lg transition-all font-medium", type === "fixed" ? "bg-background shadow-sm" : "opacity-70 hover:opacity-100 hover:bg-foreground/5")}
                >
                  Fixed
                </button>
                <button 
                  onClick={() => setType("worked")}
                  className={clsx("flex-1 py-2 text-sm rounded-lg transition-all font-medium", type === "worked" ? "bg-background shadow-sm" : "opacity-70 hover:opacity-100 hover:bg-foreground/5")}
                >
                  Worked
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wider opacity-60 font-semibold">Recurrence</label>
              <div className="flex bg-foreground/5 rounded-xl p-1 border border-foreground/10">
                <button 
                  onClick={() => setRecurrence("specific_day")}
                  className={clsx("flex-1 py-2 text-sm rounded-lg transition-all font-medium", recurrence === "specific_day" ? "bg-background shadow-sm" : "opacity-70 hover:opacity-100 hover:bg-foreground/5")}
                >
                  Specific
                </button>
                <button 
                  onClick={() => setRecurrence("all_days")}
                  className={clsx("flex-1 py-2 text-sm rounded-lg transition-all font-medium", recurrence === "all_days" ? "bg-background shadow-sm" : "opacity-70 hover:opacity-100 hover:bg-foreground/5")}
                >
                  All Days
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recurrence === "specific_day" && (
              <div className="flex flex-col gap-2 col-span-1 md:col-span-3">
                <label className="text-xs uppercase tracking-wider opacity-60 font-semibold">Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                />
              </div>
            )}
            <div className="flex flex-col gap-2 col-span-1 md:col-span-1">
              <label className="text-xs uppercase tracking-wider opacity-60 font-semibold">Start Time</label>
              <input 
                type="time" 
                value={startTime} 
                onChange={e => setStartTime(e.target.value)}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
              />
            </div>
            <div className="flex flex-col gap-2 col-span-1 md:col-span-1">
              <label className="text-xs uppercase tracking-wider opacity-60 font-semibold">End Time</label>
              <input 
                type="time" 
                value={endTime} 
                onChange={e => setEndTime(e.target.value)}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
              />
            </div>
            
            <div className="flex flex-col gap-2 col-span-1 md:col-span-1">
              <label className="text-xs uppercase tracking-wider opacity-60 font-semibold">Status</label>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value as any)}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none font-medium"
              >
                <option value="upcoming">Upcoming</option>
                <option value="running">Running</option>
                <option value="done">Done</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2 col-span-1 md:col-span-1 md:col-start-1">
              <label className="text-xs uppercase tracking-wider opacity-60 font-semibold whitespace-nowrap">Actual Hours</label>
              <input 
                type="number"
                step="0.1"
                min="0"
                value={actualHours}
                onChange={e => setActualHours(e.target.value)}
                placeholder="e.g. 1.5"
                className="w-full h-[52px] bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
              />
            </div>
            
            <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
               <label className="text-xs uppercase tracking-wider opacity-0 font-semibold pointer-events-none">Spacer</label>
               <div className="h-[52px] text-sm font-medium opacity-80 flex justify-between items-center bg-foreground/5 px-4 py-3 rounded-xl border border-foreground/10">
                 <span>Scheduled Hours:</span>
                 <span className="font-bold text-foreground/50">
                   {(() => {
                     const s = new Date(`${date}T${startTime}`).getTime();
                     const e = new Date(`${date}T${endTime}`).getTime();
                     if (e > s) return ((e - s) / 3600000).toFixed(1) + " hrs";
                     return "0 hrs";
                   })()}
                 </span>
               </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider opacity-60 font-semibold">Notes</label>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              placeholder="What did you get done?"
              rows={4}
              className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-2">
          {taskToEdit && (
            <button 
              onClick={() => {
                onDelete(taskToEdit.id);
                onClose();
              }}
              className="w-1/3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-semibold py-3.5 rounded-xl transition-all"
            >
              Delete
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={!title}
            className={clsx(
              "bg-foreground/10 hover:bg-foreground/15 disabled:opacity-40 border border-foreground/10 text-foreground font-semibold py-3.5 rounded-xl transition-all",
              taskToEdit ? "w-2/3" : "w-full"
            )}
          >
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
}
