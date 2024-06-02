import React from "react"
import {SVGMapRegion, SVGMapRegionProps} from "./SVGMapRegion.tsx"
import "./SVGMap.css"

/** Adapted from
 * https://github.com/South-Paw/react-vector-maps/
 */


export interface SVGMapProps extends React.SVGProps<SVGSVGElement> {
    children?: React.ReactNode;
    id: string;
    name: string;
    viewBox: string;
    layers: SVGMapRegionProps[];
}

export const SVGMap: React.FC<SVGMapProps> = (
    {
        children,
        id = "svg-map",
        name,
        layers,
        //tabIndex = 0,
        ...other
    },
) => {
    if (!layers || layers.length === 0) {
        // eslint-disable-next-line no-console
        console.error(
            `No 'layers' prop provided. Did you spread a map object onto the component?`,
        )
        return null
    }

    return (
        <svg xmlns="http://www.w3.org/2000/svg" key={id} aria-label={name} {...other}>
            {children}
            {layers.map((layer) => (
                <SVGMapRegion key={layer.id} id={layer.id} name={layer.name} d={layer.d}/>
            ))}
        </svg>
    )
}

