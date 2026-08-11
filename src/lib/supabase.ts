/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function sanitizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim().replace(/^["']|["']$/g, '');

  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    const match = url.match(/db\.([a-z0-9]+)\.supabase\.co/i) || url.match(/postgres\.([a-z0-9]+):/i);
    if (match && match[1]) {
      return `https://${match[1]}.supabase.co`;
    }
  }

  url = url.replace(/\/+$/, '');
  url = url.replace(/\/rest\/v1$/i, '');

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  return url;
}

export function sanitizeSupabaseKey(rawKey?: string): string {
  if (!rawKey) return '';
  return rawKey.trim().replace(/^["']|["']$/g, '');
}

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const rawUrl = process.env.SUPABASE_URL || (typeof import.meta !== 'undefined' ? (import.meta as Record<string, any>).env?.VITE_SUPABASE_URL : undefined);
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY || (typeof import.meta !== 'undefined' ? (import.meta as Record<string, any>).env?.VITE_SUPABASE_ANON_KEY : undefined);

  const url = sanitizeSupabaseUrl(rawUrl);
  const key = sanitizeSupabaseKey(rawKey);

  if (!url || !key) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, key);
  }

  return supabaseClient;
}
