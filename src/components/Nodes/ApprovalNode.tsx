// components/Nodes/ApprovalNode.tsx — Custom Approval Node component
// ✅ Manager/HR approval step — amber/yellow accent

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { UserCheck, Key, Zap, TriangleAlert } from 'lucide-react';
import QuickAddToolbar from './QuickAddToolbar';

interface ApprovalNodeDataType {
  title?: string;
  approverRole?: string;
  autoApproveThreshold?: number;
  validationErrors?: string[];
  validationWarnings?: string[];
  isSimulating?: boolean;
}

const ApprovalNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as ApprovalNodeDataType;
  const hasErrors = nodeData.validationErrors && nodeData.validationErrors.length > 0;
  const hasWarnings = nodeData.validationWarnings && nodeData.validationWarnings.length > 0;

  return (
    <div
      className={`workflow-node approval-node ${selected ? 'selected' : ''} ${
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
      <div className="node-icon"><UserCheck size={16} color="#f59e0b" /></div>
      <div className="node-content">
        <div className="node-type-label">APPROVAL</div>
        <div className="node-title">{nodeData.title || 'Untitled Approval'}</div>
        {nodeData.approverRole && (
          <div className="node-meta">
            <span className="meta-icon"><Key size={12} /></span> {nodeData.approverRole}
          </div>
        )}
        {nodeData.autoApproveThreshold !== undefined && nodeData.autoApproveThreshold > 0 && (
          <div className="node-meta">
            <span className="meta-icon"><Zap size={12} /></span> Auto-approve: ≥{nodeData.autoApproveThreshold}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="handle-source" />
      
      <QuickAddToolbar nodeId={id} isVisible={selected} />
    </div>
  );
});

ApprovalNode.displayName = 'ApprovalNode';
export default ApprovalNode;
