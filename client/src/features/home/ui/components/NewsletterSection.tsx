import { motion } from "framer-motion";
import { Mail, Send, Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const NewsletterSection = () => {
    return (
        <section className="relative py-32 bg-[#02000a] overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="relative max-w-4xl mx-auto rounded-[3rem] bg-gradient-to-br from-zinc-900 to-black p-12 lg:p-20 border border-white/5 overflow-hidden group">
                    {/* Animated Background Highlights */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{ duration: 8, repeat: Infinity }}
                        className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"
                    />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-10">
                            <Bell className="w-10 h-10 text-purple-400 animate-bounce" />
                        </div>

                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
                            STAY IN THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">LOOP.</span>
                        </h2>
                        <p className="text-zinc-400 text-lg font-medium max-w-xl mb-12">
                            Get notified about high-stakes tournaments ealy, score exclusive drop codes, and receive the latest meta reports directly in your inbox.
                        </p>

                        <form className="w-full max-w-md flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="h-14 pl-12 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all shadow-inner"
                                />
                            </div>
                            <Button className="h-14 px-8 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold group">
                                SUBSCRIBE
                                <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </Button>
                        </form>

                        <p className="mt-8 text-xs font-bold text-zinc-600 uppercase tracking-widest">
                            NO SPAM. JUST PURE ESPORTS INTEL.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
