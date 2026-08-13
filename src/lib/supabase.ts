import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types based on the schema design
export type TaskStatus = 'upcoming' | 'running' | 'done';
export type TaskType = 'fixed' | 'worked';

export interface Task {
  id: string;
  title: string;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  recurrence: 'specific_day' | 'all_days';
  status: TaskStatus;
  type: TaskType;
  notes?: string;
  actual_hours?: number;
  created_at: string;
}

export interface Goal {
  id: string;
  title: string;
  status: 'active' | 'completed';
  created_at?: string;
  completed_at?: string;
}
