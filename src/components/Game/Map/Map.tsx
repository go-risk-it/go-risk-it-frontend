import React, {useContext, useEffect, useRef} from 'react';
import {VectorMap as OriginalVectorMap} from '@south-paw/react-vector-maps';
import world from '../../../assets/risk.json';
import {Region} from "../../../api/message/boardState.ts";
import {PlayerState} from "../../../api/message/playersState.ts";
import {GameState, Phase} from "../../../api/message/gameState.ts";
import {DeployAction} from "../../../api/message/deployAction.ts";

import './Map.css'
import {GameStateContext} from "../../../providers/GameState.tsx";

const VectorMap = React.forwardRef<SVGSVGElement, any>((props, ref) => (
    <OriginalVectorMap {...props} ref={ref} />
));

interface MapProps {
    deployAction: DeployAction;
    setDeployAction: (action: DeployAction) => void;
}

function isRegionSelectable(region: Region, playersState: PlayerState, gameState: GameState, deployAction: DeployAction) {
    if (gameState.currentPhase === Phase.DEPLOY) {
        return gameState.currentTurn === playersState.index && region.ownerId === playersState.userId && deployAction.regionId === null
    }
    return false
}

function insertAfter(referenceNode: Element, newNode: Element) {
    referenceNode?.parentNode?.insertBefore(newNode, referenceNode.nextSibling);
}

const Map: React.FC<MapProps> = ({
                                    deployAction, setDeployAction
                                 }) => {
    const svgContainerRef = useRef<SVGSVGElement>(null);
    const {boardState, playersState, gameState, thisPlayerState} = useContext(GameStateContext);

    useEffect(() => {
        if (!boardState || !playersState || !gameState || !thisPlayerState) {
            return
        }
        console.log("Coloring regions, board state: ", boardState, 'svgContainerRef: ', svgContainerRef.current)
        if (svgContainerRef.current) {
            // for each region, assign it a color based on the owner
            boardState.regions.forEach(region => {
                // the player cannot be undefined, as the region is owned by a player
                const player = playersState.players.find(player => player.userId === region.ownerId)
                if (!player) {
                    throw new Error(`Player with id ${region.ownerId} not found`)
                }

                // remove all classes from the region that start with 'risk-it'
                // regionPathElement is a path element in the SVG
                const regionElement = document.getElementById(region.id)
                const regionPathElement = regionElement?.querySelector('path')

                regionPathElement?.classList.forEach(className => {
                    if (className.startsWith('risk-it')) {
                        regionPathElement?.classList.remove(className)
                    }
                    // add text with number of troops in the region
                    // Create a new text element
                    const svgNamespace = "http://www.w3.org/2000/svg";
                    const numberOfTroopsText = document.createElementNS(svgNamespace, "text");

                    // Set the text content to region.troops
                    numberOfTroopsText.textContent = region.troops.toString();

                    // Position the text element
                    // Assuming you want to center the text over the path element
                    const bbox = regionPathElement.getBBox();
                    const x = bbox.x + bbox.width / 2;
                    const y = bbox.y + bbox.height / 2;

                    // Set attributes to position the text
                    numberOfTroopsText.setAttribute("x", x.toString());
                    numberOfTroopsText.setAttribute("y", y.toString());
                    numberOfTroopsText.setAttribute("text-anchor", "middle");
                    numberOfTroopsText.setAttribute("dominant-baseline", "middle");

                    // Set additional styles if needed
                    numberOfTroopsText.setAttribute("fill", "black"); // Set the text color
                    numberOfTroopsText.style.fontSize = "12px"; // Set the font size, adjust as needed

                    insertAfter(regionPathElement, numberOfTroopsText)
                })

                // add classes to style the region based on the game state
                const playerClass = `risk-it-player${player.index}`
                const activeClass = isRegionSelectable(region, thisPlayerState, gameState, deployAction) ? 'risk-it-region-selectable' : 'risk-it-region-not-selectable'
                regionPathElement?.classList.add(playerClass, activeClass)
            })
        }
    }, [svgContainerRef.current, boardState, playersState, gameState, thisPlayerState, deployAction])


    function onClickDeployPhase(id: string) {
        if (!boardState) {
            throw new Error("Board state is null")
        }
        const region = boardState.regions.find(region => region.id === id)
        if (!region) {
            throw new Error(`Region with id ${id} not found`)
        }
        if (region.ownerId === thisPlayerState?.userId) {
            console.log(`Deploying troops to region ${id}`)
            setDeployAction({regionId: id, userId: thisPlayerState?.userId, currentTroops: region.troops, desiredTroops: 0})
        } else {
            console.log(`Cannot deploy troops to region ${id} as it is owned by player ${region.ownerId}`)
        }

    }

    const onClick = (event: React.MouseEvent<SVGPathElement, MouseEvent>) => {
        const target = event.target as SVGElement
        const id = target.getAttribute('id')

        if (!id) return
        switch (gameState?.currentPhase) {
            case Phase.DEPLOY:
                return onClickDeployPhase(id)
            default:
                console.log("Phase `", gameState?.currentPhase, "` not supported")
        }
    }


    return (
        <div className={'risk-it-map-container'}>
            <VectorMap {...world} layerProps={{onClick}} ref={svgContainerRef}/>
        </div>
    )
}

export default Map;