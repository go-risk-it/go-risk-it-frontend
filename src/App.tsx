import "./App.css"

// App.js
// import React from 'react';
import Game from "./components/Game/Game/Game.tsx"
import {BrowserRouter, Route, Routes, useParams} from "react-router-dom"
import SignIn from "./components/Auth/SignIn/SignIn.tsx"
import SignUp from "./components/Auth/SignUp/SignUp.tsx"
import {AuthProvider} from "./providers/Auth.tsx"
import ProtectedRoute from "./components/Auth/ProtectedRoute/ProtectedRoute.tsx"
import {WebsocketProvider} from "./providers/Websocket.tsx"
import {GameStateProvider} from "./providers/GameState.tsx"
import Home from "./components/Home/Home.tsx"
import GamesList from "./components/Home/GamesList.tsx"
import ShowLobbies from "./components/Home/ShowLobbies.tsx"


const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<ProtectedRoute><Home/></ProtectedRoute>}/>
                    <Route path="/games" element={<ProtectedRoute><GamesList/></ProtectedRoute>}/>
                    <Route path="/lobbies" element={<ProtectedRoute><ShowLobbies/></ProtectedRoute>}/>
                    <Route path="/games/:id" element={
                        <ProtectedRoute>
                            <GameWithParams/>
                        </ProtectedRoute>
                    }/>
                    <Route path="/signin" element={<SignIn/>}/>
                    <Route path="/signup" element={<SignUp/>}/>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

const GameWithParams = () => {
    const {id} = useParams()
    if (!id) {
        console.error("No game id provided")
        return null
    }

    return (
        <WebsocketProvider gameId={parseInt(id)}>
            <GameStateProvider>
                <Game/>
            </GameStateProvider>
        </WebsocketProvider>
    )
}


export default App
