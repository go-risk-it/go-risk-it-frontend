import {useServerQuerier} from "../../hooks/useServerQuerier.ts"
import {useEffect, useState} from "react"
import {LobbiesList} from "../../api/lobby/lobbiesList.ts"
import {useAuth} from "../../hooks/useAuth.ts"

const ShowLobby: React.FC<{
    lobby: { id: number, numberOfParticipants: number }, joinLobby?: (lobbyId: number) => void
}> = ({lobby, joinLobby}) => {
    return (
        <div>
            Lobby {lobby.id}: {lobby.numberOfParticipants} participants {joinLobby &&
            <button onClick={() => joinLobby(lobby.id)}>Join</button>}
        </div>
    )
}

const ShowLobbies: React.FC = () => {
    const {getAvailableLobbies, createLobby, joinLobby} = useServerQuerier()
    const [lobbies, setLobbies] = useState<LobbiesList>({owned: [], joined: [], joinable: []})
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const {user} = useAuth()

    const fetchLobbies = () => {
        getAvailableLobbies()
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok")
                }
                return response.json()
            })
            .then(data => {
                setLobbies(data)
                setIsLoading(false)
            })
            .catch(error => {
                setError(error.message)
                setIsLoading(false)
            })
    }

    useEffect(() => {
        fetchLobbies()
    }, [])

    if (!user || !user.email) return null

    const handleCreateLobby = () => {
        createLobby(user.email).then(() => {
            fetchLobbies()
        })
    }

    const handleJoinLobby = (lobbyId: number) => {
        joinLobby(lobbyId, user.email).then(() =>
            fetchLobbies(),
        )
    }

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <div>
            <h2>Lobbies you own</h2>
            {lobbies.owned.map(lobby => (
                <ShowLobby key={lobby.id} lobby={lobby}/>
            ))}
            {/* Button to create a new lobby */}
            <button onClick={handleCreateLobby}>Create a new lobby</button>

            <h2>Lobbies you joined</h2>
            {lobbies.joined.map(lobby => (
                <ShowLobby key={lobby.id} lobby={lobby}/>
            ))}

            <h2>Lobbies you can join</h2>
            {lobbies.joinable.map(lobby => (
                <ShowLobby key={lobby.id} lobby={lobby} joinLobby={handleJoinLobby}/>
            ))}
        </div>
    )
}

export default ShowLobbies