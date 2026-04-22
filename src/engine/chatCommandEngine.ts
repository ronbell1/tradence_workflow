// engine/chatCommandEngine.ts — Keyword-to-Workflow Mapping Engine
// Maps natural language commands to structured workflow templates with modifiers.
// No AI dependency — pure rule-based keyword matching.

import type { Node, Edge } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';

// ──────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────

export interface ParsedCommand {
  baseWorkflow: string;
  modifiers: ModifierMatch[];
  confidence: number; // 0–1 match quality
}

export interface ModifierMatch {
  type: 'escalation' | 'delay' | 'notification' | 'reminder' | 'rejection' | 'approval' | 'parallel' | 'condition';
  label: string;
  params: Record<string, string>;
}

export interface GeneratedWorkflow {
  nodes: Node[];
  edges: Edge[];
  description: string;
  appliedModifiers: string[];
  suggestions: Suggestion[];
}

export interface Suggestion {
  id: string;
  label: string;
  icon: string;
  command: string; // the command to run when clicked
}

// ──────────────────────────────────────────────────
// Base Workflow Templates
// ──────────────────────────────────────────────────

const edgeStyle = { stroke: '#6366f1', strokeWidth: 2 };

interface BaseTemplate {
  keywords: string[];
  name: string;
  description: string;
  buildNodes: () => { nodes: Node[]; edges: Edge[] };
  defaultSuggestions: Suggestion[];
}

const uid = () => uuidv4().slice(0, 8);

const baseTemplates: BaseTemplate[] = [
  {
    keywords: ['leave', 'time off', 'pto', 'vacation', 'absence', 'day off', 'leave request', 'leave approval'],
    name: 'Leave Approval',
    description: 'Employee leave request and approval workflow',
    buildNodes: () => {
      const ids = { start: `start-${uid()}`, submit: `task-${uid()}`, approval: `approval-${uid()}`, notify: `auto-${uid()}`, end: `end-${uid()}` };
      return {
        nodes: [
          { id: ids.start, type: 'start', position: { x: 350, y: 50 }, data: { type: 'start', title: 'Leave Request', metadata: [] } },
          { id: ids.submit, type: 'task', position: { x: 350, y: 200 }, data: { type: 'task', title: 'Submit Leave Form', assignee: 'Employee', dueDate: '', description: 'Employee submits leave request with dates and reason', customFields: [] } },
          { id: ids.approval, type: 'approval', position: { x: 350, y: 370 }, data: { type: 'approval', title: 'Manager Approval', approverRole: 'Manager' } },
          { id: ids.notify, type: 'automated', position: { x: 350, y: 540 }, data: { type: 'automated', title: 'Notify Team', actionId: 'send_slack', actionParams: { channel: '#team-updates', message: 'Leave approved for employee' } } },
          { id: ids.end, type: 'end', position: { x: 350, y: 700 }, data: { type: 'end', endMessage: 'Leave Processed', summaryFlag: true } },
        ],
        edges: [
          { id: `e-${uid()}`, source: ids.start, target: ids.submit, type: 'smart', animated: false, style: edgeStyle },
          { id: `e-${uid()}`, source: ids.submit, target: ids.approval, type: 'smart', animated: false, style: edgeStyle },
          { id: `e-${uid()}`, source: ids.approval, target: ids.notify, type: 'smart', animated: false, style: edgeStyle },
          { id: `e-${uid()}`, source: ids.notify, target: ids.end, type: 'smart', animated: false, style: edgeStyle },
        ],
      };
    },
    defaultSuggestions: [
      { id: 's1', label: 'Add escalation', icon: '⬆️', command: 'add escalation after 24h' },
      { id: 's2', label: 'Add rejection flow', icon: '❌', command: 'add rejection flow' },
      { id: 's3', label: 'Notify employee', icon: '📧', command: 'notify employee' },
      { id: 's4', label: 'Add reminder', icon: '⏰', command: 'add reminder after 24h' },
    ],
  },
  {
    keywords: ['onboarding', 'new hire', 'new employee', 'joining', 'induction', 'orientation'],
    name: 'Employee Onboarding',
    description: 'New hire onboarding and setup workflow',
    buildNodes: () => {
      const ids = { start: `start-${uid()}`, docs: `task-${uid()}`, approval: `approval-${uid()}`, welcome: `auto-${uid()}`, setup: `task-${uid()}`, end: `end-${uid()}` };
      return {
        nodes: [
          { id: ids.start, type: 'start', position: { x: 350, y: 50 }, data: { type: 'start', title: 'New Hire Onboarding', metadata: [] } },
          { id: ids.docs, type: 'task', position: { x: 350, y: 200 }, data: { type: 'task', title: 'Collect Documents', assignee: 'HR Coordinator', dueDate: '', description: 'Collect all required onboarding documents', customFields: [] } },
          { id: ids.approval, type: 'approval', position: { x: 350, y: 370 }, data: { type: 'approval', title: 'Manager Approval', approverRole: 'Manager' } },
          { id: ids.welcome, type: 'automated', position: { x: 350, y: 540 }, data: { type: 'automated', title: 'Send Welcome Email', actionId: 'send_email', actionParams: { to: 'new.hire@company.com', subject: 'Welcome aboard!' } } },
          { id: ids.setup, type: 'task', position: { x: 350, y: 700 }, data: { type: 'task', title: 'Setup Workstation', assignee: 'IT Support', dueDate: '', description: 'Prepare laptop, accounts, and access badges', customFields: [] } },
          { id: ids.end, type: 'end', position: { x: 350, y: 860 }, data: { type: 'end', endMessage: 'Onboarding Complete', summaryFlag: true } },
        ],
        edges: [
          { id: `e-${uid()}`, source: ids.start, target: ids.docs, type: 'smart', animated: false, style: edgeStyle },
          { id: `e-${uid()}`, source: ids.docs, target: ids.approval, type: 'smart', animated: false, style: edgeStyle },
          { id: `e-${uid()}`, source: ids.approval, target: ids.welcome, type: 'smart', animated: false, style: edgeStyle },
          { id: `e-${uid()}`, source: ids.welcome, target: ids.setup, type: 'smart', animated: false, style: edgeStyle },
          { id: `e-${uid()}`, source: ids.setup, target: ids.end, type: 'smart', animated: false, style: edgeStyle },
        ],
      };
    },
    defaultSuggestions: [
      { id: 's1', label: 'Add delay', icon: '⏳', command: 'add delay 48h' },
      { id: 's2', label: 'Add escalation', icon: '⬆️', command: 'add escalation after 72h' },
      { id: 's3', label: 'Notify team', icon: '📧', command: 'notify team' },
      { id: 's4', label: 'Add reminder', icon: '⏰', command: 'add reminder after 24h' },
    ],
  },
  {
    keywords: ['offboarding', 'exit', 'termination', 'resignation', 'leaving', 'separation'],
    name: 'Employee Offboarding',
    description: 'Employee exit and offboarding workflow',
    buildNodes: () => {
      const ids = { start: `start-${uid()}`, interview: `task-${uid()}`, handover: `task-${uid()}`, revoke: `auto-${uid()}`, assets: `task-${uid()}`, end: `end-${uid()}` };
      return {
        nodes: [
          { id: ids.start, type: 'start', position: { x: 350, y: 50 }, data: { type: 'start', title: 'Employee Exit', metadata: [] } },
          { id: ids.interview, type: 'task', position: { x: 350, y: 200 }, data: { type: 'task', title: 'Exit Interview', assignee: 'HRBP', dueDate: '', slaHours: 48, description: 'Conduct exit interview', customFields: [] } },
          { id: ids.handover, type: 'task', position: { x: 350, y: 370 }, data: { type: 'task', title: 'Knowledge Transfer', assignee: 'Team Lead', dueDate: '', slaHours: 72, description: 'Complete handover documentation', customFields: [] } },
          { id: ids.revoke, type: 'automated', position: { x: 350, y: 540 }, data: { type: 'automated', title: 'Revoke Access', actionId: 'update-hris', actionParams: { action: 'disable_access' } } },
          { id: ids.assets, type: 'task', position: { x: 350, y: 700 }, data: { type: 'task', title: 'Collect Assets', assignee: 'IT Support', dueDate: '', slaHours: 24, description: 'Retrieve company equipment', customFields: [] } },
          { id: ids.end, type: 'end', position: { x: 350, y: 860 }, data: { type: 'end', endMessage: 'Offboarding Complete', summaryFlag: true } },
        ],
        edges: [
          { id: `e-${uid()}`, source: ids.start, target: ids.interview, type: 'smart', animated: false, style: edgeStyle },
          { id: `e-${uid()}`, source: ids.interview, target: ids.handover, type: 'smart', animated: false, style: edgeStyle },
          { id: `e-${uid()}`, source: ids.handover, target: ids.revoke, type: 'smart', animated: false, style: edgeStyle },
          { id: `e-${uid()}`, source: ids.revoke, target: ids.assets, type: 'smart', animated: false, style: edgeStyle },
          { id: `e-${uid()}`, source: ids.assets, target: ids.end, type: 'smart', animated: false, style: edgeStyle },
        ],
      };
    },
    defaultSuggestions: [
      { id: 's1', label: 'Add delay', icon: '⏳', command: 'add delay 24h' },
      { id: 's2', label: 'Notify payroll', icon: '📧', command: 'notify payroll' },
      { id: 's3', label: 'Add reminder', icon: '⏰', command: 'add reminder after 12h' },
    ],
  },
  {
    keywords: ['performance', 'review', 'evaluation', 'appraisal', 'assessment', 'feedback cycle'],
    name: 'Performance Review',
    description: 'Employee performance evaluation cycle',
    buildNodes: () => {
      const ids = { start: `start-${uid()}`, self: `task-${uid()}`, mgr: `task-${uid()}`, review: `approval-${uid()}`, end: `end-${uid()}` };
      return {
        nodes: [
          { id: ids.start, type: 'start', position: { x: 350, y: 50 }, data: { type: 'start', title: 'Performance Review Cycle', metadata: [] } },
          { id: ids.self, type: 'task', position: { x: 350, y: 200 }, data: { type: 'task', title: 'Self Assessment', assignee: 'Employee', dueDate: '', slaHours: 120, description: 'Complete self-assessment form', customFields: [] } },
          { id: ids.mgr, type: 'task', position: { x: 350, y: 370 }, data: { type: 'task', title: 'Manager Evaluation', assignee: 'Manager', dueDate: '', slaHours: 72, description: 'Review and provide rating', customFields: [] } },
          { id: ids.review, type: 'approval', position: { x: 350, y: 540 }, data: { type: 'approval', title: 'HR Review', approverRole: 'HRBP', slaHours: 48 } },
          { id: ids.end, type: 'end', position: { x: 350, y: 700 }, data: { type: 'end', endMessage: 'Review Complete', summaryFlag: true } },
        ],
        edges: [
          { id: `e-${uid()}`, source: ids.start, target: ids.self, type: 'smart', animated: false, style: edgeStyle },
          { id: `e-${uid()}`, source: ids.self, target: ids.mgr, type: 'smart', animated: false, style: edgeStyle },
          { id: `e-${uid()}`, source: ids.mgr, target: ids.review, type: 'smart', animated: false, style: edgeStyle },
          { id: `e-${uid()}`, source: ids.review, target: ids.end, type: 'smart', animated: false, style: edgeStyle },
        ],
      };
    },
    defaultSuggestions: [
      { id: 's1', label: 'Add rejection flow', icon: '❌', command: 'add rejection flow' },
      { id: 's2', label: 'Add escalation', icon: '⬆️', command: 'add escalation after 48h' },
      { id: 's3', label: 'Add reminder', icon: '⏰', command: 'add reminder after 72h' },
    ],
  },
  {
    keywords: ['expense', 'reimbursement', 'claim', 'receipt', 'travel expense'],
    name: 'Expense Approval',
    description: 'Expense claim submission and approval workflow',
    buildNodes: () => {
      const ids = { start: `start-${uid()}`, submit: `task-${uid()}`, mgr: `approval-${uid()}`, finance: `approval-${uid()}`, pay: `auto-${uid()}`, end: `end-${uid()}` };
      return {
        nodes: [
          { id: ids.start, type: 'start', position: { x: 350, y: 50 }, data: { type: 'start', title: 'Expense Claim', metadata: [] } },
          { id: ids.submit, type: 'task', position: { x: 350, y: 200 }, data: { type: 'task', title: 'Submit Expense Report', assignee: 'Employee', dueDate: '', description: 'Attach receipts and fill expense details', customFields: [] } },
          { id: ids.mgr, type: 'approval', position: { x: 350, y: 370 }, data: { type: 'approval', title: 'Manager Approval', approverRole: 'Manager' } },
          { id: ids.finance, type: 'approval', position: { x: 350, y: 540 }, data: { type: 'approval', title: 'Finance Review', approverRole: 'Finance Team' } },
          { id: ids.pay, type: 'automated', position: { x: 350, y: 700 }, data: { type: 'automated', title: 'Process Reimbursement', actionId: 'setup-payroll', actionParams: { type: 'reimbursement' } } },
          { id: ids.end, type: 'end', position: { x: 350, y: 860 }, data: { type: 'end', endMessage: 'Expense Processed', summaryFlag: false } },
        ],
        edges: [
          { id: `e-${uid()}`, source: ids.start, target: ids.submit, type: 'smart', animated: false, style: edgeStyle },
          { id: `e-${uid()}`, source: ids.submit, target: ids.mgr, type: 'smart', animated: false, style: edgeStyle },
          { id: `e-${uid()}`, source: ids.mgr, target: ids.finance, type: 'smart', animated: false, style: edgeStyle },
          { id: `e-${uid()}`, source: ids.finance, target: ids.pay, type: 'smart', animated: false, style: edgeStyle },
          { id: `e-${uid()}`, source: ids.pay, target: ids.end, type: 'smart', animated: false, style: edgeStyle },
        ],
      };
    },
    defaultSuggestions: [
      { id: 's1', label: 'Add rejection flow', icon: '❌', command: 'add rejection flow' },
      { id: 's2', label: 'Notify employee', icon: '📧', command: 'notify employee' },
      { id: 's3', label: 'Add delay', icon: '⏳', command: 'add delay 48h' },
    ],
  },
  {
    keywords: ['transfer', 'relocation', 'department change', 'role change', 'position change'],
    name: 'Employee Transfer',
    description: 'Internal transfer and role change workflow',
    buildNodes: () => {
      const ids = { start: `start-${uid()}`, request: `task-${uid()}`, current: `approval-${uid()}`, new_mgr: `approval-${uid()}`, update: `auto-${uid()}`, end: `end-${uid()}` };
      return {
        nodes: [
          { id: ids.start, type: 'start', position: { x: 350, y: 50 }, data: { type: 'start', title: 'Transfer Request', metadata: [] } },
          { id: ids.request, type: 'task', position: { x: 350, y: 200 }, data: { type: 'task', title: 'Submit Transfer Request', assignee: 'Employee', dueDate: '', description: 'Submit internal transfer application', customFields: [] } },
          { id: ids.current, type: 'approval', position: { x: 350, y: 370 }, data: { type: 'approval', title: 'Current Manager Approval', approverRole: 'Current Manager' } },
          { id: ids.new_mgr, type: 'approval', position: { x: 350, y: 540 }, data: { type: 'approval', title: 'New Manager Approval', approverRole: 'New Manager' } },
          { id: ids.update, type: 'automated', position: { x: 350, y: 700 }, data: { type: 'automated', title: 'Update HRIS Records', actionId: 'update-hris', actionParams: { action: 'transfer' } } },
          { id: ids.end, type: 'end', position: { x: 350, y: 860 }, data: { type: 'end', endMessage: 'Transfer Complete', summaryFlag: true } },
        ],
        edges: [
          { id: `e-${uid()}`, source: ids.start, target: ids.request, type: 'smart', animated: false, style: edgeStyle },
          { id: `e-${uid()}`, source: ids.request, target: ids.current, type: 'smart', animated: false, style: edgeStyle },
          { id: `e-${uid()}`, source: ids.current, target: ids.new_mgr, type: 'smart', animated: false, style: edgeStyle },
          { id: `e-${uid()}`, source: ids.new_mgr, target: ids.update, type: 'smart', animated: false, style: edgeStyle },
          { id: `e-${uid()}`, source: ids.update, target: ids.end, type: 'smart', animated: false, style: edgeStyle },
        ],
      };
    },
    defaultSuggestions: [
      { id: 's1', label: 'Add escalation', icon: '⬆️', command: 'add escalation after 24h' },
      { id: 's2', label: 'Notify teams', icon: '📧', command: 'notify team' },
      { id: 's3', label: 'Add reminder', icon: '⏰', command: 'add reminder after 48h' },
    ],
  },
];

// ──────────────────────────────────────────────────
// Modifier Matchers
// ──────────────────────────────────────────────────

interface ModifierDefinition {
  keywords: string[];
  type: ModifierMatch['type'];
  label: string;
  extractParams: (input: string) => Record<string, string>;
  apply: (nodes: Node[], edges: Edge[], params: Record<string, string>) => { nodes: Node[]; edges: Edge[] };
}

const parseTimeValue = (input: string): string => {
  const match = input.match(/(\d+)\s*(h|hr|hrs|hour|hours|d|day|days|m|min|mins|minute|minutes)/i);
  if (!match) return '24';
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  if (unit.startsWith('d')) return String(value * 24);
  if (unit.startsWith('m')) return String(Math.ceil(value / 60));
  return String(value);
};

const modifiers: ModifierDefinition[] = [
  {
    keywords: ['escalation', 'escalate', 'director approval', 'vp approval', 'senior approval'],
    type: 'escalation',
    label: 'Escalation step added',
    extractParams: (input) => {
      const hours = parseTimeValue(input);
      const roleMatch = input.match(/escalat\w*\s+to\s+(\w+)/i);
      return { hours, role: roleMatch?.[1] || 'Director' };
    },
    apply: (nodes, edges, params) => {
      const lastEndIdx = nodes.findIndex(n => n.type === 'end');
      if (lastEndIdx === -1) return { nodes, edges };

      const endNode = nodes[lastEndIdx];
      const prevNodeEdge = edges.find(e => e.target === endNode.id);
      const escalationId = `approval-esc-${uid()}`;
      const delayId = `auto-delay-${uid()}`;

      const newNodes = [...nodes];
      const newEdges = edges.filter(e => e.target !== endNode.id || e.source !== prevNodeEdge?.source);

      // Shift end node down
      newNodes[lastEndIdx] = { ...endNode, position: { ...endNode.position, y: endNode.position.y + 340 } };

      // Insert delay + escalation before end
      const insertY = endNode.position.y;
      newNodes.push(
        {
          id: delayId, type: 'automated', position: { x: endNode.position.x, y: insertY },
          data: { type: 'automated', title: `Wait ${params.hours}h`, actionId: 'delay', actionParams: { hours: params.hours } },
        },
        {
          id: escalationId, type: 'approval', position: { x: endNode.position.x, y: insertY + 170 },
          data: { type: 'approval', title: `${params.role} Escalation`, approverRole: params.role, slaHours: parseInt(params.hours) },
        }
      );

      if (prevNodeEdge) {
        newEdges.push(
          { id: `e-${uid()}`, source: prevNodeEdge.source, target: delayId, type: 'smart', animated: false, style: edgeStyle },
        );
      }
      newEdges.push(
        { id: `e-${uid()}`, source: delayId, target: escalationId, type: 'smart', animated: false, style: edgeStyle },
        { id: `e-${uid()}`, source: escalationId, target: endNode.id, type: 'smart', animated: false, style: edgeStyle },
      );

      return { nodes: newNodes, edges: newEdges };
    },
  },
  {
    keywords: ['delay', 'wait', 'after', 'timeout', 'timer', 'pause'],
    type: 'delay',
    label: 'Time delay added',
    extractParams: (input) => ({ hours: parseTimeValue(input) }),
    apply: (nodes, edges, params) => {
      // Insert delay before end node
      const lastEndIdx = nodes.findIndex(n => n.type === 'end');
      if (lastEndIdx === -1) return { nodes, edges };

      const endNode = nodes[lastEndIdx];
      const prevEdge = edges.find(e => e.target === endNode.id);
      const delayId = `auto-delay-${uid()}`;

      const newNodes = [...nodes];
      const newEdges = edges.filter(e => e.target !== endNode.id || e.source !== prevEdge?.source);

      newNodes[lastEndIdx] = { ...endNode, position: { ...endNode.position, y: endNode.position.y + 170 } };

      newNodes.push({
        id: delayId, type: 'automated', position: { x: endNode.position.x, y: endNode.position.y },
        data: { type: 'automated', title: `Wait ${params.hours} hours`, actionId: 'delay', actionParams: { hours: params.hours } },
      });

      if (prevEdge) {
        newEdges.push({ id: `e-${uid()}`, source: prevEdge.source, target: delayId, type: 'smart', animated: false, style: edgeStyle });
      }
      newEdges.push({ id: `e-${uid()}`, source: delayId, target: endNode.id, type: 'smart', animated: false, style: edgeStyle });

      return { nodes: newNodes, edges: newEdges };
    },
  },
  {
    keywords: ['notify', 'notification', 'email', 'alert', 'send message', 'inform', 'notify employee', 'notify team', 'notify manager'],
    type: 'notification',
    label: 'Notification step added',
    extractParams: (input) => {
      const recipientMatch = input.match(/notify\s+(\w+)/i) || input.match(/email\s+(\w+)/i);
      return { recipient: recipientMatch?.[1] || 'employee' };
    },
    apply: (nodes, edges, params) => {
      const lastEndIdx = nodes.findIndex(n => n.type === 'end');
      if (lastEndIdx === -1) return { nodes, edges };

      const endNode = nodes[lastEndIdx];
      const prevEdge = edges.find(e => e.target === endNode.id);
      const notifyId = `auto-notify-${uid()}`;

      const newNodes = [...nodes];
      const newEdges = edges.filter(e => e.target !== endNode.id || e.source !== prevEdge?.source);

      newNodes[lastEndIdx] = { ...endNode, position: { ...endNode.position, y: endNode.position.y + 170 } };

      newNodes.push({
        id: notifyId, type: 'automated', position: { x: endNode.position.x, y: endNode.position.y },
        data: { type: 'automated', title: `Notify ${params.recipient}`, actionId: 'send_email', actionParams: { to: `${params.recipient}@company.com`, subject: 'Workflow update' } },
      });

      if (prevEdge) {
        newEdges.push({ id: `e-${uid()}`, source: prevEdge.source, target: notifyId, type: 'smart', animated: false, style: edgeStyle });
      }
      newEdges.push({ id: `e-${uid()}`, source: notifyId, target: endNode.id, type: 'smart', animated: false, style: edgeStyle });

      return { nodes: newNodes, edges: newEdges };
    },
  },
  {
    keywords: ['reminder', 'follow up', 'followup', 'nudge', 'ping'],
    type: 'reminder',
    label: 'Reminder step added',
    extractParams: (input) => ({ hours: parseTimeValue(input) }),
    apply: (nodes, edges, params) => {
      // Insert reminder as an automated step before the first approval
      const firstApprovalIdx = nodes.findIndex(n => n.type === 'approval');
      if (firstApprovalIdx === -1) return { nodes, edges };

      const approvalNode = nodes[firstApprovalIdx];
      const prevEdge = edges.find(e => e.target === approvalNode.id);
      const reminderId = `auto-remind-${uid()}`;

      const newNodes = [...nodes];
      const newEdges = edges.filter(e => e.target !== approvalNode.id || e.source !== prevEdge?.source);

      // Shift all nodes from approval onward down
      for (let i = 0; i < newNodes.length; i++) {
        if (newNodes[i].position.y >= approvalNode.position.y) {
          newNodes[i] = { ...newNodes[i], position: { ...newNodes[i].position, y: newNodes[i].position.y + 170 } };
        }
      }

      newNodes.push({
        id: reminderId, type: 'automated', position: { x: approvalNode.position.x, y: approvalNode.position.y - 170 },
        data: { type: 'automated', title: `Send Reminder (${params.hours}h)`, actionId: 'send_email', actionParams: { subject: `Reminder: Action needed within ${params.hours}h` } },
      });

      if (prevEdge) {
        newEdges.push({ id: `e-${uid()}`, source: prevEdge.source, target: reminderId, type: 'smart', animated: false, style: edgeStyle });
      }
      newEdges.push({ id: `e-${uid()}`, source: reminderId, target: approvalNode.id, type: 'smart', animated: false, style: edgeStyle });

      return { nodes: newNodes, edges: newEdges };
    },
  },
  {
    keywords: ['rejection', 'reject', 'denied', 'decline', 'rejection flow', 'rejection path'],
    type: 'rejection',
    label: 'Rejection flow added',
    extractParams: () => ({}),
    apply: (nodes, edges) => {
      // Find first approval and add a rejection branch
      const firstApproval = nodes.find(n => n.type === 'approval');
      if (!firstApproval) return { nodes, edges };

      const rejectTaskId = `task-reject-${uid()}`;
      const rejectNotifyId = `auto-reject-${uid()}`;
      const rejectEndId = `end-reject-${uid()}`;

      const offsetX = 280;
      const newNodes = [...nodes,
        {
          id: rejectTaskId, type: 'task', position: { x: firstApproval.position.x + offsetX, y: firstApproval.position.y + 120 },
          data: { type: 'task', title: 'Review Rejection', assignee: 'HR Coordinator', dueDate: '', description: 'Review and document rejection reason', customFields: [] },
        },
        {
          id: rejectNotifyId, type: 'automated', position: { x: firstApproval.position.x + offsetX, y: firstApproval.position.y + 290 },
          data: { type: 'automated', title: 'Notify Rejection', actionId: 'send_email', actionParams: { subject: 'Request has been rejected' } },
        },
        {
          id: rejectEndId, type: 'end', position: { x: firstApproval.position.x + offsetX, y: firstApproval.position.y + 450 },
          data: { type: 'end', endMessage: 'Request Rejected', summaryFlag: false },
        },
      ];

      const newEdges = [...edges,
        { id: `e-rej-${uid()}`, source: firstApproval.id, target: rejectTaskId, type: 'smart', animated: false, style: { ...edgeStyle, stroke: '#f04438' }, label: 'Rejected' },
        { id: `e-rej-${uid()}`, source: rejectTaskId, target: rejectNotifyId, type: 'smart', animated: false, style: { ...edgeStyle, stroke: '#f04438' } },
        { id: `e-rej-${uid()}`, source: rejectNotifyId, target: rejectEndId, type: 'smart', animated: false, style: { ...edgeStyle, stroke: '#f04438' } },
      ];

      return { nodes: newNodes, edges: newEdges };
    },
  },
];

// ──────────────────────────────────────────────────
// Modifier-only commands (applied to existing workflow)
// ──────────────────────────────────────────────────

export interface ModifierResult {
  nodes: Node[];
  edges: Edge[];
  appliedModifiers: string[];
  suggestions: Suggestion[];
}

export function applyModifiersToExisting(
  input: string,
  existingNodes: Node[],
  existingEdges: Edge[]
): ModifierResult | null {
  const lower = input.toLowerCase().trim();
  let currentNodes = [...existingNodes];
  let currentEdges = [...existingEdges];
  const applied: string[] = [];

  for (const mod of modifiers) {
    const matched = mod.keywords.some(kw => lower.includes(kw));
    if (matched) {
      const params = mod.extractParams(lower);
      const result = mod.apply(currentNodes, currentEdges, params);
      currentNodes = result.nodes;
      currentEdges = result.edges;
      applied.push(mod.label);
    }
  }

  if (applied.length === 0) return null;

  return {
    nodes: currentNodes,
    edges: currentEdges,
    appliedModifiers: applied,
    suggestions: [
      { id: 's1', label: 'Add notification', icon: '📧', command: 'add employee notification' },
      { id: 's2', label: 'Add reminder', icon: '⏰', command: 'add reminder after 12h' },
      { id: 's3', label: 'Add escalation', icon: '⬆️', command: 'add escalation after 48h' },
    ],
  };
}

// ──────────────────────────────────────────────────
// Main Parser
// ──────────────────────────────────────────────────

export function parseCommand(input: string): ParsedCommand | null {
  const lower = input.toLowerCase().trim();
  if (!lower) return null;

  // Find best matching base template
  let bestMatch: BaseTemplate | null = null;
  let bestScore = 0;

  for (const template of baseTemplates) {
    let score = 0;
    for (const kw of template.keywords) {
      if (lower.includes(kw)) {
        score += kw.length; // prefer longer matches
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = template;
    }
  }

  if (!bestMatch) return null;

  // Find matching modifiers
  const matchedModifiers: ModifierMatch[] = [];
  for (const mod of modifiers) {
    const matched = mod.keywords.some(kw => lower.includes(kw));
    if (matched) {
      const params = mod.extractParams(lower);
      matchedModifiers.push({ type: mod.type, label: mod.label, params });
    }
  }

  const confidence = Math.min(1, (bestScore / 10) * 0.7 + (matchedModifiers.length > 0 ? 0.3 : 0));

  return {
    baseWorkflow: bestMatch.name,
    modifiers: matchedModifiers,
    confidence,
  };
}

export function generateWorkflow(input: string): GeneratedWorkflow | null {
  const lower = input.toLowerCase().trim();
  if (!lower) return null;

  // Find best matching base template
  let bestMatch: BaseTemplate | null = null;
  let bestScore = 0;

  for (const template of baseTemplates) {
    let score = 0;
    for (const kw of template.keywords) {
      if (lower.includes(kw)) {
        score += kw.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = template;
    }
  }

  if (!bestMatch) return null;

  // Build base workflow
  let { nodes, edges } = bestMatch.buildNodes();
  const appliedModifiers: string[] = [];

  // Apply modifiers
  for (const mod of modifiers) {
    const matched = mod.keywords.some(kw => lower.includes(kw));
    if (matched) {
      const params = mod.extractParams(lower);
      const result = mod.apply(nodes, edges, params);
      nodes = result.nodes;
      edges = result.edges;
      appliedModifiers.push(mod.label);
    }
  }

  // Build description
  const parts = [`Base: ${bestMatch.name}`];
  if (appliedModifiers.length > 0) {
    parts.push(`Modifiers: ${appliedModifiers.join(', ')}`);
  }

  return {
    nodes,
    edges,
    description: parts.join(' • '),
    appliedModifiers,
    suggestions: bestMatch.defaultSuggestions,
  };
}

// ──────────────────────────────────────────────────
// Autocomplete Suggestions
// ──────────────────────────────────────────────────

export interface AutocompleteSuggestion {
  text: string;
  description: string;
  category: 'workflow' | 'modifier';
}

export function getAutocompleteSuggestions(input: string): AutocompleteSuggestion[] {
  const lower = input.toLowerCase().trim();
  if (!lower || lower.length < 2) return [];

  const results: AutocompleteSuggestion[] = [];

  for (const template of baseTemplates) {
    for (const kw of template.keywords) {
      if (kw.includes(lower) || lower.includes(kw)) {
        results.push({ text: kw, description: template.description, category: 'workflow' });
        break; // one per template
      }
    }
  }

  // Modifier suggestions
  const modifierSuggestions = [
    { text: 'with escalation after 24h', description: 'Adds escalation timer', category: 'modifier' as const },
    { text: 'with reminder', description: 'Add a reminder step', category: 'modifier' as const },
    { text: 'with notification', description: 'Send notifications', category: 'modifier' as const },
    { text: 'with rejection flow', description: 'Add rejection branch', category: 'modifier' as const },
    { text: 'with delay 48h', description: 'Add time delay', category: 'modifier' as const },
  ];

  for (const s of modifierSuggestions) {
    if (s.text.includes(lower) || lower.includes(s.text.split(' ')[1])) {
      results.push(s);
    }
  }

  return results.slice(0, 6);
}

// Example command strings for UI hints
export const exampleCommands = [
  'leave approval with escalation after 24h',
  'onboarding workflow with notification',
  'offboarding with reminder after 48h',
  'performance review with rejection flow',
  'expense approval with delay 72h',
  'employee transfer with escalation',
];
