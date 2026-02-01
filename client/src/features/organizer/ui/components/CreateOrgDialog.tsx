import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Mail, Tag, FileText, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import FileUpload from "@/components/FileUpload";

import { useOrganizerStore } from "@/features/organizer/store/useOrganizerStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { OrgFormSchema, orgSchema } from "../../lib/orgSchemas";

const CreateOrgDialog: React.FC = () => {
    const [isSuccess, setIsSuccess] = useState(false);
    const { createOrg, isLoading, error, isCreateOrgOpen, setIsCreateOrgOpen } = useOrganizerStore();
    const { checkAuth } = useAuthStore();

    // Prevent UI freeze if Radix fails to cleanup body styles
    useEffect(() => {
        if (!isCreateOrgOpen) {
            const cleanup = () => {
                const body = document.body;
                if (body) {
                    body.style.pointerEvents = "";
                    body.style.overflow = "";
                    body.classList.remove("radix-dropdown-menu-open");
                    body.removeAttribute("data-radix-scroll-lock");
                }
                const html = document.documentElement;
                if (html) {
                    html.style.pointerEvents = "";
                    html.style.overflow = "";
                }
            };

            // Immediate cleanup
            cleanup();

            // Delayed cleanup for competing animations
            const timer = setTimeout(cleanup, 300);
            return () => clearTimeout(timer);
        }
    }, [isCreateOrgOpen]);

    const form = useForm<OrgFormSchema>({
        resolver: zodResolver(orgSchema),
        defaultValues: {
            name: "",
            tag: "",
            email: "",
            description: "",
            image: undefined,
        },
    });

    const onSubmit = async (values: OrgFormSchema) => {
        const orgData = new FormData();
        orgData.append("name", values.name);
        orgData.append("tag", values.tag.toUpperCase());
        orgData.append("email", values.email);
        orgData.append("description", values.description);

        if (values.image) {
            orgData.append("image", values.image);
        }

        const success = await createOrg(orgData);

        if (success) {
            setIsSuccess(true);
            toast.success("Organization created successfully!");
            // Refresh user profile to update roles and orgId
            await checkAuth();

            setTimeout(() => {
                setIsSuccess(false);
                setIsCreateOrgOpen(false);
                form.reset();
            }, 2000);
        } else {
            toast.error(error || "Failed to create organization");
        }
    };

    return (
        <Dialog open={isCreateOrgOpen} onOpenChange={setIsCreateOrgOpen}>
            <DialogContent
                onCloseAutoFocus={(e) => e.preventDefault()}
                className="sm:max-w-[500px] bg-[#0a0514]/98 backdrop-blur-2xl border border-purple-500/20 text-white p-0 overflow-hidden shadow-2xl shadow-purple-500/20"
            >
                <div className="h-1 w-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600" />

                <DialogHeader className="px-5 pt-5 pb-2 space-y-2">
                    <div className="flex justify-center">
                        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <Building2 className="w-6 h-6 text-purple-500" />
                        </div>
                    </div>
                    <div className="space-y-0.5 text-center">
                        <DialogTitle className="text-xl font-black italic font-orbitron tracking-tight text-white uppercase">
                            Create Your Empire
                        </DialogTitle>
                        <DialogDescription className="text-purple-200/40 text-[10px] font-medium tracking-wide">
                            Establish your organization and lead the grid
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="px-5 pb-5">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Org Name */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-[9px] uppercase font-bold text-purple-200/40 tracking-wider">
                                                Org Name
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-500/50 group-focus-within:text-purple-400 transition-colors" />
                                                    <Input
                                                        placeholder="Nexus Gaming"
                                                        {...field}
                                                        className="pl-9 h-9 text-xs bg-white/5 border-white/10 focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg text-white placeholder:text-white/10"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[9px] font-bold text-rose-500" />
                                        </FormItem>
                                    )}
                                />

                                {/* Org Tag */}
                                <FormField
                                    control={form.control}
                                    name="tag"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-[9px] uppercase font-bold text-purple-200/40 tracking-wider">
                                                Tag
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-500/50 group-focus-within:text-purple-400 transition-colors" />
                                                    <Input
                                                        placeholder="NXG"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                        maxLength={5}
                                                        className="pl-9 h-9 text-xs bg-white/5 border-white/10 focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg text-white font-mono font-bold tracking-widest placeholder:text-white/10"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[9px] font-bold text-rose-500" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Contact Email */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-[9px] uppercase font-bold text-purple-200/40 tracking-wider">
                                            Email
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-500/50 group-focus-within:text-purple-400 transition-colors" />
                                                <Input
                                                    placeholder="contact@nexus.com"
                                                    type="email"
                                                    {...field}
                                                    className="pl-9 h-9 text-xs bg-white/5 border-white/10 focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg text-white placeholder:text-white/10"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[9px] font-bold text-rose-500" />
                                    </FormItem>
                                )}
                            />

                            {/* Logo Upload */}
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-[9px] uppercase font-bold text-purple-200/40 tracking-wider">
                                            Logo
                                        </FormLabel>
                                        <FormControl>
                                            <FileUpload
                                                onChange={(file) => field.onChange(file)}
                                                accept="image/*"
                                                maxSize={2 * 1024 * 1024}
                                                compact={true}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[9px] font-bold text-rose-500" />
                                    </FormItem>
                                )}
                            />

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-[9px] uppercase font-bold text-purple-200/40 tracking-wider">
                                            Manifest
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <FileText className="absolute left-3 top-2.5 w-3.5 h-3.5 text-purple-500/50 group-focus-within:text-purple-400 transition-colors" />
                                                <Textarea
                                                    placeholder="Brief mission..."
                                                    {...field}
                                                    rows={2}
                                                    className="pl-9 pt-2 text-xs bg-white/5 border-white/10 focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg text-white resize-none min-h-[60px] placeholder:text-white/10"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[9px] font-bold text-rose-500" />
                                    </FormItem>
                                )}
                            />

                            {/* Submit Action */}
                            <div className="pt-1">
                                <AnimatePresence mode="wait">
                                    {isSuccess ? (
                                        <motion.div
                                            initial={{ scale: 0.95, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="flex items-center justify-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 font-bold uppercase text-[10px] tracking-widest"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            Success!
                                        </motion.div>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full h-10 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 rounded-lg font-black text-[10px] tracking-widest shadow-lg shadow-purple-600/10 group font-orbitron"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    Processing...
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    Establish Org
                                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            )}
                                        </Button>
                                    )}
                                </AnimatePresence>
                            </div>
                        </form>
                    </Form>
                </div>

                <div className="p-2 bg-white/[0.01] border-t border-white/5 text-center font-mono text-[6px] text-white/5 uppercase tracking-[0.4em]">
                    // AUTH: AUTHORIZED // 0xOrg_Init
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateOrgDialog;
