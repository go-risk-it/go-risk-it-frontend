import React from "react"
import StatusBar from "../StatusBar/StatusBar.tsx"

import "./Game.css"
import Button from "@mui/material/Button"
import {useAuth} from "../../../hooks/useAuth.tsx"
import world from "../../../assets/risk.json"
import {SVGMap} from "../Map/SVGMap.tsx"
import {useGameState} from "../../../hooks/useGameState.tsx"


const Game: React.FC = () => {
    const {signout} = useAuth()

    const {boardState, thisPlayerState} = useGameState()
    if (!boardState || !thisPlayerState) {
        return null
    }

    const thisPlayerRegions = new Set<string>(
        boardState.regions
            .filter(region => region.ownerId === thisPlayerState.userId)
            .map(region => region.id),
    )

    // sort regions layers: put the ones owned by this player last,
    // so they are rendered on top of other regions and animations are visible
    world.layers.sort((a, b) => {
        if (thisPlayerRegions.has(a.id)) {
            return 1
        }
        if (thisPlayerRegions.has(b.id)) {
            return -1
        }
        return 0
    })

    return (
        <div>
            <h1>Go risk it!</h1>
            <Button onClick={signout}>Sign out</Button>
            <SVGMap {...world} className="risk-it-map-container"/>
            {/*<DeployPopup deployAction={deployAction} setDeployAction={setDeployAction}/>*/}
            <StatusBar/>
        </div>
    )
}

export default Game