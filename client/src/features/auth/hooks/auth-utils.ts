import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

import { showSuccessToast, showErrorToast } from "../../../lib/toast";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

export const useGoogleAuth = () => {
    const navigate = useNavigate();
    const { googleAuth } = useAuthStore();

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (authResponse) => {
            try {
                if (authResponse["code"]) {
                    const result = await googleAuth(authResponse["code"]);
                    if (result) {
                        showSuccessToast("Google authentication successful!");
                        navigate("/");
                    }
                }
            } catch (error) {
                console.error("Error during Google authentication:", error);
                showErrorToast("Google authentication failed. Please try again.");
            }
        },
        onError: (err) => {
            console.error("Google authentication failed:", err);
            showErrorToast("Google authentication failed. Please try again.");
        },
        flow: "auth-code",
    });

    return loginWithGoogle;
};

export const useDiscordAuth = () => {
    const handleDiscordLogin = () => {
        const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;

        if (!clientId) {
            showErrorToast("Discord login is not configured");
            return;
        }

        const redirectUri = encodeURIComponent(
            "http://localhost:5173/auth/discord/callback"
        );

        window.location.href = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20email`;
    };

    return handleDiscordLogin;
};
