// components/Sidebar/NodePalette.tsx — Drag source sidebar
// Lists all 5 node types for drag-and-drop onto the canvas

import type { DragEvent } from 'react';
import type { NodeType } from '../../types/nodes';

interface NodeTypeOption {
  type: NodeType;
  label: string;
  icon: string;
  description: string;
  color: string;
}

const NODE_OPTIONS: NodeTypeOption[] = [
  {
    type: 'start',
    label: 'Start',
    icon: '🟢',
    description: 'Workflow entry point',
    color: '#22c55e',
  },
  {
    type: 'task',
    label: 'Task',
    icon: '📋',
    description: 'Human task step',
    color: '#3b82f6',
  },
  {
    type: 'approval',
    label: 'Approval',
    icon: '✅',
    description: 'Manager/HR approval',
    color: '#f59e0b',
  },
  {
    type: 'automated',
    label: 'Automated',
    icon: '⚡',
    description: 'System-triggered action',
    color: '#a855f7',
  },
  {
    type: 'end',
    label: 'End',
    icon: '🔴',
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
            <div className="palette-item-drag">⠿</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodePalette;
