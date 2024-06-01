import React from 'react';
import world from '../../../assets/risk.json';
import {DeployAction} from "../../../api/message/deployAction.ts";

import './Map.css'
import {SVGMap} from "./SVGMap.tsx";


interface MapProps {
    deployAction: DeployAction;
    setDeployAction: (action: DeployAction) => void;
}

const Map: React.FC<MapProps> = (//{
                                    //deployAction, setDeployAction
                                 //}
                                 ) => {
    // const svgContainerRef = useRef<SVGSVGElement>(null);
    // const {boardState, playersState, gameState, thisPlayerState} = useContext(GameStateContext);



    // function onClickDeployPhase(id: string) {
    //     if (!boardState) {
    //         throw new Error("Board state is null")
    //     }
    //     const region = boardState.regions.find(region => region.id === id)
    //     if (!region) {
    //         throw new Error(`Region with id ${id} not found`)
    //     }
    //     if (region.ownerId === thisPlayerState?.userId) {
    //         console.log(`Deploying troops to region ${id}`)
    //         setDeployAction({regionId: id, userId: thisPlayerState?.userId, currentTroops: region.troops, desiredTroops: 0})
    //     } else {
    //         console.log(`Cannot deploy troops to region ${id} as it is owned by player ${region.ownerId}`)
    //     }
    //
    // }

    // const onClick = (event: React.MouseEvent<SVGPathElement, MouseEvent>) => {
    //     const target = event.target as SVGElement
    //     const id = target.getAttribute('id')
    //
    //     if (!id) return
    //     switch (gameState?.currentPhase) {
    //         case Phase.DEPLOY:
    //             return onClickDeployPhase(id)
    //         default:
    //             console.log("Phase `", gameState?.currentPhase, "` not supported")
    //     }
    // }


    return (
        <div className={'risk-it-map-container'}>

            <SVGMap {...world} />
        </div>
    )
}

export default Map