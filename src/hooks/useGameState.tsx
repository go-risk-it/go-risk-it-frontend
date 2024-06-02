import {useContext} from "react"
import {GameStateContext} from "../providers/GameState.tsx"


export const useGameState = () => {

    const {boardState, playersState, thisPlayerState, gameState} = useContext(GameStateContext)

    return {boardState, playersState, thisPlayerState, gameState}

}