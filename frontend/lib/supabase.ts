import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Atenção: A URL ou a chave anônima do Supabase estão ausentes. Verifique o arquivo .env.');
}

// Criar um único supabase client para toda a aplicação
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
