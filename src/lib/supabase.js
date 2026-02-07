import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Esse IF ajuda a identificar o erro no console de forma clara
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Erro: As chaves do Supabase não foram encontradas no arquivo .env");
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.co', supabaseAnonKey || 'placeholder');