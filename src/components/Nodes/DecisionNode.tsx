import { Handle, Position, type NodeProps } from '@xyflow/react';
import { TriangleAlert } from 'lucide-react';
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
      className={`workflow-node decision-node decision-diamond ${selected ? 'selected' : ''} ${
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

      <div className="decision-diamond-inner">
        <div className="node-content">
          <span className="node-type-label">DECISION</span>
          <span className="node-title">{nodeData.title || 'Condition'}</span>
          
          {conditionPreview && (
            <div className="node-condition-preview">
              {conditionPreview}
            </div>
          )}
        </div>
      </div>

      {/* Yes (True) handle — left */}
      <div className="decision-branch-label decision-branch-yes">Yes</div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="handle-source handle-source-true"
        style={{ left: '25%', background: '#22c55e' }}
        isConnectable={true}
      />

      {/* No (False) handle — right */}
      <div className="decision-branch-label decision-branch-no">No</div>
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
