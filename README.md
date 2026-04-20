<div align="center">

# ⚙️ HR Workflow Designer

**A visual, drag-and-drop workflow builder for HR operations — built to feel like enterprise software, not a toy.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_App-4f46e5?style=for-the-badge&logo=vercel&logoColor=white)](https://tradence-workflow.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-Vite-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![React Flow](https://img.shields.io/badge/React_Flow-12-ff0072?style=flat-square)](https://reactflow.dev/)

</div>

---

## What is this?

HR Workflow Designer lets you **design, validate, and simulate** end-to-end HR processes — onboarding, leave approvals, performance reviews, offboarding — entirely in the browser. No backend required. No signup. Just open and build.

It goes beyond drawing boxes and arrows. Every node carries real configuration: assignees, SLA deadlines, checklists, approval rules, conditional logic. The graph validator catches broken workflows *before* you run them, and the simulation sandbox lets you watch your process execute step-by-step with animated node highlighting.

---

## What makes this different

| Feature | Typical Workflow Tools | This Project |
|---------|----------------------|--------------|
| **Node intelligence** | Empty boxes with labels | Nodes carry assignees, SLA timers, checklists, conditional logic |
| **Real-time validation** | Run it and hope | Per-node error badges + graph-level validation blocks simulation |
| **Decision logic** | Rectangle with "if" text | Proper diamond shape, condition preview (`salary > 50000`), labeled Yes/No branches |
| **SLA tracking** | Doesn't exist | Every task/approval node can have an SLA deadline; dashboard surfaces breaches |
| **Ease of access** | Drag, drop, manually connect | Quick-add ghost menus, auto-connect button, one-click node insertion on edges |
| **Dashboard** | Not included | KPI cards, live runs table, SLA breach tracking, completion analytics |

---

## Features

### Core Workflow Engine
- **6 node types** — Start, Task, Approval, Automated, Decision, End
- **Visual decision branching** — diamond-shaped node with Yes/No handles and condition preview
- **Smart edges** — click the `+` button on any edge to insert a node inline, automatically splitting connections
- **Quick-add toolbar** — select any node and instantly append the next step via ghost menu
- **Auto-connect** — drop scattered nodes, hit the toolbar button, and the algorithm connects them logically
- **Auto-layout (dagre)** — one-click "Magic Arrange" reflows the entire graph

### Validation & Simulation
- **Graph-level validation** — checks for: single Start node, cycles (DFS), disconnected nodes, decision branches, missing fields
- **Per-node error badges** — red indicators with tooltip details on every node that has issues
- **Simulation blocking** — "Run Simulation" shows exactly *why* your workflow is invalid instead of silently failing
- **Animated simulation playback** — green glow walks through each node step-by-step with execution logs

### SLA & Accountability
- **SLA deadlines** on Task and Approval nodes (configurable in hours)
- **SLA badges** visible inside nodes on the canvas
- **Dashboard** with live runs, breach tracking, and completion metrics

### Dynamic Forms
- **Task checklists** — add structured items that travel with the node
- **Key-value custom fields** — extensible metadata on every task
- **Approval rules** — approver role selection with auto-approve threshold
- **Automated actions** — mapped to human-readable labels (Send Email, Create Jira Ticket, etc.)

### Developer Features
- **Export/Import** workflow as JSON
- **MiniMap + Controls** for large graph navigation
- **4 preset templates** — Employee Onboarding, Leave Approval, Employee Offboarding, Performance Review
- **Undo/Redo** with full history stack
- **Keyboard shortcuts** — `Ctrl+Z` / `Ctrl+Y` / `Ctrl+D` (duplicate) / `Ctrl+I` (auto-layout) / `Del` (delete)
- **Copy/Paste** nodes with `Ctrl+C` / `Ctrl+V`

### UX Polish
- Empty canvas state — clear guidance when starting fresh
- Node info density — assignee, role, action, SLA all visible without clicking
- "Configure..." hints on unconfigured nodes
- Smooth camera panning when adding nodes via quick-add
- Dotted grid background for precise alignment

---

## Architecture

```
src/
├── App.tsx                          # Root — orchestrates header, sidebar, canvas, panels
├── App.css                          # Complete design system (CSS variables, all component styles)
│
├── components/
│   ├── Canvas/
│   │   ├── WorkflowCanvas.tsx       # React Flow canvas with drag/drop, minimap, controls
│   │   └── SmartEdge.tsx            # Custom edge with inline add menu + Yes/No labels
│   ├── Nodes/
│   │   ├── StartNode.tsx            # Start (green) — workflow entry point
│   │   ├── TaskNode.tsx             # Task (blue) — human task with SLA + checklist
│   │   ├── ApprovalNode.tsx         # Approval (amber) — role-based with auto-approve
│   │   ├── AutomatedNode.tsx        # Automated (purple) — system action with label map
│   │   ├── DecisionNode.tsx         # Decision (orange) — diamond shape, condition preview
│   │   ├── EndNode.tsx              # End (red) — terminal node
│   │   └── QuickAddToolbar.tsx      # Ghost menu for one-click node appending
│   ├── NodeForms/                   # Config panels for each node type
│   ├── Sidebar/                     # Node palette (drag source)
│   ├── Sandbox/                     # Simulation panel + execution log
│   └── Dashboard/                   # Analytics modal with KPIs + live runs
│
├── hooks/
│   ├── useWorkflow.ts               # Central state — nodes, edges, CRUD, auto-connect, undo
│   ├── useSimulation.ts             # Mock API call + result management
│   └── useHistory.ts                # Undo/redo snapshot stack
│
├── utils/
│   ├── graphValidation.ts           # DFS cycle detection, connectivity, field validation
│   └── layout.ts                    # Dagre auto-layout computation
│
├── types/
│   ├── nodes.ts                     # Node data interfaces (TaskNodeData, etc.)
│   └── api.ts                       # API types (WorkflowGraph, SimulationResult, etc.)
│
├── data/
│   └── templates.tsx                # 4 preset workflow templates
│
├── api/
│   └── workflowApi.ts               # Mock REST endpoints (GET/POST actions, simulate)
│
└── mocks/
    └── handlers.ts                  # Mock response data for automated actions
```

### Key design decisions

1. **No backend** — Everything runs client-side with mock APIs. This was intentional: the focus is on demonstrating frontend engineering depth, not CRUD endpoints. The mock layer (`api/workflowApi.ts`) follows real REST patterns and could be swapped for actual endpoints with zero UI changes.

2. **CSS variables over Tailwind** — The entire design system lives in `:root` variables in `App.css`. This gives complete control over theming without build-step dependencies or class name bloat. Every color, radius, shadow, and transition is tokenized.

3. **Validation as a first-class feature** — Validation runs reactively on every node/edge change (`useEffect` in `useWorkflow`). Per-node states are computed via `getNodeValidationStates()` and injected into nodes as data props. This means error badges are always current — no "validate" button needed.

4. **Diamond decision node via clip-path** — Instead of rotating a square (which breaks text readability), the decision node uses `clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)` for a true diamond shape while keeping inner content perfectly aligned.

5. **Smart edges with inline insertion** — Clicking `+` on any edge creates a new node *at that exact midpoint*, automatically rewiring `source → new node → target`. The original edge is destroyed and two new edges take its place. This makes inserting steps into an existing flow effortless.

6. **SLA as node-level metadata** — Rather than building a separate SLA system, deadline tracking is embedded directly in node data. This means SLA information travels with the workflow when exported/imported and is visible inside the node on the canvas.

---

## Getting started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Install & run

```bash
# Clone the repository
git clone https://github.com/your-username/hr-workflow-designer.git
cd hr-workflow-designer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
npm run preview
```

---

## Tech stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | React 19 + TypeScript | Type safety, hooks-first architecture |
| **Build** | Vite 8 | Sub-second HMR, optimized production builds |
| **Graph engine** | React Flow 12 (`@xyflow/react`) | Production-grade node/edge rendering, handles, minimap |
| **Layout** | dagre | Automatic directed graph layout computation |
| **Icons** | lucide-react | Consistent, tree-shakable icon set |
| **IDs** | uuid v14 | Collision-free node/edge identifiers |
| **Styling** | Vanilla CSS + CSS Variables | Full design system control, zero framework overhead |

---

## What's completed vs. what's next

### ✅ Completed

- Full 6-node-type workflow builder with drag-and-drop
- Decision node with diamond shape, condition preview, Yes/No branching
- SLA deadline tracking on Task and Approval nodes
- Dynamic checklists on Task nodes
- Graph validation (cycles, connectivity, required fields, decision branches)
- Per-node validation error badges
- Simulation sandbox with animated step-by-step playback
- Dashboard with KPI cards, SLA breach tracking, live runs table
- Smart edges with inline node insertion and Yes/No labels
- Quick-add ghost menus for one-click workflow building
- Auto-connect and auto-layout (dagre)
- Export/Import as JSON
- 4 HR-specific templates (Onboarding, Leave Approval, Offboarding, Performance Review)
- Undo/Redo with history stack
- Copy/Paste and keyboard shortcuts
- Empty canvas state
- Responsive, premium corporate visual design

### 🔮 With more time

- **Real backend** — Persist workflows to a database, support multi-user collaboration
- **Live SLA engine** — Real-time countdown timers on active workflow instances with push notification escalation
- **Variable mapping** — Reference data from upstream nodes (e.g., `{{steps.CollectDocs.assignee}}`) in downstream config
- **Role-based access control** — Different permissions for designers, approvers, and admins
- **Workflow versioning** — Track changes over time, diff two versions, rollback
- **Conditional edge routing** — Dynamic path selection based on runtime data
- **File upload fields** — Attach documents to task nodes during execution
- **Email/Slack integration** — Real notification delivery in automated nodes
- **Node folding** — Collapse/expand sub-workflows for managing large graphs
- **Dark mode** — Full theme toggle using existing CSS variable system
- **Audit trail** — Immutable log of every action taken on a workflow instance

---

<div align="center">

**Built for the Tredence AI Agentic Engineering assignment.**

Made with React, TypeScript, and an unhealthy amount of CSS.

</div>
