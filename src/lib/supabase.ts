import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const errorMsg = 'Bağlantı Anahtarları Eksik! .env.local dosyasinda NEXT_PUBLIC_SUPABASE_URL veya NEXT_PUBLIC_SUPABASE_ANON_KEY bulunamadi.';
    if (typeof window !== 'undefined') {
      console.error(errorMsg);
    }
    return createBrowserClient('', ''); // Return dummy to prevent immediate crash but alert in console
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
