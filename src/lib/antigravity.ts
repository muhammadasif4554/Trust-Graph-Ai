// src/lib/antigravity.ts

const SINGLE_STAGE_SYSTEM_PROMPT = `
You are the "Digital Bodyguard," an advanced Risk Assessment Engine and Protective Assistant protecting elderly users from scams.
You will receive raw JSON forensic data about a URL.

Analyze it and output ONLY a JSON object with EXACTLY this structure, with no markdown formatting:
{
  "flags": {
    "domain_age_days": <number>,
    "av_flag_count": <number>,
    "av_severity": "<none|low|medium|high|critical>",
    "domain_mismatch_detected": <true|false>,
    "mismatch_brand": "<brand name or null>"
  },
  "category": "<RED|YELLOW|GREEN>",
  "confidence": <0.0 to 1.0>,
  "verdict": "<Actionable 10-word sentence for a 70-year-old starting with STOP, CAUTION, or SAFE>"
}

RULES FOR CATEGORY:
RED: Domain < 30 days old OR av_flag_count >= 3 OR (mismatch_brand AND av_flag_count > 0).
YELLOW: Domain 30-180 days old OR av_flag_count 1-2.
GREEN: Domain > 365 days old AND av_flag_count == 0 AND no mismatch.

RULES FOR VERDICT:
- Respond in 10 words or fewer.
- Start with the exact action word: STOP, CAUTION, or SAFE.
- Use ONLY simple words. No technical jargon. BANNED: DNS, Phishing, Malware, SSL, HTTPS.
`;

const STAGE_KEYS: string[] = [
  process.env.ANTIGRAVITY_KEY_1!,
  process.env.ANTIGRAVITY_KEY_2!,
  process.env.ANTIGRAVITY_KEY_3!,
  process.env.ANTIGRAVITY_KEY_4!
].filter(Boolean);

let keyIndex = 0;

function getNextKey() {
  if (STAGE_KEYS.length === 0) return process.env.ANTIGRAVITY_KEY_1; // Fallback
  const key = STAGE_KEYS[keyIndex];
  keyIndex = (keyIndex + 1) % STAGE_KEYS.length;
  return key;
}

export async function runFullPipeline(rawData: any) {
  const key = getNextKey();
  const AG_BASE = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${key}`;

  const res = await fetch(AG_BASE, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      system_instruction: {
        parts: { text: SINGLE_STAGE_SYSTEM_PROMPT }
      },
      contents: [{
        parts: [{ text: JSON.stringify(rawData) }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`Antigravity AI failed:`, errText);
    throw new Error(`Antigravity API error: ${res.status}`);
  }

  const data = await res.json();
  let text = data.candidates[0].content.parts[0].text;

  // Clean up potential markdown formatting from JSON output
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();

  return JSON.parse(text);
}
