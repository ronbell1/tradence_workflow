// App.tsx — Main Application Component
// Orchestrates all panels: Sidebar, Canvas, Config Form, Simulation, Dashboard

import { useState, useCallback, useEffect, useRef } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useWorkflow } from './hooks/useWorkflow';
import WorkflowCanvas from './components/Canvas/WorkflowCanvas';
import NodePalette from './components/Sidebar/NodePalette';
import NodeFormPanel from './components/NodeForms/NodeFormPanel';
import SimulationPanel from './components/Sandbox/SimulationPanel';
import DashboardPanel from './components/Dashboard/DashboardPanel';
import KeyboardHelp from './components/KeyboardHelp/KeyboardHelp';
import { useToast } from './components/Toast/ToastProvider';
import { validateWorkflow } from './utils/graphValidation';
import { Workflow, Undo2, Redo2, LayoutTemplate, Save, FolderOpen, FlaskConical, X, Wand2, Trash2, Copy, Link2, BarChart3, Keyboard, HardDriveDownload, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { workflowTemplates } from './data/templates';
import './App.css';

function AppContent() {
  const {
    nodes,
    edges,
    selectedNode,
    validationStates,
    simulatingNodeId,
    setSimulatingNodeId,
    canUndo,
    canRedo,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onPaneClick,
    onNodesDelete,
    addNode,
    updateNodeData,
    deleteNode,
    serializeGraph,
    handleUndo,
    handleRedo,
    exportWorkflow,
    importWorkflow,
    loadTemplate,
    applyAutoLayout,
    duplicateSelectedNode,
    autoConnectGraph,
  } = useWorkflow();

  const { showToast } = useToast();
  const [showSimulation, setShowSimulation] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation summary
  const validation = validateWorkflow(nodes, edges);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && target.tagName !== 'SELECT') {
          setShowKeyboardHelp(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Import workflow JSON file
  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const success = importWorkflow(result);
          if (success) {
            showToast('Workflow imported successfully', 'success');
          } else {
            showToast('Invalid workflow file', 'error');
          }
        }
      };
      reader.readAsText(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [importWorkflow, showToast]
  );

  const handleExport = useCallback(() => {
    exportWorkflow();
    showToast('Workflow exported as JSON', 'success');
  }, [exportWorkflow, showToast]);

  const handleAutoLayout = useCallback(() => {
    applyAutoLayout();
    showToast('Layout arranged', 'info');
  }, [applyAutoLayout, showToast]);

  const handleAutoConnect = useCallback(() => {
    autoConnectGraph();
    showToast('Nodes auto-connected', 'info');
  }, [autoConnectGraph, showToast]);

  const handleLoadTemplate = useCallback((template: typeof workflowTemplates[0]) => {
    loadTemplate({ nodes: template.nodes, edges: template.edges });
    setShowTemplates(false);
    showToast(`Loaded: ${template.name}`, 'success');
  }, [loadTemplate, showToast]);

  const handleCloseFormPanel = useCallback(() => {
    onPaneClick();
  }, [onPaneClick]);

  return (
    <div className="app-container">
      {/* Top Header Bar */}
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <span className="logo-icon"><Workflow size={22} /></span>
            <span className="logo-text">Tredence</span>
            <span className="logo-divider">|</span>
            <span className="logo-sub">HR Workflow Designer</span>
          </div>
        </div>

        <div className="header-center">
          <div className="header-actions">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="btn-toolbar"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className="btn-toolbar"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={16} />
            </button>
            <div className="toolbar-divider"></div>
            <button
              onClick={handleAutoLayout}
              className="btn-toolbar"
              title="Auto Layout (Ctrl+I)"
            >
              <Wand2 size={16} /> Arrange
            </button>
            <button
              onClick={handleAutoConnect}
              className="btn-toolbar"
              title="Auto Connect Unlinked Nodes"
            >
              <Link2 size={16} /> Connect
            </button>
            <div className="toolbar-divider"></div>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="btn-toolbar"
              title="Load Template"
            >
              <LayoutTemplate size={16} /> Templates
            </button>
            <div className="toolbar-divider"></div>

            {/* Selected Node Actions */}
            <button
              onClick={() => selectedNode && duplicateSelectedNode()}
              disabled={!selectedNode}
              className="btn-toolbar"
              title="Duplicate Selected (Ctrl+D)"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={() => {
                if (selectedNode) {
                  deleteNode(selectedNode.id);
                  showToast('Node deleted', 'info');
                }
              }}
              disabled={!selectedNode}
              className="btn-toolbar action-danger"
              title="Delete Selected (Del/Backspace)"
            >
              <Trash2 size={16} />
            </button>
            <div className="toolbar-divider"></div>
            <button onClick={handleExport} className="btn-toolbar" title="Export as JSON">
              <HardDriveDownload size={16} /> Export
            </button>
            <button onClick={handleImport} className="btn-toolbar" title="Import JSON">
              <FolderOpen size={16} /> Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="header-right">
          <button
            onClick={() => setShowKeyboardHelp(true)}
            className="btn-toolbar"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard size={16} />
          </button>
          <button
            onClick={() => setShowDashboard(true)}
            className="btn-toolbar"
            title="Dashboard & Analytics"
          >
            <BarChart3 size={16} /> Dashboard
          </button>
          <button
            onClick={() => setShowSimulation(!showSimulation)}
            className={`btn-simulate ${showSimulation ? 'active' : ''}`}
          >
            <FlaskConical size={16} /> {showSimulation ? 'Close Sandbox' : 'Test Workflow'}
          </button>
        </div>
      </header>

      {/* Template Dropdown */}
      {showTemplates && (
        <div className="templates-dropdown">
          <div className="templates-header">
            <h3><LayoutTemplate size={14} className="inline-icon" /> Preset Workflow Templates</h3>
            <button onClick={() => setShowTemplates(false)} className="btn-icon"><X size={18} /></button>
          </div>
          <div className="templates-grid">
            {workflowTemplates.map((template) => (
              <button
                key={template.id}
                className="template-card"
                onClick={() => handleLoadTemplate(template)}
              >
                <span className="template-icon">{template.icon}</span>
                <div className="template-info">
                  <strong>{template.name}</strong>
                  <span>{template.description}</span>
                  <span className="template-node-count">{template.nodes.length} nodes</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="app-body">
        {/* Left Sidebar — Node Palette */}
        <aside className="sidebar-left">
          <NodePalette />
        </aside>

        {/* Center — Canvas */}
        <main className="canvas-area">
          <WorkflowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onNodesDelete={onNodesDelete}
            addNode={addNode}
            validationStates={validationStates}
            simulatingNodeId={simulatingNodeId}
          />
        </main>

        {/* Right Panel — Node Config or Simulation */}
        <aside className={`sidebar-right ${selectedNode || showSimulation ? 'open' : ''}`}>
          {showSimulation ? (
            <SimulationPanel
              nodes={nodes}
              edges={edges}
              serializeGraph={serializeGraph}
              onSimulatingNode={setSimulatingNodeId}
              isOpen={showSimulation}
              onClose={() => setShowSimulation(false)}
            />
          ) : (
            <NodeFormPanel
              selectedNode={selectedNode}
              onChange={updateNodeData}
              onDelete={deleteNode}
              onClose={handleCloseFormPanel}
            />
          )}
        </aside>
      </div>

      {/* Status Bar */}
      <footer className="status-bar">
        <div className="status-left">
          <span className="status-item"><span className="status-dot-sm" style={{ background: '#4f46e5' }}></span> {nodes.length} nodes</span>
          <span className="status-item"><span className="status-dot-sm" style={{ background: '#6366f1' }}></span> {edges.length} edges</span>
        </div>
        <div className="status-center">
          {validation.isValid ? (
            <span className="status-item status-valid"><CheckCircle2 size={12} /> Valid workflow</span>
          ) : (
            <span className="status-item status-invalid"><AlertTriangle size={12} /> {validation.errors.length} error{validation.errors.length !== 1 ? 's' : ''}</span>
          )}
          {validation.warnings.length > 0 && (
            <span className="status-item status-warn"><XCircle size={12} /> {validation.warnings.length} warning{validation.warnings.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        <div className="status-right">
          <span className="status-item status-saved"><Save size={10} /> Auto-saved</span>
        </div>
      </footer>

      {/* Modals */}
      <DashboardPanel isOpen={showDashboard} onClose={() => setShowDashboard(false)} />
      <KeyboardHelp isOpen={showKeyboardHelp} onClose={() => setShowKeyboardHelp(false)} />
    </div>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}

export default App;
