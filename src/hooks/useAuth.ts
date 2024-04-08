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
        console.log("Logged in user", data)
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
        console.log("Signed up user", data)
    }


    const signout = async () => {
        const {error} = await supabase.auth.signOut()
        if (error) {
            console.error(error)
            return
        }
        console.log("Signed out")
    };

    return {session, signin, signup, signout, setSession};
};