// src/lib/whoisxml.ts

const WHOIS_BASE = 'https://www.whoisxmlapi.com/whoisserver/WhoisService';

export async function fetchWhoisData(domain: string) {
  try {
    const params = new URLSearchParams({
      apiKey: process.env.WHOISXML_API_KEY!,
      domainName: domain,
      outputFormat: 'JSON',
    });

    const res = await fetch(`${WHOIS_BASE}?${params}`);
    if (!res.ok) throw new Error(`WhoisXML error: ${res.status}`);
    
    const data = await res.json();

    const createdDate = data.WhoisRecord?.createdDate || null;
    const domainAgeDays = createdDate
      ? Math.floor((Date.now() - new Date(createdDate).getTime()) / 86400000)
      : null;

    return {
      createdDate,
      domainAgeDays,
      registrar: data.WhoisRecord?.registrarName || 'Unknown',
      registrantCountry: data.WhoisRecord?.registrantContact?.country || 'Unknown',
      isFresh: domainAgeDays !== null && domainAgeDays < 30,
    };
  } catch (error) {
    console.error('fetchWhoisData error:', error);
    return {
      createdDate: null,
      domainAgeDays: null,
      registrar: 'Unknown',
      registrantCountry: 'Unknown',
      isFresh: false,
    };
  }
}
