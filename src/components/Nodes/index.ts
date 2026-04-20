// components/Nodes/index.ts — Node type registry for React Flow

import type { NodeTypes } from '@xyflow/react';
import StartNode from './StartNode';
import TaskNode from './TaskNode';
import ApprovalNode from './ApprovalNode';
import AutomatedNode from './AutomatedNode';
import EndNode from './EndNode';

/**
 * All 5 custom node types registered for React Flow's nodeTypes prop.
 * Adding a new node type = add component + register here.
 */
export const nodeTypes: NodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode,
};
