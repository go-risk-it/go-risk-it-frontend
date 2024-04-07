import {User, useSupabase} from "./useSupabase.ts";

export const useAuth = () => {
    const {supabase, session, setSession} = useSupabase();

    const signin = async (user: User) => {
        const {data, error} = await supabase.auth.signInWithPassword({
            email: user.email,
            password: user.password,
        })
        if (error) {
            console.error(error)
            return
        }
        setSession(data.session)
    }

    const signup = async (user: User) => {
        const {data, error} = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
        })
        if (error) {
            console.error(error)
            return
        }
        setSession(data.session)
    }


    const signout = async () => {
        const {error} = await supabase.auth.signOut()
        setSession(null)
        if (error) {
            console.error(error)
            return
        }
    };

    return {session, signin, signup, signout, setSession};
};