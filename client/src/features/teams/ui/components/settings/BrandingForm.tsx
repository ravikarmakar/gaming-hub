import { Control } from "react-hook-form";
import { Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormControl, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import FileUpload from "@/components/FileUpload";
import { MAX_FILE_SIZE, TeamForm } from "@/features/teams/lib/teamSchema";

interface BrandingFormProps {
    control: Control<TeamForm>;
    currentTeam: any; // Type strictly if possible, but 'any' matches the original usage or infer from store
}

export const BrandingForm = ({ control, currentTeam }: BrandingFormProps) => {
    return (
        <Card className="bg-[#0F111A]/60 border-white/10 backdrop-blur-xl shadow-2xl shadow-purple-500/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <ImageIcon className="w-5 h-5 text-purple-400" />
                    Branding & Visuals
                </CardTitle>
                <CardDescription className="text-gray-400">
                    Update your team logo and banner to stand out
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                        control={control}
                        name="image"
                        render={({ field }) => (
                            <div className="space-y-4">
                                <Label className="text-gray-300">Team Logo</Label>
                                <FormControl>
                                    <FileUpload
                                        variant="avatar"
                                        value={field.value || currentTeam?.imageUrl}
                                        onChange={field.onChange}
                                        maxSize={MAX_FILE_SIZE}
                                        fallbackText={currentTeam?.teamName?.[0]}
                                    />
                                </FormControl>
                                <FormMessage />
                            </div>
                        )}
                    />

                    <FormField
                        control={control}
                        name="banner"
                        render={({ field }) => (
                            <div className="space-y-4">
                                <Label className="text-gray-300">Team Banner</Label>
                                <FormControl>
                                    <FileUpload
                                        variant="banner"
                                        value={field.value || currentTeam?.bannerUrl}
                                        onChange={field.onChange}
                                        maxSize={MAX_FILE_SIZE}
                                    />
                                </FormControl>
                                <FormMessage />
                            </div>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    );
};
