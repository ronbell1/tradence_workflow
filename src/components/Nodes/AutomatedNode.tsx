// components/Nodes/AutomatedNode.tsx — Custom Automated Step Node
// ⚡ System-triggered action — purple accent

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Zap, Settings } from 'lucide-react';
import QuickAddToolbar from './QuickAddToolbar';

const ACTION_LABELS: Record<string, string> = {
  'send-email': 'Send Email',
  'create-jira': 'Create Jira Ticket',
  'provision-laptop': 'Provision Laptop',
  'add-to-slack': 'Add to Slack',
  'update-hris': 'Update HRIS',
  'schedule-orientation': 'Schedule Orientation',
  'send-welcome-kit': 'Send Welcome Kit',
  'notify-manager': 'Notify Manager',
  'setup-payroll': 'Setup Payroll',
  'assign-buddy': 'Assign Buddy',
};

interface AutomatedNodeDataType {
  title?: string;
  actionId?: string;
  actionParams?: Record<string, string>;
  validationErrors?: string[];
  validationWarnings?: string[];
  isSimulating?: boolean;
}

const AutomatedNode = memo(({ id, data, selected }: NodeProps) => {
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
      <div className="node-icon"><Zap size={16} color="var(--node-automated)" /></div>
      <div className="node-content">
        <div className="node-type-label">AUTOMATED</div>
        <div className="node-title">{nodeData.title || 'Untitled Action'}</div>
        {nodeData.actionId ? (
          <div className="node-meta">
            <span className="meta-icon"><Settings size={12} /></span> {ACTION_LABELS[nodeData.actionId] || nodeData.actionId}
          </div>
        ) : (
          <div className="node-meta" style={{ fontStyle: 'italic', opacity: 0.6 }}>
            <span className="meta-icon"><Settings size={12} /></span> Configure action...
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="handle-source"
      />
      
      <QuickAddToolbar nodeId={id} isVisible={selected} />
    </div>
  );
});

AutomatedNode.displayName = 'AutomatedNode';
export default AutomatedNode;
