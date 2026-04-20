// data/templates.ts — Preset workflow templates
// Pre-built graphs for common HR workflows

import type { Node, Edge } from '@xyflow/react';
import { UserPlus, Plane, FileCheck } from 'lucide-react';
import * as React from 'react';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  nodes: Node[];
  edges: Edge[];
}

const edgeStyle = { stroke: '#6366f1', strokeWidth: 2 };

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'onboarding',
    name: 'Employee Onboarding',
    description: 'Standard new hire onboarding workflow',
    icon: <UserPlus size={24} className="text-blue-500" />,
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 300, y: 50 },
        data: { type: 'start', title: 'New Hire Onboarding', metadata: [] },
      },
      {
        id: 'task-1',
        type: 'task',
        position: { x: 300, y: 200 },
        data: {
          type: 'task',
          title: 'Collect Documents',
          assignee: 'HR Coordinator',
          dueDate: '2026-05-01',
          description: 'Collect all required onboarding documents from new hire',
          customFields: [],
        },
      },
      {
        id: 'approval-1',
        type: 'approval',
        position: { x: 300, y: 370 },
        data: {
          type: 'approval',
          title: 'Manager Approval',
          approverRole: 'Manager',
          autoApproveThreshold: undefined,
        },
      },
      {
        id: 'auto-1',
        type: 'automated',
        position: { x: 300, y: 540 },
        data: {
          type: 'automated',
          title: 'Send Welcome Email',
          actionId: 'send_email',
          actionParams: { to: 'new.hire@company.com', subject: 'Welcome aboard!' },
        },
      },
      {
        id: 'task-2',
        type: 'task',
        position: { x: 300, y: 700 },
        data: {
          type: 'task',
          title: 'Setup Workstation',
          assignee: 'IT Support',
          dueDate: '2026-05-03',
          description: 'Prepare laptop, accounts, and access badges',
          customFields: [],
        },
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 300, y: 860 },
        data: { type: 'end', endMessage: 'Onboarding Complete', summaryFlag: true },
      },
    ],
    edges: [
      { id: 'e-s1-t1', source: 'start-1', target: 'task-1', type: 'smoothstep', animated: true, style: edgeStyle },
      { id: 'e-t1-a1', source: 'task-1', target: 'approval-1', type: 'smoothstep', animated: true, style: edgeStyle },
      { id: 'e-a1-au1', source: 'approval-1', target: 'auto-1', type: 'smoothstep', animated: true, style: edgeStyle },
      { id: 'e-au1-t2', source: 'auto-1', target: 'task-2', type: 'smoothstep', animated: true, style: edgeStyle },
      { id: 'e-t2-e1', source: 'task-2', target: 'end-1', type: 'smoothstep', animated: true, style: edgeStyle },
    ],
  },
  {
    id: 'leave-approval',
    name: 'Leave Approval',
    description: 'Employee leave request and approval flow',
    icon: <Plane size={24} className="text-orange-500" />,
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 300, y: 50 },
        data: { type: 'start', title: 'Leave Request', metadata: [] },
      },
      {
        id: 'task-1',
        type: 'task',
        position: { x: 300, y: 200 },
        data: {
          type: 'task',
          title: 'Submit Leave Form',
          assignee: 'Employee',
          dueDate: '',
          description: 'Employee fills out leave request form',
          customFields: [],
        },
      },
      {
        id: 'approval-1',
        type: 'approval',
        position: { x: 300, y: 370 },
        data: {
          type: 'approval',
          title: 'Manager Review',
          approverRole: 'Manager',
          autoApproveThreshold: undefined,
        },
      },
      {
        id: 'approval-2',
        type: 'approval',
        position: { x: 300, y: 540 },
        data: {
          type: 'approval',
          title: 'HRBP Final Approval',
          approverRole: 'HRBP',
          autoApproveThreshold: 3,
        },
      },
      {
        id: 'auto-1',
        type: 'automated',
        position: { x: 300, y: 710 },
        data: {
          type: 'automated',
          title: 'Notify Team',
          actionId: 'send_slack',
          actionParams: { channel: '#team-updates', message: 'Leave approved' },
        },
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 300, y: 870 },
        data: { type: 'end', endMessage: 'Leave Processed', summaryFlag: false },
      },
    ],
    edges: [
      { id: 'e-s1-t1', source: 'start-1', target: 'task-1', type: 'smoothstep', animated: true, style: edgeStyle },
      { id: 'e-t1-a1', source: 'task-1', target: 'approval-1', type: 'smoothstep', animated: true, style: edgeStyle },
      { id: 'e-a1-a2', source: 'approval-1', target: 'approval-2', type: 'smoothstep', animated: true, style: edgeStyle },
      { id: 'e-a2-au1', source: 'approval-2', target: 'auto-1', type: 'smoothstep', animated: true, style: edgeStyle },
      { id: 'e-au1-e1', source: 'auto-1', target: 'end-1', type: 'smoothstep', animated: true, style: edgeStyle },
    ],
  },
  {
    id: 'offboarding',
    name: 'Employee Offboarding',
    description: 'Standard exit and offboarding workflow',
    icon: <FileCheck size={24} className="text-purple-500" />,
    nodes: [
      {
        id: 'start-1', type: 'start', position: { x: 300, y: 50 },
        data: { type: 'start', title: 'Employee Exit', metadata: [] },
      },
      {
        id: 'task-1', type: 'task', position: { x: 300, y: 200 },
        data: { type: 'task', title: 'Exit Interview', assignee: 'HRBP', dueDate: '', slaHours: 48, description: 'Conduct exit interview', customFields: [] },
      },
      {
        id: 'task-2', type: 'task', position: { x: 300, y: 370 },
        data: { type: 'task', title: 'Knowledge Transfer', assignee: 'Team Lead', dueDate: '', slaHours: 72, description: 'Complete handover documentation', customFields: [] },
      },
      {
        id: 'auto-1', type: 'automated', position: { x: 300, y: 540 },
        data: { type: 'automated', title: 'Revoke System Access', actionId: 'update-hris', actionParams: { action: 'disable_access' } },
      },
      {
        id: 'task-3', type: 'task', position: { x: 300, y: 710 },
        data: { type: 'task', title: 'Collect Assets', assignee: 'IT Support', dueDate: '', slaHours: 24, checklist: ['Laptop', 'Access Badge', 'Parking Pass', 'Company Phone'], description: 'Retrieve all company assets', customFields: [] },
      },
      {
        id: 'auto-2', type: 'automated', position: { x: 300, y: 880 },
        data: { type: 'automated', title: 'Process Final Pay', actionId: 'setup-payroll', actionParams: { type: 'final_settlement' } },
      },
      {
        id: 'end-1', type: 'end', position: { x: 300, y: 1040 },
        data: { type: 'end', endMessage: 'Offboarding Complete', summaryFlag: true },
      },
    ],
    edges: [
      { id: 'e-s1-t1', source: 'start-1', target: 'task-1', type: 'smart', animated: false, style: edgeStyle },
      { id: 'e-t1-t2', source: 'task-1', target: 'task-2', type: 'smart', animated: false, style: edgeStyle },
      { id: 'e-t2-au1', source: 'task-2', target: 'auto-1', type: 'smart', animated: false, style: edgeStyle },
      { id: 'e-au1-t3', source: 'auto-1', target: 'task-3', type: 'smart', animated: false, style: edgeStyle },
      { id: 'e-t3-au2', source: 'task-3', target: 'auto-2', type: 'smart', animated: false, style: edgeStyle },
      { id: 'e-au2-e1', source: 'auto-2', target: 'end-1', type: 'smart', animated: false, style: edgeStyle },
    ],
  },
  {
    id: 'performance-review',
    name: 'Performance Review',
    description: 'Quarterly performance evaluation cycle',
    icon: <FileCheck size={24} className="text-green-500" />,
    nodes: [
      {
        id: 'start-1', type: 'start', position: { x: 300, y: 50 },
        data: { type: 'start', title: 'Performance Review Cycle', metadata: [] },
      },
      {
        id: 'task-1', type: 'task', position: { x: 300, y: 200 },
        data: { type: 'task', title: 'Self Assessment', assignee: 'Employee', dueDate: '', slaHours: 120, description: 'Complete self-assessment form', customFields: [] },
      },
      {
        id: 'task-2', type: 'task', position: { x: 300, y: 370 },
        data: { type: 'task', title: 'Manager Evaluation', assignee: 'Manager', dueDate: '', slaHours: 72, description: 'Review employee performance and provide rating', customFields: [] },
      },
      {
        id: 'decision-1', type: 'decision', position: { x: 300, y: 540 },
        data: { type: 'decision', title: 'Rating Check', conditionVariable: 'rating', conditionOperator: 'greater_than', conditionValue: '3' },
      },
      {
        id: 'approval-1', type: 'approval', position: { x: 100, y: 720 },
        data: { type: 'approval', title: 'Promotion Approval', approverRole: 'Director', slaHours: 48 },
      },
      {
        id: 'task-3', type: 'task', position: { x: 500, y: 720 },
        data: { type: 'task', title: 'Create PIP', assignee: 'HRBP', dueDate: '', slaHours: 48, description: 'Create Performance Improvement Plan', customFields: [] },
      },
      {
        id: 'end-1', type: 'end', position: { x: 300, y: 900 },
        data: { type: 'end', endMessage: 'Review Cycle Complete', summaryFlag: true },
      },
    ],
    edges: [
      { id: 'e-s1-t1', source: 'start-1', target: 'task-1', type: 'smart', animated: false, style: edgeStyle },
      { id: 'e-t1-t2', source: 'task-1', target: 'task-2', type: 'smart', animated: false, style: edgeStyle },
      { id: 'e-t2-d1', source: 'task-2', target: 'decision-1', type: 'smart', animated: false, style: edgeStyle },
      { id: 'e-d1-a1', source: 'decision-1', sourceHandle: 'true', target: 'approval-1', type: 'smart', animated: false, style: edgeStyle },
      { id: 'e-d1-t3', source: 'decision-1', sourceHandle: 'false', target: 'task-3', type: 'smart', animated: false, style: edgeStyle },
      { id: 'e-a1-e1', source: 'approval-1', target: 'end-1', type: 'smart', animated: false, style: edgeStyle },
      { id: 'e-t3-e1', source: 'task-3', target: 'end-1', type: 'smart', animated: false, style: edgeStyle },
    ],
  },
];
