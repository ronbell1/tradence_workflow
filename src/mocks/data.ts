// mocks/data.ts — Mock data for API responses

import type { Automation } from '../types/api';

/**
 * Mock automations returned by GET /automations.
 * Each has an id, label, and dynamic params array.
 */
export const mockAutomations: Automation[] = [
  {
    id: 'send_email',
    label: 'Send Email',
    params: ['to', 'subject'],
  },
  {
    id: 'generate_doc',
    label: 'Generate Document',
    params: ['template', 'recipient'],
  },
  {
    id: 'send_slack',
    label: 'Send Slack Message',
    params: ['channel', 'message'],
  },
  {
    id: 'create_ticket',
    label: 'Create Ticket',
    params: ['title', 'priority', 'assignee'],
  },
  {
    id: 'update_hris',
    label: 'Update HRIS Record',
    params: ['employeeId', 'field', 'value'],
  },
];

/**
 * Mock simulation handler — walks the graph and produces step-by-step execution log.
 * Performs a topological traversal starting from the Start node.
 */
export function simulateWorkflowExecution(
  nodes: { id: string; type: string; data: Record<string, unknown> }[],
  edges: { id: string; source: string; target: string }[]
): {
  success: boolean;
  steps: { nodeId: string; type: string; status: string; message: string }[];
  errors: string[];
} {
  const steps: { nodeId: string; type: string; status: string; message: string }[] = [];
  const errors: string[] = [];

  // Find start node
  const startNode = nodes.find((n) => n.type === 'start');
  if (!startNode) {
    return { success: false, steps: [], errors: ['No start node found'] };
  }

  // Build adjacency map
  const adjacency = new Map<string, string[]>();
  nodes.forEach((n) => adjacency.set(n.id, []));
  edges.forEach((e) => {
    adjacency.get(e.source)?.push(e.target);
  });

  // BFS traversal from start
  const visited = new Set<string>();
  const queue: string[] = [startNode.id];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const node = nodes.find((n) => n.id === currentId);
    if (!node) continue;

    const data = node.data as Record<string, unknown>;

    // Generate step message based on node type
    let message = '';
    let status: 'completed' | 'pending' | 'error' = 'completed';

    switch (node.type) {
      case 'start':
        message = `Workflow started: ${data.title || 'Untitled'}`;
        break;
      case 'task': {
        const assignee = data.assignee || 'Unassigned';
        message = `Task "${data.title || 'Untitled'}" assigned to ${assignee}`;
        if (!data.assignee) {
          status = 'error';
          errors.push(`Task node "${data.title}" has no assignee`);
        }
        break;
      }
      case 'approval': {
        const role = data.approverRole || 'Unknown';
        const threshold = data.autoApproveThreshold;
        if (threshold && typeof threshold === 'number' && threshold > 0) {
          message = `Auto-approved by ${role} (threshold: ${threshold})`;
        } else {
          message = `Awaiting ${role} approval`;
          status = 'pending';
        }
        break;
      }
      case 'automated': {
        const actionId = data.actionId || 'unknown';
        const automation = mockAutomations.find((a) => a.id === actionId);
        message = `Executing automated action: ${automation?.label || actionId}`;
        break;
      }
      case 'end':
        message = `Workflow completed: ${data.endMessage || 'Done'}`;
        break;
      default:
        message = `Processing node ${currentId}`;
    }

    steps.push({
      nodeId: currentId,
      type: node.type,
      status,
      message,
    });

    // Enqueue neighbors
    const neighbors = adjacency.get(currentId) || [];
    neighbors.forEach((n) => {
      if (!visited.has(n)) queue.push(n);
    });
  }

  // Check unvisited nodes
  const unvisited = nodes.filter((n) => !visited.has(n.id));
  if (unvisited.length > 0) {
    unvisited.forEach((n) => {
      const data = n.data as Record<string, unknown>;
      errors.push(
        `Node "${data.title || data.endMessage || n.id}" is not reachable from Start`
      );
    });
  }

  return {
    success: errors.length === 0,
    steps,
    errors,
  };
}
