import React, {useCallback, useEffect, useState} from "react"
import {Phase} from "../../../api/message/gameState.ts"
import {BoardState} from "../../../api/message/boardState.ts"
import {useGameState} from "../../../hooks/useGameState.tsx"


export interface SVGMapRegionProps {
    id: string;
    name: string;
    d: string;
}

function getRegion(boardState: BoardState, id: string) {
    return boardState.regions.find(region => region.id === id)
}

export const SVGMapRegion: React.FC<SVGMapRegionProps> = ({id, name, d}) => {
    const {gameState, boardState, playersState, thisPlayerState} = useGameState()
    const [center, setCenter] = useState({x: 0, y: 0})
    const [selectable, setSelectable] = useState(false)

    // center the text in the region when the region is rendered
    const measuredRef = useCallback((node: SVGPathElement) => {
        if (node !== null) {
            const bbox = node.getBBox()
            setCenter({
                x: bbox.x + bbox.width / 2,
                y: bbox.y + bbox.height / 2,
            })
        }
    }, [])

    useEffect(() => {
        if (!boardState || !playersState || !gameState || !thisPlayerState) {
            return
        }

        const region = getRegion(boardState, id)

        if (gameState.currentPhase === Phase.DEPLOY) {
            setSelectable(
                gameState.currentTurn === thisPlayerState.index &&
                thisPlayerState.userId === region?.ownerId,
            )
        }
    }, [id, boardState, playersState, gameState, thisPlayerState])

    if (!boardState || !playersState) {
        return null
    }

    const region = getRegion(boardState, id)
    if (!region) {
        console.error(`Region with id ${id} not found`)
        return null
    }

    const player = playersState.players.find(player => player.userId === region.ownerId)
    if (!player) {
        console.error(`Player with id ${region.ownerId} not found`)
        return null
    }

    // center the text in the region
    return (
        <g>
            <path id={id} ref={measuredRef} d={d} aria-label={name}
                  className={`risk-it-player${player.index} ${selectable ? "risk-it-region-selectable" : "risk-it-region-not-selectable"}`}/>
            <title>{name}</title>
            <text
                x={center.x}
                y={center.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="troop-count"
                // style={{pointerEvents: 'none'}}
            >
                {region.troops}
            </text>
        </g>
    )
}