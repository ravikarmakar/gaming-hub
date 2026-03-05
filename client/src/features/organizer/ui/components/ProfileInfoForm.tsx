import { Building2, Globe } from "lucide-react";
import { REGIONS } from "@/constants/regions";
import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FormSection } from "@/components/shared/FormSection";
import { OrgSettingsFormSchema } from "../../lib/orgSchemas";

interface ProfileInfoFormProps {
    disabled?: boolean;
}

export const ProfileInfoForm = ({ disabled }: ProfileInfoFormProps) => {
    const { control } = useFormContext<OrgSettingsFormSchema>();

    return (
        <FormSection
            title="Organization Profile"
            description="Update your public identity and contact information."
            icon={Building2}
            iconColor="text-purple-500"
            contentClassName="pt-6"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-black text-gray-500 uppercase tracking-widest">Brand Name</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    className="bg-white/5 border-white/10 text-white focus:ring-purple-500 focus:border-purple-500 h-11"
                                    placeholder="e.g. Pro Gaming League"
                                    disabled={disabled}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="tag"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-black text-gray-500 uppercase tracking-widest">Public Tag</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                    className="bg-white/5 border-white/10 text-white focus:ring-purple-500 focus:border-purple-500 h-11"
                                    placeholder="e.g. PGL"
                                    disabled={disabled}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <FormField
                control={control}
                name="region"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs font-black text-gray-500 uppercase tracking-widest">Region</FormLabel>
                        <Select disabled={disabled} onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 focus:ring-purple-500 focus:border-purple-500">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-gray-500" />
                                        <SelectValue placeholder="Select a region" />
                                    </div>
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#0B0C1A] border-white/10 text-white">
                                {REGIONS.map((region) => (
                                    <SelectItem key={region.value} value={region.value}>
                                        {region.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs font-black text-gray-500 uppercase tracking-widest">Biography</FormLabel>
                        <FormControl>
                            <Textarea
                                {...field}
                                className="bg-white/5 border-white/10 text-white min-h-[140px] focus:ring-purple-500 focus:border-purple-500 resize-none leading-relaxed"
                                placeholder="Tell participants about your mission, history, and goals..."
                                disabled={disabled}
                                value={field.value || ""}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </FormSection>
    );
};
