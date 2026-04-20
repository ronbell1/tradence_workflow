// types/api.ts — API request/response types

export interface Automation {
  id: string;
  label: string;
  params: string[];
}

export interface SimulationStep {
  nodeId: string;
  type: string;
  status: 'completed' | 'pending' | 'error';
  message: string;
}

export interface SimulationResult {
  success: boolean;
  steps: SimulationStep[];
  errors: string[];
}

export interface WorkflowGraph {
  nodes: {
    id: string;
    type: string;
    data: Record<string, unknown>;
    position: { x: number; y: number };
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
  }[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
