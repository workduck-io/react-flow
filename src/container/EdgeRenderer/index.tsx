import React, { memo, CSSProperties } from 'react';
import shallow from 'zustand/shallow';
import cc from 'classcat';

import { useStore } from '../../store';
import ConnectionLine from '../../components/ConnectionLine/index';
import MarkerDefinitions from './MarkerDefinitions';
import { getEdgePositions, getHandle, getNodeData } from './utils';
import useVisibleEdges from '../../hooks/useVisibleEdges';

import {
  Position,
  Edge,
  ConnectionLineType,
  ConnectionLineComponent,
  ConnectionMode,
  OnEdgeUpdateFunc,
  HandleType,
  ReactFlowState,
  EdgeTypesWrapped,
} from '../../types';

interface EdgeRendererProps {
  edgeTypes: EdgeTypesWrapped;
  connectionLineType: ConnectionLineType;
  connectionLineStyle?: CSSProperties;
  connectionLineComponent?: ConnectionLineComponent;
  connectionLineContainerStyle?: CSSProperties;
  onEdgeClick?: (event: React.MouseEvent, node: Edge) => void;
  onEdgeDoubleClick?: (event: React.MouseEvent, edge: Edge) => void;
  defaultMarkerColor: string;
  onlyRenderVisibleElements: boolean;
  onEdgeUpdate?: OnEdgeUpdateFunc;
  onEdgeContextMenu?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeMouseEnter?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeMouseMove?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeMouseLeave?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeUpdateStart?: (event: React.MouseEvent, edge: Edge, handleType: HandleType) => void;
  onEdgeUpdateEnd?: (event: MouseEvent, edge: Edge, handleType: HandleType) => void;
  edgeUpdaterRadius?: number;
  noPanClassName?: string;
  elevateEdgesOnSelect: boolean;
  rfId?: string;
}

const selector = (s: ReactFlowState) => ({
  connectionNodeId: s.connectionNodeId,
  connectionHandleType: s.connectionHandleType,
  nodesConnectable: s.nodesConnectable,
  elementsSelectable: s.elementsSelectable,
  width: s.width,
  height: s.height,
  connectionMode: s.connectionMode,
  nodeInternals: s.nodeInternals,
});

const EdgeRenderer = (props: EdgeRendererProps) => {
  const {
    connectionNodeId,
    connectionHandleType,
    nodesConnectable,
    elementsSelectable,
    width,
    height,
    connectionMode,
    nodeInternals,
  } = useStore(selector, shallow);
  const edgeTree = useVisibleEdges(props.onlyRenderVisibleElements, nodeInternals, props.elevateEdgesOnSelect);

  if (!width) {
    return null;
  }

  const {
    connectionLineType,
    defaultMarkerColor,
    connectionLineStyle,
    connectionLineComponent,
    connectionLineContainerStyle,
  } = props;
  const renderConnectionLine = connectionNodeId && connectionHandleType;

  return (
    <>
      {edgeTree.map(({ level, edges, isMaxLevel }) => (
        <svg
          key={level}
          style={{ zIndex: level }}
          width={width}
          height={height}
          className="react-flow__edges react-flow__container"
        >
          {isMaxLevel && <MarkerDefinitions defaultColor={defaultMarkerColor} rfId={props.rfId} />}
          <g>
            {edges.map((edge: Edge) => {
              const [sourceNodeRect, sourceHandleBounds, sourceIsValid] = getNodeData(nodeInternals, edge.source);
              const [targetNodeRect, targetHandleBounds, targetIsValid] = getNodeData(nodeInternals, edge.target);

              if (!sourceIsValid || !targetIsValid) {
                return null;
              }

              let edgeType = edge.type || 'default';

              if (!props.edgeTypes[edgeType]) {
                console.warn(
                  `[React Flow]: Edge type "${edgeType}" not found. Using fallback type "default". Help: https://reactflow.dev/error#300`
                );

                edgeType = 'default';
              }

              const EdgeComponent = props.edgeTypes[edgeType] || props.edgeTypes.default;
              // when connection type is loose we can define all handles as sources
              const targetNodeHandles =
                connectionMode === ConnectionMode.Strict
                  ? targetHandleBounds!.target
                  : targetHandleBounds!.target || targetHandleBounds!.source;
              const sourceHandle = getHandle(sourceHandleBounds!.source!, edge.sourceHandle || null);
              const targetHandle = getHandle(targetNodeHandles!, edge.targetHandle || null);
              const sourcePosition = sourceHandle?.position || Position.Bottom;
              const targetPosition = targetHandle?.position || Position.Top;

              if (!sourceHandle) {
                // @ts-ignore
                if (process.env.NODE_ENV === 'development') {
                  console.warn(
                    `[React Flow]: Couldn't create edge for source handle id: ${edge.sourceHandle}; edge id: ${edge.id}. Help: https://reactflow.dev/error#800`
                  );
                }
                return null;
              }

              if (!targetHandle) {
                // @ts-ignore
                if (process.env.NODE_ENV === 'development') {
                  console.warn(
                    `[React Flow]: Couldn't create edge for target handle id: ${edge.targetHandle}; edge id: ${edge.id}. Help: https://reactflow.dev/error#800`
                  );
                }
                return null;
              }

              const { sourceX, sourceY, targetX, targetY } = getEdgePositions(
                sourceNodeRect,
                sourceHandle,
                sourcePosition,
                targetNodeRect,
                targetHandle,
                targetPosition
              );

              return (
                <EdgeComponent
                  key={edge.id}
                  id={edge.id}
                  className={cc([edge.className, props.noPanClassName])}
                  type={edgeType}
                  data={edge.data}
                  selected={!!edge.selected}
                  animated={!!edge.animated}
                  hidden={!!edge.hidden}
                  label={edge.label}
                  labelStyle={edge.labelStyle}
                  labelShowBg={edge.labelShowBg}
                  labelBgStyle={edge.labelBgStyle}
                  labelBgPadding={edge.labelBgPadding}
                  labelBgBorderRadius={edge.labelBgBorderRadius}
                  style={edge.style}
                  source={edge.source}
                  target={edge.target}
                  sourceHandleId={edge.sourceHandle}
                  targetHandleId={edge.targetHandle}
                  markerEnd={edge.markerEnd}
                  markerStart={edge.markerStart}
                  sourceX={sourceX}
                  sourceY={sourceY}
                  targetX={targetX}
                  targetY={targetY}
                  sourcePosition={sourcePosition}
                  targetPosition={targetPosition}
                  elementsSelectable={elementsSelectable}
                  onEdgeUpdate={props.onEdgeUpdate}
                  onContextMenu={props.onEdgeContextMenu}
                  onMouseEnter={props.onEdgeMouseEnter}
                  onMouseMove={props.onEdgeMouseMove}
                  onMouseLeave={props.onEdgeMouseLeave}
                  onClick={props.onEdgeClick}
                  edgeUpdaterRadius={props.edgeUpdaterRadius}
                  onEdgeDoubleClick={props.onEdgeDoubleClick}
                  onEdgeUpdateStart={props.onEdgeUpdateStart}
                  onEdgeUpdateEnd={props.onEdgeUpdateEnd}
                  rfId={props.rfId}
                />
              );
            })}
          </g>
        </svg>
      ))}
      {renderConnectionLine && (
        <svg
          style={connectionLineContainerStyle}
          width={width}
          height={height}
          className="react-flow__edges react-flow__connectionline react-flow__container"
        >
          <ConnectionLine
            connectionNodeId={connectionNodeId!}
            connectionHandleType={connectionHandleType!}
            connectionLineStyle={connectionLineStyle}
            connectionLineType={connectionLineType}
            isConnectable={nodesConnectable}
            CustomConnectionLineComponent={connectionLineComponent}
          />
        </svg>
      )}
    </>
  );
};

EdgeRenderer.displayName = 'EdgeRenderer';

export default memo(EdgeRenderer);
