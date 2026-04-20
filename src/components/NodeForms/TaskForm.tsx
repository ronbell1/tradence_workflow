// components/NodeForms/TaskForm.tsx — Task Node configuration form
// Controlled component with key-value custom fields

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { KeyValuePair } from '../../types/nodes';
import { ClipboardList, X } from 'lucide-react';

interface TaskFormProps {
  nodeId: string;
  data: {
    title?: string;
    description?: string;
    assignee?: string;
    dueDate?: string;
    customFields?: KeyValuePair[];
  };
  onChange: (nodeId: string, data: Record<string, unknown>) => void;
  onDelete: (nodeId: string) => void;
}

const TaskForm = ({ nodeId, data, onChange, onDelete }: TaskFormProps) => {
  const [customFields, setCustomFields] = useState<KeyValuePair[]>(
    data.customFields || []
  );

  const handleChange = (field: string, value: string) => {
    onChange(nodeId, { [field]: value });
  };

  const addCustomField = () => {
    const newPair: KeyValuePair = { id: uuidv4(), key: '', value: '' };
    const updated = [...customFields, newPair];
    setCustomFields(updated);
    onChange(nodeId, { customFields: updated });
  };

  const removeCustomField = (id: string) => {
    const updated = customFields.filter((kv) => kv.id !== id);
    setCustomFields(updated);
    onChange(nodeId, { customFields: updated });
  };

  const handleKVChange = (id: string, field: 'key' | 'value', val: string) => {
    const updated = customFields.map((kv) =>
      kv.id === id ? { ...kv, [field]: val } : kv
    );
    setCustomFields(updated);
    onChange(nodeId, { customFields: updated });
  };

  return (
    <div className="node-form">
      <div className="form-header">
        <span className="form-icon"><ClipboardList size={18} color="#3b82f6" /></span>
        <h3>Task Node</h3>
      </div>

      <div className="form-group">
        <label htmlFor={`task-title-${nodeId}`}>
          Title <span className="required">*</span>
        </label>
        <input
          id={`task-title-${nodeId}`}
          type="text"
          value={data.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="e.g., Collect documents"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor={`task-assignee-${nodeId}`}>
          Assignee <span className="required">*</span>
        </label>
        <input
          id={`task-assignee-${nodeId}`}
          type="text"
          value={data.assignee || ''}
          onChange={(e) => handleChange('assignee', e.target.value)}
          placeholder="e.g., John Doe"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor={`task-due-${nodeId}`}>
          Due Date <span className="required">*</span>
        </label>
        <input
          id={`task-due-${nodeId}`}
          type="date"
          value={data.dueDate || ''}
          onChange={(e) => handleChange('dueDate', e.target.value)}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor={`task-desc-${nodeId}`}>Description</label>
        <textarea
          id={`task-desc-${nodeId}`}
          value={data.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Task description..."
          className="form-textarea"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Custom Fields (Key-Value)</label>
        {customFields.map((kv) => (
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
              onClick={() => removeCustomField(kv.id)}
              className="btn-icon btn-danger"
              title="Remove"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button onClick={addCustomField} className="btn-secondary btn-sm">
          + Add Custom Field
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

export default TaskForm;
