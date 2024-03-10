import React from 'react';
import {VectorMap} from '@south-paw/react-vector-maps';
import {StyleSheetManager} from 'styled-components';
import world from '../../../public/risk.json';
import {BoardState} from "../../api/message/boardState.ts";
import {PlayersState} from "../../api/message/playersState.ts";
import {GameState} from "../../api/message/gameState.ts";

import './Board.css'

interface BoardProps {
    boardState: BoardState;
    gameState: GameState;
    playersState: PlayersState;
    playerIndex: number;
}

const Board: React.FC<BoardProps> = ({boardState, gameState, playersState, playerIndex}) => {

    const [selected, setSelected] = React.useState<string[]>([])
    // for each region, assign it a color based on the owner
    boardState.regions.forEach(region => {
        // the player cannot be undefined, as the region is owned by a player
        const player = playersState.players.find(player => player.id === region.ownerId)
        if (!player) {
            throw new Error(`Player with id ${region.ownerId} not found`)
        }
        const className = `player${player.index}`
        document.getElementById(region.id)?.classList.add(className)
    })

    function onClickDeployPhase(id: string) {
        const region = boardState.regions.find(region => region.id === id)
        if (!region) {
            throw new Error(`Region with id ${id} not found`)
        }
        const player = playersState.players.find(player => player.index === playerIndex)
        if (!player) {
            throw new Error(`Player with index ${playerIndex} not found`)
        }
        if (region.ownerId === player.id) {
            console.log(`Deploying troops to region ${id}`)
            setSelected([...selected, id])
        } else {
            console.log(`Cannot deploy troops to region ${id} as it is owned by player ${region.ownerId}`)
        }

    }

    const onClick = (event: React.MouseEvent<SVGPathElement, MouseEvent>) => {
        const target = event.target as SVGElement
        const id = target.getAttribute('id')
        // assign the path element to active css class
        // target.classList.toggle('active')
        //
        // // If selected includes the id already, remove it - otherwise add it
        if (!id) return
        // selected.includes(id)
        //     ? setSelected(selected.filter(sid => sid !== id))
        //     : setSelected([...selected, id])
        switch (gameState.currentPhase) {
            case "DEPLOY":
                return onClickDeployPhase(id)
        }
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

export default Board;