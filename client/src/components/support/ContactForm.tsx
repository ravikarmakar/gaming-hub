import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { LoaderCircle as Loader2, Send, Mail } from "lucide-react";
import toast from "react-hot-toast";

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

export const ContactForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<SupportFormValues>({
        resolver: zodResolver(supportFormSchema),
        defaultValues: {
            name: "",
            email: "",
            subject: "",
            message: "",
        },
    });

    const onSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Simulate API call with captured values
            await new Promise((resolve) => setTimeout(resolve, 1500));

            toast.success("Message sent successfully! We'll get back to you shortly.");
            form.reset();
        } catch {
            toast.error("Failed to send message. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
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
                    <CardDescription className="text-zinc-400">
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
                                                    type="email"
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
    );
};
