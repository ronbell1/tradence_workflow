// utils/graphValidation.ts — Graph validation utilities
// Validates workflow structure before simulation

import type { Node, Edge } from '@xyflow/react';
import type { ValidationResult } from '../types/api';

/**
 * Checks if the workflow has exactly one Start node.
 */
export function hasStartNode(nodes: Node[]): boolean {
  return nodes.filter((n) => n.type === 'start').length === 1;
}

/**
 * Returns the count of start nodes in the workflow.
 */
export function getStartNodeCount(nodes: Node[]): number {
  return nodes.filter((n) => n.type === 'start').length;
}

/**
 * Detects cycles in the directed graph using DFS.
 * Returns true if a cycle is detected (workflow must be a DAG).
 */
export function hasCycle(nodes: Node[], edges: Edge[]): boolean {
  const adjacencyList = new Map<string, string[]>();

  // Build adjacency list
  nodes.forEach((node) => adjacencyList.set(node.id, []));
  edges.forEach((edge) => {
    const neighbors = adjacencyList.get(edge.source);
    if (neighbors) {
      neighbors.push(edge.target);
    }
  });

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true; // Cycle detected
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true;
    }
  }

  return false;
}

/**
 * Returns nodes that have no outgoing edges (except End nodes).
 */
export function getDisconnectedNodes(nodes: Node[], edges: Edge[]): Node[] {
  const nodesWithOutgoing = new Set(edges.map((e) => e.source));
  return nodes.filter(
    (node) => node.type !== 'end' && !nodesWithOutgoing.has(node.id)
  );
}

/**
 * Returns nodes that have missing required fields.
 */
export function getNodesWithMissingFields(nodes: Node[]): { nodeId: string; fields: string[] }[] {
  const result: { nodeId: string; fields: string[] }[] = [];

  for (const node of nodes) {
    const missing: string[] = [];
    const data = node.data as Record<string, unknown>;

    switch (node.type) {
      case 'start':
        if (!data.title || (data.title as string).trim() === '') missing.push('Title');
        break;
      case 'task':
        if (!data.title || (data.title as string).trim() === '') missing.push('Title');
        if (!data.assignee || (data.assignee as string).trim() === '') missing.push('Assignee');
        if (!data.dueDate || (data.dueDate as string).trim() === '') missing.push('Due Date');
        break;
      case 'approval':
        if (!data.title || (data.title as string).trim() === '') missing.push('Title');
        if (!data.approverRole || (data.approverRole as string).trim() === '') missing.push('Approver Role');
        break;
      case 'automated':
        if (!data.title || (data.title as string).trim() === '') missing.push('Title');
        if (!data.actionId || (data.actionId as string).trim() === '') missing.push('Action');
        break;
      case 'end':
        if (!data.endMessage || (data.endMessage as string).trim() === '') missing.push('End Message');
        break;
    }

    if (missing.length > 0) {
      result.push({ nodeId: node.id, fields: missing });
    }
  }

  return result;
}

/**
 * Validates the Start node constraints:
 * - Only 1 Start node allowed
 * - Start node should have no incoming edges
 */
export function validateStartNode(nodes: Node[], edges: Edge[]): string[] {
  const errors: string[] = [];
  const startNodes = nodes.filter((n) => n.type === 'start');
  
  if (startNodes.length === 0) {
    errors.push('Workflow must have a Start node');
  } else if (startNodes.length > 1) {
    errors.push('Only one Start node is allowed per workflow');
  } else {
    const startId = startNodes[0].id;
    const hasIncoming = edges.some((e) => e.target === startId);
    if (hasIncoming) {
      errors.push('Start node must not have incoming edges');
    }
  }

  return errors;
}

/**
 * Validates the End node constraints:
 * - End nodes should have no outgoing edges
 */
export function validateEndNodes(nodes: Node[], edges: Edge[]): string[] {
  const warnings: string[] = [];
  const endNodes = nodes.filter((n) => n.type === 'end');
  
  for (const endNode of endNodes) {
    const hasOutgoing = edges.some((e) => e.source === endNode.id);
    if (hasOutgoing) {
      warnings.push(`End node "${(endNode.data as Record<string, unknown>).endMessage || endNode.id}" should not have outgoing edges`);
    }
  }

  return warnings;
}

/**
 * Complete workflow validation — aggregates all checks.
 * Call this before submitting to POST /simulate.
 */
export function validateWorkflow(nodes: Node[], edges: Edge[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Check Start node
  errors.push(...validateStartNode(nodes, edges));

  // 2. Check End node warnings
  warnings.push(...validateEndNodes(nodes, edges));

  // 3. Detect cycles
  if (hasCycle(nodes, edges)) {
    errors.push('Workflow contains a cycle — workflows must be directed acyclic graphs (DAGs)');
  }

  // 4. Check disconnected nodes (no outgoing edge, except End)
  const disconnected = getDisconnectedNodes(nodes, edges);
  for (const node of disconnected) {
    const data = node.data as Record<string, unknown>;
    const label = (data.title as string) || (data.endMessage as string) || node.id;
    errors.push(`Node "${label}" has no outgoing edges`);
  }
  
  // 4b. Check Decision node exact branches
  const decisionNodes = nodes.filter(n => n.type === 'decision');
  for (const dec of decisionNodes) {
    const outEdges = edges.filter(e => e.source === dec.id);
    const hasTrue = outEdges.some(e => e.sourceHandle === 'true');
    const hasFalse = outEdges.some(e => e.sourceHandle === 'false');
    if (!hasTrue || !hasFalse) {
      errors.push(`Decision Node "${(dec.data as Record<string, unknown>).title || dec.id}" must have both "Yes" and "No" outgoing edges connected.`);
    }
  }

  // 5. Check missing required fields
  const missingFields = getNodesWithMissingFields(nodes);
  for (const { nodeId, fields } of missingFields) {
    const node = nodes.find((n) => n.id === nodeId);
    const nodeData = node?.data as Record<string, unknown>;
    const label = (nodeData?.title as string) || (nodeData?.endMessage as string) || nodeId;
    warnings.push(`Node "${label}" is missing required fields: ${fields.join(', ')}`);
  }

  // 6. Check if graph is empty
  if (nodes.length === 0) {
    errors.push('Workflow is empty — add nodes to the canvas');
  }

  // 7. Detect fully disconnected nodes (no incoming AND no outgoing)
  if (nodes.length > 1) {
    const nodesWithOutgoing = new Set(edges.map((e) => e.source));
    const nodesWithIncoming = new Set(edges.map((e) => e.target));
    for (const node of nodes) {
      if (!nodesWithOutgoing.has(node.id) && !nodesWithIncoming.has(node.id)) {
        const data = node.data as Record<string, unknown>;
        const label = (data.title as string) || (data.endMessage as string) || node.id;
        errors.push(`Node "${label}" is completely disconnected — connect it to the workflow`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get per-node validation states for inline error display on nodes.
 */
export function getNodeValidationStates(
  nodes: Node[],
  edges: Edge[]
): Map<string, { errors: string[]; warnings: string[] }> {
  const states = new Map<string, { errors: string[]; warnings: string[] }>();

  // Initialize all nodes
  nodes.forEach((node) => states.set(node.id, { errors: [], warnings: [] }));

  // Start node validation
  const startNodes = nodes.filter((n) => n.type === 'start');
  if (startNodes.length > 1) {
    startNodes.forEach((n) =>
      states.get(n.id)?.errors.push('Only one Start node allowed')
    );
  }
  startNodes.forEach((n) => {
    if (edges.some((e) => e.target === n.id)) {
      states.get(n.id)?.errors.push('Start node cannot have incoming edges');
    }
  });

  // End node validation
  nodes
    .filter((n) => n.type === 'end')
    .forEach((n) => {
      if (edges.some((e) => e.source === n.id)) {
        states.get(n.id)?.warnings.push('End node should not have outgoing edges');
      }
    });

  // Disconnected nodes
  const nodesWithOutgoing = new Set(edges.map((e) => e.source));
  nodes.forEach((node) => {
    if (node.type !== 'end' && !nodesWithOutgoing.has(node.id)) {
      states.get(node.id)?.errors.push('No outgoing connections');
    }
    
    // Decision node branch check
    if (node.type === 'decision') {
      const outEdges = edges.filter((e) => e.source === node.id);
      const hasTrue = outEdges.some((e) => e.sourceHandle === 'true');
      const hasFalse = outEdges.some((e) => e.sourceHandle === 'false');
      if (!hasTrue || !hasFalse) {
        states.get(node.id)?.errors.push('Must have both True and False connections');
      }
    }
  });

  // Missing required fields
  const missingFields = getNodesWithMissingFields(nodes);
  missingFields.forEach(({ nodeId, fields }) => {
    states.get(nodeId)?.warnings.push(`Missing: ${fields.join(', ')}`);
  });

  return states;
}
