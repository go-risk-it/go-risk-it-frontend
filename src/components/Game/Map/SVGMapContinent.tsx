import {SVGMapRegion, SVGMapRegionProps} from "./SVGMapRegion.tsx"
import React, {ReactElement} from "react"

export interface SVGMapContinentProps {
    id: string;
    name: string;
    regions: SVGMapRegionProps[];
    ownerIndex?: number;
}

export const SVGMapContinent: React.FC<SVGMapContinentProps> = ({id, name, regions, ownerIndex}) => {
    let filter: ReactElement = <></>
    if (ownerIndex !== undefined) {
        filter = <filter id={`outline-${id}`}>
            <feMorphology in="SourceAlpha" result="expanded"
                          operator="dilate" radius="5"/>
            <feFlood className={`risk-it-player${ownerIndex}`} result="black"/>
            <feComposite in="black" in2="expanded" operator="in"/>
            <feComposite in="SourceGraphic"/>
        </filter>
    }
    return (
        <>
            {filter}
            <g id={id} aria-label={name} filter={`url(#outline-${id})`} className="risk-it-continent">
                {regions.map((region) => (
                    <SVGMapRegion key={region.id} id={region.id} name={region.name} d={region.d}
                                  onRegionClick={region.onRegionClick} troops={region.troops}
                                  ownerIndex={region.ownerIndex}/>
                ))}
            </g>
        </>

    )
}