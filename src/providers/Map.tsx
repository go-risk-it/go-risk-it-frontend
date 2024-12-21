import React, {createContext, ReactNode, useMemo} from "react"
import world from "../assets/risk.json"
import Graph from "../components/Game/Game/Graph"
import {BoardState} from "../api/message/boardState.ts"
import {PlayerState} from "../api/message/playersState.ts"

interface MapContextProps {
    mapData: typeof world;
    getSvgPathForRegion: (regionId: string) => string;
    mapGraph: Graph;
}

export const MapContext = createContext<MapContextProps | undefined>(undefined)

export const MapProvider: React.FC<{
    children: ReactNode; boardState: BoardState, thisPlayerState: PlayerState,
}> = ({children, boardState}) => {
    const mapGraph = useMemo(() => new Graph(world.links, boardState), [boardState])

    const getSvgPathForRegion = (regionId: string): string => {
        const layer = world.layers.find(l => l.id === regionId)
        if (layer) {
            return layer.d
        }
        console.warn(`No SVG path found for region ${regionId}`)
        return ""
    }

    return (
        <MapContext.Provider value={{mapData: world, getSvgPathForRegion, mapGraph}}>
            {children}
        </MapContext.Provider>
    )
}


