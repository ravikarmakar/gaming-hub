import { Control } from "react-hook-form";
import { Globe, Twitter, Instagram, Youtube } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TeamForm } from "@/features/teams/lib/teamSchema";

interface SocialsFormProps {
    control: Control<TeamForm>;
}

export const SocialsForm = ({ control }: SocialsFormProps) => {
    return (
        <Card className="bg-[#0F111A]/60 border-white/10 backdrop-blur-xl shadow-2xl shadow-purple-500/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Globe className="w-5 h-5 text-purple-400" />
                    Social Presence
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={control}
                        name="twitter"
                        render={({ field }) => (
                            <FormItem className="relative">
                                <Twitter className="absolute w-4 h-4 text-gray-500 left-3 top-3" />
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Twitter URL"
                                        className="pl-10 text-white bg-black/20 border-purple-500/20"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="discord"
                        render={({ field }) => (
                            <FormItem className="relative">
                                <Badge variant="outline" className="mr-2 border-purple-500/20 text-gray-400 absolute left-1 top-2.5 h-6 scale-75">
                                    #
                                </Badge>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Discord Invite Link"
                                        className="pl-10 text-white bg-black/20 border-purple-500/20"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="youtube"
                        render={({ field }) => (
                            <FormItem className="relative">
                                <Youtube className="absolute w-4 h-4 text-gray-500 left-3 top-3" />
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="YouTube Channel"
                                        className="pl-10 text-white bg-black/20 border-purple-500/20"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="instagram"
                        render={({ field }) => (
                            <FormItem className="relative">
                                <Instagram className="absolute w-4 h-4 text-gray-500 left-3 top-3" />
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Instagram Profile"
                                        className="pl-10 text-white bg-black/20 border-purple-500/20"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    );
};
