// hooks/useHistory.ts — Undo/Redo state management
// Wraps workflow state with a history stack for Ctrl+Z / Ctrl+Y support

import { useState, useCallback, useRef } from 'react';
import type { Node, Edge } from '@xyflow/react';

interface HistorySnapshot {
  nodes: Node[];
  edges: Edge[];
}

const MAX_HISTORY = 50;

/**
 * Custom hook implementing undo/redo via a snapshot stack.
 * Captures complete workflow state at each significant change.
 */
export const useHistory = () => {
  const [past, setPast] = useState<HistorySnapshot[]>([]);
  const [future, setFuture] = useState<HistorySnapshot[]>([]);
  const isUndoRedoAction = useRef(false);

  const pushSnapshot = useCallback((snapshot: HistorySnapshot) => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }
    setPast((prev) => {
      const newPast = [...prev, snapshot];
      if (newPast.length > MAX_HISTORY) newPast.shift();
      return newPast;
    });
    setFuture([]); // Clear redo stack on new action
  }, []);

  const undo = useCallback(
    (currentSnapshot: HistorySnapshot): HistorySnapshot | null => {
      if (past.length === 0) return null;

      const previous = past[past.length - 1];
      setPast((prev) => prev.slice(0, -1));
      setFuture((prev) => [currentSnapshot, ...prev]);
      isUndoRedoAction.current = true;
      return previous;
    },
    [past]
  );

  const redo = useCallback(
    (currentSnapshot: HistorySnapshot): HistorySnapshot | null => {
      if (future.length === 0) return null;

      const next = future[0];
      setFuture((prev) => prev.slice(1));
      setPast((prev) => [...prev, currentSnapshot]);
      isUndoRedoAction.current = true;
      return next;
    },
    [future]
  );

  return {
    pushSnapshot,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
};
