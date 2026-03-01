import { motion } from "framer-motion";
import { MessageSquare, Twitter, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CommunitySection = () => {
    return (
        <section className="relative py-28 bg-[#02000a] overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.08)_0%,transparent_70%)]" />
            </div>

            <div className="container relative z-10 mx-auto px-4">
                <div className="max-w-6xl mx-auto rounded-[3.5rem] bg-zinc-900/20 border border-white/5 backdrop-blur-2xl p-12 lg:p-24 overflow-hidden relative">
                    {/* Corner Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">
                                    NEXUS COMMUNITY
                                </span>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.85] tracking-tighter mb-8">
                                JOIN THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">RESISTANCE.</span>
                            </h2>
                            <p className="text-xl text-zinc-400 font-medium mb-12 leading-relaxed">
                                Connect with thousands of gamers, find your next squad, and stay updated with the latest tournament meta. Our community never sleeps.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Button className="h-14 px-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-[0_0_25px_rgba(79,70,229,0.4)]">
                                    <MessageSquare className="w-6 h-6 mr-3" />
                                    JOIN DISCORD
                                </Button>
                                <div className="flex items-center gap-3 ml-4">
                                    {[Twitter, Instagram, Youtube].map((Icon, i) => (
                                        <motion.a
                                            key={i}
                                            href="#"
                                            whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.1)" }}
                                            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                                        >
                                            <Icon className="w-5 h-5" />
                                        </motion.a>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative aspect-square lg:aspect-video rounded-[2.5rem] bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-white/10 flex items-center justify-center group overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                            <img
                                src="/assets/community/discord-vibe.jpg"
                                alt="Community"
                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                            />
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6">
                                    <span className="text-4xl font-black text-white">45K</span>
                                </div>
                                <span className="text-sm font-black text-white/60 tracking-widest uppercase">Members Online Now</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
