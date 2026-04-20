// components/Sandbox/ExecutionLog.tsx — Displays step-by-step simulation results

import type { SimulationStep } from '../../types/api';

interface ExecutionLogProps {
  steps: SimulationStep[];
  errors: string[];
  activeStepIndex?: number;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return '✅';
    case 'pending':
      return '⏳';
    case 'error':
      return '❌';
    default:
      return '⚪';
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'step-completed';
    case 'pending':
      return 'step-pending';
    case 'error':
      return 'step-error';
    default:
      return '';
  }
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    start: 'START',
    task: 'TASK',
    approval: 'APPROVAL',
    automated: 'AUTOMATED',
    end: 'END',
  };
  return labels[type] || type.toUpperCase();
};

const ExecutionLog = ({ steps, errors, activeStepIndex }: ExecutionLogProps) => {
  return (
    <div className="execution-log">
      {steps.length > 0 && (
        <div className="log-timeline">
          {steps.map((step, index) => (
            <div
              key={`${step.nodeId}-${index}`}
              className={`log-step ${getStatusClass(step.status)} ${
                activeStepIndex === index ? 'active-step' : ''
              } ${activeStepIndex !== undefined && index > activeStepIndex ? 'future-step' : ''}`}
            >
              <div className="step-connector">
                <div className="step-dot">{getStatusIcon(step.status)}</div>
                {index < steps.length - 1 && <div className="step-line"></div>}
              </div>
              <div className="step-content">
                <div className="step-header">
                  <span className={`step-type-badge type-${step.type}`}>
                    {getTypeLabel(step.type)}
                  </span>
                  <span className={`step-status status-${step.status}`}>
                    {step.status}
                  </span>
                </div>
                <div className="step-message">{step.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {errors.length > 0 && (
        <div className="log-errors">
          <h4>⚠️ Simulation Errors</h4>
          <ul>
            {errors.map((error, i) => (
              <li key={i} className="error-item">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExecutionLog;
