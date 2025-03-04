import {useAuth} from "../../hooks/useAuth.ts"
import GamesList from "./GamesList.tsx"
import ShowLobbies from "./ShowLobbies.tsx"
import Button from "@mui/material/Button"
import React from "react"

const Home: React.FC = () => {
    const {session, signout} = useAuth()

    // two links:
    // - Get Available Lobbies that redirects to /lobbies !!
    // - Show your games that redirects to /games !!
    return (
        <div>
            <Button className="signout-button" onClick={signout}>Sign out</Button>
            <h2>Hello {session?.user?.id}</h2>

            <h1>Want to risk it all?</h1>

            <GamesList/>

            <ShowLobbies/>
        </div>
    )


}

export default Home