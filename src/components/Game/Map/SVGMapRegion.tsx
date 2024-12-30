import React, {useCallback, useState} from "react"
import "./SVGMap.css"


export interface SVGMapRegionProps {
    id: string;
    name: string;
    d: string;
    onRegionClick: (() => void) | null;
    troops: number;
    ownerIndex: number;
}


export const SVGMapRegion: React.FC<SVGMapRegionProps> = ({id, name, d, onRegionClick, troops, ownerIndex}) => {
    const [center, setCenter] = useState({x: 0, y: 0})

    // center the text in the region when the region is rendered
    const measuredRef = useCallback((node: SVGPathElement) => {
        if (node !== null) {
            const bbox = node.getBBox()
            setCenter({
                x: bbox.x + bbox.width / 2,
                y: bbox.y + bbox.height / 2,
            })
        }
    }, [])

    const isSelectable = onRegionClick !== null


    // center the text in the region
    return (
        <g {...(isSelectable ? {onClick: onRegionClick} : {})}>
            <path id={id} ref={measuredRef} d={d} aria-label={name}
                  className={`risk-it-region risk-it-player${ownerIndex} ${isSelectable ? "risk-it-region-selectable" : "risk-it-region-not-selectable"}`}/>
            <title>{name}</title>
            <text
                x={center.x}
                y={center.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="troop-count"
                // style={{pointerEvents: 'none'}}
            >
                {troops}
            </text>
        </g>
    )
}