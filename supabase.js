// js/supabase.js
// ------------------------------------------------------------
// Paste your own project's values below. Find them in your
// Supabase dashboard: Settings > API
// ------------------------------------------------------------
var SUPABASE_URL = "https://didlishwbielzuzyuecv.supabase.co";
var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZGxpc2h3YmllbHp1enl1ZWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNzc5MzgsImV4cCI6MjEwMzg1MzkzOH0.Ne46yeHBv2SzWB-iMbFTWN00vwKQs2LAQvOr9wm8QHw";

// `var` (instead of `const`) so this survives being re-run by dev-server hot reloads
var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);