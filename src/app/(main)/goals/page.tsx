"use client";

import { useState, useEffect } from "react";
import { FiCheckCircle, FiCircle, FiPlus, FiTrash2 } from "react-icons/fi";
import { supabase, Goal } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import clsx from "clsx";

export default function Goals() {
  const { isGuest } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setIsLoading(true);
    if (isGuest) {
      setGoals([]);
      setIsLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching goals:", error);
    } else {
      setGoals(data || []);
    }
    setIsLoading(false);
  };

  const activeGoals = goals.filter(g => g.status === "active");
  const completedGoals = goals.filter(g => g.status === "completed").sort((a,b) => 
    new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
  );

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    if (isGuest) {
      const newGoal: Goal = {
        id: Math.random().toString(),
        title: newGoalTitle,
        status: "active",
      };
      setGoals([newGoal, ...goals]);
      setNewGoalTitle("");
      return;
    }

    const { data, error } = await supabase
      .from('goals')
      .insert([{
        title: newGoalTitle,
        status: "active",
      }])
      .select();

    if (!error && data) {
      setGoals([data[0] as Goal, ...goals]);
      setNewGoalTitle("");
    } else {
      console.error("Error creating goal:", error);
    }
  };

  const toggleGoalStatus = async (id: string) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    const isCompleted = goal.status === "completed";
    const newStatus = isCompleted ? "active" : "completed";
    const completedAt = isCompleted ? null : new Date().toISOString();

    if (isGuest) {
      setGoals(goals.map(g => g.id === id ? { ...g, status: newStatus, completed_at: completedAt || undefined } : g));
      return;
    }

    const { error } = await supabase
      .from('goals')
      .update({
        status: newStatus,
        completed_at: completedAt
      })
      .eq('id', id);

    if (!error) {
      setGoals(goals.map(g => g.id === id ? { ...g, status: newStatus, completed_at: completedAt || undefined } : g));
    } else {
      console.error("Error updating goal:", error);
    }
  };

  const deleteGoal = async (id: string) => {
    if (isGuest) {
      setGoals(goals.filter(g => g.id !== id));
      return;
    }

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (!error) {
      setGoals(goals.filter(g => g.id !== id));
    } else {
      console.error("Error deleting goal:", error);
    }
  };

  return (
    <div className="flex flex-col gap-10 w-full max-w-4xl mx-auto">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Goals & Achievements</h2>
        <p className="text-sm opacity-70 mt-1">Track your progress and celebrate wins.</p>
      </header>

      <div className="glass-panel p-6 flex flex-col gap-6">
        <form onSubmit={handleAddGoal} className="flex items-center gap-4">
          <input 
            type="text" 
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            placeholder="What do you want to achieve?" 
            className="flex-1 bg-black/10 dark:bg-white/5 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
          <button 
            type="submit" 
            disabled={!newGoalTitle.trim()}
            className="glass hover:bg-white/20 disabled:opacity-50 transition-colors flex items-center justify-center h-12 w-12 rounded-xl"
          >
            <FiPlus className="text-xl" />
          </button>
        </form>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm uppercase tracking-widest font-semibold opacity-70">Active Goals</h3>
          {isLoading ? (
             <div className="animate-pulse h-16 bg-white/5 rounded-xl w-full"></div>
          ) : activeGoals.length === 0 ? (
             <p className="text-sm opacity-50 italic">No active goals. Set one above!</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {activeGoals.map(goal => (
                <li key={goal.id} className="glass-card p-4 flex items-center gap-4 group">
                  <button onClick={() => toggleGoalStatus(goal.id)} className="text-2xl text-foreground/30 hover:text-foreground transition-colors">
                    <FiCircle />
                  </button>
                  <span className="font-medium text-lg flex-1">{goal.title}</span>
                  <button 
                    onClick={() => deleteGoal(goal.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <FiTrash2 />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-sm uppercase tracking-widest font-semibold opacity-70">Achievements 🏆</h3>
        {!isLoading && completedGoals.length === 0 ? (
            <div className="glass-panel p-8 text-center opacity-70">
              <p>Complete a goal to see it here.</p>
            </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedGoals.map(goal => (
              <div key={goal.id} className="glass-card p-5 flex flex-col gap-2 relative overflow-hidden opacity-80 group">
                <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                  <FiCheckCircle className="text-6xl text-foreground" />
                </div>
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-lg pr-8">{goal.title}</h4>
                  <button 
                    onClick={() => deleteGoal(goal.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 -mt-2 -mr-2 text-red-500/70 hover:text-red-500 transition-all z-10"
                  >
                    <FiTrash2 />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs opacity-60" suppressHydrationWarning>
                    Completed {goal.completed_at ? new Date(goal.completed_at).toLocaleDateString() : 'recently'}
                  </p>
                  <button 
                    onClick={() => toggleGoalStatus(goal.id)}
                    className="text-xs font-medium text-foreground/50 hover:text-foreground transition-colors z-10"
                  >
                    Undo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
