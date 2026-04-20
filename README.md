# 🏗️ HR Workflow Designer — Tredence Studio

A mini HR Workflow Designer module where an HR admin can visually create and test internal workflows — such as onboarding, leave approval, or document verification.

Built with **React + TypeScript + React Flow** (Vite).

---

## 🚀 How to Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

**Requirements:** Node.js 18+

---

## 🏛️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        App.tsx (Orchestrator)                   │
│  ┌──────────┐  ┌──────────────────┐  ┌───────────────────────┐ │
│  │  Sidebar  │  │   WorkflowCanvas │  │   Right Panel         │ │
│  │  (Palette)│  │   (React Flow)   │  │  ┌─────────────────┐  │ │
│  │           │  │                  │  │  │ NodeFormPanel    │  │ │
│  │ Drag src  │──│  Custom Nodes    │──│  │ (NodeFormReg.)   │  │ │
│  │ for nodes │  │  + Edge mgmt     │  │  ├─────────────────┤  │ │
│  │           │  │  + Validation    │  │  │ SimulationPanel  │  │ │
│  └──────────┘  └──────────────────┘  │  │ (ExecutionLog)   │  │ │
│                                       │  └─────────────────┘  │ │
│                                       └───────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                        Hooks Layer                              │
│  useWorkflow.ts ← main state   │  useSimulation.ts ← POST     │
│  useAutomations.ts ← GET       │  useHistory.ts ← undo/redo   │
├─────────────────────────────────────────────────────────────────┤
│                    API Abstraction Layer                        │
│  api/workflowApi.ts ← getAutomations(), simulateWorkflow()     │
├─────────────────────────────────────────────────────────────────┤
│                    Mock Data Layer                              │
│  mocks/data.ts ← mockAutomations, simulateWorkflowExecution()  │
├─────────────────────────────────────────────────────────────────┤
│                    Utilities                                    │
│  utils/graphValidation.ts ← hasStartNode, hasCycle, validate   │
└─────────────────────────────────────────────────────────────────┘
```

### Folder Structure

```
src/
├── api/                    ← All API calls (workflowApi.ts)
├── components/
│   ├── Canvas/             ← WorkflowCanvas.tsx
│   ├── Nodes/              ← StartNode, TaskNode, ApprovalNode,
│   │                         AutomatedNode, EndNode, index.ts
│   ├── NodeForms/          ← NodeFormPanel, NodeFormRegistry,
│   │                         StartForm, TaskForm, ApprovalForm,
│   │                         AutomatedStepForm, EndForm
│   ├── Sidebar/            ← NodePalette.tsx (drag source)
│   └── Sandbox/            ← SimulationPanel, ExecutionLog
├── data/                   ← templates.ts (preset workflows)
├── hooks/
│   ├── useWorkflow.ts      ← main flow state hook
│   ├── useSimulation.ts    ← POST /simulate logic
│   ├── useAutomations.ts   ← GET /automations
│   └── useHistory.ts       ← undo/redo stack
├── mocks/                  ← In-memory mock data & simulation logic
├── types/
│   ├── nodes.ts            ← NodeType union, per-node data interfaces
│   └── api.ts              ← Automation, SimulationResult, WorkflowGraph
└── utils/
    └── graphValidation.ts  ← hasStartNode, hasCycle, validateWorkflow
```

---

## 🎯 Design Decisions

### Why Vite over Next.js?
This is a **single-page application** — no SSR, routing, or server-side features are needed. Vite provides the fastest DX with HMR and zero-config TypeScript support.

### Why in-memory mocks vs MSW/JSON Server?
In-memory async mocks (`api/workflowApi.ts` wrapping `mocks/data.ts`) provide the simplest setup with zero additional dependencies. The API abstraction layer means swapping to a real backend only requires changing `workflowApi.ts` — no component changes needed.

### Why discriminated union for node data?
```typescript
export type WorkflowNodeData =
  | ({ type: 'start' } & StartNodeData)
  | ({ type: 'task' } & TaskNodeData)
  // ...
```
This enables type-safe field access via TypeScript's type narrowing. When switching on `type`, all fields are statically known — eliminating runtime errors.

### Why NodeFormRegistry pattern?
```typescript
const NodeFormRegistry: Record<string, ComponentType<FormComponentProps>> = {
  start: StartForm,
  task: TaskForm,
  // Adding a new node type = add ONE entry here
};
```
This makes the form system **extensible** — adding a new node type requires:
1. A new data interface in `types/nodes.ts`
2. A new form component
3. One entry in the registry

No panel logic changes needed.

### Why controlled components?
All form inputs are controlled — their values flow from React Flow node state. This ensures:
- Single source of truth (node data)
- Real-time canvas label updates when editing
- Easy serialization for the simulation API

---

## ✅ Completed Features

### Core (All Required)
- [x] **5 Custom Node Types** — Start (🟢), Task (📋), Approval (✅), Automated (⚡), End (🔴)
- [x] **Drag-and-Drop** — Sidebar palette → canvas via `onDrop` + `screenToFlowPosition`
- [x] **Edge Connections** — SmoothStep edges with animated styling
- [x] **Node Selection → Edit Panel** — Click node to open right-side config form
- [x] **Delete Nodes/Edges** — Backspace/Delete key + delete button in forms
- [x] **Node Config Forms** — Controlled components with all required fields per type
- [x] **Key-Value Dynamic Fields** — Task + Start nodes support add/remove metadata pairs
- [x] **Dynamic Params (Automated)** — Params rendered from `action.params` array (from API)
- [x] **Approval Role** — Dropdown (Manager/HRBP/Director) + custom free text entry
- [x] **Mock API Layer** — `GET /automations` (5 actions) + `POST /simulate`
- [x] **Pre-Simulate Validation** — Start node check, cycle detection (DFS), disconnected nodes, missing required fields
- [x] **Sandbox Panel** — Serialize graph → validate → POST /simulate → timeline execution log
- [x] **TypeScript Types** — Discriminated union, per-node data interfaces, API types

### Bonus Features (Strategic Additions)
- [x] **Export/Import Workflow as JSON** — Save/Load button for workflow persistence
- [x] **Inline Validation Badges** — Red indicator on nodes with errors/warnings
- [x] **MiniMap + Zoom Controls + Background** — Full React Flow polish
- [x] **Preset Templates** — 3 templates (Onboarding, Leave Approval, Document Verification)
- [x] **Undo/Redo** — Ctrl+Z/Ctrl+Y via snapshot history stack
- [x] **Animated Simulation Playback** — Nodes glow/pulse step-by-step during simulation
- [x] **Dark Theme** — Consistent design system with CSS variables, color-coded node types

---

## 🔮 What I Would Add Next

1. **Condition-based branching edges** — Approval → Yes/No paths with conditional edge labels
2. **AI Node Type** — An "AI Agent" node that can call LLM APIs for decision-making
3. **Real persistence layer** — Save/load workflows from a database
4. **Multi-user collaboration** — Real-time editing with WebSockets
5. **Node grouping/sub-workflows** — Collapse groups of nodes into reusable sub-flows
6. **Execution history** — Timeline of past simulation runs with diff comparison
7. **Role-based access control** — Different permissions per user role
8. **Unit/integration tests** — React Testing Library for forms, Cypress for E2E

---

## 📝 Assumptions Made

- **Workflows are DAGs** — No cycles allowed. This assumption is validated before simulation.
- **Single Start Node** — Only one per workflow, enforced in validation.
- **Start nodes have no incoming edges** — Validated.
- **End nodes have no outgoing edges** — Warned (not blocked).
- **Auto-approve threshold** — Treated as a minimum score above which approval is automatic.
- **No authentication** — As specified in the PRD.
- **No real backend** — All data is in-memory with async wrappers simulating API behavior.
