import { useEffect, useRef } from 'react';

interface UseAutoSaveOptions {
  data: any;
  onSave?: (data: any) => void;
  delay?: number;
}

export const useAutoSave = ({ data, onSave, delay = 1000 }: UseAutoSaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');

  useEffect(() => {
    const currentDataString = JSON.stringify(data);
    
    // Skip if data hasn't changed
    if (currentDataString === lastSavedRef.current) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      lastSavedRef.current = currentDataString;
      onSave?.(data);
      
      // Show subtle indication that data was saved
      const event = new CustomEvent('autoSave', { 
        detail: { timestamp: new Date().toISOString() } 
      });
      window.dispatchEvent(event);
    }, delay);

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
};