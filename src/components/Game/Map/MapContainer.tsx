import React from "react"
import {SVGMap} from "./SVGMap.tsx"
import Graph from "../Game/Graph.ts"
import {Region} from "../../../api/message/boardState.ts"
import {useGameState} from "../../../hooks/useGameState.ts"
import {useMapData} from "../../../hooks/useMapData.ts"

const MapContainer: React.FC<{
    onRegionClick: (graph: Graph, region: Region) => (() => void) | null;
}> = ({onRegionClick}) => {
    const {boardState, playersState, thisPlayerState} = useGameState()
    if (!boardState || !playersState || !thisPlayerState) {
        throw Error("Game state not loaded")
    }
    const {mapData, mapGraph} = useMapData()

    const thisPlayerRegions = new Set(boardState.regions.filter(region => region.ownerId === thisPlayerState.userId).map(region => region.id))

    const svgMapProps = {
        ...mapData,
        layers: mapData.layers.map(layer => {
            const region = boardState.regions.find(boardRegion => boardRegion.id === layer.id)
            if (!region) throw Error(`Region with id ${layer.id} not found`)
            const owner = playersState.players.find(player => player.userId === region.ownerId)
            if (!owner) throw Error(`Owner with id ${region.ownerId} not found`)
            return {
                ...layer,
                onRegionClick: onRegionClick(mapGraph, region),
                troops: region.troops,
                ownerIndex: owner.index,
            }
        })
            // sort regions layers: put the ones owned by this player last,
            // so they are rendered on top of other regions and animations are visible
            .sort((a, b) => {
                if (thisPlayerRegions.has(a.id)) return 1
                if (thisPlayerRegions.has(b.id)) return -1
                return 0
            }),
    }

    return <SVGMap {...svgMapProps} className="risk-it-map-container"/>
}

export default MapContainer