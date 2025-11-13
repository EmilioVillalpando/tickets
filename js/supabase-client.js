import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

// Initialize Supabase client
export const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
