// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vghqespckpspidfkkjjb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnaHFlc3Bja3BzcGlkZmtrampiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYxODQ0MzksImV4cCI6MjA0MTc2MDQzOX0._bfFpLVOw85dx6qAlE7oOIh7Ksc4-wfc7EhiqvYI6eA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
