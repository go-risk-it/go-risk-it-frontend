import {useContext} from "react"
import {GameStateContext} from "../providers/GameState.tsx"


export const useGameState = () => {

    return useContext(GameStateContext)
}