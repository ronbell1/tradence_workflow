// components/NodeForms/NodeFormRegistry.ts — Form component registry
// Maps NodeType → FormComponent so adding a new type only requires
// adding an entry here, not changing the panel logic.

import type { ComponentType } from 'react';
import StartForm from './StartForm';
import TaskForm from './TaskForm';
import ApprovalForm from './ApprovalForm';
import AutomatedStepForm from './AutomatedStepForm';
import EndForm from './EndForm';

interface FormComponentProps {
  nodeId: string;
  data: Record<string, unknown>;
  onChange: (nodeId: string, data: Record<string, unknown>) => void;
  onDelete: (nodeId: string) => void;
}

/**
 * NodeFormRegistry — extensible map of NodeType → FormComponent.
 * To add a new node type: create a form component and register it here.
 */
const NodeFormRegistry: Record<string, ComponentType<FormComponentProps>> = {
  start: StartForm as unknown as ComponentType<FormComponentProps>,
  task: TaskForm as unknown as ComponentType<FormComponentProps>,
  approval: ApprovalForm as unknown as ComponentType<FormComponentProps>,
  automated: AutomatedStepForm as unknown as ComponentType<FormComponentProps>,
  end: EndForm as unknown as ComponentType<FormComponentProps>,
};

export default NodeFormRegistry;
