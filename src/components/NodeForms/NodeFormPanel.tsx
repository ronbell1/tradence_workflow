// components/NodeForms/NodeFormPanel.tsx — Side panel that renders the correct form
// Uses NodeFormRegistry to look up the form component by node type

import type { Node } from '@xyflow/react';
import NodeFormRegistry from './NodeFormRegistry';

interface NodeFormPanelProps {
  selectedNode: Node | null;
  onChange: (nodeId: string, data: Record<string, unknown>) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

const NodeFormPanel = ({ selectedNode, onChange, onDelete, onClose }: NodeFormPanelProps) => {
  if (!selectedNode) {
    return (
      <div className="form-panel empty-panel">
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No Node Selected</h3>
          <p>Click on a node in the canvas to edit its configuration.</p>
        </div>
      </div>
    );
  }

  const nodeType = selectedNode.type || '';
  const FormComponent = NodeFormRegistry[nodeType];

  if (!FormComponent) {
    return (
      <div className="form-panel">
        <div className="empty-state">
          <p>Unknown node type: {nodeType}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-panel">
      <div className="panel-header">
        <h2>Edit Node</h2>
        <button onClick={onClose} className="btn-icon" title="Close panel">
          ✕
        </button>
      </div>
      <div className="panel-body">
        <FormComponent
          nodeId={selectedNode.id}
          data={selectedNode.data as Record<string, unknown>}
          onChange={onChange}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default NodeFormPanel;
