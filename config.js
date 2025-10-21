// Supabase Configuration
// För utveckling: Fyll i dina nycklar här eller använd .env.local
// För produktion: Sätts via Vercel Environment Variables

const SUPABASE_CONFIG = {
  url: import.meta.env?.VITE_SUPABASE_URL || 
       process.env?.SUPABASE_URL || 
       'YOUR_SUPABASE_URL_HERE',
  anonKey: import.meta.env?.VITE_SUPABASE_ANON_KEY || 
           process.env?.SUPABASE_ANON_KEY || 
           'YOUR_SUPABASE_ANON_KEY_HERE'
};

// Validera konfiguration
if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL_HERE' || 
    SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY_HERE') {
  console.warn('⚠️ Supabase not configured! Please add your credentials to config.js or environment variables.');
  console.warn('📖 See SUPABASE_SETUP.md for instructions.');
}

export default SUPABASE_CONFIG;

