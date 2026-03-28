export const AUTH_ROUTES = {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    GET_PROFILE: "/auth/get-profile",
    REFRESH_TOKEN: "/auth/refresh-token",
    GOOGLE: "/auth/google",
    DISCORD_CALLBACK: "/auth/discord/callback",
    SEND_VERIFY_OTP: "/auth/send-verify-otp",
    VERIFY_ACCOUNT: "/auth/verify-account",
    SEND_RESET_OTP: "/auth/send-reset-otp",
    FORGOT_PASSWORD: "/auth/forgot-password",
    SETTINGS: "/auth/settings",
} as const;