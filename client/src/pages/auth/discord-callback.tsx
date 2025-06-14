import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import LoadingSpinner from "@/components/LoadingSpinner";

const DiscordCallback = () => {
  const navigate = useNavigate();
  const { loginWithDiscord, user, isLoading } = useAuthStore();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    if (!code || user) return;

    loginWithDiscord(code).then((result) => {
      if (result) {
        navigate("/"); // or home
      } else {
        navigate("/login");
      }
    });
  }, [loginWithDiscord, navigate, user]);

  return <div>{isLoading && <LoadingSpinner />}</div>;
};

export default DiscordCallback;
