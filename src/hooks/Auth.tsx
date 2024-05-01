import {Session, User} from '@supabase/supabase-js';
import {useContext, useState, useEffect, createContext} from 'react';
import {supabaseClient} from '../config/supabase-client';

export interface Credentials {
    email: string;
    password: string;
}

// create a context for authentication
const AuthContext = createContext<{
    session: Session | null | undefined,
    user: User | null | undefined,
}>({
    session: null, user: null
});

export const AuthProvider = ({children}: any) => {
    const [user, setUser] = useState<User>()
    const [session, setSession] = useState<Session | null>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const setData = async () => {
            const {data: {session}, error} = await supabaseClient.auth.getSession();
            if (error) throw error;
            setSession(session)
            setUser(session?.user)
            setLoading(false);
        };

        const {data: listener} = supabaseClient.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user)
            setLoading(false)
        });

        setData();

        return () => {
            listener?.subscription.unsubscribe();
        };
    }, []);

    const value = {
        session,
        user,
    };

    // use a provider to pass down the value
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// export the useAuth hook
export const useAuth = () => {
    const signin = async (credentials: Credentials) => {
        const {data, error} = await supabaseClient.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        })
        if (error) {
            console.error(error)
            return
        }
        console.log("Logged in user", data)
    }

    const signup = async (credentials: Credentials) => {
        const {data, error} = await supabaseClient.auth.signUp({
            email: credentials.email,
            password: credentials.password,
        })
        if (error) {
            console.error(error)
            return
        }
        console.log("Signed up user", data)
    }


    const signout = async () => {
        const {error} = await supabaseClient.auth.signOut()
        if (error) {
            console.error(error)
            return
        }
        console.log("Signed out")
    };

    const {session, user} = useContext(AuthContext);

    return {session, user, signin, signup, signout};

};