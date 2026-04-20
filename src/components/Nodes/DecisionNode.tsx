import { Handle, Position, type NodeProps } from '@xyflow/react';
import { GitBranch, TriangleAlert } from 'lucide-react';
import QuickAddToolbar from './QuickAddToolbar';



const DecisionNode = ({ id, data, selected }: NodeProps) => {
  const nodeData = data as any;
  const hasErrors = nodeData.validationErrors && nodeData.validationErrors.length > 0;

  return (
    <div
      className={`workflow-node decision-node ${selected ? 'selected' : ''} ${
        nodeData.isSimulating ? 'simulating' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="handle-target"
        isConnectable={true}
      />

      {hasErrors && (
        <div className="node-validation-badge" title={nodeData.validationErrors![0]}>
          <TriangleAlert size={12} />
        </div>
      )}

      <div className="node-content">
        <span className="node-type-label">Decision</span>
        <span className="node-title">{nodeData.title || 'Condition'}</span>
        
        {nodeData.conditionVariable && (
          <div className="node-meta">
            <span className="meta-icon"><GitBranch size={10} color="#f97316" /></span>
            <span>If {nodeData.conditionVariable}</span>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="handle-source handle-source-true"
        style={{ left: '25%', background: '#22c55e' }}
        isConnectable={true}
      />
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
