import {useAuth} from "../../../hooks/useAuth.ts";
import {Navigate, Outlet} from "react-router-dom";

export const ProtectedRoute = ({redirectPath = '/signin'}) => {
    const {user} = useAuth();
    console.log("user", user)
    if (!user) {
        return <Navigate to={redirectPath} replace/>;
    }

    return <Outlet/>;
};
