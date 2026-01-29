import { transporter } from "../config/mail.js";

// Generates a 6-digit numeric OTP.
export const generateOTP = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
};

// Sends a verification OTP email.
export const sendVerificationEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "Account verification OTP - Gaming-Hub",
        text: `Welcome to Gaming-hub!\n\nYour One-Time Password (OTP) is: ${otp}\n\nPlease verify your account using this OTP. Note: This OTP is valid for only 10 minutes.`,
    };

    return transporter.sendMail(mailOptions);
};
