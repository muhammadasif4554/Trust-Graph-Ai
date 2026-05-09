'use client';
import { useState } from 'react';
import ScanInput from '@/components/ScanInput';
import TrafficLight from '@/components/TrafficLight';
import AccessibilityBar from '@/components/AccessibilityBar';

export default function HomePage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (url: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to scan');
      }
      
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong while scanning.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-black p-8 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <AccessibilityBar />
        
        <div className="text-center mb-16">
          <h1 className="text-6xl font-black text-blue-700 dark:text-white tracking-tight mb-6">
            TrustGraph AI
          </h1>
          <p className="text-3xl text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
            Your Digital Bodyguard.<br />
            Paste a link below to check if it's safe.
          </p>
        </div>

        <ScanInput onScan={handleScan} isLoading={loading} />

        {error && (
          <div className="mt-8 p-6 bg-red-100 border-4 border-red-500 rounded-3xl text-red-700 text-center text-2xl font-bold">
            {error}
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <TrafficLight 
              category={result.category} 
              verdict={result.verdict} 
              confidence={result.confidence}
              flags={result.flags}
              whois={result.whois} 
            />

            {/* Visual Quarantine Sandbox */}
            <div className="mt-8 bg-gray-100 rounded-3xl p-6 border-4 border-gray-300 shadow-inner relative overflow-hidden">
              <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-bold z-10 flex items-center gap-2 backdrop-blur-sm">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span> Visual Quarantine Sandbox
              </div>
              
              {result.category === 'RED' && (
                <div className="absolute inset-0 z-20 backdrop-blur-md bg-red-900/20 flex flex-col items-center justify-center p-8 text-center transition-opacity hover:opacity-0 cursor-pointer">
                  <div className="bg-red-600 text-white p-4 rounded-full mb-4 shadow-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <h3 className="text-3xl font-black text-white drop-shadow-lg">IMAGE HIDDEN FOR SAFETY</h3>
                  <p className="text-white font-bold mt-2 drop-shadow-md">Hover to reveal the malicious site</p>
                </div>
              )}
              
              <div className="rounded-xl overflow-hidden border border-gray-300 bg-white shadow-md relative">
                {/* Fake Browser Header */}
                <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="mx-auto bg-white px-4 py-1 rounded-md text-xs text-gray-500 font-mono w-1/2 text-center border border-gray-200 truncate">
                    {result.url}
                  </div>
                </div>
                
                <div className="relative aspect-video bg-gray-200 animate-pulse flex items-center justify-center">
                  <span className="text-gray-400 font-bold z-0 absolute">Capturing Live Screenshot...</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={`https://shot.screenshotapi.net/screenshot?token=${process.env.NEXT_PUBLIC_SCREENSHOT_API_KEY}&url=${encodeURIComponent(result.url)}&output=image&file_type=png&wait_for_event=load`}
                    alt="Target Website Screenshot" 
                    className="w-full h-full object-cover object-top absolute inset-0 z-10"
                    loading="lazy"
                    onLoad={(e) => {
                      // Remove pulse animation once image loads
                      (e.target as HTMLElement).parentElement?.classList.remove('animate-pulse');
                      (e.target as HTMLElement).parentElement?.classList.remove('bg-gray-200');
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
