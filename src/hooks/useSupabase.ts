import {createClient} from "@supabase/supabase-js";
import {useContext, useEffect} from "react";
import {AuthContext} from "../contexts/AuthContext.ts";

export interface User {
    email: string;
    password: string;
}

export const useSupabase = () => {
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpb29yamRtcmF2eHpuYWRtdGllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMTcwNzA4OSwiZXhwIjoyMDI3MjgzMDg5fQ.zdO7Z7FS37H5Nt0D6EtLGNn6rVSeNEhBRc6q5H3iF2Y'
    const supabase = createClient('https://aioorjdmravxznadmtie.supabase.co', key)
    const {session, setSession} = useContext(AuthContext);

    useEffect(() => {
        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(session)
        })

        const {
            data: {subscription},
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    return {supabase, session, setSession}
}