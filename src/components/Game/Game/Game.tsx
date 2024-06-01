import {useContext, useEffect, useState} from 'react'
import Map from "../Map/Map.tsx";
import StatusBar from "../StatusBar/StatusBar.tsx";

import {DeployAction} from "../../../api/message/deployAction.ts"
import DeployPopup from "../DeployPopup/DeployPopup.tsx"

import './Game.css'
import Button from "@mui/material/Button";
import {useAuth} from "../../../hooks/useAuth.tsx";
import "./Game.css"


function Game() {
    const {signout} = useAuth()

    // UI states
    const [deployAction, setDeployAction] = useState<DeployAction | null>({
        regionId: null,
        userId: "",
        currentTroops: 0,
        desiredTroops: 0
    })


    return (
        <div>
            <h1>Go risk it!</h1>
            <Button onClick={signout}>Sign out</Button>
            <Map deployAction={deployAction} setDeployAction={setDeployAction}/>
            <DeployPopup deployAction={deployAction} setDeployAction={setDeployAction}/>
            <StatusBar/>
        </div>
    )
}

export default Game