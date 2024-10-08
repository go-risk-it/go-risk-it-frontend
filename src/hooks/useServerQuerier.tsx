import {useAuth} from "./useAuth.tsx"
import {DeployMove} from "../api/message/deployMove.ts"
import {AttackMove} from "../api/message/attackMove.ts"
import {GameState} from "../api/message/gameState.ts"
import {ConquerMove} from "../api/message/conquerMove.ts"

export const useServerQuerier = () => {

    const {session} = useAuth()
    if (!session) {
        throw Error("Session not found")
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

    const doDeploy = async (deployMove: DeployMove, gameState: GameState): Promise<Response> => {
        return doMove(deployMove, `${process.env.REACT_APP_API_URL!}/games/${gameState.id}/moves/deployments`)
    }

    const doAttack = async (attackMove: AttackMove, gameState: GameState): Promise<Response> => {
        return doMove(attackMove, `${process.env.REACT_APP_API_URL!}/games/${gameState.id}/moves/attacks`)
    }

    const doConquer = async (conquerMove: ConquerMove, gameState: GameState): Promise<Response> => {
        return doMove(conquerMove, `${process.env.REACT_APP_API_URL!}/games/${gameState.id}/moves/conquers`)
    }

    return {
        doDeploy,
        doAttack,
        doConquer,
    }
}
