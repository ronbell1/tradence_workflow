// components/NodeForms/AutomatedStepForm.tsx — Automated Step Node form
// Dynamic param fields rendered from action.params array (fetched from API)

import { useAutomations } from '../../hooks/useAutomations';

interface AutomatedStepFormProps {
  nodeId: string;
  data: {
    title?: string;
    actionId?: string;
    actionParams?: Record<string, string>;
  };
  onChange: (nodeId: string, data: Record<string, unknown>) => void;
  onDelete: (nodeId: string) => void;
}

const AutomatedStepForm = ({ nodeId, data, onChange, onDelete }: AutomatedStepFormProps) => {
  const { automations, loading, error } = useAutomations();

  const selectedAction = automations.find((a) => a.id === data.actionId);

  const handleChange = (field: string, value: string) => {
    onChange(nodeId, { [field]: value });
  };

  const handleActionChange = (actionId: string) => {
    // Reset params when action changes
    onChange(nodeId, { actionId, actionParams: {} });
  };

  const handleParamChange = (paramName: string, value: string) => {
    const updatedParams = { ...(data.actionParams || {}), [paramName]: value };
    onChange(nodeId, { actionParams: updatedParams });
  };

  return (
    <div className="node-form">
      <div className="form-header">
        <span className="form-icon">⚡</span>
        <h3>Automated Step</h3>
      </div>

      <div className="form-group">
        <label htmlFor={`auto-title-${nodeId}`}>
          Title <span className="required">*</span>
        </label>
        <input
          id={`auto-title-${nodeId}`}
          type="text"
          value={data.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="e.g., Send welcome email"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor={`auto-action-${nodeId}`}>
          Action <span className="required">*</span>
        </label>
        {loading ? (
          <div className="form-loading">Loading actions...</div>
        ) : error ? (
          <div className="form-error">{error}</div>
        ) : (
          <select
            id={`auto-action-${nodeId}`}
            value={data.actionId || ''}
            onChange={(e) => handleActionChange(e.target.value)}
            className="form-select"
          >
            <option value="">Select action...</option>
            {automations.map((action) => (
              <option key={action.id} value={action.id}>
                {action.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Dynamic param fields rendered from action.params array */}
      {selectedAction && selectedAction.params.length > 0 && (
        <div className="form-group">
          <label>Action Parameters</label>
          <div className="dynamic-params">
            {selectedAction.params.map((paramName) => (
              <div key={paramName} className="param-row">
                <label htmlFor={`param-${nodeId}-${paramName}`} className="param-label">
                  {paramName}
                </label>
                <input
                  id={`param-${nodeId}-${paramName}`}
                  type="text"
                  value={(data.actionParams || {})[paramName] || ''}
                  onChange={(e) => handleParamChange(paramName, e.target.value)}
                  placeholder={`Enter ${paramName}...`}
                  className="form-input"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="form-actions">
        <button onClick={() => onDelete(nodeId)} className="btn-danger">
          Delete Node
        </button>
      </div>
    </div>
  );
};

export default AutomatedStepForm;
