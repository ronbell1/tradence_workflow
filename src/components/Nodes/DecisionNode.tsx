import { Handle, Position, type NodeProps } from '@xyflow/react';
import { TriangleAlert, Split } from 'lucide-react';
import QuickAddToolbar from './QuickAddToolbar';

const OPERATOR_LABELS: Record<string, string> = {
  equals: '==',
  not_equals: '!=',
  greater_than: '>',
  less_than: '<',
  contains: '∋',
};

const DecisionNode = ({ id, data, selected }: NodeProps) => {
  const nodeData = data as any;
  const hasErrors = nodeData.validationErrors && nodeData.validationErrors.length > 0;

  const conditionPreview = nodeData.conditionVariable
    ? `${nodeData.conditionVariable} ${OPERATOR_LABELS[nodeData.conditionOperator] || '=='} ${nodeData.conditionValue || '?'}`
    : null;

  return (
    <div
      className={`workflow-node decision-node ${selected ? 'selected' : ''} ${
        nodeData.isSimulating ? 'simulating' : ''
      } ${hasErrors ? 'has-errors' : ''}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="handle-target"
        isConnectable={true}
      />

      {hasErrors && (
        <div className="node-validation-badge" title={
          (nodeData.validationErrors || []).join('\n')
        }>
          <TriangleAlert size={12} />
        </div>
      )}

      <div className="node-header" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        <Split size={14} style={{ color: 'var(--node-approval)' }} />
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{nodeData.title || 'Decision'}</span>
      </div>

      <div className="node-body">
        <div style={{
          fontSize: '11px',
          fontFamily: 'var(--font-mono, monospace)',
          color: 'var(--text-secondary)',
          background: 'var(--bg-hover)',
          padding: '4px 8px',
          borderRadius: '4px',
          wordBreak: 'break-all'
        }}>
          {conditionPreview || 'No condition'}
        </div>
      </div>

      {/* Yes (True) handle — bottom left */}
      <div className="decision-branch-label" style={{ position: 'absolute', bottom: '-20px', left: '25%', transform: 'translateX(-50%)', fontSize: '10px', fontWeight: 600, color: '#10b981' }}>Yes</div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="handle-source handle-source-true"
        style={{ left: '25%', background: '#10b981' }}
        isConnectable={true}
      />

      {/* No (False) handle — bottom right */}
      <div className="decision-branch-label" style={{ position: 'absolute', bottom: '-20px', left: '75%', transform: 'translateX(-50%)', fontSize: '10px', fontWeight: 600, color: '#ef4444' }}>No</div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="handle-source handle-source-false"
        style={{ left: '75%', background: '#ef4444' }}
        isConnectable={true}
      />
      
      <QuickAddToolbar nodeId={id} isVisible={selected} sourceHandleId="true" />
    </div>
  );
};

export default DecisionNode;
