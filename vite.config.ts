import {defineConfig, loadEnv} from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
    const env = loadEnv(mode, process.cwd(), "");
    return {
        plugins: [react()],
        define: {
            "process.env.REACT_APP_WS_URL": JSON.stringify(env.REACT_APP_WS_URL),
            "process.env.REACT_APP_API_URL": JSON.stringify(env.REACT_APP_API_URL),
            "process.env.REACT_APP_SUPABASE_URL": JSON.stringify(env.REACT_APP_SUPABASE_URL),
            "process.env.REACT_APP_SUPABASE_ANON_KEY": JSON.stringify(env.REACT_APP_SUPABASE_ANON_KEY),
            "process.env.NODE_TLS_VERIFY": JSON.stringify(env.NODE_TLS_VERIFY),
        },
    };
});
