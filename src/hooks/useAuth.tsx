import {supabaseClient} from '../config/supabase-client';

import {useContext} from 'react';
import {AuthContext} from '../providers/Auth.tsx';

// export the useAuth hook
export interface Credentials {
    email: string;
    password: string;
}

export const useAuth = () => {
    const signin = (credentials: Credentials) => {
        return supabaseClient.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        })
    }

    const signup = (credentials: Credentials) => {
        return supabaseClient.auth.signUp({
            email: credentials.email,
            password: credentials.password,
        })
    }

    const signout = () => {
        return supabaseClient.auth.signOut()
    };

    const {session, user} = useContext(AuthContext);

    return {session, user, signin, signup, signout};
};