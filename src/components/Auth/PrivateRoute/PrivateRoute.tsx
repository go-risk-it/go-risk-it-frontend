import {useAuth} from "../../../hooks/useAuth.ts";
import {Navigate, Outlet} from "react-router-dom";

export const ProtectedRoute = ({redirectPath = '/signin'}) => {
    const {session} = useAuth();
    console.log("session", session)
    if (!session) {
        return <Navigate to={redirectPath} replace/>;
    }

    return <Outlet/>;
};
