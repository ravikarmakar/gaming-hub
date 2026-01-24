import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    Globe,
    Twitter,
    Instagram,
    Youtube,
    Settings,
    Image as ImageIcon,
    LayoutDashboard,
    Save,
    Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useTeamStore } from "@/features/teams/store/useTeamStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import FileUpload from "@/components/FileUpload";

// Simple custom Switch since UI component is missing
const Switch = ({ checked, onCheckedChange }: { checked: boolean, onCheckedChange: (val: boolean) => void }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={`
      relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none
      ${checked ? "bg-purple-600" : "bg-gray-700"}
    `}
    >
        <span
            className={`
        inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
        ${checked ? "translate-x-6" : "translate-x-1"}
      `}
        />
    </button>
);


const TeamSettings = () => {
    const { currentTeam, getTeamById, updateTeam, isLoading } = useTeamStore();
    const { user } = useAuthStore();

    const [formData, setFormData] = useState({
        teamName: "",
        tag: "",
        bio: "",
        region: "",
        isRecruiting: false,
        twitter: "",
        discord: "",
        youtube: "",
        instagram: "",
        image: null as File | null,
        banner: null as File | null,
    });

    const [previews, setPreviews] = useState({
        image: null as string | null,
        banner: null as string | null,
    });

    useEffect(() => {
        if (user?.teamId) {
            getTeamById(user.teamId);
        }
    }, [user?.teamId, getTeamById]);

    useEffect(() => {
        if (currentTeam) {
            setFormData({
                teamName: currentTeam.teamName || "",
                tag: currentTeam.tag || "",
                bio: currentTeam.bio || "",
                region: (currentTeam.region as string) || "INDIA",
                isRecruiting: currentTeam.isRecruiting || false,
                twitter: currentTeam.socialLinks?.twitter || "",
                discord: currentTeam.socialLinks?.discord || "",
                youtube: currentTeam.socialLinks?.youtube || "",
                instagram: currentTeam.socialLinks?.instagram || "",
                image: null,
                banner: null,
            });
            setPreviews({
                image: currentTeam.imageUrl,
                banner: currentTeam.bannerUrl,
            });
        }
    }, [currentTeam]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, isRecruiting: checked }));
    };

    const handleSelectChange = (value: string) => {
        setFormData((prev) => ({ ...prev, region: value }));
    };

    const handleFileChange = (name: "image" | "banner", file: File | null) => {
        setFormData((prev) => ({ ...prev, [name]: file }));
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews((prev) => ({ ...prev, [name]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = new FormData();
        data.append("teamName", formData.teamName);
        data.append("tag", formData.tag);
        data.append("bio", formData.bio);
        data.append("region", formData.region);
        data.append("isRecruiting", String(formData.isRecruiting));
        data.append("twitter", formData.twitter);
        data.append("discord", formData.discord);
        data.append("youtube", formData.youtube);
        data.append("instagram", formData.instagram);

        if (formData.image) data.append("image", formData.image);
        if (formData.banner) data.append("banner", formData.banner);

        const result = await updateTeam(data);
        if (result) {
            toast.success("Team settings updated successfully!");
        } else {
            toast.error("Failed to update team settings");
        }
    };

    if (isLoading && !currentTeam) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] bg-[#0B0C1A]">
                <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
            </div>
        );
    }

    if (!currentTeam) return null;

    // Check if the current user is the captain. If not, redirect.
    const isCaptain = currentTeam.captain === user?._id;
    if (!isCaptain && !isLoading) {
        return <Navigate to="/dashboard/team" replace />;
    }

    return (
        <ScrollArea className="h-full bg-[#0B0C1A]">
            <div className="px-4 md:px-8 py-8 mx-auto max-w-5xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <Settings className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Team Settings</h1>
                        <p className="text-gray-400 text-sm">Manage your team's identity and professional presence</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Branding Section */}
                    <Card className="bg-[#111222] border-purple-500/20">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-purple-400" />
                                Branding & Visuals
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                Update your team logo and banner to stand out
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <Label className="text-gray-300">Team Logo</Label>
                                    <FileUpload
                                        name="image"
                                        onChange={(file) => handleFileChange("image", file)}
                                        accept="image/*"
                                        compact
                                    />
                                    {previews.image && (
                                        <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border border-purple-500/20 bg-black/40">
                                            <img src={previews.image} alt="Logo preview" className="object-cover w-full h-full" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-gray-300">Team Banner</Label>
                                    <FileUpload
                                        name="banner"
                                        onChange={(file) => handleFileChange("banner", file)}
                                        accept="image/*"
                                        compact
                                    />
                                    {previews.banner && (
                                        <div className="mt-2 relative w-full h-24 rounded-lg overflow-hidden border border-purple-500/20 bg-black/40">
                                            <img src={previews.banner} alt="Banner preview" className="object-cover w-full h-full" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* General Information */}
                    <Card className="bg-[#111222] border-purple-500/20">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <LayoutDashboard className="w-5 h-5 text-purple-400" />
                                General Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="teamName" className="text-gray-300">Team Name</Label>
                                    <Input
                                        id="teamName"
                                        name="teamName"
                                        value={formData.teamName}
                                        onChange={handleInputChange}
                                        className="bg-black/20 border-purple-500/20 text-white placeholder:text-gray-600 focus:border-purple-500/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tag" className="text-gray-300">Team Tag (Max 5 chars)</Label>
                                    <Input
                                        id="tag"
                                        name="tag"
                                        maxLength={5}
                                        value={formData.tag}
                                        onChange={handleInputChange}
                                        className="bg-black/20 border-purple-500/20 text-white placeholder:text-gray-600 focus:border-purple-500/50 uppercase"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio" className="text-gray-300">Team Bio</Label>
                                <Textarea
                                    id="bio"
                                    name="bio"
                                    rows={4}
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    className="bg-black/20 border-purple-500/20 text-white placeholder:text-gray-600 focus:border-purple-500/50"
                                    placeholder="Tell the world about your team..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Region</Label>
                                    <Select value={formData.region} onValueChange={handleSelectChange}>
                                        <SelectTrigger className="bg-black/20 border-purple-500/20 text-white">
                                            <SelectValue placeholder="Select region" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#111222] border-purple-500/20 text-white">
                                            {["NA", "EU", "ASIA", "SEA", "SA", "OCE", "MENA", "INDIA"].map((reg) => (
                                                <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-purple-500/10">
                                    <div className="space-y-0.5">
                                        <Label className="text-gray-300">Recruitment Status</Label>
                                        <p className="text-xs text-gray-500">Allow other players to see you're looking for members</p>
                                    </div>
                                    <Switch
                                        checked={formData.isRecruiting}
                                        onCheckedChange={handleSwitchChange}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Social Links */}
                    <Card className="bg-[#111222] border-purple-500/20">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Globe className="w-5 h-5 text-purple-400" />
                                Social Presence
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Twitter className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                    <Input
                                        name="twitter"
                                        placeholder="Twitter URL"
                                        value={formData.twitter}
                                        onChange={handleInputChange}
                                        className="pl-10 bg-black/20 border-purple-500/20 text-white"
                                    />
                                </div>
                                <div className="relative">
                                    <Badge variant="outline" className="border-purple-500/20 text-gray-400 mr-2 absolute left-1 top-2.5 h-6 scale-75">
                                        #
                                    </Badge>
                                    <Input
                                        name="discord"
                                        placeholder="Discord Invite Link"
                                        value={formData.discord}
                                        onChange={handleInputChange}
                                        className="pl-10 bg-black/20 border-purple-500/20 text-white"
                                    />
                                </div>
                                <div className="relative">
                                    <Youtube className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                    <Input
                                        name="youtube"
                                        placeholder="YouTube Channel"
                                        value={formData.youtube}
                                        onChange={handleInputChange}
                                        className="pl-10 bg-black/20 border-purple-500/20 text-white"
                                    />
                                </div>
                                <div className="relative">
                                    <Instagram className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                    <Input
                                        name="instagram"
                                        placeholder="Instagram Profile"
                                        value={formData.instagram}
                                        onChange={handleInputChange}
                                        className="pl-10 bg-black/20 border-purple-500/20 text-white"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-purple-500/20 text-gray-400 hover:bg-white/5"
                            onClick={() => user?.teamId && getTeamById(user.teamId, true)}
                        >
                            Reset Changes
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-purple-600 hover:bg-purple-700 text-white min-w-[140px]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Settings
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </ScrollArea>
    );
};

export default TeamSettings;
