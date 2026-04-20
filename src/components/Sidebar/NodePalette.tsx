// components/Sidebar/NodePalette.tsx — Drag source sidebar
// Lists all 6 node types for drag-and-drop onto the canvas

import type { DragEvent } from 'react';
import type { NodeType } from '../../types/nodes';

import { CirclePlay, ClipboardList, UserCheck, Zap, StopCircle, GripVertical, Split } from 'lucide-react';

interface NodeTypeOption {
  type: NodeType;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const NODE_OPTIONS: NodeTypeOption[] = [
  {
    type: 'start',
    label: 'Start',
    icon: <CirclePlay size={20} color="#22c55e" />,
    description: 'Workflow entry point',
    color: '#22c55e',
  },
  {
    type: 'task',
    label: 'Task',
    icon: <ClipboardList size={20} color="#3b82f6" />,
    description: 'Human task step',
    color: '#3b82f6',
  },
  {
    type: 'approval',
    label: 'Approval',
    icon: <UserCheck size={20} color="#f59e0b" />,
    description: 'Manager/HR approval',
    color: '#f59e0b',
  },
  {
    type: 'automated',
    label: 'Automated',
    icon: <Zap size={20} color="#8b5cf6" />,
    description: 'System-triggered action',
    color: '#8b5cf6',
  },
  {
    type: 'decision',
    label: 'Decision',
    icon: <Split size={20} color="#f97316" />,
    description: 'If/Else Branching Logic',
    color: '#f97316',
  },
  {
    type: 'end',
    label: 'End',
    icon: <StopCircle size={20} color="#ef4444" />,
    description: 'Workflow completion',
    color: '#ef4444',
  },
];

const NodePalette = () => {
  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="node-palette">
      <div className="palette-header">
        <h2>Node Types</h2>
        <p className="palette-hint">Drag nodes onto the canvas</p>
      </div>
      <div className="palette-list">
        {NODE_OPTIONS.map((option) => (
          <div
            key={option.type}
            className="palette-item"
            draggable
            onDragStart={(e) => onDragStart(e, option.type)}
            style={{ '--node-color': option.color } as React.CSSProperties}
          >
            <div className="palette-item-icon">{option.icon}</div>
            <div className="palette-item-info">
              <div className="palette-item-label">{option.label}</div>
              <div className="palette-item-desc">{option.description}</div>
            </div>
            <div className="palette-item-drag"><GripVertical size={16} /></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodePalette;
