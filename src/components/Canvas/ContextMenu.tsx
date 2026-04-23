import React, { useCallback, useEffect } from 'react';
import { Trash2, Files, Network } from 'lucide-react';

interface ContextMenuProps {
  id: string;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onAutoConnect?: (id: string) => void;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  id, top, left, right, bottom, onDuplicate, onDelete, onAutoConnect, onClose
}) => {
  const closeContextMenu = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleClick = () => {
      // Small timeout to prevent immediate close on open click
      setTimeout(() => closeContextMenu(), 10);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [closeContextMenu]);

  return (
    <div
      style={{ top, left, right, bottom }}
      className="context-menu"
      onClick={(e) => e.stopPropagation()} // prevent clicks from closing before actions
    >
      <div className="context-menu-header">
        <p>Actions</p>
      </div>
      <button className="context-menu-btn" onClick={() => { onDuplicate(id); closeContextMenu(); }}>
        <Files size={14} /> Duplicate
      </button>
      {onAutoConnect && (
        <button className="context-menu-btn" onClick={() => { onAutoConnect(id); closeContextMenu(); }}>
          <Network size={14} /> Auto-Connect
        </button>
      )}
      <div className="context-menu-divider" />
      <button className="context-menu-btn danger" onClick={() => { onDelete(id); closeContextMenu(); }}>
        <Trash2 size={14} /> Delete
      </button>
    </div>
  );
};
