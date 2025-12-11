import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hjcpstearytiwelhnnhy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqY3BzdGVhcnl0aXdlbGhubmh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNzc2MTAsImV4cCI6MjA3ODg1MzYxMH0.q0HSLqJ8dotiGZ3mPayBEsUK14NV0dXAi1npbl2mHvc';

export const supabase = createClient(supabaseUrl, supabaseKey);
