const AUTH_BASE = "/auth";

export const AUTH_ENDPOINTS = {
    REGISTER: `${AUTH_BASE}/register`,
    LOGIN: `${AUTH_BASE}/login`,
    LOGOUT: `${AUTH_BASE}/logout`,
    GET_PROFILE: `${AUTH_BASE}/get-profile`,
    REFRESH_TOKEN: `${AUTH_BASE}/refresh-token`,
    GOOGLE: `${AUTH_BASE}/google`,
    DISCORD: `${AUTH_BASE}/discord`,
    SEND_VERIFY_OTP: `${AUTH_BASE}/send-verify-otp`,
    VERIFY_ACCOUNT: `${AUTH_BASE}/verify-account`,
    SEND_RESET_OTP: `${AUTH_BASE}/send-reset-otp`,
    RESET_PASSWORD: `${AUTH_BASE}/reset-password`,
} as const;
