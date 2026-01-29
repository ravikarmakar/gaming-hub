import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { ROUTES } from "@/lib/routes";

const DiscordCallback = () => {
  const navigate = useNavigate();
  const { loginWithDiscord, user } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const hasCalledRef = useRef(false);

  useEffect(() => {
    // Prevent double API call from React StrictMode
    if (hasCalledRef.current) return;

    const code = new URLSearchParams(window.location.search).get("code");

    if (user) {
      navigate(ROUTES.HOME);
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMessage("No authorization code received from Discord");
      return;
    }

    hasCalledRef.current = true;

    loginWithDiscord(code).then((result) => {
      if (result) {
        navigate(ROUTES.HOME);
      } else {
        setStatus("error");
        setErrorMessage("Failed to login with Discord. Please try again.");
      }
    });
  }, [loginWithDiscord, navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center space-y-4">
        {status === "loading" && (
          <>
            <LoaderCircle className="w-10 h-10 animate-spin text-purple-500 mx-auto" />
            <p className="text-gray-400 text-sm">Connecting with Discord...</p>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-red-400 text-sm">{errorMessage}</p>
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="text-purple-400 hover:text-purple-300 text-sm underline"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DiscordCallback;