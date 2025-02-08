import {useAuth} from "../../hooks/useAuth.ts"

const Home: React.FC = () => {
    const {session} = useAuth()

    // two links:
    // - Get Available Lobbies that redirects to /lobbies !!
    // - Show your games that redirects to /games !!
    return (
        <div>
            <h1>Want to risk it all?</h1>
            <h2>Hello {session?.user?.id}</h2>

            <a href="/lobbies">Get Available Lobbies</a>
            <br/>
            <a href="/games">Show your games</a>
        </div>
    )


}

export default Home