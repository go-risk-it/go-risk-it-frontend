import {useServerQuerier} from "../../hooks/useServerQuerier.ts"
import {useEffect, useState} from "react"
import {LobbiesList} from "../../api/lobby/lobbiesList.ts"

const ShowLobby: React.FC<{ lobby: { id: number, numberOfParticipants: number } }> = ({lobby}) => {
    return (
        <div>
           Lobby {lobby.id}: {lobby.numberOfParticipants} participants
        </div>
    )
}

const ShowLobbies: React.FC = () => {
    const {getAvailableLobbies} = useServerQuerier()
    const [lobbies, setLobbies] = useState<LobbiesList>({owned: [], joined: [], joinable: []})
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    useEffect(() => {
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
    }, [])

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <div>
            <h1>Lobbies you own</h1>
            {lobbies.owned.map(lobby => (
                <ShowLobby key={lobby.id} lobby={lobby}/>
            ))}

            <h1>Lobbies you joined</h1>
            {lobbies.joined.map(lobby => (
                <ShowLobby key={lobby.id} lobby={lobby}/>
            ))}

            <h1>Lobbies you can join</h1>
            {lobbies.joinable.map(lobby => (
                <ShowLobby key={lobby.id} lobby={lobby}/>
            ))}
            <a href="/">Go back to home</a>
        </div>
    )
}

export default ShowLobbies