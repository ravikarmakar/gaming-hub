import { Control, FieldValues } from "react-hook-form";
import { User as UserIcon, Phone, Mail, Calendar } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface PersonalDetailsSectionProps<T extends FieldValues> {
    control: Control<T>;
    userEmail?: string;
}

export function PersonalDetailsSection<T extends FieldValues>({
    control,
    userEmail,
}: PersonalDetailsSectionProps<T>) {
    return (
        <Card className="bg-white/[0.02] border-white/5 rounded-[32px] overflow-hidden">
            <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-3 mb-1">
                    <UserIcon className="w-4 h-4 text-blue-500" />
                    <CardTitle className="text-sm font-black text-white tracking-[2px]">Personal Details</CardTitle>
                </div>
                <CardDescription className="text-xs text-zinc-400 font-medium">
                    Your personal information is used for identity verification and support.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                        control={control}
                        name={"gender" as any}
                        render={({ field }) => (
                            <FormItem className="space-y-2.5">
                                <div className="flex items-center gap-2 px-1">
                                    <UserIcon className="w-3 h-3 text-blue-500/50" />
                                    <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-400">Gender</FormLabel>
                                </div>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-12 bg-white/[0.03] border-white/5 focus:ring-0 focus:border-purple-500/50 transition-all rounded-xl text-white font-bold tracking-tight text-sm px-4 capitalize">
                                            <SelectValue placeholder="Identify yourself" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-[#0d0b14] border-white/10 text-zinc-200 rounded-xl overflow-hidden backdrop-blur-xl">
                                        {[
                                            { label: "Male", value: "male" },
                                            { label: "Female", value: "female" },
                                            { label: "Other", value: "other" },
                                            { label: "Prefer not to say", value: "prefer_not_to_say" }
                                        ].map((option) => (
                                            <SelectItem key={option.value} value={option.value} className="capitalize py-3 focus:bg-blue-500/10 focus:text-white transition-colors cursor-pointer font-bold text-xs tracking-widest">
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage className="text-[10px] font-bold text-red-500/80 px-1" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name={"dob" as any}
                        render={({ field }) => (
                            <FormItem className="space-y-2.5">
                                <div className="flex items-center gap-2 px-1">
                                    <Calendar className="w-3 h-3 text-purple-500/50" />
                                    <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-400">Date of Birth</FormLabel>
                                </div>
                                <FormControl>
                                    <div className="relative group">
                                        <Input
                                            {...field}
                                            type="date"
                                            max={new Date().toISOString().split("T")[0]}
                                            className="h-12 bg-white/[0.03] border-white/5 focus:border-purple-500/50 transition-all rounded-xl text-white font-bold tracking-tight text-sm px-4 placeholder:text-zinc-700 [color-scheme:dark]"
                                        />
                                        <div className="absolute inset-0 rounded-xl bg-purple-500/0 group-focus-within:bg-purple-500/[0.02] pointer-events-none transition-all" />
                                    </div>
                                </FormControl>
                                <FormMessage className="text-[10px] font-bold text-red-500/80 px-1" />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={control}
                    name={"phoneNumber" as any}
                    render={({ field }) => (
                        <FormItem className="space-y-2.5">
                            <div className="flex items-center gap-2 px-1">
                                <Phone className="w-3 h-3 text-emerald-500/50" />
                                <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-400">Phone Number</FormLabel>
                            </div>
                            <FormControl>
                                <div className="relative group">
                                    <Input
                                        {...field}
                                        type="tel"
                                        maxLength={15}
                                        className="h-12 bg-white/[0.03] border-white/5 focus:border-purple-500/50 transition-all rounded-xl text-white font-bold tracking-tight text-sm px-4 placeholder:text-zinc-700"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                    <div className="absolute inset-0 rounded-xl bg-purple-500/0 group-focus-within:bg-purple-500/[0.02] pointer-events-none transition-all" />
                                </div>
                            </FormControl>
                            <FormMessage className="text-[10px] font-bold text-red-500/80 px-1" />
                        </FormItem>
                    )}
                />

                <div className="space-y-2.5 opacity-60 grayscale pointer-events-none">
                    <div className="flex items-center gap-2 px-1">
                        <Mail className="w-3 h-3 text-zinc-400" />
                        <label className="text-[10px] font-black tracking-[3px] text-zinc-400">Primary Email</label>
                    </div>
                    <div className="h-12 bg-white/[0.03] border-white/5 rounded-xl text-zinc-400 font-bold tracking-tight text-sm px-4 flex items-center border-dashed border">
                        {userEmail || "Not provided"}
                    </div>
                    <p className="text-[9px] font-bold text-zinc-600 tracking-widest px-1">
                        Email can only be changed from account security settings.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
