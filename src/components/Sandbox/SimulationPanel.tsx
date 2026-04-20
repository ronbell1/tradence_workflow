// components/Sandbox/SimulationPanel.tsx — Workflow Test / Sandbox Panel
// Serializes graph → validates → calls POST /simulate → displays execution log

import { useState, useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { validateWorkflow } from '../../utils/graphValidation';
import { useSimulation } from '../../hooks/useSimulation';
import type { WorkflowGraph, ValidationResult } from '../../types/api';
import ExecutionLog from './ExecutionLog';
import { FlaskConical, CircleX, TriangleAlert, CircleCheck, Play, X } from 'lucide-react';

interface SimulationPanelProps {
  nodes: Node[];
  edges: Edge[];
  serializeGraph: () => WorkflowGraph;
  onSimulatingNode: (nodeId: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

const SimulationPanel = ({
  nodes,
  edges,
  serializeGraph,
  onSimulatingNode,
  isOpen,
  onClose,
}: SimulationPanelProps) => {
  const { result, loading, error, simulate, reset } = useSimulation();
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number | undefined>(undefined);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animated simulation playback — highlights nodes step-by-step
  const animateSteps = useCallback(
    async (steps: { nodeId: string }[]) => {
      setIsAnimating(true);
      for (let i = 0; i < steps.length; i++) {
        setActiveStepIndex(i);
        onSimulatingNode(steps[i].nodeId);
        await new Promise((resolve) => setTimeout(resolve, 700));
      }
      onSimulatingNode(null);
      setActiveStepIndex(undefined);
      setIsAnimating(false);
    },
    [onSimulatingNode]
  );

  const handleSimulate = async () => {
    // Pre-simulate validation (SB-04)
    const validationResult = validateWorkflow(nodes, edges);
    setValidation(validationResult);

    if (!validationResult.isValid) {
      return; // Don't submit invalid workflows
    }

    // Serialize and submit
    const graph = serializeGraph();
    const simResult = await simulate(graph);

    // Animate playback if simulation succeeded
    if (simResult && simResult.steps.length > 0) {
      animateSteps(simResult.steps);
    }
  };

  const handleReset = () => {
    reset();
    setValidation(null);
    setActiveStepIndex(undefined);
    onSimulatingNode(null);
    setIsAnimating(false);
  };

  if (!isOpen) return null;

  return (
    <div className="simulation-panel">
      <div className="sim-panel-header">
        <h2><FlaskConical size={16} className="inline-icon" /> Workflow Sandbox</h2>
        <button onClick={onClose} className="btn-icon" title="Close">
          <X size={18} />
        </button>
      </div>

      <div className="sim-panel-body">
        {/* Validation errors/warnings */}
        {validation && !validation.isValid && (
          <div className="validation-results">
            <h4><CircleX size={14} className="inline-icon" /> Validation Failed</h4>
            <ul className="validation-errors">
              {validation.errors.map((err, i) => (
                <li key={i} className="val-error">{err}</li>
              ))}
            </ul>
          </div>
        )}

        {validation && validation.warnings.length > 0 && (
          <div className="validation-warnings">
            <h4><TriangleAlert size={14} className="inline-icon" /> Warnings</h4>
            <ul>
              {validation.warnings.map((warn, i) => (
                <li key={i} className="val-warning">{warn}</li>
              ))}
            </ul>
          </div>
        )}

        {/* API Error */}
        {error && (
          <div className="sim-error">
            <h4><CircleX size={14} className="inline-icon" /> Simulation Error</h4>
            <p>{error}</p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="sim-loading">
            <div className="loading-spinner"></div>
            <p>Running simulation...</p>
          </div>
        )}

        {/* Execution Log */}
        {result && (
          <div className="sim-results">
            <div className="sim-results-header">
              <h4>{result.success ? <><CircleCheck size={14} className="inline-icon" /> Simulation Complete</> : <><TriangleAlert size={14} className="inline-icon" /> Simulation Completed with Issues</>}</h4>
              <span className="step-count">{result.steps.length} steps</span>
            </div>
            <ExecutionLog
              steps={result.steps}
              errors={result.errors}
              activeStepIndex={activeStepIndex}
            />
          </div>
        )}
      </div>

      <div className="sim-panel-footer">
        <button
          onClick={handleSimulate}
          className="btn-primary"
          disabled={loading || isAnimating || nodes.length === 0}
        >
          {loading ? 'Simulating...' : isAnimating ? 'Playing...' : <><Play size={14} className="inline-icon" /> Run Simulation</>}
        </button>
        <button
          onClick={handleReset}
          className="btn-secondary"
          disabled={loading || isAnimating}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default SimulationPanel;
