import { useServerQuerier } from "../../hooks/useServerQuerier.ts"
import { useEffect, useState } from "react"
import { LobbiesList } from "../../api/lobby/lobbiesList.ts"
import { useAuth } from "../../hooks/useAuth.ts"
import {
    Card,
    CardContent,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Box,
    Paper,
    Grid,
    CardActions,
    Fade,
    Chip,
    Stack,
    IconButton,
    Tooltip
} from "@mui/material"
import {
    PersonOutline as PersonIcon,
    PlayArrow as PlayIcon,
    Login as LoginIcon,
    Casino as CasinoIcon,
    Refresh as RefreshIcon
} from "@mui/icons-material"

const ShowLobby: React.FC<{
    lobby: { id: number; numberOfParticipants: number }
    joinLobby?: (lobbyId: number) => void
    startGame?: (lobbyId: number) => void
}> = ({ lobby, joinLobby, startGame }) => {
    return (
        <Fade in={true} timeout={500}>
            <Card>
                <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                        <Chip 
                            label={`#${lobby.id}`}
                            color="primary"
                            size="small"
                            sx={{ 
                                borderRadius: '6px',
                                fontWeight: 600
                            }}
                        />
                        <Box sx={{ flexGrow: 1 }} />
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <PersonIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                                {lobby.numberOfParticipants}
                            </Typography>
                        </Stack>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                        {startGame ? "You're the host" : joinLobby ? "Open to join" : "You're a participant"}
                    </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', gap: 1, p: 2, pt: 0 }}>
                    {joinLobby && (
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => joinLobby(lobby.id)}
                            startIcon={<LoginIcon />}
                            size="small"
                        >
                            Join
                        </Button>
                    )}
                    {startGame && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => startGame(lobby.id)}
                            startIcon={<PlayIcon />}
                            size="small"
                        >
                            Start Game
                        </Button>
                    )}
                </CardActions>
            </Card>
        </Fade>
    )
}

const ShowLobbies: React.FC = () => {
    const { getAvailableLobbies, createLobby, joinLobby, startGame } = useServerQuerier()
    const [lobbies, setLobbies] = useState<LobbiesList>({ owned: [], joined: [], joinable: [] })
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const { user } = useAuth()

    const fetchLobbies = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true)
        try {
            const response = await getAvailableLobbies()
            if (!response.ok) throw new Error("Network response was not ok")
            const data = await response.json()
            setLobbies(data)
        } catch (error: any) {
            setError(error?.message || "An error occurred")
        } finally {
            setIsLoading(false)
            if (showRefresh) setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchLobbies()
        const interval = setInterval(() => fetchLobbies(), 5000)
        return () => clearInterval(interval)
    }, [])

    if (user?.email === undefined) 
        return (
            <Alert 
                severity="error" 
                sx={{ borderRadius: 2 }}
            >
                Not logged in
            </Alert>
        )

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
                sx={{ borderRadius: 2 }}
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
        createLobby(participantName).then(() => fetchLobbies(true))
    }

    const handleJoinLobby = (lobbyId: number) => {
        joinLobby(lobbyId, participantName).then(() => fetchLobbies(true))
    }

    const handleStartGame = (lobbyId: number) => {
        startGame(lobbyId).then(() => fetchLobbies(true))
    }

    return (
        <Stack spacing={4}>
            <Box>
                <Stack 
                    direction="row" 
                    alignItems="center" 
                    spacing={2} 
                    mb={3}
                >
                    <Typography variant="h5">Game Lobbies</Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Tooltip title="Refresh lobbies">
                        <IconButton 
                            onClick={() => fetchLobbies(true)}
                            color="primary"
                            size="small"
                            sx={{ opacity: refreshing ? 0.5 : 1 }}
                            disabled={refreshing}
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreateLobby}
                        startIcon={<CasinoIcon />}
                    >
                        Create Lobby
                    </Button>
                </Stack>

                {lobbies.owned.length > 0 && (
                    <Box mb={4}>
                        <Typography variant="h6" color="primary" gutterBottom>
                            Your Lobbies
                        </Typography>
                        <Grid container spacing={2}>
                            {lobbies.owned.map((lobby) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={lobby.id}>
                                    <ShowLobby lobby={lobby} startGame={handleStartGame} />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {lobbies.joined.length > 0 && (
                    <Box mb={4}>
                        <Typography variant="h6" color="primary" gutterBottom>
                            Joined Lobbies
                        </Typography>
                        <Grid container spacing={2}>
                            {lobbies.joined.map((lobby) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={lobby.id}>
                                    <ShowLobby lobby={lobby} />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {lobbies.joinable.length > 0 && (
                    <Box>
                        <Typography variant="h6" color="primary" gutterBottom>
                            Available Lobbies
                        </Typography>
                        <Grid container spacing={2}>
                            {lobbies.joinable.map((lobby) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={lobby.id}>
                                    <ShowLobby lobby={lobby} joinLobby={handleJoinLobby} />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {lobbies.joinable.length === 0 && lobbies.joined.length === 0 && lobbies.owned.length === 0 && (
                    <Paper 
                        sx={{ 
                            p: 4, 
                            textAlign: 'center',
                            background: 'transparent',
                            border: '2px dashed',
                            borderColor: 'divider'
                        }}
                    >
                        <Typography variant="h6" color="primary" gutterBottom>
                            No Active Lobbies
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            Create a new lobby and invite your friends to join!
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCreateLobby}
                            startIcon={<CasinoIcon />}
                        >
                            Create Your First Lobby
                        </Button>
                    </Paper>
                )}
            </Box>
        </Stack>
    )
}

export default ShowLobbies