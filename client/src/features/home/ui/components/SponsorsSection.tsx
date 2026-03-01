import { motion } from "framer-motion";

const PARTNERS = [
    { name: "Razer", logo: "RAZER" },
    { name: "SteelSeries", logo: "STEELSERIES" },
    { name: "Red Bull", logo: "RED BULL" },
    { name: "Intel", logo: "INTEL" },
    { name: "HyperX", logo: "HYPERX" },
    { name: "NVIDIA", logo: "NVIDIA" },
];

export const SponsorsSection = () => {
    return (
        <section className="py-24 bg-[#02000a] border-t border-white/5">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center text-center mb-16">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-4">
                        TRUSTED PARTNERS & SPONSORS
                    </p>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                    {PARTNERS.map((partner, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className="flex flex-col items-center"
                        >
                            <span className="text-3xl lg:text-4xl font-black text-white tracking-widest font-mono">
                                {partner.logo}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
