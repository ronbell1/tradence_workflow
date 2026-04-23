// types/nodes.ts — All TypeScript types for workflow nodes

export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end' | 'decision';

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
  slaHours?: number;
  checklist?: string[];
  customFields: KeyValuePair[];
}

export interface ApprovalNodeData {
  title: string;
  approverRole: string; // "Manager" | "HRBP" | "Director" or free text
  autoApproveThreshold?: number;
  slaHours?: number;
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

export interface DecisionNodeData {
  title: string;
  conditionVariable: string;
  conditionOperator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  conditionValue: string;
}



// Discriminated union for type-safe node data access
export type WorkflowNodeData =
  | ({ type: 'start' } & StartNodeData)
  | ({ type: 'task' } & TaskNodeData)
  | ({ type: 'approval' } & ApprovalNodeData)
  | ({ type: 'automated' } & AutomatedNodeData)
  | ({ type: 'end' } & EndNodeData)
  | ({ type: 'decision' } & DecisionNodeData);

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
