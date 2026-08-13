-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enum Types
CREATE TYPE task_status AS ENUM ('upcoming', 'running', 'done');
CREATE TYPE task_type AS ENUM ('fixed', 'worked');
CREATE TYPE task_recurrence AS ENUM ('specific_day', 'all_days');
CREATE TYPE goal_status AS ENUM ('active', 'completed');

-- 2. Table `tasks`
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  recurrence task_recurrence NOT NULL,
  status task_status NOT NULL,
  type task_type NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table `goals`
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  status goal_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ==========================================
-- Supabase Analytics Heavy-Lifting Functions
-- ==========================================

-- 1. Performance Trend Data (Share Market Style)
CREATE OR REPLACE FUNCTION get_performance_trend(days_back INT DEFAULT 7)
RETURNS TABLE (
  date DATE,
  total_hours NUMERIC,
  completion_ratio NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH daily_stats AS (
    SELECT 
      DATE(t.start_time) as task_date,
      -- Sum the duration in hours for tasks that are done
      SUM(EXTRACT(EPOCH FROM (t.end_time::timestamp - t.start_time::timestamp)) / 3600) FILTER (WHERE t.status = 'done') as hours_worked,
      -- Calculate ratio: completed tasks / total tasks for that day
      COUNT(*) FILTER (WHERE t.status = 'done')::NUMERIC / NULLIF(COUNT(*), 0) as ratio
    FROM 
      tasks t
    WHERE 
      t.start_time >= (CURRENT_DATE - (days_back || ' days')::INTERVAL)
    GROUP BY 
      DATE(t.start_time)
  )
  SELECT 
    gs.date::DATE,
    COALESCE(ds.hours_worked, 0) as total_hours,
    COALESCE(ds.ratio, 0) * 100 as completion_ratio
  FROM 
    generate_series(CURRENT_DATE - (days_back - 1 || ' days')::INTERVAL, CURRENT_DATE, '1 day'::INTERVAL) gs(date)
  LEFT JOIN 
    daily_stats ds ON gs.date::DATE = ds.task_date
  ORDER BY 
    gs.date ASC;
END;
$$ LANGUAGE plpgsql;


-- 2. Task Distribution (Routine vs One-Off)
CREATE OR REPLACE FUNCTION get_task_distribution()
RETURNS TABLE (
  recurrence_type TEXT,
  total_hours NUMERIC,
  task_count INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.recurrence::TEXT as recurrence_type,
    COALESCE(SUM(EXTRACT(EPOCH FROM (t.end_time::timestamp - t.start_time::timestamp)) / 3600), 0) as total_hours,
    COUNT(*)::INT as task_count
  FROM 
    tasks t
  WHERE 
    t.status = 'done'
  GROUP BY 
    t.recurrence;
END;
$$ LANGUAGE plpgsql;
