// App.tsx — Main Application Component
// Orchestrates all panels: Sidebar, Canvas, Config Form, Simulation

import { useState, useCallback, useEffect, useRef } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useWorkflow } from './hooks/useWorkflow';
import WorkflowCanvas from './components/Canvas/WorkflowCanvas';
import NodePalette from './components/Sidebar/NodePalette';
import NodeFormPanel from './components/NodeForms/NodeFormPanel';
import SimulationPanel from './components/Sandbox/SimulationPanel';
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
  } = useWorkflow();

  const [showSimulation, setShowSimulation] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y (redo)
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
          if (!success) {
            alert('Invalid workflow file. Please check the JSON format.');
          }
        }
      };
      reader.readAsText(file);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [importWorkflow]
  );

  const handleCloseFormPanel = useCallback(() => {
    onPaneClick();
  }, [onPaneClick]);

  return (
    <div className="app-container">
      {/* Top Header Bar */}
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <span className="logo-icon">◈</span>
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
              ↶
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className="btn-toolbar"
              title="Redo (Ctrl+Y)"
            >
              ↷
            </button>
            <div className="toolbar-divider"></div>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="btn-toolbar"
              title="Load Template"
            >
              📋 Templates
            </button>
            <div className="toolbar-divider"></div>
            <button onClick={exportWorkflow} className="btn-toolbar" title="Export as JSON">
              💾 Save
            </button>
            <button onClick={handleImport} className="btn-toolbar" title="Import JSON">
              📂 Import
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
            onClick={() => setShowSimulation(!showSimulation)}
            className={`btn-simulate ${showSimulation ? 'active' : ''}`}
          >
            🧪 {showSimulation ? 'Close Sandbox' : 'Test Workflow'}
          </button>
        </div>
      </header>

      {/* Template Dropdown */}
      {showTemplates && (
        <div className="templates-dropdown">
          <div className="templates-header">
            <h3>📋 Preset Workflow Templates</h3>
            <button onClick={() => setShowTemplates(false)} className="btn-icon">✕</button>
          </div>
          <div className="templates-grid">
            {workflowTemplates.map((template) => (
              <button
                key={template.id}
                className="template-card"
                onClick={() => {
                  loadTemplate({ nodes: template.nodes, edges: template.edges });
                  setShowTemplates(false);
                }}
              >
                <span className="template-icon">{template.icon}</span>
                <div className="template-info">
                  <strong>{template.name}</strong>
                  <span>{template.description}</span>
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

          {/* Node count badge */}
          <div className="canvas-status">
            <span className="status-badge">{nodes.length} nodes</span>
            <span className="status-badge">{edges.length} edges</span>
          </div>
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
