import {useAuth} from "./useAuth.tsx"
import {DeployMove} from "../api/message/deployMove.ts"
import {AttackMove} from "../api/message/attackMove.ts"
import {useGameState} from "./useGameState.tsx"

export const useServerQuerier = () => {

    const {session} = useAuth()
    const {gameState} = useGameState()
    if (!session) {
        throw Error("Session not found")
    }
    if (!gameState) {
        throw Error("Game state not found")
    }

    const doMove = async (move: unknown, url: string): Promise<Response> => {
        const body = JSON.stringify(move)
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`,
            },
            body: body,
        })
    }

    const doDeploy = async (deployMove: DeployMove): Promise<Response> => {
        return doMove(deployMove, `${process.env.REACT_APP_API_URL!}/games/${gameState.id}/moves/deployments`)
    }

    const doAttack = async (attackMove: AttackMove): Promise<Response> => {
        return doMove(attackMove, `${process.env.REACT_APP_API_URL!}/games/${gameState.id}/moves/attacks`)
    }

    return {
        doDeploy,
        doAttack,
    }
}
