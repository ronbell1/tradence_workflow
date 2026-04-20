// components/NodeForms/EndForm.tsx — End Node configuration form

interface EndFormProps {
  nodeId: string;
  data: {
    endMessage?: string;
    summaryFlag?: boolean;
  };
  onChange: (nodeId: string, data: Record<string, unknown>) => void;
  onDelete: (nodeId: string) => void;
}

const EndForm = ({ nodeId, data, onChange, onDelete }: EndFormProps) => {
  return (
    <div className="node-form">
      <div className="form-header">
        <span className="form-icon">🔴</span>
        <h3>End Node</h3>
      </div>

      <div className="form-group">
        <label htmlFor={`end-message-${nodeId}`}>
          End Message <span className="required">*</span>
        </label>
        <input
          id={`end-message-${nodeId}`}
          type="text"
          value={data.endMessage || ''}
          onChange={(e) => onChange(nodeId, { endMessage: e.target.value })}
          placeholder="e.g., Onboarding complete"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label className="toggle-label">
          <div className="toggle-wrapper">
            <input
              type="checkbox"
              checked={data.summaryFlag || false}
              onChange={(e) => onChange(nodeId, { summaryFlag: e.target.checked })}
              className="toggle-input"
            />
            <span className="toggle-slider"></span>
          </div>
          <span>Generate Summary Report</span>
        </label>
      </div>

      <div className="form-actions">
        <button onClick={() => onDelete(nodeId)} className="btn-danger">
          Delete Node
        </button>
      </div>
    </div>
  );
};

export default EndForm;
