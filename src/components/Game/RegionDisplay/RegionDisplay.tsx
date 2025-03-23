import React, {useEffect, useRef} from "react"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import "../Map/SVGMap.css"
import "./RegionDisplay.css"
import {useMapData} from "../../../hooks/useMapData.ts"


interface RegionDisplayProps {
    regionId: string;
    troops?: number;
    ownerIndex: number;
}

const RegionDisplay: React.FC<RegionDisplayProps> = ({regionId, troops, ownerIndex}) => {
    const {getSvgPathForRegion} = useMapData()
    const svgRef = useRef<SVGSVGElement>(null)
    const svgPath = getSvgPathForRegion(regionId)

    useEffect(() => {
        if (svgRef.current && svgPath) {
            const svgElement = svgRef.current
            const pathElement = svgElement.querySelector("path")
            if (pathElement) {
                const bbox = pathElement.getBBox()
                const padding = 5
                const viewBox = `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`
                svgElement.setAttribute("viewBox", viewBox)
            }
        }
    }, [svgPath])

    return (
        <Box display="flex" flexDirection="column" alignItems="center">
            <svg ref={svgRef} className="risk-it-map-container risk-it-region-display">
                <path
                    d={svgPath}
                    className={`risk-it-player${ownerIndex}`}
                    stroke="#000"
                    strokeWidth="1"
                />
            </svg>
            {troops !== undefined && <Typography variant="body2">Troops: {troops}</Typography>}
        </Box>
    )
}

export default RegionDisplay
