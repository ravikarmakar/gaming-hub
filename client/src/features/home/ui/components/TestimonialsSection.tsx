import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

const TESTIMONIALS = [
    {
        name: "Arjun Kapoor",
        tag: "@arjun_k",
        game: "BGMI",
        rating: 5,
        avatar: "AK",
        quote: "I was skeptical about another esports platform, but the moment I played my first tournament here, I knew it was different. The anti-cheat actually works, prize pools are real, and I found my current team through squad matching. We just won our first ₹50K tournament.",
        accentColor: "from-purple-500 to-violet-600",
        textColor: "text-purple-400",
    },
    {
        name: "Meera Joshi",
        tag: "@meera_plays",
        game: "Free Fire",
        rating: 5,
        avatar: "MJ",
        quote: "As a content creator, having verifiable stats that I can share is a game-changer. My profile went from 'trust me bro' to actual proof of skill. Got my first brand deal because sponsors could see my tournament history right on my profile.",
        accentColor: "from-pink-500 to-rose-600",
        textColor: "text-pink-400",
    },
    {
        name: "Rohan Das",
        tag: "@rohan_clutch",
        game: "BGMI",
        rating: 5,
        avatar: "RD",
        quote: "The daily scrims keep me sharp and the weekly tournaments keep me hungry. I've improved more in 3 months here than in 2 years of random matchmaking. The community is toxic-free which is rare in Indian gaming.",
        accentColor: "from-cyan-500 to-blue-600",
        textColor: "text-cyan-400",
    },
    {
        name: "Sneha Reddy",
        tag: "@sneha_storm",
        game: "Pixel Royale",
        rating: 5,
        avatar: "SR",
        quote: "I organized a tournament for my college and the platform handled everything — brackets, scheduling, anti-cheat, even payment distribution. What would have taken me weeks took 15 minutes. Absolute lifesaver for tournament organizers.",
        accentColor: "from-emerald-500 to-green-600",
        textColor: "text-emerald-400",
    },
    {
        name: "Vikram Nair",
        tag: "@vik_nair",
        game: "Free Fire",
        rating: 4,
        avatar: "VN",
        quote: "My team climbed from amateur to semi-pro in just one season. The detailed post-match analytics showed us exactly where we were losing fights and the leaderboard system kept us motivated. Best ₹0 we ever spent.",
        accentColor: "from-amber-500 to-orange-600",
        textColor: "text-amber-400",
    },
];

export const TestimonialsSection = () => {
    const [current, setCurrent] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);

    useEffect(() => {
        if (!autoPlay) return;
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [autoPlay]);

    const goTo = (index: number) => {
        setCurrent(index);
        setAutoPlay(false);
        // Resume auto-play after 10s of inactivity
        setTimeout(() => setAutoPlay(true), 10000);
    };

    const nextSlide = () => goTo((current + 1) % TESTIMONIALS.length);
    const prevSlide = () => goTo((current - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

    const testimonial = TESTIMONIALS[current];

    return (
        <section className="relative py-24 lg:py-32 bg-[#02000a] overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.04)_0%,transparent_70%)]" />
            </div>

            <div className="container relative z-10 mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 mb-6">
                        <Quote className="w-4 h-4 text-pink-400" />
                        <span className="text-[10px] font-black text-pink-400 uppercase tracking-[0.3em]">
                            PLAYER VOICES
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-6">
                        What Players{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                            Are Saying
                        </span>
                    </h2>
                    <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-medium">
                        Don't take our word for it. Hear from the gamers who compete on our platform every day.
                    </p>
                </motion.div>

                {/* Testimonial Card */}
                <div className="max-w-4xl mx-auto">
                    <div className="relative rounded-[2rem] border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 lg:p-12 min-h-[320px] flex items-center">
                        {/* Quote decoration */}
                        <div className="absolute top-6 left-8 lg:left-12">
                            <Quote className="w-12 h-12 text-white/[0.04]" />
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current}
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -40 }}
                                transition={{ duration: 0.4 }}
                                className="w-full"
                            >
                                <div className="flex flex-col lg:flex-row items-center gap-8">
                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        <div className={cn(
                                            "w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                                            testimonial.accentColor
                                        )}>
                                            <span className="text-xl lg:text-2xl font-black text-white">{testimonial.avatar}</span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 text-center lg:text-left">
                                        <p className="text-base lg:text-lg text-zinc-300 leading-relaxed mb-6 italic">
                                            "{testimonial.quote}"
                                        </p>
                                        <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-4">
                                            <div>
                                                <h4 className="text-base font-black text-white">{testimonial.name}</h4>
                                                <span className="text-sm text-zinc-500">{testimonial.tag}</span>
                                            </div>
                                            <div className="hidden lg:block w-px h-6 bg-white/10" />
                                            <span className={cn("text-sm font-bold", testimonial.textColor)}>{testimonial.game}</span>
                                            <div className="flex items-center gap-0.5">
                                                {[...Array(testimonial.rating)].map((_, i) => (
                                                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                ))}
                                                {[...Array(5 - testimonial.rating)].map((_, i) => (
                                                    <Star key={`empty-${i}`} className="w-4 h-4 text-zinc-700" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8">
                        {/* Dots */}
                        <div className="flex items-center gap-2">
                            {TESTIMONIALS.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goTo(i)}
                                    className={cn(
                                        "h-2 rounded-full transition-all duration-300",
                                        current === i
                                            ? "w-8 bg-purple-500"
                                            : "w-2 bg-zinc-700 hover:bg-zinc-500"
                                    )}
                                    aria-label={`Go to testimonial ${i + 1}`}
                                />
                            ))}
                        </div>

                        {/* Arrows */}
                        <div className="flex gap-2">
                            <Button
                                onClick={prevSlide}
                                className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center p-0 text-zinc-400 hover:text-white hover:border-purple-500/40 hover:bg-purple-500/10 transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <Button
                                onClick={nextSlide}
                                className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center p-0 text-zinc-400 hover:text-white hover:border-purple-500/40 hover:bg-purple-500/10 transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
