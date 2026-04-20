// hooks/useAutomations.ts — Fetches automation actions from API

import { useState, useEffect } from 'react';
import type { Automation } from '../types/api';
import { getAutomations } from '../api/workflowApi';

/**
 * Hook to fetch and cache available automation actions.
 * Used by the AutomatedStep node form to populate the action dropdown
 * and dynamically render param fields.
 */
export const useAutomations = () => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getAutomations()
      .then((data) => {
        if (!cancelled) {
          setAutomations(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to fetch automations');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { automations, loading, error };
};
