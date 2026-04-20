import React, { useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from '@xyflow/react';
import { ClipboardList, UserCheck, Zap, StopCircle, Plus, X, Split } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { NodeType } from '../../types/nodes';

const NODE_OPTIONS: { type: NodeType; icon: React.ReactNode; color: string; label: string }[] = [
  { type: 'task', icon: <ClipboardList size={16} color="#3b82f6" />, color: '#3b82f6', label: 'Task' },
  { type: 'approval', icon: <UserCheck size={16} color="#f59e0b" />, color: '#f59e0b', label: 'Approval' },
  { type: 'decision', icon: <Split size={16} color="#f97316" />, color: '#f97316', label: 'Decision' },
  { type: 'automated', icon: <Zap size={16} color="#8b5cf6" />, color: '#8b5cf6', label: 'Automated' },
  { type: 'end', icon: <StopCircle size={16} color="#ef4444" />, color: '#ef4444', label: 'End' },
];

export default function SmartEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  sourceHandleId,
  style = {},
  markerEnd,
}: EdgeProps) {
  const { setNodes, setEdges } = useReactFlow();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Determine edge label based on sourceHandle (for decision nodes)
  let edgeLabel: string | null = null;
  let edgeLabelColor = '#64748b';
  if (sourceHandleId === 'true') {
    edgeLabel = 'Yes';
    edgeLabelColor = '#22c55e';
  } else if (sourceHandleId === 'false') {
    edgeLabel = 'No';
    edgeLabelColor = '#ef4444';
  }

  const onAddNode = (type: NodeType) => {
    setIsMenuOpen(false);

    const newNodeId = `${type}-${uuidv4().slice(0, 8)}`;
    
    const defaultData = {
      task: { title: 'New Task', assignee: '', dueDate: '', customFields: [] },
      approval: { title: 'Manager Approval', approverRole: 'Manager' },
      automated: { title: '', actionId: '' },
      decision: { title: 'Condition', conditionVariable: '', conditionOperator: 'equals', conditionValue: '' },
      end: { endMessage: 'Workflow Complete', summaryFlag: false },
      start: { title: 'Start', metadata: [] }
    }[type];

    const newNode = {
      id: newNodeId,
      type,
      position: {
        x: labelX - 80,
        y: labelY - 40,
      },
      data: { type, ...defaultData },
      selected: true,
    };

    const newEdge1 = {
      id: `e-${source}-${newNodeId}`,
      source,
      sourceHandle: sourceHandleId,
      target: newNodeId,
      type: 'smart',
      animated: false,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
    };

    const newEdge2 = {
      id: `e-${newNodeId}-${target}`,
      source: newNodeId,
      target,
      type: 'smart',
      animated: false,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
    };

    setEdges((es) => es.filter((e) => e.id !== id).concat(newEdge1 as any, newEdge2 as any));
    setNodes((ns) => ns.map(n => ({...n, selected: false})).concat(newNode as any));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        {/* Edge label (Yes/No) for decision branches */}
        {edgeLabel && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${sourceX}px,${sourceY + 18}px)`,
              fontSize: '10px',
              fontWeight: 700,
              color: edgeLabelColor,
              background: '#fff',
              padding: '1px 6px',
              borderRadius: '4px',
              border: `1px solid ${edgeLabelColor}30`,
              pointerEvents: 'none',
              zIndex: 15,
              letterSpacing: '0.5px',
            }}
          >
            {edgeLabel}
          </div>
        )}

        {/* Add node button / menu */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            zIndex: 20,
            pointerEvents: 'all',
          }}
          className="edge-menu-container"
        >
          {isMenuOpen ? (
            <div className="smart-edge-menu">
              <button 
                className="smart-close-btn"
                onClick={() => setIsMenuOpen(false)}
              >
                <X size={12} />
              </button>
              {NODE_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  className="smart-ghost-btn"
                  onClick={() => onAddNode(opt.type)}
                  title={`Add ${opt.label}`}
                >
                  {opt.icon}
                </button>
              ))}
            </div>
          ) : (
            <button
              className="smart-add-btn"
              onClick={() => setIsMenuOpen(true)}
            >
              <Plus size={14} color="#64748b" />
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
