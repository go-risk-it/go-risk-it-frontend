// class that handles the graph of the regions

import {BoardState, Region} from "../../../api/message/boardState.ts"

// a link is an object with "source" and "target" properties (strings)
interface Link {
    source: string
    target: string
}


class Graph {
    graph: Map<string, Set<string>>
    regionMap: Map<string, Region>

    constructor(links: Link[], boardState: BoardState) {
        this.graph = new Map()
        this.regionMap = new Map<string, Region>()
        for (const region of boardState.regions) {
            this.regionMap.set(region.id, region)
        }
        for (const link of links) {
            const source = link.source
            const target = link.target

            const region1 = this.regionMap.get(source)
            const region2 = this.regionMap.get(target)
            if (!region1 || !region2) {
                throw Error(`Region not found in boardState: ${source} or ${target}`)
            }

            if (!this.graph.has(source)) {
                this.graph.set(source, new Set())
            }
            if (!this.graph.has(target)) {
                this.graph.set(target, new Set())
            }
            this.graph.get(source)!.add(target)
            this.graph.get(target)!.add(source)
        }
    }

    areNeighbors(region_id1: string, region_id2: string): boolean {
        return this.graph.get(region_id1)?.has(region_id2) || false
    }

    canReach(region_id1: string, region_id2: string): boolean {
        const region1 = this.regionMap.get(region_id1)
        const region2 = this.regionMap.get(region_id2)
        if (!region1 || !region2) {
            throw Error(`Region not found in boardState: ${region_id1} or ${region_id2}`)
        }
        if (region1.ownerId !== region2.ownerId) {
            return false
        }

        const visited = new Set<string>()
        const queue = [region1]
        while (queue.length > 0) {
            const current = queue.pop()!
            if (current === region2) {
                return true
            }
            visited.add(current.id)
            for (const neighbor_id of this.graph.get(current.id)!) {
                if (!visited.has(neighbor_id)) {
                    const neighbor = this.regionMap.get(neighbor_id)!
                    if (neighbor.ownerId === region1.ownerId) {
                        queue.push(neighbor)
                    }
                }
            }
        }
        return false
    }
}

export default Graph