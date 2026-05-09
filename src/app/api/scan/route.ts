// src/app/api/scan/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { fetchWhoisData } from '@/lib/whoisxml';
import { fetchVirusTotal } from '@/lib/virustotal';
import { runFullPipeline } from '@/lib/antigravity';
import { saveScanResult } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      // Basic normalization if missing protocol
      const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
      parsedUrl = new URL(normalizedUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const domain = parsedUrl.hostname;
    const fullUrl = parsedUrl.toString();

    // Step 1: Parallel external API calls (Speed Optimization)
    const [whoisData, vtData] = await Promise.all([
      fetchWhoisData(domain),
      fetchVirusTotal(fullUrl),
    ]);

    // Step 2: Build raw data object for Stage 1
    const rawData = { 
      url: fullUrl, 
      domain, 
      whoisData, 
      vtData,
    };

    // Step 3: Run AI pipeline instantly
    const aiResult = await runFullPipeline(rawData);

    // Step 4: Assemble final response
    const scanResult = {
      url: fullUrl,
      category: aiResult.category, // RED, YELLOW, GREEN
      confidence: aiResult.confidence,
      verdict: aiResult.verdict,
      flags: aiResult.flags,
      whois: whoisData,
      scannedAt: new Date().toISOString(),
    };

    // Step 5: Save to Supabase (Non-blocking or awaited depending on preference)
    try {
      await saveScanResult(scanResult);
    } catch (dbError) {
      console.error('Failed to save to Supabase:', dbError);
      // We still return the result even if DB fails
    }

    return NextResponse.json(scanResult);

  } catch (error: any) {
    console.error('Scan API error:', error);
    return NextResponse.json({ 
      error: 'Scan failed', 
      details: error.message 
    }, { status: 500 });
  }
}
