import { motion } from "framer-motion";
import { LifeBuoy } from "lucide-react";

import { ContactForm } from "@/components/support/ContactForm";
import { FaqSection } from "@/components/support/FaqSection";
import { LiveChatSupport } from "@/components/support/LiveChatSupport";

const SupportPage = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
            <div className="absolute top-20 right-0 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-20 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-[1440px] mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-2xl">
                        <LifeBuoy className="w-8 h-8 text-purple-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-200">
                        How can we help you?
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        Have questions or run into an issue? Our team is here to assist you.
                        Fill out the form below or check our frequently asked questions.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
                    {/* Contact Form Section */}
                    <ContactForm />

                    {/* FAQ & Info Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="space-y-8"
                    >
                        <FaqSection />
                        <LiveChatSupport />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
