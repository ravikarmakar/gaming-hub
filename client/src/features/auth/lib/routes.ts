export const AUTH_ROUTES = {
    LOGIN: "/login",
    REGISTER: "/register",
    LOGOUT: "/logout",
    GET_PROFILE: "/get-profile",
    REFRESH_TOKEN: "/refresh-token",
    GOOGLE: "/google",
    DISCORD_CALLBACK: "/auth/discord/callback",
    SEND_VERIFY_OTP: "/send-verify-otp",
    VERIFY_ACCOUNT: "/verify-account",
    SEND_RESET_OTP: "/send-reset-otp",
    FORGOT_PASSWORD: "/forgot-password",
} as const;