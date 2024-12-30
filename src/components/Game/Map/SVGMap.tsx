import React from "react"
import "./SVGMap.css"
import {SVGMapContinent, SVGMapContinentProps} from "./SVGMapContinent.tsx"

/** Adapted from
 * https://github.com/South-Paw/react-vector-maps/
 */
export interface SVGMapProps extends React.SVGProps<SVGSVGElement> {
    id: string;
    name: string;
    viewBox: string;
    continents: SVGMapContinentProps[];
}

export const SVGMap: React.FC<SVGMapProps> = (
    {
        id = "svg-map",
        name,
        viewBox,
        continents,
    },
) => {
    if (!continents || continents.length === 0) {
        console.error(
            `No 'layers' prop provided. Did you spread a map object onto the component?`,
        )
        return null
    }

    return (
        <svg xmlns="http://www.w3.org/2000/svg" key={id} aria-label={name} viewBox={viewBox}
             className="risk-it-map-container">
            {continents.map(continent => (
                <SVGMapContinent key={continent.id} {...continent}/>
            ))}
        </svg>
    )
}

