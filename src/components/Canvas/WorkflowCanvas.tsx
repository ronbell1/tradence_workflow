// components/Canvas/WorkflowCanvas.tsx — Main React Flow canvas
// Central feature: drag-and-drop canvas with all 5 node types

import { useCallback, useRef, type DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type ReactFlowInstance,
  ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from '../Nodes';
import type { NodeType } from '../../types/nodes';
import type { Node, Edge, OnNodesChange, OnEdgesChange, OnConnect } from '@xyflow/react';

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onPaneClick: () => void;
  onNodesDelete: (nodes: Node[]) => void;
  addNode: (type: NodeType, position: { x: number; y: number }) => string;
  validationStates: Map<string, { errors: string[]; warnings: string[] }>;
  simulatingNodeId: string | null;
}

const WorkflowCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
  onNodesDelete,
  addNode,
  validationStates,
  simulatingNodeId,
}: WorkflowCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // Inject validation + simulation state into node data for rendering
  const nodesWithState = nodes.map((node) => {
    const valState = validationStates.get(node.id);
    return {
      ...node,
      data: {
        ...node.data,
        validationErrors: valState?.errors || [],
        validationWarnings: valState?.warnings || [],
        isSimulating: simulatingNodeId === node.id,
      },
    };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onInit = useCallback((instance: any) => {
    reactFlowInstance.current = instance;
  }, []);

  // Handle drop from sidebar palette (CA-01)
  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type || !reactFlowInstance.current) return;

      // Use screenToFlowPosition for accurate drop placement
      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [addNode]
  );

  // MiniMap node color coding
  const minimapNodeColor = (node: Node) => {
    switch (node.type) {
      case 'start': return '#22c55e';
      case 'task': return '#3b82f6';
      case 'approval': return '#f59e0b';
      case 'automated': return '#a855f7';
      case 'end': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <div className="canvas-wrapper" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodesWithState}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodesDelete={onNodesDelete}
        onInit={onInit}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: '#94a3b8', strokeWidth: 2 }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
        }}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        deleteKeyCode={['Backspace', 'Delete']}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={12}
          size={1.5}
          color="#cbd5e1"
        />
        <Controls
          showInteractive={false}
          className="canvas-controls"
        />
        <MiniMap
          nodeColor={minimapNodeColor}
          maskColor="rgba(240, 240, 240, 0.5)"
          className="canvas-minimap"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
