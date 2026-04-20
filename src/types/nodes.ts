// types/nodes.ts — All TypeScript types for workflow nodes

export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end';

export interface KeyValuePair {
  id: string; // uuid for React key
  key: string;
  value: string;
}

// Per-node data interfaces
export interface StartNodeData {
  title: string;
  metadata: KeyValuePair[];
}

export interface TaskNodeData {
  title: string;
  description?: string;
  assignee: string;
  dueDate: string;
  customFields: KeyValuePair[];
}

export interface ApprovalNodeData {
  title: string;
  approverRole: string; // "Manager" | "HRBP" | "Director" or free text
  autoApproveThreshold?: number;
}

export interface AutomatedNodeData {
  title: string;
  actionId: string;
  actionParams: Record<string, string>;
}

export interface EndNodeData {
  endMessage: string;
  summaryFlag: boolean;
}

// Discriminated union for type-safe node data access
export type WorkflowNodeData =
  | ({ type: 'start' } & StartNodeData)
  | ({ type: 'task' } & TaskNodeData)
  | ({ type: 'approval' } & ApprovalNodeData)
  | ({ type: 'automated' } & AutomatedNodeData)
  | ({ type: 'end' } & EndNodeData);

// Node form props — generic interface consumed by all form components
export interface NodeFormProps<T = WorkflowNodeData> {
  nodeId: string;
  data: T;
  onChange: (nodeId: string, data: Partial<T>) => void;
  onDelete: (nodeId: string) => void;
}

// Validation state for inline node validation
export interface NodeValidationState {
  nodeId: string;
  errors: string[];
  warnings: string[];
}
