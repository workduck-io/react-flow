import React, { memo, ComponentType, useState, useMemo } from 'react';
import cc from 'classcat';

import { useStoreApi } from '../../store';
import { EdgeProps, WrapEdgeProps, Connection } from '../../types';
import { handleMouseDown } from '../../components/Handle/handler';
import { EdgeAnchor } from './EdgeAnchor';
import { getMarkerId } from '../../utils/graph';
import { getMouseHandler } from './utils';

export default (EdgeComponent: ComponentType<EdgeProps>) => {
  const EdgeWrapper = ({
    id,
    className,
    type,
    data,
    onClick,
    onEdgeDoubleClick,
    selected,
    animated,
    label,
    labelStyle,
    labelShowBg,
    labelBgStyle,
    labelBgPadding,
    labelBgBorderRadius,
    style,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    elementsSelectable,
    hidden,
    sourceHandleId,
    targetHandleId,
    onContextMenu,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
    edgeUpdaterRadius,
    onEdgeUpdate,
    onEdgeUpdateStart,
    onEdgeUpdateEnd,
    markerEnd,
    markerStart,
    rfId,
  }: WrapEdgeProps): JSX.Element | null => {
    const [updating, setUpdating] = useState<boolean>(false);
    const store = useStoreApi();

    const onEdgeClick = (event: React.MouseEvent<SVGGElement, MouseEvent>): void => {
      const { edges, addSelectedEdges } = store.getState();
      const edge = edges.find((e) => e.id === id)!;

      if (elementsSelectable) {
        store.setState({ nodesSelectionActive: false });
        addSelectedEdges([id]);
      }

      onClick?.(event, edge);
    };

    const onEdgeDoubleClickHandler = getMouseHandler(id, store.getState, onEdgeDoubleClick);
    const onEdgeContextMenu = getMouseHandler(id, store.getState, onContextMenu);
    const onEdgeMouseEnter = getMouseHandler(id, store.getState, onMouseEnter);
    const onEdgeMouseMove = getMouseHandler(id, store.getState, onMouseMove);
    const onEdgeMouseLeave = getMouseHandler(id, store.getState, onMouseLeave);

    const handleEdgeUpdater = (event: React.MouseEvent<SVGGElement, MouseEvent>, isSourceHandle: boolean) => {
      const nodeId = isSourceHandle ? target : source;
      const handleId = (isSourceHandle ? targetHandleId : sourceHandleId) || null;
      const handleType = isSourceHandle ? 'target' : 'source';
      const isValidConnection = () => true;
      const isTarget = isSourceHandle;
      const edge = store.getState().edges.find((e) => e.id === id)!;

      onEdgeUpdateStart?.(event, edge, handleType);

      const _onEdgeUpdateEnd = onEdgeUpdateEnd
        ? (evt: MouseEvent): void => onEdgeUpdateEnd(evt, edge, handleType)
        : undefined;

      const onConnectEdge = (connection: Connection) => onEdgeUpdate?.(edge, connection);

      handleMouseDown({
        event,
        handleId,
        nodeId,
        onConnect: onConnectEdge,
        isTarget,
        getState: store.getState,
        setState: store.setState,
        isValidConnection,
        elementEdgeUpdaterType: handleType,
        onEdgeUpdateEnd: _onEdgeUpdateEnd,
      });
    };

    const onEdgeUpdaterSourceMouseDown = (event: React.MouseEvent<SVGGElement, MouseEvent>): void =>
      handleEdgeUpdater(event, true);
    const onEdgeUpdaterTargetMouseDown = (event: React.MouseEvent<SVGGElement, MouseEvent>): void =>
      handleEdgeUpdater(event, false);

    const onEdgeUpdaterMouseEnter = () => setUpdating(true);
    const onEdgeUpdaterMouseOut = () => setUpdating(false);
    const markerStartUrl = useMemo(() => `url(#${getMarkerId(markerStart, rfId)})`, [markerStart, rfId]);
    const markerEndUrl = useMemo(() => `url(#${getMarkerId(markerEnd, rfId)})`, [markerEnd, rfId]);

    if (hidden) {
      return null;
    }

    const inactive = !elementsSelectable && !onClick;
    const handleEdgeUpdate = typeof onEdgeUpdate !== 'undefined';
    const edgeClasses = cc([
      'react-flow__edge',
      `react-flow__edge-${type}`,
      className,
      { selected, animated, inactive, updating },
    ]);

    return (
      <g
        className={edgeClasses}
        onClick={onEdgeClick}
        onDoubleClick={onEdgeDoubleClickHandler}
        onContextMenu={onEdgeContextMenu}
        onMouseEnter={onEdgeMouseEnter}
        onMouseMove={onEdgeMouseMove}
        onMouseLeave={onEdgeMouseLeave}
      >
        <EdgeComponent
          id={id}
          source={source}
          target={target}
          selected={selected}
          animated={animated}
          label={label}
          labelStyle={labelStyle}
          labelShowBg={labelShowBg}
          labelBgStyle={labelBgStyle}
          labelBgPadding={labelBgPadding}
          labelBgBorderRadius={labelBgBorderRadius}
          data={data}
          style={style}
          sourceX={sourceX}
          sourceY={sourceY}
          targetX={targetX}
          targetY={targetY}
          sourcePosition={sourcePosition}
          targetPosition={targetPosition}
          sourceHandleId={sourceHandleId}
          targetHandleId={targetHandleId}
          markerStart={markerStartUrl}
          markerEnd={markerEndUrl}
          data-testid={`rf__edge-${id}`}
        />
        {handleEdgeUpdate && (
          <g
            onMouseDown={onEdgeUpdaterSourceMouseDown}
            onMouseEnter={onEdgeUpdaterMouseEnter}
            onMouseOut={onEdgeUpdaterMouseOut}
          >
            <EdgeAnchor position={sourcePosition} centerX={sourceX} centerY={sourceY} radius={edgeUpdaterRadius} />
          </g>
        )}
        {handleEdgeUpdate && (
          <g
            onMouseDown={onEdgeUpdaterTargetMouseDown}
            onMouseEnter={onEdgeUpdaterMouseEnter}
            onMouseOut={onEdgeUpdaterMouseOut}
          >
            <EdgeAnchor position={targetPosition} centerX={targetX} centerY={targetY} radius={edgeUpdaterRadius} />
          </g>
        )}
      </g>
    );
  };

  EdgeWrapper.displayName = 'EdgeWrapper';

  return memo(EdgeWrapper);
};
