// components/Nodes/TaskNode.tsx — Custom Task Node component
// 📋 Human task step — blue accent

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ClipboardList, User, Calendar } from 'lucide-react';
import QuickAddToolbar from './QuickAddToolbar';

interface TaskNodeDataType {
  title?: string;
  assignee?: string;
  dueDate?: string;
  description?: string;
  validationErrors?: string[];
  validationWarnings?: string[];
  isSimulating?: boolean;
}

const TaskNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as TaskNodeDataType;
  const hasErrors = nodeData.validationErrors && nodeData.validationErrors.length > 0;
  const hasWarnings = nodeData.validationWarnings && nodeData.validationWarnings.length > 0;

  return (
    <div
      className={`workflow-node task-node ${selected ? 'selected' : ''} ${
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
      <div className="node-icon"><ClipboardList size={16} color="#3b82f6" /></div>
      <div className="node-content">
        <div className="node-type-label">TASK</div>
        <div className="node-title">{nodeData.title || 'Untitled Task'}</div>
        {nodeData.assignee && (
          <div className="node-meta">
            <span className="meta-icon"><User size={12} /></span> {nodeData.assignee}
          </div>
        )}
        {nodeData.dueDate && (
          <div className="node-meta">
            <span className="meta-icon"><Calendar size={12} /></span> {nodeData.dueDate}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="handle-source" />
      <QuickAddToolbar nodeId={id} isVisible={selected} />
    </div>
  );
});

TaskNode.displayName = 'TaskNode';
export default TaskNode;
