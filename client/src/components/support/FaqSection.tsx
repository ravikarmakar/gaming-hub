import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileQuestion, HelpCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqItems = [
    {
        question: "How do I create a tournament?",
        answer: "Currently, tournaments are organized exclusively by the platform to ensure quality and fairness. If you're an organization looking to partner, please contact us.",
    },
    {
        question: "Can I join multiple teams?",
        answer: "Currently, a player can only be part of one active team at a time to ensure fair play in tournaments.",
    },
    {
        question: "How do I report a player?",
        answer: "Go to the player's profile page and click the 'Report' button. Please provide evidence for your report.",
    },
    {
        question: "What payment methods are supported?",
        answer: "We currently support major credit cards and PayPal for premium memberships and tournament entry fees.",
    },
];

export const FaqSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <FileQuestion className="w-6 h-6 text-purple-400" />
                Frequently Asked Questions
            </h2>
            <div className="grid gap-4">
                {faqItems.map((item, index) => {
                    const isOpen = openIndex === index;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            onClick={() => setOpenIndex(isOpen ? null : index)}
                            role="button"
                            tabIndex={0}
                            aria-expanded={isOpen}
                            aria-controls={`faq-answer-${index}`}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    setOpenIndex(isOpen ? null : index);
                                }
                            }}
                            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-white flex items-start gap-3 select-none">
                                    <HelpCircle className={cn("w-5 h-5 mt-0.5 shrink-0 transition-colors", isOpen ? "text-purple-400" : "text-purple-500/50 group-hover:text-purple-400")} />
                                    {item.question}
                                </h3>
                                <ChevronDown className={cn("w-5 h-5 text-zinc-400 transition-transform duration-300", isOpen && "rotate-180 text-purple-400")} />
                            </div>
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        id={`faq-answer-${index}`}
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <p className="text-zinc-400 text-sm leading-relaxed pl-8 pt-4 border-t border-white/5 mt-4">
                                            {item.answer}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
