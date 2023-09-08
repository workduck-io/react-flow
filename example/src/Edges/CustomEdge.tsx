import { FC } from 'react';
import { EdgeLabelRenderer, EdgeProps, getBezierEdgeCenter, getBezierPath, useStore } from 'react-flow-renderer';

const CustomEdge: FC<EdgeProps> = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}) => {
    const isConnectedNodeDragging = useStore((s) =>
    Array.from(s.nodeInternals.values()).find((n) => n.dragging && (target === n.id || source === n.id))
  );
  const edgePath = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const [labelX,labelY] = getBezierEdgeCenter({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
  return (
    <>
      <path id={id} className="react-flow__edge-path" d={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: 'white',
            border: '1px solid #555',
            borderRadius: 10,
            padding: 5,
            zIndex: isConnectedNodeDragging ? 10 : 0,
            opacity: isConnectedNodeDragging ? 0.5 : 1,
          }}
        >
          {data.text}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
