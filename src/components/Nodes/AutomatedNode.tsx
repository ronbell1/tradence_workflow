// components/Nodes/AutomatedNode.tsx — Custom Automated Step Node
// ⚡ System-triggered action — purple accent

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface AutomatedNodeDataType {
  title?: string;
  actionId?: string;
  actionParams?: Record<string, string>;
  validationErrors?: string[];
  validationWarnings?: string[];
  isSimulating?: boolean;
}

const AutomatedNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as AutomatedNodeDataType;
  const hasErrors = nodeData.validationErrors && nodeData.validationErrors.length > 0;
  const hasWarnings = nodeData.validationWarnings && nodeData.validationWarnings.length > 0;

  return (
    <div
      className={`workflow-node automated-node ${selected ? 'selected' : ''} ${
        nodeData.isSimulating ? 'simulating' : ''
      } ${hasErrors ? 'has-errors' : ''}`}
    >
      {(hasErrors || hasWarnings) && (
        <div className="node-validation-badge" title={
          [...(nodeData.validationErrors || []), ...(nodeData.validationWarnings || [])].join('\n')
        }>
          {hasErrors ? '!' : '⚠'}
        </div>
      )}
      <Handle type="target" position={Position.Top} className="handle-target" />
      <div className="node-icon">⚡</div>
      <div className="node-content">
        <div className="node-type-label">AUTOMATED</div>
        <div className="node-title">{nodeData.title || 'Untitled Action'}</div>
        {nodeData.actionId && (
          <div className="node-meta">
            <span className="meta-icon">🔧</span> {nodeData.actionId}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="handle-source" />
    </div>
  );
});

AutomatedNode.displayName = 'AutomatedNode';
export default AutomatedNode;
