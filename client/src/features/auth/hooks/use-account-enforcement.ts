import { useEffect } from "react";
import { useAuthQuery, useSendVerifyOtpMutation } from "../index";

/**
 * Hook to enforce account verification and handle OTP session logic.
 * Pulls the complex verification-forcing side-effects out of the ProtectedRoute.
 */
export function useAccountEnforcement() {
    const { data: user } = useAuthQuery();
    const { mutate: sendVerifyOtp } = useSendVerifyOtpMutation();

    useEffect(() => {
        if (user && !user.isAccountVerified) {
            const storageKey = `otp_sent_${user._id}`;
            const hasSentSession = sessionStorage.getItem(storageKey);

            // Check if existing OTP is active
            const isOtpActive = user.verifyOtpExpireAt && Date.now() < user.verifyOtpExpireAt;

            if (!isOtpActive && !hasSentSession) {
                sessionStorage.setItem(storageKey, "true");
                sendVerifyOtp();
            } else if (!hasSentSession) {
                // Mark as sent for this session to prevent spamming
                sessionStorage.setItem(storageKey, "true");
            }
        }
    }, [user, sendVerifyOtp]);

    return {
        isAccountVerified: user?.isAccountVerified ?? true,
        user,
    };
}
