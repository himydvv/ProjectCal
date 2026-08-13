-- Enable RLS just in case it wasn't
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Allow completely public access for this prototype (Select, Insert, Update, Delete)
CREATE POLICY "Allow public all operations on tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all operations on goals" ON goals FOR ALL USING (true) WITH CHECK (true);
