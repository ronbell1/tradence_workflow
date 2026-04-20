import React from 'react';
import { NodeToolbar, Position, useReactFlow } from '@xyflow/react';
import { ClipboardList, UserCheck, Zap, StopCircle, Split } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { NodeType } from '../../types/nodes';

const NODE_OPTIONS: { type: NodeType; icon: React.ReactNode; color: string; label: string }[] = [
  { type: 'task', icon: <ClipboardList size={16} color="#2970ff" />, color: '#2970ff', label: 'Task' },
  { type: 'approval', icon: <UserCheck size={16} color="#f79009" />, color: '#f79009', label: 'Approval' },
  { type: 'decision', icon: <Split size={16} color="#ee6723" />, color: '#ee6723', label: 'Decision' },
  { type: 'automated', icon: <Zap size={16} color="#7a5af8" />, color: '#7a5af8', label: 'Automated' },
  { type: 'end', icon: <StopCircle size={16} color="#f04438" />, color: '#f04438', label: 'End' },
];

interface QuickAddToolbarProps {
  nodeId: string;
  isVisible: boolean;
  sourceHandleId?: string;
}

export default function QuickAddToolbar({ nodeId, isVisible, sourceHandleId }: QuickAddToolbarProps) {
  const { setNodes, setEdges, getNode, setCenter, getZoom } = useReactFlow();

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
      style: { stroke: 'var(--edge-color)', strokeWidth: 2 },
    };

    // Add node and edge
    setNodes((ns) => ns.map(n => ({...n, selected: false})).concat(newNode as any));
    setEdges((es) => es.concat(newEdge as any));

    // Smoothly pan to newly added node
    setTimeout(() => {
      setCenter(newNode.position.x + 80, newNode.position.y + 40, { zoom: getZoom(), duration: 800 });
    }, 50);
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
