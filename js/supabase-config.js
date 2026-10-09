export const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
export const SUPABASE_PUBLISHABLE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";

export const SUPABASE_CONFIGURED =
  /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co\/?$/.test(SUPABASE_URL.trim()) &&
  SUPABASE_PUBLISHABLE_KEY.trim().length > 20 &&
  !SUPABASE_URL.includes("YOUR_SUPABASE") &&
  !SUPABASE_PUBLISHABLE_KEY.includes("YOUR_SUPABASE");

export function getSupabaseConfig() {
  if (!SUPABASE_CONFIGURED) {
    console.warn("Supabase is not configured. Guest mode is available.");
    return null;
  }

  return {
    url: SUPABASE_URL.trim().replace(/\/$/, ""),
    key: SUPABASE_PUBLISHABLE_KEY.trim()
  };
}
