// components/NodeForms/ApprovalForm.tsx — Approval Node configuration form

interface ApprovalFormProps {
  nodeId: string;
  data: {
    title?: string;
    approverRole?: string;
    autoApproveThreshold?: number;
  };
  onChange: (nodeId: string, data: Record<string, unknown>) => void;
  onDelete: (nodeId: string) => void;
}

const ROLE_PRESETS = ['Manager', 'HRBP', 'Director'];

const ApprovalForm = ({ nodeId, data, onChange, onDelete }: ApprovalFormProps) => {
  const handleChange = (field: string, value: string | number | undefined) => {
    onChange(nodeId, { [field]: value });
  };

  return (
    <div className="node-form">
      <div className="form-header">
        <span className="form-icon">✅</span>
        <h3>Approval Node</h3>
      </div>

      <div className="form-group">
        <label htmlFor={`approval-title-${nodeId}`}>
          Title <span className="required">*</span>
        </label>
        <input
          id={`approval-title-${nodeId}`}
          type="text"
          value={data.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="e.g., Manager Approval"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor={`approval-role-${nodeId}`}>
          Approver Role <span className="required">*</span>
        </label>
        <div className="role-input-group">
          <select
            id={`approval-role-select-${nodeId}`}
            value={ROLE_PRESETS.includes(data.approverRole || '') ? data.approverRole : '__custom__'}
            onChange={(e) => {
              if (e.target.value !== '__custom__') {
                handleChange('approverRole', e.target.value);
              }
            }}
            className="form-select"
          >
            <option value="">Select role...</option>
            {ROLE_PRESETS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
            <option value="__custom__">Custom...</option>
          </select>
          {(!ROLE_PRESETS.includes(data.approverRole || '') && data.approverRole !== '') && (
            <input
              id={`approval-role-${nodeId}`}
              type="text"
              value={data.approverRole || ''}
              onChange={(e) => handleChange('approverRole', e.target.value)}
              placeholder="Enter custom role"
              className="form-input"
              style={{ marginTop: '8px' }}
            />
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor={`approval-threshold-${nodeId}`}>
          Auto-approve Threshold
        </label>
        <input
          id={`approval-threshold-${nodeId}`}
          type="number"
          min={0}
          value={data.autoApproveThreshold ?? ''}
          onChange={(e) =>
            handleChange(
              'autoApproveThreshold',
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          placeholder="e.g., 85"
          className="form-input"
        />
        <span className="form-hint">
          If set, approvals above this score are auto-approved
        </span>
      </div>

      <div className="form-actions">
        <button onClick={() => onDelete(nodeId)} className="btn-danger">
          Delete Node
        </button>
      </div>
    </div>
  );
};

export default ApprovalForm;
