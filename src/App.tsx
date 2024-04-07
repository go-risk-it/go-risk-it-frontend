import './App.css'

// App.js
// import React from 'react';
import Game from "./components/Game/Game/Game.tsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import SignIn from "./components/Auth/SignIn/SignIn.tsx";
import SignUp from "./components/Auth/SignUp/SignUp.tsx";
import {AuthContext} from './contexts/AuthContext.ts';
import {useAuth} from "./hooks/useAuth.ts";
import {ProtectedRoute} from "./components/Auth/PrivateRoute/PrivateRoute.tsx";


const App = () => {
    const {user, setUser} = useAuth();
    return (
        <AuthContext.Provider value={{user, setUser}}>
            <BrowserRouter>
                <Routes>
                    <Route element={<ProtectedRoute/>}>
                        <Route path="/" element={<Game/>}/>
                    </Route>
                    <Route path="/signin" element={<SignIn/>}/>
                    <Route path="/signup" element={<SignUp/>}/>
                </Routes>
            </BrowserRouter>
        </AuthContext.Provider>
    );
};

export default App;
