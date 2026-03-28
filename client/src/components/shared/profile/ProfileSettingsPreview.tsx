import React from "react";
import { Control } from "react-hook-form";
import { Tag, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/ui/form";
import FileUpload from "@/components/FileUpload";

interface ProfileSettingsPreviewProps {
    control: Control<any>;
    bannerName: string;
    imageName: string;
    currentBannerUrl?: string | null;
    currentImageUrl?: string | null;
    name?: string;
    tag?: string;
    isHiring?: boolean;
    isVerified?: boolean;
    canUpdate?: boolean;
    fallbackText?: string;
    ownershipLabel?: string;
    hideStatus?: boolean;
}

export const ProfileSettingsPreview: React.FC<ProfileSettingsPreviewProps> = ({
    control,
    bannerName,
    imageName,
    currentBannerUrl,
    currentImageUrl,
    name,
    tag,
    isHiring,
    isVerified,
    canUpdate,
    fallbackText,
    ownershipLabel = "Owner Account",
    hideStatus = false
}) => {
    return (
        <Card className="bg-transparent border-white/5 h-fit overflow-hidden">
            <div className="space-y-4">
                <FormField
                    control={control}
                    name={bannerName}
                    render={({ field }) => (
                        <FileUpload
                            variant="banner"
                            value={field.value || currentBannerUrl}
                            onChange={field.onChange}
                            disabled={!canUpdate}
                            label="Change Banner"
                        />
                    )}
                />
            </div>
            <CardHeader className="text-center -mt-16 overflow-visible">
                <div className="relative mx-auto mb-4">
                    <FormField
                        control={control}
                        name={imageName}
                        render={({ field }) => (
                            <FileUpload
                                variant="avatar"
                                value={field.value || currentImageUrl}
                                onChange={field.onChange}
                                disabled={!canUpdate}
                                fallbackText={fallbackText || name?.[0]}
                            />
                        )}
                    />
                </div>
                <CardTitle className="text-white text-xl">{name}</CardTitle>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                    {tag && (
                        <Badge variant="outline" className="bg-purple-500/10 border-purple-500/20 text-purple-400">
                            <Tag className="size-3 mr-1" /> {tag}
                        </Badge>
                    )}
                    {isHiring && (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            <Briefcase className="size-3 mr-1" /> Is Hiring
                        </Badge>
                    )}
                </div>
            </CardHeader>
            {!hideStatus && (
                <CardContent className="pt-4 border-t border-white/5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 text-sm border-r border-white/5 pr-4">
                            <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Ownership</p>
                            <p className="text-zinc-300 flex items-center gap-2">
                                <span className="size-2 rounded-full bg-purple-500" /> {ownershipLabel}
                            </p>
                        </div>
                        <div className="space-y-2 text-sm pl-4">
                            <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Verification</p>
                            {isVerified ? (
                                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 w-fit">Verified Partner</Badge>
                            ) : (
                                <p className="text-zinc-500">Not verified</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};
