import { motion } from "framer-motion";
import React from "react";

interface ProfileBannerLayoutProps {
    bannerImage?: string;
    children: React.ReactNode;
    bannerHeight?: string;
    className?: string;
}

/**
 * A shared layout component for profile pages (Player, Team, Organizer).
 * Handles the ambient background orbs, banner image/gradient, and content positioning.
 */
export const ProfileBannerLayout = ({
    bannerImage,
    children,
    bannerHeight = "h-64 md:h-80 lg:h-96",
    className = ""
}: ProfileBannerLayoutProps) => {
    return (
        <div className={`min-h-screen bg-[#050505] text-white overflow-x-hidden relative ${className}`}>
            {/* Background Decorative Orbs (Shared across all profile types) */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div
                    className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-800/20 blur-[120px] rounded-full animate-pulse"
                    style={{ animationDuration: "15000ms" }}
                />
                <div
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-800/20 blur-[120px] rounded-full animate-pulse"
                    style={{ animationDuration: "18000ms" }}
                />
                <div
                    className="absolute top-[20%] right-[5%] w-[30%] h-[30%] bg-blue-800/10 blur-[100px] rounded-full animate-pulse"
                    style={{ animationDuration: "25000ms" }}
                />
                {/* Subtle Center Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-purple-900/5 blur-[150px] rounded-full pointer-events-none" />
            </div>

            {/* Banner Section */}
            <div className={`relative ${bannerHeight} w-full overflow-hidden z-1`}>
                {bannerImage ? (
                    <motion.img
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                        src={bannerImage}
                        alt="Profile Banner"
                        className="object-cover w-full h-full opacity-40 grayscale-[0.5]"
                    />
                ) : (
                    /* Fallback tactical gradient if no image is provided */
                    <div className="w-full h-full bg-gradient-to-br from-violet-900/20 via-[#050505] to-fuchsia-900/20 opacity-60" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050505] to-transparent" />
            </div>

            {/* Profile Content Container (With standard overlap) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32 relative z-10 space-y-12 pb-20">
                {children}
            </div>
        </div>
    );
};
