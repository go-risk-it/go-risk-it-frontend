import {useContext} from "react"
import {MapContext} from "../providers/Map.tsx"


export const useMapData = () => {
    const context = useContext(MapContext)
    if (!context) {
        throw new Error("useMap must be used within a MapProvider")
    }
    const {mapData, getSvgPathForRegion, mapGraph} = context
    return {mapData, getSvgPathForRegion, mapGraph}
}