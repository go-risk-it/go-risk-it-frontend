import React from 'react'
import StatusBar from "../StatusBar/StatusBar.tsx";

import './Game.css'
import Button from "@mui/material/Button";
import {useAuth} from "../../../hooks/useAuth.tsx";
import "./Game.css"
import world from "../../../assets/risk.json";
import {SVGMap} from "../Map/SVGMap.tsx";


const Game: React.FC = () => {
    const {signout} = useAuth()

    return (
        <div>
            <h1>Go risk it!</h1>
            <Button onClick={signout}>Sign out</Button>
            <SVGMap {...world} className='risk-it-map-container'/>
            {/*<DeployPopup deployAction={deployAction} setDeployAction={setDeployAction}/>*/}
            <StatusBar/>
        </div>
    )
}

export default Game