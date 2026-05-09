// src/lib/virustotal.ts

const VT_BASE = 'https://www.virustotal.com/api/v3';

export async function fetchVirusTotal(url: string) {
  try {
    // For instant results, we lookup the URL instead of forcing a new scan
    // URL identifier is the base64url encoded URL
    const urlId = Buffer.from(url).toString('base64url');

    const res = await fetch(`${VT_BASE}/urls/${urlId}`, {
      method: 'GET',
      headers: {
        'x-apikey': process.env.VIRUSTOTAL_API_KEY!,
      },
    });

    if (!res.ok) {
      if (res.status === 404) {
        // Not found means VT has never seen it. We return unknown instantly rather than blocking for 30s.
        return { malicious: 0, suspicious: 0, undetected: 0, severity: 'none' };
      }
      throw new Error(`VirusTotal API error: ${res.status}`);
    }

    const resultData = await res.json();
    const stats = resultData.data.attributes.last_analysis_stats;
    
    return {
      malicious: stats.malicious,
      suspicious: stats.suspicious,
      undetected: stats.undetected,
      total_engines: stats.malicious + stats.suspicious + stats.undetected,
      severity: stats.malicious >= 5 ? 'critical'
        : stats.malicious >= 3 ? 'high'
        : stats.malicious >= 1 ? 'medium' : 'none',
    };
  } catch (error) {
    console.error('fetchVirusTotal error:', error);
    return { malicious: 0, suspicious: 0, undetected: 0, severity: 'error' };
  }
}
