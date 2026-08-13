"use client";

import { useState, useEffect } from "react";
import { supabase, Task } from "@/lib/supabase";
import TaskCard from "@/components/ui/TaskCard";
import TaskModal from "@/components/modals/TaskModal";
import TaskLogModal from "@/components/modals/TaskLogModal";
import { FiPlus } from "react-icons/fi";

import { format } from "date-fns";

export default function Timetable() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('start_time', { ascending: true });
      
    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      setTasks(data || []);
    }
    setIsLoading(false);
  };

  const handleSaveTask = async (task: Partial<Task>) => {
    if (taskToEdit) {
      // Update
      const { error } = await supabase
        .from('tasks')
        .update({
          title: task.title,
          start_time: task.start_time,
          end_time: task.end_time,
          recurrence: task.recurrence,
          status: task.status,
          type: task.type,
          notes: task.notes,
          actual_hours: task.actual_hours
        })
        .eq('id', task.id);
        
      if (!error) {
        setTasks(tasks.map(t => t.id === task.id ? { ...t, ...task } as Task : t));
      } else {
        console.error("Error updating task:", error);
      }
    } else {
      // Insert
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: task.title,
          start_time: task.start_time,
          end_time: task.end_time,
          recurrence: task.recurrence,
          status: task.status,
          type: task.type,
          notes: task.notes,
          actual_hours: task.actual_hours
        }])
        .select();
        
      if (!error && data) {
        setTasks([...tasks, data[0] as Task]);
      } else {
        console.error("Error inserting task:", error);
      }
    }
  };

  const handleDeleteTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
      
    if (!error) {
      setTasks(tasks.filter(t => t.id !== id));
    } else {
      console.error("Error deleting task:", error);
    }
  };

  const openNewTask = () => {
    setTaskToEdit(undefined);
    setIsModalOpen(true);
  };

  const openEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  // Sort strictly by start time for the timetable view (in case state changes before re-fetch)
  const chronologicalTasks = [...tasks].sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-baseline gap-3">
            Timetable
            <span suppressHydrationWarning className="text-xl text-foreground/30 font-semibold tracking-normal">
              {format(new Date(), "EEEE")}
            </span>
          </h2>
          <p suppressHydrationWarning className="text-sm opacity-70 mt-1 font-medium">
            {format(new Date(), "MMMM do")} • Your schedule, sorted by time.
          </p>
        </div>
        
        <button 
          onClick={openNewTask}
          className="glass hover:bg-white/20 dark:hover:bg-white/10 transition-colors flex items-center gap-2 px-5 py-2.5 rounded-full font-medium"
        >
          <FiPlus /> New Task
        </button>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 opacity-50">
          <div className="animate-pulse flex gap-2">
            <div className="w-2 h-2 rounded-full bg-current"></div>
            <div className="w-2 h-2 rounded-full bg-current"></div>
            <div className="w-2 h-2 rounded-full bg-current"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chronologicalTasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => openEditTask(task)} />
          ))}
          
          {chronologicalTasks.length === 0 && (
            <div className="col-span-full glass-panel p-12 text-center flex flex-col items-center justify-center opacity-70">
              <p className="text-lg">No tasks scheduled.</p>
              <p className="text-sm mt-2">Click "New Task" to get started.</p>
            </div>
          )}
        </div>
      )}
      
      {!taskToEdit ? (
        <TaskModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          existingTasks={tasks}
          taskToEdit={taskToEdit}
        />
      ) : (
        <TaskLogModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          existingTasks={tasks}
          taskToEdit={taskToEdit}
        />
      )}
    </div>
  );
}
