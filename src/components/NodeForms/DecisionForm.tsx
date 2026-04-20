import { Split } from 'lucide-react';

interface DecisionFormProps {
  nodeId: string;
  data: {
    title?: string;
    conditionVariable?: string;
    conditionOperator?: string;
    conditionValue?: string;
  };
  onChange: (nodeId: string, data: Record<string, unknown>) => void;
  onDelete: (nodeId: string) => void;
}

const DecisionForm = ({ nodeId, data, onChange, onDelete }: DecisionFormProps) => {
  const handleChange = (field: string, value: string) => {
    onChange(nodeId, { [field]: value });
  };

  return (
    <div className="node-form">
      <div className="form-header">
        <span className="form-icon"><Split size={18} color="#f97316" /></span>
        <h3>Decision Node</h3>
      </div>

      <div className="form-group">
        <label htmlFor={`decision-title-${nodeId}`}>
          Title <span className="required">*</span>
        </label>
        <input
          id={`decision-title-${nodeId}`}
          type="text"
          value={data.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="e.g., Check Salary > 50k"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor={`decision-var-${nodeId}`}>
          Condition Variable <span className="required">*</span>
        </label>
        <input
          id={`decision-var-${nodeId}`}
          type="text"
          value={data.conditionVariable || ''}
          onChange={(e) => handleChange('conditionVariable', e.target.value)}
          placeholder="e.g., requested_salary"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor={`decision-op-${nodeId}`}>
          Operator <span className="required">*</span>
        </label>
        <select
          id={`decision-op-${nodeId}`}
          value={data.conditionOperator || 'equals'}
          onChange={(e) => handleChange('conditionOperator', e.target.value)}
          className="form-select"
        >
          <option value="equals">Equals</option>
          <option value="not_equals">Not Equals</option>
          <option value="greater_than">Greater Than</option>
          <option value="less_than">Less Than</option>
          <option value="contains">Contains</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor={`decision-val-${nodeId}`}>
          Value to check against <span className="required">*</span>
        </label>
        <input
          id={`decision-val-${nodeId}`}
          type="text"
          value={data.conditionValue || ''}
          onChange={(e) => handleChange('conditionValue', e.target.value)}
          placeholder="e.g., 50000"
          className="form-input"
        />
      </div>

      <div className="form-actions">
        <button onClick={() => onDelete(nodeId)} className="btn-danger">
          Delete Node
        </button>
      </div>
    </div>
  );
};

export default DecisionForm;
