import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignVerticalSpaceAround, AlignHorizontalSpaceAround, Trash2 } from 'lucide-react';
import { useReactFlow, type Node } from '@xyflow/react';

interface AlignmentToolbarProps {
  selectedNodes: Node[];
  onDelete: (nodes: Node[]) => void;
}

const AlignmentToolbar: React.FC<AlignmentToolbarProps> = ({ selectedNodes, onDelete }) => {
  const { setNodes } = useReactFlow();

  if (selectedNodes.length <= 1) return null;

  const handleAlign = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'distribute-x' | 'distribute-y') => {
    setNodes((nodes) => {
      const selectedIds = new Set(selectedNodes.map((n) => n.id));
      const minX = Math.min(...selectedNodes.map((n) => n.position.x));
      const maxX = Math.max(...selectedNodes.map((n) => n.position.x + (n.measured?.width || 200)));
      const minY = Math.min(...selectedNodes.map((n) => n.position.y));
      const maxY = Math.max(...selectedNodes.map((n) => n.position.y + (n.measured?.height || 100)));

      // Sort nodes for distribution
      const sortedX = [...selectedNodes].sort((a, b) => a.position.x - b.position.x);
      const sortedY = [...selectedNodes].sort((a, b) => a.position.y - b.position.y);

      return nodes.map((node) => {
        if (!selectedIds.has(node.id)) return node;

        const newNode = { ...node, position: { ...node.position } };

        switch (type) {
          case 'left':
            newNode.position.x = minX;
            break;
          case 'right':
            newNode.position.x = maxX - (node.measured?.width || 200);
            break;
          case 'center':
            newNode.position.x = minX + (maxX - minX) / 2 - (node.measured?.width || 200) / 2;
            break;
          case 'top':
            newNode.position.y = minY;
            break;
          case 'bottom':
            newNode.position.y = maxY - (node.measured?.height || 100);
            break;
          case 'middle':
            newNode.position.y = minY + (maxY - minY) / 2 - (node.measured?.height || 100) / 2;
            break;
          case 'distribute-x': {
            const index = sortedX.findIndex((n) => n.id === node.id);
            if (selectedNodes.length > 1) {
              const step = (maxX - minX - (node.measured?.width || 200)) / (selectedNodes.length - 1);
              newNode.position.x = minX + index * step;
            }
            break;
          }
          case 'distribute-y': {
            const index = sortedY.findIndex((n) => n.id === node.id);
            if (selectedNodes.length > 1) {
              const step = (maxY - minY - (node.measured?.height || 100)) / (selectedNodes.length - 1);
              newNode.position.y = minY + index * step;
            }
            break;
          }
        }
        return newNode;
      });
    });
  };

  return (
    <div className="alignment-toolbar" style={{
      position: 'absolute',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100,
      display: 'flex',
      gap: '8px',
      padding: '8px',
      background: 'var(--bg-elevated)',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: '1px solid var(--border-color)',
    }}>
      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', padding: '0 8px', display: 'flex', alignItems: 'center' }}>
        {selectedNodes.length} selected
      </div>
      <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />
      <button onClick={() => handleAlign('left')} title="Align Left" className="toolbar-btn"><AlignLeft size={16} /></button>
      <button onClick={() => handleAlign('center')} title="Align Center" className="toolbar-btn"><AlignCenter size={16} /></button>
      <button onClick={() => handleAlign('right')} title="Align Right" className="toolbar-btn"><AlignRight size={16} /></button>
      <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />
      <button onClick={() => handleAlign('top')} title="Align Top" className="toolbar-btn"><AlignLeft size={16} style={{transform: 'rotate(90deg)'}} /></button>
      <button onClick={() => handleAlign('middle')} title="Align Middle" className="toolbar-btn"><AlignHorizontalSpaceAround size={16} style={{transform: 'rotate(90deg)'}} /></button>
      <button onClick={() => handleAlign('bottom')} title="Align Bottom" className="toolbar-btn"><AlignLeft size={16} style={{transform: 'rotate(-90deg)'}} /></button>
      <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />
      <button onClick={() => handleAlign('distribute-x')} title="Distribute Horizontally" className="toolbar-btn"><AlignHorizontalSpaceAround size={16} /></button>
      <button onClick={() => handleAlign('distribute-y')} title="Distribute Vertically" className="toolbar-btn"><AlignVerticalSpaceAround size={16} /></button>
      <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />
      <button onClick={() => onDelete(selectedNodes)} title="Delete Selected" className="toolbar-btn" style={{ color: '#ef4444' }}><Trash2 size={16} /></button>
    </div>
  );
};

export default AlignmentToolbar;
