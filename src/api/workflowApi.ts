// api/workflowApi.ts — API abstraction layer
// All API calls are centralized here, consumed by hooks.

import type { Automation, SimulationResult, WorkflowGraph } from '../types/api';
import { mockAutomations, simulateWorkflowExecution } from '../mocks/data';

/**
 * GET /automations — Fetches available automation actions.
 * Returns list of actions with their dynamic param definitions.
 */
export const getAutomations = async (): Promise<Automation[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockAutomations;
};

/**
 * POST /simulate — Submits a serialized workflow graph for simulation.
 * Returns a step-by-step execution log.
 */
export const simulateWorkflow = async (
  graph: WorkflowGraph
): Promise<SimulationResult> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const result = simulateWorkflowExecution(
    graph.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      data: n.data,
    })),
    graph.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    }))
  );

  return {
    success: result.success,
    steps: result.steps.map((s) => ({
      nodeId: s.nodeId,
      type: s.type,
      status: s.status as 'completed' | 'pending' | 'error',
      message: s.message,
    })),
    errors: result.errors,
  };
};
