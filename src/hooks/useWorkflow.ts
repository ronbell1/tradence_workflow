// hooks/useWorkflow.ts — Main workflow state hook
// Central state management for the React Flow canvas

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  addEdge,
  type OnConnect,
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import type { NodeType, WorkflowNodeData } from '../types/nodes';
import type { WorkflowGraph } from '../types/api';
import { useHistory } from './useHistory';
import { getNodeValidationStates } from '../utils/graphValidation';

// Default data factories for each node type
const createDefaultNodeData = (type: NodeType): WorkflowNodeData => {
  switch (type) {
    case 'start':
      return { type: 'start', title: 'Start', metadata: [] };
    case 'task':
      return {
        type: 'task',
        title: '',
        description: '',
        assignee: '',
        dueDate: '',
        customFields: [],
      };
    case 'approval':
      return {
        type: 'approval',
        title: '',
        approverRole: '',
        autoApproveThreshold: undefined,
      };
    case 'automated':
      return { type: 'automated', title: '', actionId: '', actionParams: {} };
    case 'end':
      return { type: 'end', endMessage: '', summaryFlag: false };
    default:
      return { type: 'start', title: 'Start', metadata: [] };
  }
};

/**
 * Main workflow hook — manages nodes, edges, selection, validation,
 * undo/redo, and graph serialization.
 */
export const useWorkflow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [validationStates, setValidationStates] = useState<
    Map<string, { errors: string[]; warnings: string[] }>
  >(new Map());
  // Track which node is being animated during simulation
  const [simulatingNodeId, setSimulatingNodeId] = useState<string | null>(null);

  const { pushSnapshot, undo, redo, canUndo, canRedo } = useHistory();
  const isInitialRender = useRef(true);

  // Save snapshot for undo on every change (debounced)
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      pushSnapshot({ nodes: structuredClone(nodes), edges: structuredClone(edges) });
    }, 500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  // Recompute validation states whenever nodes/edges change
  useEffect(() => {
    const states = getNodeValidationStates(nodes, edges);
    setValidationStates(states);
  }, [nodes, edges]);

  // Connect nodes with smooth step edges
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        ...connection,
        id: `e-${connection.source}-${connection.target}-${Date.now()}`,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Add a new node to the canvas at specified position
  const addNode = useCallback(
    (type: NodeType, position: { x: number; y: number }) => {
      const id = uuidv4();
      const nodeData = createDefaultNodeData(type);
      const newNode: Node = {
        id,
        type,
        position,
        data: nodeData as unknown as Record<string, unknown>,
      };
      setNodes((nds) => [...nds, newNode]);
      setSelectedNodeId(id);
      return id;
    },
    [setNodes]
  );

  // Update node data (from config forms)
  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<WorkflowNodeData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: { ...node.data, ...data },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // Delete a specific node and its connected edges
  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
      );
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
    },
    [setNodes, setEdges, selectedNodeId]
  );

  // Handle node click — open config panel
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  // Handle pane click — deselect
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Delete selected nodes/edges (Backspace/Delete key)
  const onNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      deletedNodes.forEach((n) => {
        if (n.id === selectedNodeId) setSelectedNodeId(null);
      });
    },
    [selectedNodeId]
  );

  // Serialize workflow graph for API submission
  const serializeGraph = useCallback((): WorkflowGraph => {
    return {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type || 'start',
        data: n.data as Record<string, unknown>,
        position: n.position,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
      })),
    };
  }, [nodes, edges]);

  // Undo action
  const handleUndo = useCallback(() => {
    const snapshot = undo({
      nodes: structuredClone(nodes),
      edges: structuredClone(edges),
    });
    if (snapshot) {
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
    }
  }, [undo, nodes, edges, setNodes, setEdges]);

  // Redo action
  const handleRedo = useCallback(() => {
    const snapshot = redo({
      nodes: structuredClone(nodes),
      edges: structuredClone(edges),
    });
    if (snapshot) {
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
    }
  }, [redo, nodes, edges, setNodes, setEdges]);

  // Export workflow as JSON
  const exportWorkflow = useCallback(() => {
    const graph = serializeGraph();
    const json = JSON.stringify(graph, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [serializeGraph]);

  // Import workflow from JSON
  const importWorkflow = useCallback(
    (jsonString: string) => {
      try {
        const graph: WorkflowGraph = JSON.parse(jsonString);
        if (!graph.nodes || !graph.edges) {
          throw new Error('Invalid workflow format');
        }
        const importedNodes: Node[] = graph.nodes.map((n) => ({
          id: n.id,
          type: n.type as NodeType,
          position: n.position,
          data: n.data,
        }));
        setNodes(importedNodes);
        setEdges(
          graph.edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
          }))
        );
        setSelectedNodeId(null);
        return true;
      } catch {
        return false;
      }
    },
    [setNodes, setEdges]
  );

  // Load a preset template
  const loadTemplate = useCallback(
    (template: { nodes: Node[]; edges: Edge[] }) => {
      setNodes(template.nodes);
      setEdges(template.edges);
      setSelectedNodeId(null);
    },
    [setNodes, setEdges]
  );

  // Get selected node object
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return {
    nodes,
    edges,
    selectedNode,
    selectedNodeId,
    validationStates,
    simulatingNodeId,
    setSimulatingNodeId,
    canUndo,
    canRedo,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onPaneClick,
    onNodesDelete,
    addNode,
    updateNodeData,
    deleteNode,
    serializeGraph,
    handleUndo,
    handleRedo,
    exportWorkflow,
    importWorkflow,
    loadTemplate,
    setNodes,
    setEdges,
  };
};
