import {Session, User} from "@supabase/supabase-js"
import {createContext, ReactElement, useEffect, useState} from "react"
import {supabaseClient} from "../config/supabase-client.ts"


// create a context for authentication
export const AuthContext = createContext<{
    session: Session | null | undefined,
    user: User | null | undefined,
}>({
    session: null, user: null
})

export const AuthProvider = ({children}: { children: ReactElement }) => {
    const [user, setUser] = useState<User>()
    const [session, setSession] = useState<Session | null>()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const setData = async () => {
            const {data: {session}, error} = await supabaseClient.auth.getSession()
            if (error) throw error
            setSession(session)
            setUser(session?.user)
            setLoading(false)
        }

        const {data: listener} = supabaseClient.auth.onAuthStateChange((_event, session) => {
            console.log('session' + session?.access_token)
            console.log('event' + _event)
            setSession(session)
            setUser(session?.user)
            setLoading(false)
        })

        setData()

        return () => {
            listener?.subscription.unsubscribe()
        }
    }, [])

    const value = {
        session,
        user,
    }

    // use a provider to pass down the value
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
