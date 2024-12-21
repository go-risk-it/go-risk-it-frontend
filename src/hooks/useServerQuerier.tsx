import {useAuth} from "./useAuth.tsx"
import {DeployMove} from "../api/message/deployMove.ts"
import {AttackMove} from "../api/message/attackMove.ts"
import {GameState} from "../api/message/gameState.ts"
import {ConquerMove} from "../api/message/conquerMove.ts"
import {ReinforceMove} from "../api/message/reinforceMove.ts"
import {AdvanceMove} from "../api/message/advanceMove.ts"
import {CardMove} from "../api/message/cardMove.ts"

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

    const doReinforce = async (reinforceMove: ReinforceMove, gameState: GameState): Promise<Response> => {
        return doMove(reinforceMove, `${process.env.REACT_APP_API_URL!}/games/${gameState.id}/moves/reinforcements`)
    }

    const doAdvance = async (advanceMove: AdvanceMove, gameState: GameState): Promise<Response> => {
        return doMove(advanceMove, `${process.env.REACT_APP_API_URL!}/games/${gameState.id}/advancements`)
    }

    const doPlayCards = async (cardMove: CardMove, gameState: GameState): Promise<Response> => {
        return doMove(cardMove, `${process.env.REACT_APP_API_URL!}/games/${gameState.id}/moves/cards`)
    }

    return {
        doDeploy,
        doAttack,
        doConquer,
        doReinforce,
        doAdvance,
        doPlayCards,
    }
}
