import React from 'react';
import {VectorMap} from '@south-paw/react-vector-maps';
import world from '../../assets/risk.json';
import {BoardState, Region} from "../../api/message/boardState.ts";
import {PlayersState, PlayerState} from "../../api/message/playersState.ts";
import {GameState, Phase} from "../../api/message/gameState.ts";
import {DeployAction} from "../../api/message/deployAction.ts";

import './Board.css'

interface BoardProps {
    boardState: BoardState;
    gameState: GameState;
    playersState: PlayersState;
    playerState: PlayerState;
    deployAction: DeployAction;
    setDeployAction: (action: DeployAction) => void;
}

function isRegionSelectable(region: Region, playersState: PlayerState, gameState: GameState, deployAction: DeployAction) {
    if (gameState.currentPhase === Phase.DEPLOY) {
        return gameState.currentTurn === playersState.index && region.ownerId === playersState.id && deployAction.regionId === null
    }
    return false
}

const Board: React.FC<BoardProps> = ({
                                         boardState, gameState, playersState, playerState,
                                         deployAction, setDeployAction
                                     }) => {

    // for each region, assign it a color based on the owner
    boardState.regions.forEach(region => {
        // the player cannot be undefined, as the region is owned by a player
        const player = playersState.players.find(player => player.id === region.ownerId)
        if (!player) {
            throw new Error(`Player with id ${region.ownerId} not found`)
        }

        // remove all classes from the region that start with 'risk-it'
        document.getElementById(region.id)?.classList.forEach(className => {
            if (className.startsWith('risk-it')) {
                document.getElementById(region.id)?.classList.remove(className)
            }
        })

        // add classes to style the region based on the game state
        const playerClass = `risk-it-player${player.index}`
        const activeClass = isRegionSelectable(region, playerState, gameState, deployAction) ? 'risk-it-region-selectable' : 'region-not-selectable'
        document.getElementById(region.id)?.classList.add(playerClass, activeClass)
    })

    function onClickDeployPhase(id: string) {
        const region = boardState.regions.find(region => region.id === id)
        if (!region) {
            throw new Error(`Region with id ${id} not found`)
        }
        if (region.ownerId === playerState.id) {
            console.log(`Deploying troops to region ${id}`)
            setDeployAction({regionId: id, troops: playerState.troopsToDeploy})
        } else {
            console.log(`Cannot deploy troops to region ${id} as it is owned by player ${region.ownerId}`)
        }

    }

    const onClick = (event: React.MouseEvent<SVGPathElement, MouseEvent>) => {
        const target = event.target as SVGElement
        const id = target.getAttribute('id')

        if (!id) return
        switch (gameState.currentPhase) {
            case Phase.DEPLOY:
                return onClickDeployPhase(id)
        }
    }

    return (
        <div className={'risk-it-map-container'}>
            <VectorMap {...world} layerProps={{onClick}}/>
        </div>
    )
}

export default Board;