'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AIPersonality,
  AIPersonalityId,
  DEFAULT_PERSONALITY_ID,
  PERSONALITY_STORAGE_KEY,
  getPersonality,
  PERSONALITIES_LIST,
} from '@/lib/aiPersonalities';

interface UseAIPersonalityReturn {
  personality: AIPersonality;
  personalityId: AIPersonalityId;
  setPersonality: (id: AIPersonalityId) => void;
  allPersonalities: AIPersonality[];
  isLoaded: boolean;
}

/**
 * Hook to read and update the user's selected AI personality.
 * Persists to localStorage and syncs across components.
 */
export function useAIPersonality(): UseAIPersonalityReturn {
  const [personalityId, setPersonalityId] = useState<AIPersonalityId>(DEFAULT_PERSONALITY_ID);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PERSONALITY_STORAGE_KEY) as AIPersonalityId | null;
      if (stored && getPersonality(stored).id === stored) {
        setPersonalityId(stored);
      }
    } catch {
      // localStorage not available (SSR)
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const setPersonality = useCallback((id: AIPersonalityId) => {
    setPersonalityId(id);
    try {
      localStorage.setItem(PERSONALITY_STORAGE_KEY, id);
      // Dispatch storage event so other tabs/components can sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: PERSONALITY_STORAGE_KEY,
        newValue: id,
      }));
    } catch {
      // localStorage not available
    }
  }, []);

  // Listen for cross-tab / cross-component storage updates
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === PERSONALITY_STORAGE_KEY && e.newValue) {
        const newId = e.newValue as AIPersonalityId;
        if (getPersonality(newId).id === newId) {
          setPersonalityId(newId);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return {
    personality: getPersonality(personalityId),
    personalityId,
    setPersonality,
    allPersonalities: PERSONALITIES_LIST,
    isLoaded,
  };
}
