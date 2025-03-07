import {useEffect, useState} from "react"
import {GamesList} from "../../api/game/message/gamesList.ts"
import {useServerQuerier} from "../../hooks/useServerQuerier.ts"

const ShowGames: React.FC = () => {
    const {getUserGames} = useServerQuerier()
    const [games, setGames] = useState<GamesList>({games: []})
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchGames = () => {
        getUserGames()
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok")
                }
                return response.json()
            })
            .then(data => {
                setGames(data)
                setIsLoading(false)
            })
            .catch(error => {
                setError(error.message)
                setIsLoading(false)
            })
    }

    useEffect(() => {
        fetchGames()
    }, [])

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <div>
            <h2>Active Games</h2>
            {games.games.map(game => (
                <div key={game.id}>
                    <button onClick={() => window.location.href = `/games/${game.id}`}>Game {game.id}</button>
                </div>
            ))}
        </div>
    )
}

export default ShowGames