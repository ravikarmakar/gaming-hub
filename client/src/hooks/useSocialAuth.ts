import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/useUserStore";
import { AUTH_CONFIG, ERROR_TOAST_OPTIONS, TOAST_OPTIONS } from "@/config/auth";

export function useSocialAuth() {
  const navigate = useNavigate();
  const { googleAuth } = useUserStore();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (authResponse) => {
      try {
        if (authResponse.code) {
          const result = await googleAuth(authResponse.code);
          if (result) {
            toast.success("Login successful with Google!", TOAST_OPTIONS);
            navigate(-1);
          } else {
            toast.error("Google login failed.", ERROR_TOAST_OPTIONS);
          }
        }
      } catch (error) {
        console.error("Error during Google login:", error);
        toast.error(
          "An unexpected error occurred during Google login.",
          ERROR_TOAST_OPTIONS
        );
      }
    },
    onError: (err) => {
      console.error("Google login failed:", err);
      toast.error(
        "Google login failed. Please try again.",
        ERROR_TOAST_OPTIONS
      );
    },
    flow: "auth-code",
  });

  const handleDiscordLogin = () => {
    if (!AUTH_CONFIG.DISCORD_CLIENT_ID) {
      console.error("DISCORD_CLIENT_ID is not defined.");
      toast.error("Discord login not configured.", ERROR_TOAST_OPTIONS);
      return;
    }
    const redirectUri = encodeURIComponent(
      AUTH_CONFIG.BASE_URL + "/auth/discord/callback"
    );
    const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${AUTH_CONFIG.DISCORD_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20email`;
    window.location.href = discordAuthUrl;
  };

  return { handleGoogleLogin, handleDiscordLogin };
}
