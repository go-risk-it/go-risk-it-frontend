'use client';
import React from 'react';
import { VectorMap } from '@south-paw/react-vector-maps';
import styled from 'styled-components';
import world from '../../public/risk.json';

const MapContainer = styled.div`
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
        fill: rgba(168,43,43,0.83);
    }

    // When a layer is focused.
    &:focus {
        fill: rgba(168,43,43,0.6);
    }

    // When a layer is 'checked' (via checkedLayers prop).
    &[aria-checked='true'] {
        fill: rgba(56,43,168,1);
    }

    // When a layer is 'selected' (via currentLayers prop).
    &[aria-current='true'] {
        fill: rgba(56,43,168,0.83);
    }

    // You can also highlight a specific layer via it's id
    &[id="northwest_territory"] {
        fill: rgba(56,43,168,0.6);
    }
    }
}
`;

const Map: React.FC = () => {

    const style = { margin: '1rem auto', width: '300px' };

    const [selected, setSelected] = React.useState([]);

    const onClick = ({ target }) => {
        const id = target.attributes.id.value;

        // If selected includes the id already, remove it - otherwise add it
        selected.includes(id)
            ? setSelected(selected.filter(sid => sid !== id))
            : setSelected([...selected, id]);
    }

    return (
        <MapContainer>
            <VectorMap {...world} checkedLayers={['indonesia']} layerProps={{ onClick }} />
            <p>Selected:</p>
            <pre>{JSON.stringify(selected, null, 2)}</pre>
        </MapContainer>
    );
};

export default Map;
