// components/Nodes/EndNode.tsx — Custom End Node component
// 🔴 Workflow completion — red accent, no outgoing edges

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { StopCircle, BarChart3, TriangleAlert } from 'lucide-react';
import QuickAddToolbar from './QuickAddToolbar';

interface EndNodeDataType {
  endMessage?: string;
  summaryFlag?: boolean;
  validationErrors?: string[];
  validationWarnings?: string[];
  isSimulating?: boolean;
}

const EndNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as EndNodeDataType;
  const hasErrors = nodeData.validationErrors && nodeData.validationErrors.length > 0;
  const hasWarnings = nodeData.validationWarnings && nodeData.validationWarnings.length > 0;

  return (
    <div
      className={`workflow-node end-node ${selected ? 'selected' : ''} ${
        nodeData.isSimulating ? 'simulating' : ''
      } ${hasErrors ? 'has-errors' : ''}`}
    >
      {(hasErrors || hasWarnings) && (
        <div className="node-validation-badge" title={
          [...(nodeData.validationErrors || []), ...(nodeData.validationWarnings || [])].join('\n')
        }>
          {hasErrors ? <TriangleAlert size={14} /> : '⚠'}
        </div>
      )}
      <Handle type="target" position={Position.Top} className="handle-target" />
      <div className="node-icon"><StopCircle size={16} color="var(--node-end)" /></div>
      <div className="node-content">
        <div className="node-type-label">END</div>
        <div className="node-title">{nodeData.endMessage || 'End'}</div>
        {nodeData.summaryFlag && (
          <div className="node-meta">
            <span className="meta-icon"><BarChart3 size={12} /></span> Summary enabled
          </div>
        )}
      </div>
      
      {/* End Node typically stops workflows, but providing QuickAddToolbar for infinite graph extensions just in case */}
      <QuickAddToolbar nodeId={id} isVisible={selected} />
    </div>
  );
});

EndNode.displayName = 'EndNode';
export default EndNode;
