import {useAuth} from "./useAuth.ts"
import {DeployMove} from "../api/game/message/deployMove.ts"
import {AttackMove} from "../api/game/message/attackMove.ts"
import {GameState} from "../api/game/message/gameState.ts"
import {ConquerMove} from "../api/game/message/conquerMove.ts"
import {ReinforceMove} from "../api/game/message/reinforceMove.ts"
import {AdvanceMove} from "../api/game/message/advanceMove.ts"
import {CardMove} from "../api/game/message/cardMove.ts"
import {JoinLobby} from "../api/lobby/joinLobby.ts"
import {CreateLobby} from "../api/lobby/createLobby.ts"

export const useServerQuerier = () => {
    const {session} = useAuth()
    if (!session) {
        throw Error("Session not found")
    }

    const doGetAuthenticated = async (url: string): Promise<Response> => {
        return fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${session.access_token}`,
            },
        })
    }

    const doPostAuthenticated = async (url: string, body: unknown = null): Promise<Response> => {
        const options: RequestInit = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`,
            },
        }
        if (body !== null) {
            options.body = JSON.stringify(body)
        }
        return fetch(url, options)
    }

    const doDeploy = async (deployMove: DeployMove, gameState: GameState): Promise<Response> => {
        return doPostAuthenticated(`${process.env.REACT_APP_API_URL!}/games/${gameState.id}/moves/deployments`, deployMove)
    }

    const doAttack = async (attackMove: AttackMove, gameState: GameState): Promise<Response> => {
        return doPostAuthenticated(`${process.env.REACT_APP_API_URL!}/games/${gameState.id}/moves/attacks`, attackMove)
    }

    const doConquer = async (conquerMove: ConquerMove, gameState: GameState): Promise<Response> => {
        return doPostAuthenticated(`${process.env.REACT_APP_API_URL!}/games/${gameState.id}/moves/conquers`, conquerMove)
    }

    const doReinforce = async (reinforceMove: ReinforceMove, gameState: GameState): Promise<Response> => {
        return doPostAuthenticated(`${process.env.REACT_APP_API_URL!}/games/${gameState.id}/moves/reinforcements`, reinforceMove)
    }

    const doAdvance = async (advanceMove: AdvanceMove, gameState: GameState): Promise<Response> => {
        return doPostAuthenticated(`${process.env.REACT_APP_API_URL!}/games/${gameState.id}/advancements`, advanceMove)
    }

    const doPlayCards = async (cardMove: CardMove, gameState: GameState): Promise<Response> => {
        console.log("Playing cards: ", cardMove)
        return doPostAuthenticated(`${process.env.REACT_APP_API_URL!}/games/${gameState.id}/moves/cards`, cardMove)
    }


    const getAvailableLobbies = async () => {
        return doGetAuthenticated(`${process.env.REACT_APP_API_URL!}/lobbies/summary`)
    }

    const createLobby = async (ownerName: string) => {
        const body: CreateLobby = {ownerName: ownerName}
        return doPostAuthenticated(`${process.env.REACT_APP_API_URL!}/lobbies`, body)
    }

    const joinLobby = async (lobbyId: number, participantName: string) => {
        const body: JoinLobby = {participantName: participantName}
        return doPostAuthenticated(`${process.env.REACT_APP_API_URL!}/lobbies/${lobbyId}/join`, body)
    }

    const startGame = async (lobbyId: number) => {
        return doPostAuthenticated(`${process.env.REACT_APP_API_URL!}/lobbies/${lobbyId}/start`)
    }

    const getUserGames = async () => {
        return doGetAuthenticated(`${process.env.REACT_APP_API_URL!}/games/summary`)
    }

    return {
        doDeploy,
        doAttack,
        doConquer,
        doReinforce,
        doAdvance,
        doPlayCards,
        getAvailableLobbies,
        createLobby,
        joinLobby,
        startGame,
        getUserGames,
    }
}
