import React, { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Building2, Globe, Tag, FileText, CheckCircle2, ArrowRight, Loader2, Shield } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import FileUpload from "@/components/FileUpload";

interface CreateGroupDialogProps {
    title: string;
    description: string;
    type: "org" | "team";
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    form: UseFormReturn<any>;
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    isLoading: boolean;
    isSuccess?: boolean;
}

const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({
    title,
    description,
    type,
    isOpen,
    setIsOpen,
    form,
    onSubmit,
    isLoading,
    isSuccess = false,
}) => {
    // Config based on type
    const isOrg = type === "org";
    const Icon = isOrg ? Building2 : Shield;

    const nameField = isOrg ? "name" : "teamName";
    const nameLabel = isOrg ? "Org Name" : "Team Name";
    const namePlaceholder = isOrg ? "Nexus Gaming" : "Team Liquid";

    const descField = isOrg ? "description" : "bio";
    const descLabel = isOrg ? "About Your Organization" : "Team Bio";
    const descPlaceholder = isOrg ? "Brief mission..." : "What inspires your team?";

    // Prevent UI freeze if Radix fails to cleanup body styles
    useEffect(() => {
        if (!isOpen) {
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

            cleanup();
            const timer = setTimeout(cleanup, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent
                onCloseAutoFocus={(e) => e.preventDefault()}
                className="sm:max-w-[500px] bg-brand-dark/98 backdrop-blur-2xl border border-purple-500/20 text-white p-0 overflow-hidden shadow-2xl shadow-purple-500/20"
            >
                <div className="h-1 w-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600" />

                {!isSuccess && (
                    <DialogHeader className="px-5 pt-5 pb-2 space-y-2">
                        <div className="space-y-0.5 text-center">
                            <DialogTitle className="text-xl font-black italic font-orbitron tracking-tight text-white uppercase">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="text-purple-200/40 text-[10px] font-medium tracking-wide">
                                {description}
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                )}

                <div className="px-5 pb-5">
                    <AnimatePresence mode="wait">
                        {isSuccess ? (
                            <motion.div
                                key="success-state"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center justify-center py-12 px-4 space-y-4 text-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 mb-2">
                                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-xl font-black italic font-orbitron text-white uppercase tracking-wider">
                                    {isOrg ? "Organization Created!" : "Team Created!"}
                                </h3>
                                <p className="text-sm font-medium text-purple-200/60 tracking-wide flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                                    Navigating to {isOrg ? "Org" : "Team"} Dashboard...
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="form-state"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <Form {...form}>
                                    <form onSubmit={onSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {/* Name Input */}
                                            <FormField
                                                control={form.control}
                                                name={nameField}
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1">
                                                        <FormLabel className="text-[9px] uppercase font-bold text-purple-200/40 tracking-wider">
                                                            {nameLabel}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="relative group">
                                                                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-500/50 group-focus-within:text-purple-400 transition-colors" />
                                                                <Input
                                                                    placeholder={namePlaceholder}
                                                                    {...field}
                                                                    value={field.value || ""}
                                                                    className="pl-9 h-9 text-xs bg-white/5 border-white/10 focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg text-white placeholder:text-white/10"
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage className="text-[9px] font-bold text-rose-500" />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Tag Input */}
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
                                                                    value={field.value || ""}
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

                                        {/* Contact Region */}
                                        <FormField
                                            control={form.control}
                                            name="region"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[9px] uppercase font-bold text-purple-200/40 tracking-wider">
                                                        Region
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                                        <FormControl>
                                                            <SelectTrigger className="pl-3 h-9 text-xs bg-white/5 border-white/10 focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg text-white">
                                                                <div className="flex items-center gap-2">
                                                                    <Globe className="w-3.5 h-3.5 text-purple-500/50" />
                                                                    <SelectValue placeholder="Select a region" />
                                                                </div>
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-[#0B0C1A] border-white/10 text-white">
                                                            <SelectItem value="INDIA">India (IND)</SelectItem>
                                                            <SelectItem value="NA">North America (NA)</SelectItem>
                                                            <SelectItem value="EU">Europe (EU)</SelectItem>
                                                            <SelectItem value="ASIA">Asia (ASIA)</SelectItem>
                                                            <SelectItem value="SEA">Southeast Asia (SEA)</SelectItem>
                                                            <SelectItem value="SA">South America (SA)</SelectItem>
                                                            <SelectItem value="OCE">Oceania (OCE)</SelectItem>
                                                            <SelectItem value="MENA">Middle East & North Africa (MENA)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[9px] font-bold text-rose-500" />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Logo Upload */}
                                        <FormField
                                            control={form.control}
                                            name="image"
                                            render={({ field: { onChange, value } }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[9px] uppercase font-bold text-purple-200/40 tracking-wider">
                                                        Logo
                                                    </FormLabel>
                                                    <FormControl>
                                                        <FileUpload
                                                            onChange={onChange}
                                                            value={value}
                                                            accept="image/*"
                                                            maxSize={5 * 1024 * 1024}
                                                            compact={true}
                                                            className="border-white/10 hover:border-purple-500/30 transition-all rounded-lg"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[9px] font-bold text-rose-500" />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Description / Bio */}
                                        <FormField
                                            control={form.control}
                                            name={descField}
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[9px] uppercase font-bold text-purple-200/40 tracking-wider">
                                                        {descLabel}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <FileText className="absolute left-3 top-2.5 w-3.5 h-3.5 text-purple-500/50 group-focus-within:text-purple-400 transition-colors" />
                                                            <Textarea
                                                                placeholder={descPlaceholder}
                                                                {...field}
                                                                value={field.value || ""}
                                                                rows={2}
                                                                className="pl-9 pt-2 text-xs bg-white/5 border-white/10 focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg text-white resize-none min-h-[60px] max-h-[100px] placeholder:text-white/10"
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-[9px] font-bold text-rose-500" />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Submit Action and Error Handling */}
                                        <div className="pt-1 space-y-3">
                                            <Button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full h-10 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 rounded-lg font-black text-[10px] tracking-widest shadow-lg shadow-purple-600/10 group font-orbitron"
                                            >
                                                {isLoading ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                        Creating...
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2">
                                                        Create
                                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateGroupDialog;
