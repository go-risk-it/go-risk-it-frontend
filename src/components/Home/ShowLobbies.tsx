import { useEffect, useState } from "react"
import { useServerQuerier } from "../../hooks/useServerQuerier.ts"
import { LobbiesList } from "../../api/lobby/lobbiesList.ts"
import { useAuth } from "../../hooks/useAuth.ts"
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Grid,
    Stack,
    Typography
} from "@mui/material"
import { LobbyCard } from "./LobbyCard"
import LobbiesHeader from "./LobbiesHeader"
import EmptyLobbies from "./EmptyLobbies"
import './styles/Lobby.styles.css'

const ShowLobbies: React.FC = () => {
    const { getAvailableLobbies, createLobby, joinLobby, startGame } = useServerQuerier()
    const [lobbies, setLobbies] = useState<LobbiesList>({ owned: [], joined: [], joinable: [] })
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { user } = useAuth()

    const fetchLobbies = async () => {
        try {
            const response = await getAvailableLobbies()
            if (!response.ok) throw new Error("Network response was not ok")
            const data = await response.json()
            setLobbies(data)
        } catch (error: any) {
            setError(error?.message || "An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLobbies()
        const interval = setInterval(() => fetchLobbies(), 5000)
        return () => clearInterval(interval)
    }, [])

    if (!user?.email) return <Alert severity="error">Not logged in</Alert>

    if (isLoading) 
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress />
            </Box>
        )

    if (error) 
        return (
            <Alert 
                severity="error"
                action={
                    <Button color="inherit" size="small" onClick={() => fetchLobbies()}>
                        Retry
                    </Button>
                }
            >
                {error}
            </Alert>
        )

    const participantName = user.email.split("@")[0]

    const handleCreateLobby = () => {
        createLobby(participantName).then(() => fetchLobbies())
    }

    const handleJoinLobby = (lobbyId: number) => {
        joinLobby(lobbyId, participantName).then(() => fetchLobbies())
    }

    const handleStartGame = (lobbyId: number) => {
        startGame(lobbyId).then(() => fetchLobbies())
    }

    const renderLobbySection = (
        title: string, 
        lobbies: Array<{ id: number; numberOfParticipants: number }>,
        props: { startGame?: typeof handleStartGame, joinLobby?: typeof handleJoinLobby }
    ) => {
        if (lobbies.length === 0) return null

        return (
            <Box className="lobbies-section">
                <Typography variant="h6" color="primary" gutterBottom>
                    {title}
                </Typography>
                <Grid container spacing={2}>
                    {lobbies.map((lobby) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={lobby.id}>
                            <LobbyCard 
                                lobby={lobby} 
                                {...props}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        )
    }

    const hasNoLobbies = !lobbies.owned.length && !lobbies.joined.length && !lobbies.joinable.length

    return (
        <Stack spacing={4}>
            <Box>
                <LobbiesHeader 
                    onCreateLobby={handleCreateLobby}
                />

                {renderLobbySection("Your Lobbies", lobbies.owned, { startGame: handleStartGame })}
                {renderLobbySection("Joined Lobbies", lobbies.joined, {})}
                {renderLobbySection("Available Lobbies", lobbies.joinable, { joinLobby: handleJoinLobby })}

                {hasNoLobbies && <EmptyLobbies />}
            </Box>
        </Stack>
    )
}

export default ShowLobbies