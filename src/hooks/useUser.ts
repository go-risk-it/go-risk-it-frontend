import {useContext} from "react";
import {AuthContext} from "../contexts/AuthContext";
import {useSessionStorage} from 'usehooks-ts'

// NOTE: optimally move this into a separate file
export interface User {
    id: string;
    name: string;
    email: string;
    authToken?: string;
}

export const useUser = () => {
    const {user, setUser} = useContext(AuthContext);
    const [, setValue] = useSessionStorage("user", "");

    const addUser = (user: User) => {
        setUser(user);
        setValue(() => JSON.stringify(user))
    };

    const removeUser = () => {
        setUser(null);
        setValue(() => "");
    };

    return {user, addUser, removeUser, setUser};
};