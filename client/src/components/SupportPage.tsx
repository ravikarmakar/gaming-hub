import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { Loader2, Send, MessageSquare, Mail, HelpCircle, FileQuestion, LifeBuoy, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

// Zod Schema for validation
const supportFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
    message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

type SupportFormValues = z.infer<typeof supportFormSchema>;

const SupportPage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const form = useForm<SupportFormValues>({
        resolver: zodResolver(supportFormSchema),
        defaultValues: {
            name: "",
            email: "",
            subject: "",
            message: "",
        },
    });

    const onSubmit = async (values: SupportFormValues) => {
        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        console.log("Support Form Submitted:", values);
        toast.success("Message sent successfully! We'll get back to you shortly.");

        form.reset();
        setIsSubmitting(false);
    };

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

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
            <div className="absolute top-20 right-0 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-20 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
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
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card className="bg-white/[0.02] border-white/10 backdrop-blur-md shadow-xl overflow-hidden">
                            <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
                                <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
                                    <Mail className="w-5 h-5 text-purple-400" />
                                    Send us a message
                                </CardTitle>
                                <CardDescription className="text-zinc-500">
                                    We typically reply within 24 hours.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Name</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Your name"
                                                                {...field}
                                                                className="bg-black/20 border-white/10 focus:border-purple-500/50 h-10 transition-all rounded-lg"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-xs text-red-400" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="you@example.com"
                                                                {...field}
                                                                className="bg-black/20 border-white/10 focus:border-purple-500/50 h-10 transition-all rounded-lg"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-xs text-red-400" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="subject"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Subject</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="What is this about?"
                                                            {...field}
                                                            className="bg-black/20 border-white/10 focus:border-purple-500/50 h-10 transition-all rounded-lg"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs text-red-400" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="message"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Message</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Tell us more about your inquiry..."
                                                            {...field}
                                                            className="min-h-[150px] bg-black/20 border-white/10 focus:border-purple-500/50 transition-all rounded-lg resize-none"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs text-red-400" />
                                                </FormItem>
                                            )}
                                        />

                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold h-12 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all duration-300 group"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                                                    Send Message
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* FAQ & Info Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="space-y-8"
                    >
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
                                            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-white flex items-start gap-3 select-none">
                                                    <HelpCircle className={cn("w-5 h-5 mt-0.5 shrink-0 transition-colors", isOpen ? "text-purple-400" : "text-purple-500/50 group-hover:text-purple-400")} />
                                                    {item.question}
                                                </h3>
                                                <ChevronDown className={cn("w-5 h-5 text-zinc-500 transition-transform duration-300", isOpen && "rotate-180 text-purple-400")} />
                                            </div>
                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.div
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

                        <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/10 backdrop-blur-sm">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-purple-400" />
                                Live Chat Support
                            </h3>
                            <p className="text-zinc-400 text-sm mb-6">
                                Need immediate assistance? Our support team is available Monday to Friday, 9am - 5pm EST.
                            </p>
                            <Button
                                variant="outline"
                                disabled
                                className="w-full border-purple-500/20 bg-purple-500/5 text-purple-200/50 hover:bg-purple-500/5 hover:text-purple-200/50 rounded-xl h-10 font-bold opacity-50 cursor-not-allowed"
                            >
                                Live Chat (Coming Soon)
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
