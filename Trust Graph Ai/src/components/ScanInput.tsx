// src/components/ScanInput.tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ScanInputProps {
  onScan: (url: string) => void;
  isLoading: boolean;
}

export default function ScanInput({ onScan, isLoading }: ScanInputProps) {
  const [input, setInput] = useState('');

  const handleScan = () => {
    if (input.trim()) {
      onScan(input.trim());
    }
  };

  return (
    <div className='flex flex-col gap-6 w-full max-w-2xl mx-auto'>
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='Paste the link or message here...'
        className='text-2xl min-h-[160px] p-6 border-4 border-blue-300 dark:border-white dark:bg-black dark:text-white rounded-3xl focus:border-blue-500 focus:ring-blue-500 shadow-lg'
        style={{ fontSize: '24px', lineHeight: '1.5' }}
      />
      <Button
        onClick={handleScan}
        disabled={isLoading || !input.trim()}
        className='h-24 text-3xl font-bold bg-blue-600 dark:bg-white dark:text-black dark:hover:bg-gray-200 hover:bg-blue-700 rounded-3xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]'
        size='lg'
      >
        {isLoading ? (
          <div className="flex items-center gap-3">
            <span className="animate-pulse">Checking Safety...</span>
          </div>
        ) : (
          'CHECK THIS LINK'
        )}
      </Button>
      <p className="text-center text-gray-400 dark:text-white text-lg">
        We scan the link safely so you don't have to.
      </p>
    </div>
  );
}
