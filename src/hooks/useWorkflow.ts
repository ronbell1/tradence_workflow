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
import { getLayoutedElements } from '../utils/layout';

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
        slaHours: undefined,
        checklist: [],
        customFields: [],
      };
    case 'approval':
      return {
        type: 'approval',
        title: '',
        approverRole: '',
        autoApproveThreshold: undefined,
        slaHours: undefined,
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
  // Try loading saved workflow from localStorage
  const savedWorkflow = (() => {
    try {
      const saved = localStorage.getItem('hr-workflow-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { nodes: parsed.nodes || [], edges: parsed.edges || [] };
      }
    } catch { /* ignore parse errors */ }
    return { nodes: [], edges: [] };
  })();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(savedWorkflow.nodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(savedWorkflow.edges as Edge[]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [validationStates, setValidationStates] = useState<
    Map<string, { errors: string[]; warnings: string[] }>
  >(new Map());
  // Track which node is being animated during simulation
  const [simulatingNodeId, setSimulatingNodeId] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<Node | null>(null);

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

  // Auto-save to localStorage on every change (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem('hr-workflow-state', JSON.stringify({ nodes, edges }));
      } catch { /* ignore quota errors */ }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [nodes, edges]);

  // Recompute validation states whenever nodes/edges change
  useEffect(() => {
    const states = getNodeValidationStates(nodes, edges);
    setValidationStates(states);
  }, [nodes, edges]);

  // Connect nodes with smooth step edges
  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      const edge = { ...params, type: 'smart', style: { stroke: '#94a3b8', strokeWidth: 2 } };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  // Add a new node to the canvas at specified position
  const addNode = useCallback(
    (type: NodeType, position: { x: number; y: number }) => {
      const id = `${type}-${uuidv4().slice(0, 8)}`;
      const nodeData = createDefaultNodeData(type);
      const newNode: Node = {
        id,
        type,
        position,
        data: nodeData as unknown as Record<string, unknown>,
        selected: true,
      };

      setNodes((nds) => nds.map(n => ({...n, selected: false})).concat(newNode as any));
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
            type: 'smart',
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
  
  // Auto format Layout using dagre
  const applyAutoLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [nodes, edges, setNodes, setEdges]);
  
  // Handle Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Auto-layout
      if (e.ctrlKey && e.key === 'i') {
         e.preventDefault();
         applyAutoLayout();
      }
      
      if (!selectedNodeId) return;

      // Copy Node Ctrl+C
      if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
        const node = nodes.find(n => n.id === selectedNodeId);
        if (node) setClipboard(node);
      }

      // Paste Node Ctrl+V
      if (e.ctrlKey && (e.key === 'v' || e.key === 'V')) {
        if (clipboard) {
          const newId = `${clipboard.type}-${uuidv4().slice(0, 8)}`;
          const newNode: Node = {
            ...clipboard,
            id: newId,
            position: { x: clipboard.position.x + 20, y: clipboard.position.y + 20 },
            selected: true
          };
          setNodes(nds => nds.map(n => ({...n, selected: false})).concat(newNode as any));
          setSelectedNodeId(newId);
        }
      }

      // Duplicate Node Ctrl+D
      if (e.ctrlKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        duplicateSelectedNode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, selectedNodeId, setNodes, applyAutoLayout, clipboard]);

  const duplicateSelectedNode = useCallback(() => {
    if (!selectedNodeId) return;
    const selectedNodeObj = nodes.find(n => n.id === selectedNodeId);
    if (!selectedNodeObj) return;
    
    const newId = `${selectedNodeObj.type}-${uuidv4().slice(0, 8)}`;
    const duplicatedNode: Node = {
      ...selectedNodeObj,
      id: newId,
      position: { x: selectedNodeObj.position.x + 50, y: selectedNodeObj.position.y + 50 },
      selected: true
    };
    setNodes(nds => nds.map(n => ({...n, selected: false})).concat(duplicatedNode as any));
    setSelectedNodeId(newId);
  }, [selectedNodeId, nodes, setNodes]);


  // Get selected node object
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  const autoConnectGraph = useCallback(() => {
    setEdges(currentEdges => {
      const newEdges = [...currentEdges];
      const getOutgoingEdges = (nodeId: string) => newEdges.filter(e => e.source === nodeId);
      const getIncomingEdges = (nodeId: string) => newEdges.filter(e => e.target === nodeId);

      const unconnSources = nodes.filter(n => n.type !== 'end' && getOutgoingEdges(n.id).length === 0);
      const unconnTargets = nodes.filter(n => n.type !== 'start' && getIncomingEdges(n.id).length === 0);

      const sortedSources = [...unconnSources].sort((a,b) => a.position.y - b.position.y);
      const targetPool = [...unconnTargets];

      sortedSources.forEach(sourceNode => {
         let bestTargetIndex = -1;
         let minDistance = Infinity;

         targetPool.forEach((targetNode, index) => {
            if (targetNode.id === sourceNode.id) return;
            // Prefer nodes below the current one, but allow slight upward variance
            const dy = targetNode.position.y - sourceNode.position.y;
            if (dy > -50) { 
               const dx = targetNode.position.x - sourceNode.position.x;
               const dist = Math.sqrt(dx*dx + dy*dy);
               if (dist < minDistance && dist < 1200) {
                 minDistance = dist;
                 bestTargetIndex = index;
               }
            }
         });

         if (bestTargetIndex !== -1) {
            const targetNode = targetPool[bestTargetIndex];
            newEdges.push({
               id: `e-${sourceNode.id}-${targetNode.id}`,
               source: sourceNode.id,
               sourceHandle: sourceNode.type === 'decision' ? 'true' : undefined,
               target: targetNode.id,
               type: 'smart',
               animated: false,
               style: { stroke: '#94a3b8', strokeWidth: 2 }
            } as any);
            targetPool.splice(bestTargetIndex, 1);
         }
      });
      return newEdges as any;
    });
  }, [nodes, setEdges]);

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
    duplicateSelectedNode,
    autoConnectGraph,
    serializeGraph,
    handleUndo,
    handleRedo,
    exportWorkflow,
    importWorkflow,
    loadTemplate,
    applyAutoLayout,
    setNodes,
    setEdges,
  };
};
