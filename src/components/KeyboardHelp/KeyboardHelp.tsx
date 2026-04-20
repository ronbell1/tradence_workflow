// components/KeyboardHelp/KeyboardHelp.tsx — Keyboard shortcuts reference modal
import { Keyboard, X } from 'lucide-react';

interface KeyboardHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: ['Ctrl', 'Z'], desc: 'Undo' },
  { keys: ['Ctrl', 'Y'], desc: 'Redo' },
  { keys: ['Ctrl', 'D'], desc: 'Duplicate selected node' },
  { keys: ['Ctrl', 'C'], desc: 'Copy selected node' },
  { keys: ['Ctrl', 'V'], desc: 'Paste node' },
  { keys: ['Ctrl', 'I'], desc: 'Auto-layout (Magic Arrange)' },
  { keys: ['Del'], desc: 'Delete selected' },
  { keys: ['Backspace'], desc: 'Delete selected' },
  { keys: ['?'], desc: 'Show this help' },
];

const KeyboardHelp = ({ isOpen, onClose }: KeyboardHelpProps) => {
  if (!isOpen) return null;

  return (
    <div className="dashboard-overlay" onClick={onClose}>
      <div className="keyboard-help-modal" onClick={e => e.stopPropagation()}>
        <div className="dashboard-header">
          <div className="dashboard-header-left">
            <Keyboard size={18} />
            <h2>Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>
        <div className="keyboard-help-body">
          {shortcuts.map((s, i) => (
            <div key={i} className="shortcut-row">
              <div className="shortcut-keys">
                {s.keys.map((k, j) => (
                  <span key={j}>
                    <kbd className="kbd">{k}</kbd>
                    {j < s.keys.length - 1 && <span className="kbd-plus">+</span>}
                  </span>
                ))}
              </div>
              <span className="shortcut-desc">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KeyboardHelp;
