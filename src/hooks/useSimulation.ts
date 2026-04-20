// hooks/useSimulation.ts — Handles POST /simulate logic

import { useState, useCallback } from 'react';
import type { SimulationResult, WorkflowGraph } from '../types/api';
import { simulateWorkflow } from '../api/workflowApi';

/**
 * Hook for workflow simulation.
 * Handles sending the serialized graph to POST /simulate,
 * managing loading/error states, and storing results.
 */
export const useSimulation = () => {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulate = useCallback(async (graph: WorkflowGraph) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await simulateWorkflow(graph);
      setResult(response);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Simulation failed';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return { result, loading, error, simulate, reset };
};
