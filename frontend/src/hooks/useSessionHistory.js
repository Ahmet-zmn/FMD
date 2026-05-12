/**
 * Session History Hook
 * Stores analysis results for the current browser session.
 */

import { useState, useCallback } from 'react';

const MAX_HISTORY = 20;

export function useSessionHistory() {
  const [history, setHistory] = useState([]);

  const addToHistory = useCallback((entry) => {
    setHistory((prev) => {
      const newHistory = [
        {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...entry,
        },
        ...prev,
      ];
      return newHistory.slice(0, MAX_HISTORY);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, addToHistory, clearHistory };
}
