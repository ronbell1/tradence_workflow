// components/NodeForms/StartForm.tsx — Start Node configuration form
// Controlled component with key-value metadata pairs

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { KeyValuePair } from '../../types/nodes';

interface StartFormProps {
  nodeId: string;
  data: {
    title?: string;
    metadata?: KeyValuePair[];
  };
  onChange: (nodeId: string, data: Record<string, unknown>) => void;
  onDelete: (nodeId: string) => void;
}

const StartForm = ({ nodeId, data, onChange, onDelete }: StartFormProps) => {
  const [metadata, setMetadata] = useState<KeyValuePair[]>(data.metadata || []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(nodeId, { title: e.target.value });
  };

  const addMetadata = () => {
    const newPair: KeyValuePair = { id: uuidv4(), key: '', value: '' };
    const updated = [...metadata, newPair];
    setMetadata(updated);
    onChange(nodeId, { metadata: updated });
  };

  const removeMetadata = (id: string) => {
    const updated = metadata.filter((kv) => kv.id !== id);
    setMetadata(updated);
    onChange(nodeId, { metadata: updated });
  };

  const handleKVChange = (id: string, field: 'key' | 'value', val: string) => {
    const updated = metadata.map((kv) =>
      kv.id === id ? { ...kv, [field]: val } : kv
    );
    setMetadata(updated);
    onChange(nodeId, { metadata: updated });
  };

  return (
    <div className="node-form">
      <div className="form-header">
        <span className="form-icon">🟢</span>
        <h3>Start Node</h3>
      </div>

      <div className="form-group">
        <label htmlFor={`start-title-${nodeId}`}>
          Title <span className="required">*</span>
        </label>
        <input
          id={`start-title-${nodeId}`}
          type="text"
          value={data.title || ''}
          onChange={handleTitleChange}
          placeholder="e.g., Employee Onboarding"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Metadata (Key-Value Pairs)</label>
        {metadata.map((kv) => (
          <div key={kv.id} className="kv-row">
            <input
              type="text"
              value={kv.key}
              onChange={(e) => handleKVChange(kv.id, 'key', e.target.value)}
              placeholder="Key"
              className="form-input kv-input"
            />
            <input
              type="text"
              value={kv.value}
              onChange={(e) => handleKVChange(kv.id, 'value', e.target.value)}
              placeholder="Value"
              className="form-input kv-input"
            />
            <button
              onClick={() => removeMetadata(kv.id)}
              className="btn-icon btn-danger"
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}
        <button onClick={addMetadata} className="btn-secondary btn-sm">
          + Add Metadata
        </button>
      </div>

      <div className="form-actions">
        <button onClick={() => onDelete(nodeId)} className="btn-danger">
          Delete Node
        </button>
      </div>
    </div>
  );
};

export default StartForm;
