import { useCallback, useTransition, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

import { useGoogleAuthMutation } from "@/features/auth";

export const useGoogleAuth = () => {
    const navigate = useNavigate();
    const { mutateAsync: googleAuth, isPending: isMutationLoading } = useGoogleAuthMutation();
    const [isTransitioning, startTransition] = useTransition();

    const handleSuccess = useCallback(async (authResponse: any) => {
        try {
            if (authResponse["code"]) {
                const result = await googleAuth(authResponse["code"]);
                if (result?.user) {
                    startTransition(() => {
                        void navigate("/");
                    });
                }
            }
        } catch (error) {
            console.error("Error during Google authentication:", error);
        }
    }, [googleAuth, navigate, startTransition]);

    const handleError = useCallback((err: any) => {
        console.error("Google authentication failed:", err);
    }, []);

    const loginWithGoogle = useGoogleLogin({
        onSuccess: handleSuccess,
        onError: handleError,
        flow: "auth-code",
    });

    return {
        login: loginWithGoogle,
        isLoading: isMutationLoading || isTransitioning,
    };
};

export const useDiscordAuth = () => {
    const [isRedirecting, setIsRedirecting] = useState(false);

    const handleDiscordLogin = useCallback(() => {
        const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;

        if (!clientId) {
            return;
        }

        setIsRedirecting(true);

        const redirectUri = encodeURIComponent(
            import.meta.env.VITE_DISCORD_REDIRECT_URI || window.location.origin + "/auth/discord/callback"
        );

        window.location.href = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20email`;
    }, []);

    return {
        login: handleDiscordLogin,
        isLoading: isRedirecting,
    };
};
