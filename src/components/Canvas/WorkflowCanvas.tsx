// components/Canvas/WorkflowCanvas.tsx — Main React Flow canvas
// Central feature: drag-and-drop canvas with all 5 node types

import { useCallback, useRef, useState, type DragEvent } from 'react';
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
import SmartEdge from './SmartEdge';
import { ContextMenu } from './ContextMenu';
import AlignmentToolbar from './AlignmentToolbar';
import type { NodeType } from '../../types/nodes';

const edgeTypes = {
  smart: SmartEdge,
};
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
  duplicateNode?: () => void;
  deleteNode?: (id: string) => void;
  autoConnectGraph?: () => void;
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
  duplicateNode,
  deleteNode,
  autoConnectGraph,
}: WorkflowCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ id: string; top?: number; left?: number; right?: number; bottom?: number } | null>(null);

  // Path Highlighting State
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Determine highlighted paths
  const getHighlightPath = useCallback(() => {
    if (!hoveredNodeId) return { nodes: new Set(), edges: new Set() };
    const hNodes = new Set<string>([hoveredNodeId]);
    const hEdges = new Set<string>();

    const traverseDown = (nodeId: string) => {
      edges.filter(e => e.source === nodeId).forEach(edge => {
        if (!hEdges.has(edge.id)) {
          hEdges.add(edge.id);
          hNodes.add(edge.target);
          traverseDown(edge.target);
        }
      });
    };

    const traverseUp = (nodeId: string) => {
      edges.filter(e => e.target === nodeId).forEach(edge => {
        if (!hEdges.has(edge.id)) {
          hEdges.add(edge.id);
          hNodes.add(edge.source);
          traverseUp(edge.source);
        }
      });
    };

    traverseDown(hoveredNodeId);
    traverseUp(hoveredNodeId);

    return { nodes: hNodes, edges: hEdges };
  }, [hoveredNodeId, edges]);

  const { nodes: highlightNodes, edges: highlightEdges } = getHighlightPath();

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      onNodeClick(event, node); // Select the node so duplicateNode knows what to target
      const pane = reactFlowWrapper.current?.getBoundingClientRect();
      if (!pane) return;
      setContextMenu({
        id: node.id,
        top: event.clientY < pane.height - 200 ? event.clientY - pane.top : undefined,
        left: event.clientX < pane.width - 200 ? event.clientX - pane.left : undefined,
        bottom: event.clientY >= pane.height - 200 ? pane.bottom - event.clientY : undefined,
        right: event.clientX >= pane.width - 200 ? pane.right - event.clientX : undefined,
      });
    },
    [setContextMenu]
  );

  const onPaneClickCloseContextMenu = useCallback(() => {
    setContextMenu(null);
    onPaneClick();
  }, [onPaneClick]);

  const selectedNodes = nodes.filter(n => n.selected);

  // Inject validation + simulation state into node data for rendering
  const nodesWithState = nodes.map((node) => {
    const valState = validationStates.get(node.id);
    return {
      ...node,
      className: `${node.className || ''} ${hoveredNodeId && !highlightNodes.has(node.id) ? 'dimmed' : ''}`,
      data: {
        ...node.data,
        validationErrors: valState?.errors || [],
        validationWarnings: valState?.warnings || [],
        isSimulating: simulatingNodeId === node.id,
      },
    };
  });

  const edgesWithState = edges.map((edge) => {
    let className = edge.className || '';
    if (hoveredNodeId) {
      className += highlightEdges.has(edge.id) ? ' highlighted' : ' dimmed';
    }
    if (simulatingNodeId && edge.source === simulatingNodeId) {
      className += ' simulating-path';
    }
    return {
      ...edge,
      className,
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
      case 'start': return '#12b76a';
      case 'task': return '#2970ff';
      case 'approval': return '#f79009';
      case 'automated': return '#7a5af8';
      case 'end': return '#f04438';
      default: return '#98a2b3';
    }
  };

  return (
    <div className="canvas-wrapper" ref={reactFlowWrapper}>
      {nodes.length === 0 && (
        <div className="empty-canvas-state">
          <h3>Workflow is empty</h3>
          <p>Drag nodes from the left sidebar to start building.</p>
        </div>
      )}
      <ReactFlow
        nodes={nodesWithState}
        edges={edgesWithState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={(connection) => {
          if (connection.source === connection.target) return false;
          const targetNode = nodes.find(n => n.id === connection.target);
          if (targetNode?.type === 'start') return false;
          const sourceNode = nodes.find(n => n.id === connection.source);
          if (sourceNode?.type === 'end') return false;
          return true;
        }}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onNodeMouseEnter={(_, node) => setHoveredNodeId(node.id)}
        onNodeMouseLeave={() => setHoveredNodeId(null)}
        onPaneClick={onPaneClickCloseContextMenu}
        onNodesDelete={onNodesDelete}
        onInit={onInit}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: 'var(--edge-color)', strokeWidth: 2 }}
        defaultEdgeOptions={{
          type: 'smart',
          animated: false,
          style: { stroke: 'var(--edge-color)', strokeWidth: 2 },
        }}
        fitView
        fitViewOptions={{ padding: 0.2, minZoom: 0.5, maxZoom: 1 }}
        snapToGrid
        snapGrid={[16, 16]}
        deleteKeyCode={['Backspace', 'Delete']}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={12}
          size={1.5}
          color="var(--bg-dots)"
        />
        <Controls
          showInteractive={true}
          className="canvas-controls"
        />
        <MiniMap
          nodeColor={minimapNodeColor}
          maskColor="rgba(0, 0, 0, 0.1)"
          className="canvas-minimap"
          pannable
          zoomable
        />
        {contextMenu && (
          <ContextMenu
            {...contextMenu}
            onClose={() => setContextMenu(null)}
            onDuplicate={() => {
              if (duplicateNode) duplicateNode();
            }}
            onDelete={(id) => {
              if (deleteNode) deleteNode(id);
            }}
            onAutoConnect={() => {
              if (autoConnectGraph) autoConnectGraph();
            }}
          />
        )}
      </ReactFlow>
      
      <AlignmentToolbar
        selectedNodes={selectedNodes}
        onDelete={(nodesToDelete) => {
          if (deleteNode) nodesToDelete.forEach(n => deleteNode(n.id));
        }}
      />
    </div>
  );
};

export default WorkflowCanvas;
