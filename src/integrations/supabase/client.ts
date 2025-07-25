
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ainlzqfaijqluyuqdojj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpbmx6cWZhaWpxbHV5dXFkb2pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczOTMyMDMsImV4cCI6MjA2Mjk2OTIwM30.pqlrah8uh4zQDVpc10Ay--JY81URcjZ_zoa-owQTxZs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
  }
});
