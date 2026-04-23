import { memo } from 'react';
import { NodeResizer } from '@xyflow/react';

interface GroupNodeData {
  title?: string;
  color?: string;
}

const GroupNode = memo(({ data, selected }: any) => {
  const nodeData = data as GroupNodeData;

  return (
    <>
      <NodeResizer minWidth={200} minHeight={150} isVisible={selected} lineClassName="border-blue-400" />
      <div
        className={`group-node ${selected ? 'selected' : ''}`}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: nodeData.color || 'rgba(241, 245, 249, 0.5)',
          border: '1px dashed #cbd5e1',
          borderRadius: '8px',
          padding: '12px',
        }}
      >
        <div style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#475467',
          marginBottom: '8px',
        }}>
          {nodeData.title || 'Department Group'}
        </div>
      </div>
    </>
  );
});

GroupNode.displayName = 'GroupNode';
export default GroupNode;
