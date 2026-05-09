// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function saveScanResult(result: any) {
  const { data, error } = await supabase
    .from('scan_results')
    .insert([
      {
        url: result.url,
        domain: new URL(result.url).hostname,
        category: result.category,
        confidence: result.confidence,
        verdict: result.verdict,
        flags: result.flags,
        scanned_at: new Date().toISOString(),
      }
    ]);

  if (error) {
    console.error('Error saving scan result:', error);
    throw error;
  }
  return data;
}

export async function getScanHistory(limit = 10) {
  const { data, error } = await supabase
    .from('scan_results')
    .select('*')
    .order('scanned_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching scan history:', error);
    throw error;
  }
  return data;
}
