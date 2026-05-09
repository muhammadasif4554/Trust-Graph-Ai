// src/components/AccessibilityBar.tsx
'use client';
import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function AccessibilityBar() {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [highContrast]);

  return (
    <div className="flex justify-end items-center gap-4 p-4 mb-8 bg-gray-50 dark:bg-black rounded-2xl border-2 border-gray-200 dark:border-white">
      <Label htmlFor="contrast-mode" className="text-xl font-bold dark:text-white">
        High Contrast Mode
      </Label>
      <Switch 
        id="contrast-mode" 
        checked={highContrast}
        onCheckedChange={setHighContrast}
        className="scale-150 dark:border-white"
      />
    </div>
  );
}
