import {useEffect, useState} from "react"
import {Alert, Box, CircularProgress, Grid} from '@mui/material'
import {GamesList} from "../../api/game/message/gamesList.ts"
import {useServerQuerier} from "../../hooks/useServerQuerier.ts"
import {useAuth} from "../../hooks/useAuth.ts"
import GameCard from "./GameCard"
import EmptyGames from "./EmptyGames"

const ShowGames: React.FC = () => {
    const {getUserGames} = useServerQuerier()
    const {session} = useAuth()
    const [games, setGames] = useState<GamesList>({games: []})
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchGames = () => {
        setIsLoading(true)
        setError(null)
        getUserGames()
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch games")
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

    if (!session) {
        return (
            <Alert severity="info" sx={{mt: 2}}>
                Please sign in to view your games
            </Alert>
        )
    }

    if (isLoading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                <CircularProgress />
            </Box>
        )
    }

    if (error) {
        return (
            <Alert severity="error" sx={{mt: 2}}>
                {error}
            </Alert>
        )
    }

    return (
        <Box>            
            {games.games.length > 0 ? (
                <Grid container spacing={3}>
                    {games.games.map(game => (
                        <Grid item xs={12} sm={6} md={4} key={game.id}>
                            <GameCard game={game} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <EmptyGames />
            )}
        </Box>
    )
}

export default ShowGames