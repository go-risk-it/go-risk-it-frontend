import {createClient} from "@supabase/supabase-js";
import {useContext, useEffect} from "react";
import {AuthContext} from "../contexts/AuthContext.ts";

export interface User {
    email: string;
    password: string;
}

export const useSupabase = () => {
    const key = 'public_anon_key'
    const supabase = createClient('http://localhost:8000', key)
    const {session, setSession} = useContext(AuthContext);

    useEffect(() => {
        supabase.auth.getSession().then(({data: {session: sex}}) => {
            console.log("Got session", sex)
            setSession(sex)
        })

        const {
            data: {subscription},
        } = supabase.auth.onAuthStateChange((_event, sex) => {
            console.log("Auth state change", _event, sex)
            setSession(sex)
        })

        return () => subscription.unsubscribe()
    }, [])

    return {supabase, session, setSession}
}