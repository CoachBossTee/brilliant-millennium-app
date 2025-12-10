import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  const supabaseUrl = 'https://yfhayymdhwmisqoqxknn.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmaGF5eW1kaHdtaXNxb3F4a25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NzcxNjcsImV4cCI6MjA4MDU1MzE2N30.lqj9vPGX4vc0B-93ZPRZCX8X2t2Y16MgaFRxdM5rwb8';

  return createSupabaseClient(supabaseUrl, supabaseKey);
}
