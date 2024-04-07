import {createContext} from "react";
import {Session} from "@supabase/supabase-js";

interface AuthContext {
    session: Session | null;
    setSession: (session: Session | null) => void;
}

export const AuthContext = createContext<AuthContext>({
    session: null,
    setSession: () => {
    }
});