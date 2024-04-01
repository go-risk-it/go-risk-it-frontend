import {useEffect} from "react";
import {useUser, User} from "./useUser";
import {useSessionStorage} from "usehooks-ts";

export const useAuth = () => {
    // we can re export the user methods or object from this hook
    const {user, addUser, removeUser, setUser} = useUser();
    const [item,] = useSessionStorage("user", "");

    useEffect(() => {
        const user = item
        if (user) {
            addUser(JSON.parse(user));
        }
    }, [addUser, item]);

    const login = (user: User) => {
        addUser(user);
    };

    const logout = () => {
        removeUser();
    };

    return {user, login, logout, setUser};
};