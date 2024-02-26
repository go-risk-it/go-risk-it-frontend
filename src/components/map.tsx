'use client';
import React from 'react';
import {VectorMap} from '@south-paw/react-vector-maps';
import styled, {StyleSheetManager} from 'styled-components';
import world from '../../public/risk.json';
import {BoardState} from "../api/message/boardState.ts";

interface MapContainerProps {
    boardstate: BoardState;
}

const MapContainer = styled.div<MapContainerProps>`
    margin: 1rem auto;
    width: 1000px;

    svg {
        stroke: #fff;

        // All layers are just path elements

        path {
            fill: #a82b2b;
            cursor: pointer;
            outline: none;

            // When a layer is hovered

            &:hover {
                fill: rgba(168, 43, 43, 0.83);
            }

            // When a layer is focused.

            &:focus {
                fill: rgba(168, 43, 43, 0.6);
            }

            // When a layer is 'checked' (via checkedLayers prop).

            &[aria-checked='true'] {
                fill: rgba(56, 43, 168, 1);
            }

            // When a layer is 'selected' (via currentLayers prop).

            &[aria-current='true'] {
                fill: rgba(56, 43, 168, 0.83);
            }

            // color each region based on the owner. For each region, generate a style with the fill color based on the owner
            ${props => Object.entries(props.boardstate.regions).map(([, region]) => {
                return `&[id=${region.id}] {
                    fill: ${region.ownerId === 1 ? 'red' : 'blue'};
                }`
            }).join('')}
        }
    }
`;


function Map({boardState}: {boardState: BoardState}) {

    const [selected, setSelected] = React.useState<string[]>([])

    const onClick = (event: React.MouseEvent<SVGPathElement, MouseEvent>) => {
        const target = event.target as SVGElement
        const id = target.getAttribute('id')

        // If selected includes the id already, remove it - otherwise add it
        if (!id) return
        selected.includes(id)
            ? setSelected(selected.filter(sid => sid !== id))
            : setSelected([...selected, id])
    }

    return (
        <StyleSheetManager shouldForwardProp={() => true}>
            <MapContainer boardstate={boardState}>
                <VectorMap {...world} checkedLayers={['indonesia']} layerProps={{onClick}}/>
                <p>Selected:</p>
                <pre>{JSON.stringify(selected, null,   2)}</pre>
            </MapContainer>
        </StyleSheetManager>
    )
}

export default Map;