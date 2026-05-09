// src/components/TrafficLight.tsx
import { AlertTriangle, ShieldCheck, Octagon, CalendarDays, Globe, ShieldAlert } from 'lucide-react';

const COLORS = {
  RED: { 
    bg: 'bg-red-50', 
    border: 'border-red-500', 
    text: 'text-red-700', 
    title: 'STOP',
    icon: <Octagon className="w-24 h-24 text-red-600" />,
    scoreColor: 'bg-red-500'
  },
  YELLOW: { 
    bg: 'bg-amber-50', 
    border: 'border-amber-500', 
    text: 'text-amber-700', 
    title: 'CAUTION',
    icon: <AlertTriangle className="w-24 h-24 text-amber-600" />,
    scoreColor: 'bg-amber-500'
  },
  GREEN: { 
    bg: 'bg-green-50', 
    border: 'border-green-500', 
    text: 'text-green-700', 
    title: 'SAFE',
    icon: <ShieldCheck className="w-24 h-24 text-green-600" />,
    scoreColor: 'bg-green-500'
  },
};

interface TrafficLightProps {
  category: 'RED' | 'YELLOW' | 'GREEN';
  verdict: string;
  confidence?: number;
  flags?: any;
  whois?: any;
}

export default function TrafficLight({ category, verdict, confidence, flags, whois }: TrafficLightProps) {
  const c = COLORS[category] || COLORS.YELLOW;
  
  // Calculate a 0-100 Trust Score based on category and confidence
  let trustScore = 100;
  if (category === 'RED') trustScore = Math.max(0, 30 - (confidence || 1) * 30);
  if (category === 'YELLOW') trustScore = 50 + (1 - (confidence || 0.5)) * 20;
  if (category === 'GREEN') trustScore = 80 + (confidence || 1) * 20;
  trustScore = Math.round(trustScore);

  return (
    <div className={`mt-12 rounded-[40px] border-[12px] ${c.border} ${c.bg} p-10 text-center shadow-2xl transition-all animate-in fade-in zoom-in duration-500`}>
      <div className="flex flex-col items-center gap-6">
        <div className="p-4 bg-white rounded-full shadow-inner">
          {c.icon}
        </div>
        <div className={`text-7xl font-black ${c.text} tracking-tighter`}>
          {c.title}
        </div>
      </div>
      
      <p className={`mt-8 text-4xl font-bold ${c.text} leading-tight max-w-2xl mx-auto`}>
        {verdict}
      </p>

      {/* Trust Score Meter */}
      <div className="mt-12 max-w-xl mx-auto bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-600 mb-4 flex items-center justify-center gap-2">
          <ShieldAlert className="w-6 h-6" /> Trust Score: {trustScore}/100
        </h3>
        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
          <div 
            className={`h-6 rounded-full ${c.scoreColor} transition-all duration-1000 ease-out`} 
            style={{ width: `${trustScore}%` }}
          ></div>
        </div>
      </div>

      {/* Domain Identity Card */}
      {whois && (
        <div className="mt-8 max-w-2xl mx-auto bg-white p-6 rounded-3xl shadow-sm border border-gray-200 text-left">
          <h3 className="text-xl font-bold text-gray-500 uppercase tracking-widest mb-4 border-b pb-2">Domain Identity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CalendarDays className="w-6 h-6 text-blue-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500 font-semibold">Launched</p>
                <p className="text-lg font-bold text-gray-800">
                  {whois.domainAgeDays ? `${whois.domainAgeDays} days ago` : 'Unknown'}
                </p>
                {whois.createdDate && <p className="text-sm text-gray-400">{new Date(whois.createdDate).toLocaleDateString()}</p>}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500 font-semibold">Registered In</p>
                <p className="text-lg font-bold text-gray-800">{whois.registrantCountry || 'Hidden'}</p>
                <p className="text-sm text-gray-400">{whois.registrar || 'Unknown Registrar'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {flags && (
        <div className="mt-10 pt-10 border-t-2 border-dashed border-gray-300">
          <h3 className="text-xl font-bold text-gray-500 uppercase tracking-widest mb-4">Red Flags</h3>
          <div className="flex flex-wrap justify-center gap-3">
             {flags.av_flag_count > 0 && (
               <span className="bg-white px-4 py-2 rounded-full text-lg font-semibold border border-red-200 text-red-700">
                 {flags.av_flag_count} Security Engines Flagged This
               </span>
             )}
             {flags.domain_age_days < 30 && (
               <span className="bg-white px-4 py-2 rounded-full text-lg font-semibold border border-amber-200 text-amber-700">
                 Brand New Website
               </span>
             )}
             {flags.domain_mismatch_detected && (
               <span className="bg-white px-4 py-2 rounded-full text-lg font-semibold border border-red-200 text-red-700">
                 Pretending to be {flags.mismatch_brand}
               </span>
             )}
             {flags.av_flag_count === 0 && flags.domain_age_days > 365 && !flags.domain_mismatch_detected && (
               <span className="bg-white px-4 py-2 rounded-full text-lg font-semibold border border-green-200 text-green-700">
                 No Technical Red Flags Found
               </span>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
