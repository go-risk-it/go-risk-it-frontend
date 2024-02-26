'use client';
import React from 'react';
import {VectorMap} from '@south-paw/react-vector-maps';
import {StyleSheetManager} from 'styled-components';
import world from '../../public/risk.json';
import {BoardState} from "../api/message/boardState.ts";
import {PlayersState} from "../api/message/playersState.ts";


function Map({boardState}: { boardState: BoardState },
             {playersState}: { playersState: PlayersState }) {

    const [selected, setSelected] = React.useState<string[]>([])
    // for each region, assign it a color based on the owner
    boardState.regions.forEach(region => {
        // the player cannot be undefined, as the region is owned by a player
        const player = playersState.players.find(player => player.userId === region.ownerId)
        if (!player) {
            throw new Error(`Player with id ${region.ownerId} not found`)
        }
        const className = `player${player.index}`
        document.getElementById(region.id)?.classList.add(className)
    })

    const onClick = (event: React.MouseEvent<SVGPathElement, MouseEvent>) => {
        const target = event.target as SVGElement
        const id = target.getAttribute('id')
        // assign the path element to active css class
        target.classList.toggle('active')

        // If selected includes the id already, remove it - otherwise add it
        if (!id) return
        selected.includes(id)
            ? setSelected(selected.filter(sid => sid !== id))
            : setSelected([...selected, id])
    }

    return (
        <StyleSheetManager shouldForwardProp={() => true}>
            <div className={'map-container'}>
                <VectorMap {...world} layerProps={{onClick}}/>
                <p>Selected:</p>
                <pre>{JSON.stringify(selected, null, 2)}</pre>
            </div>
        </StyleSheetManager>
    )
}

export default Map;