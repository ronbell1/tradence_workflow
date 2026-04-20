import React from 'react';
import { NodeToolbar, Position, useReactFlow } from '@xyflow/react';
import { ClipboardList, UserCheck, Zap, StopCircle, Split } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { NodeType } from '../../types/nodes';

const NODE_OPTIONS: { type: NodeType; icon: React.ReactNode; color: string; label: string }[] = [
  { type: 'task', icon: <ClipboardList size={16} color="#3b82f6" />, color: '#3b82f6', label: 'Task' },
  { type: 'approval', icon: <UserCheck size={16} color="#f59e0b" />, color: '#f59e0b', label: 'Approval' },
  { type: 'decision', icon: <Split size={16} color="#f97316" />, color: '#f97316', label: 'Decision' },
  { type: 'automated', icon: <Zap size={16} color="#8b5cf6" />, color: '#8b5cf6', label: 'Automated' },
  { type: 'end', icon: <StopCircle size={16} color="#ef4444" />, color: '#ef4444', label: 'End' },
];

interface QuickAddToolbarProps {
  nodeId: string;
  isVisible: boolean;
  sourceHandleId?: string;
}

export default function QuickAddToolbar({ nodeId, isVisible, sourceHandleId }: QuickAddToolbarProps) {
  const { setNodes, setEdges, getNode } = useReactFlow();

  const onAddNode = (type: NodeType) => {
    const parentNode = getNode(nodeId);
    if (!parentNode) return;

    const newNodeId = `${type}-${uuidv4().slice(0, 8)}`;
    
    // Default node data mapping based on type
    const defaultData = {
      task: { title: 'New Task', assignee: '', dueDate: '', customFields: [] },
      approval: { title: 'Manager Approval', approverRole: 'Manager' },
      automated: { title: 'System Action', actionId: '' },
      decision: { title: 'Condition', conditionVariable: '', conditionOperator: 'equals', conditionValue: '' },
      end: { endMessage: 'Workflow Complete', summaryFlag: false },
      start: { title: 'Start', metadata: [] }
    }[type];

    const newNode = {
      id: newNodeId,
      type,
      position: {
        x: parentNode.position.x, 
        y: parentNode.position.y + 120, // offset below parent
      },
      data: { type, ...defaultData },
      selected: true,
    };

    const newEdge = {
      id: `e-${nodeId}-${sourceHandleId ? sourceHandleId + '-' : ''}${newNodeId}`,
      source: nodeId,
      sourceHandle: sourceHandleId,
      target: newNodeId,
      type: 'smart',
      animated: false,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
    };

    // Add node and edge
    setNodes((ns) => ns.map(n => ({...n, selected: false})).concat(newNode as any));
    setEdges((es) => es.concat(newEdge as any));
  };

  return (
    <NodeToolbar
      isVisible={isVisible}
      position={Position.Bottom}
      offset={10}
      className="node-quick-add"
    >
      <div className="smart-edge-menu">
        {NODE_OPTIONS.map((opt) => (
          <button
            key={opt.type}
            className="smart-ghost-btn"
            onClick={() => onAddNode(opt.type)}
            title={`Append ${opt.label}`}
          >
            {opt.icon}
          </button>
        ))}
      </div>
    </NodeToolbar>
  );
}
