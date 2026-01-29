import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import { ForgotPasswordRequest } from "./forgot-password-request";
import { ResetPasswordAction } from "./reset-password-action";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Request, 2: Reset (OTP + New Password)
  const [email, setEmail] = useState("");

  const handleRequestSuccess = (userEmail: string) => {
    setEmail(userEmail);
    setStep(2);
  };

  const handleRestart = () => {
    setStep(1);
    setEmail("");
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <ForgotPasswordRequest key="request" onSuccess={handleRequestSuccess} />
        ) : (
          <ResetPasswordAction key="reset" email={email} onRestart={handleRestart} />
        )}
      </AnimatePresence>

      <div className="pt-6 border-t border-white/10 mt-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">
          🛡️ Secure Gaming Network
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;