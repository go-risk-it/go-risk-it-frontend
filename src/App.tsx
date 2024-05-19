import './App.css'

// App.js
// import React from 'react';
import Game from "./components/Game/Game/Game.tsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import SignIn from "./components/Auth/SignIn/SignIn.tsx";
import SignUp from "./components/Auth/SignUp/SignUp.tsx";
import {AuthProvider} from "./hooks/Auth.tsx";
import ProtectedRoute from "./components/Auth/ProtectedRoute/ProtectedRoute.tsx";
import {WebsocketProvider} from "./hooks/Websocket.tsx";


const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={
                        <ProtectedRoute>
                            <WebsocketProvider>
                                <Game/>
                            </WebsocketProvider>
                        </ProtectedRoute>
                    }>
                    </Route>
                    <Route path="/signin" element={<SignIn/>}/>
                    <Route path="/signup" element={<SignUp/>}/>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
