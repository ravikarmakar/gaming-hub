import { transporter } from "../config/mail.js";

import crypto from "crypto";

// Generates a 6-digit numeric OTP.
export const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

// Sends a verification OTP email.
export const sendVerificationEmail = async (email, otp) => {
    if (!process.env.SENDER_EMAIL) {
        throw new Error("SENDER_EMAIL is not defined in environment variables");
    }

    const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "Account verification OTP - Gaming-Hub",
        text: `Welcome to Gaming-hub!\n\nYour One-Time Password (OTP) is: ${otp}\n\nPlease verify your account using this OTP. Note: This OTP is valid for only 2 minutes.`,
    };

    return transporter.sendMail(mailOptions);
};
