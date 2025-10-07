interface Window {
  process: {
    env: {
      API_KEY: string;
      // FIX: Add missing environment variable definitions for Supabase.
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
    };
  };
}
