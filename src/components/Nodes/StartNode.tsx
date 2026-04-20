// components/Nodes/StartNode.tsx — Custom Start Node component
// 🟢 Workflow entry point — green accent, only 1 allowed

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface StartNodeDataType {
  title?: string;
  metadata?: { id: string; key: string; value: string }[];
  validationErrors?: string[];
  validationWarnings?: string[];
  isSimulating?: boolean;
}

const StartNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as StartNodeDataType;
  const hasErrors = nodeData.validationErrors && nodeData.validationErrors.length > 0;
  const hasWarnings = nodeData.validationWarnings && nodeData.validationWarnings.length > 0;

  return (
    <div
      className={`workflow-node start-node ${selected ? 'selected' : ''} ${
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
      <div className="node-icon">🟢</div>
      <div className="node-content">
        <div className="node-type-label">START</div>
        <div className="node-title">{nodeData.title || 'Start'}</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="handle-source"
      />
    </div>
  );
});

StartNode.displayName = 'StartNode';
export default StartNode;
