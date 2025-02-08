import React from "react"
import {SVGMap, SVGMapProps} from "./SVGMap.tsx"
import Graph from "../Game/Graph.ts"
import {useGameState} from "../../../hooks/useGameState.ts"
import {useMapData} from "../../../hooks/useMapData.ts"
import {Region} from "../../../api/game/message/boardState.ts"
import {MapType} from "../../../providers/Map.tsx"
import {SVGMapContinentProps} from "./SVGMapContinent.tsx"
import {SVGMapRegionProps} from "./SVGMapRegion.tsx"


const initContinentLayers: (mapData: MapType) => SVGMapContinentProps[] = (mapData: MapType) => {
    const continentLayers: Map<string, SVGMapContinentProps> = new Map()

    mapData.continents.forEach((continent) => {
        const continentLayer: SVGMapContinentProps = {
            id: continent.id,
            name: continent.name,
            regions: [],
            ownerIndex: undefined,
        }
        continentLayers.set(continent.id, continentLayer)
    })

    mapData.layers.forEach((layer) => {
        const continent = continentLayers.get(layer.continent)
        if (!continent) {
            console.warn(`Continent ${layer.continent} not found for layer ${layer.id}`)
            return
        }
        continent.regions.push({
            id: layer.id,
            name: layer.name,
            d: layer.d,
            onRegionClick: () => null,
            troops: 0,
            ownerIndex: 0,
        })
    })

    return Array.from(continentLayers.values())
}

function getContinentOwnerIndex(continentRegions: SVGMapRegionProps[]): number | undefined {
    const ownerIndices = new Set(continentRegions.map(region => region.ownerIndex))
    if (ownerIndices.size === 1) {
        console.log(`Continent of ${continentRegions[0].name} owned by player ${ownerIndices.values().next().value}`)
        return ownerIndices.values().next().value
    }
    return undefined
}

const MapContainer: React.FC<{
    onRegionClick: (graph: Graph, region: Region) => (() => void) | null;
}> = ({onRegionClick}) => {
    const {boardState, playersState, thisPlayerState} = useGameState()
    if (!boardState || !playersState || !thisPlayerState) {
        throw Error("Game state not loaded")
    }
    const {mapData, mapGraph} = useMapData()

    const thisPlayerRegions = new Set(boardState.regions.filter(region => region.ownerId === thisPlayerState.userId).map(region => region.id))

    const continentLayers = initContinentLayers(mapData)

    continentLayers.forEach((continent) => {
            continent.regions.forEach((region) => {
                const boardRegion = boardState.regions.find(boardRegion => boardRegion.id === region.id)
                if (!boardRegion) throw Error(`Region with id ${region.id} not found`)

                const owner = playersState.players.find(player => player.userId === boardRegion.ownerId)
                if (!owner) throw Error(`Owner with id ${boardRegion.ownerId} not found`)

                region.onRegionClick = onRegionClick(mapGraph, boardRegion)
                region.troops = boardRegion.troops
                region.ownerIndex = owner.index
            })
            // sort regions so that the regions of the current player are drawn on top
            continent.regions.sort((a, b) => {
                if (thisPlayerRegions.has(a.id)) return 1
                if (thisPlayerRegions.has(b.id)) return -1
                return 0
            })
            continent.ownerIndex = getContinentOwnerIndex(continent.regions)
        },
    )
    const svgMapProps: SVGMapProps = {
        id: mapData.id,
        name: mapData.name,
        viewBox: mapData.viewBox,
        continents: continentLayers,
    }

    return <SVGMap {...svgMapProps}/>
}

export default MapContainer