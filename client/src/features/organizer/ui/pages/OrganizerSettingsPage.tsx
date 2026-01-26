import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
    Settings,
    Trash2,
    Save,
    AlertTriangle,
    Building2,
    Mail,
    Tag,
    Camera,
    Globe,
    MessageCircle,
    Twitter,
    Instagram,
    Briefcase,
    Image as ImageIcon,
    X
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useOrganizerStore } from "@/features/organizer/store/useOrganizerStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { ORG_ACTIONS, ORG_ACTIONS_ACCESS } from "../../lib/access";
import { useAccess } from "@/features/auth/hooks/useAccess";

const OrganizerSettingsPage = () => {
    const navigate = useNavigate();
    const { currentOrg, updateOrg, deleteOrg, isLoading, error, getOrgById } = useOrganizerStore();
    const { user } = useAuthStore();
    const { can } = useAccess();

    const profileInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        tag: "",
        description: "",
        isHiring: false,
        socialLinks: {
            discord: "",
            twitter: "",
            website: "",
            instagram: "",
            youtube: "",
        }
    });

    const [images, setImages] = useState({
        image: null as File | null,
        banner: null as File | null
    });

    const [previews, setPreviews] = useState({
        image: "",
        banner: ""
    });

    // Reset form to original data
    const resetForm = useCallback(() => {
        if (currentOrg) {
            setFormData({
                name: currentOrg.name || "",
                email: currentOrg.email || "",
                tag: currentOrg.tag || "",
                description: currentOrg.description || "",
                isHiring: currentOrg.isHiring || false,
                socialLinks: {
                    discord: currentOrg.socialLinks?.discord || "",
                    twitter: currentOrg.socialLinks?.twitter || "",
                    website: currentOrg.socialLinks?.website || "",
                    instagram: currentOrg.socialLinks?.instagram || "",
                    youtube: currentOrg.socialLinks?.youtube || "",
                }
            });
            setPreviews({
                image: currentOrg.imageUrl || "",
                banner: currentOrg.bannerUrl || ""
            });
            setImages({ image: null, banner: null });
        }
    }, [currentOrg]);

    useEffect(() => {
        if (!currentOrg) {
            getOrgById(user?.orgId || "");
        } else {
            resetForm();
        }
    }, [currentOrg, resetForm]);

    // Check if form is dirty
    const isDirty = useMemo(() => {
        if (!currentOrg) return false;

        const hasFormChanged =
            formData.name !== (currentOrg.name || "") ||
            formData.email !== (currentOrg.email || "") ||
            formData.tag !== (currentOrg.tag || "") ||
            formData.description !== (currentOrg.description || "") ||
            formData.isHiring !== (currentOrg.isHiring || false) ||
            formData.socialLinks.discord !== (currentOrg.socialLinks?.discord || "") ||
            formData.socialLinks.twitter !== (currentOrg.socialLinks?.twitter || "") ||
            formData.socialLinks.website !== (currentOrg.socialLinks?.website || "") ||
            formData.socialLinks.instagram !== (currentOrg.socialLinks?.instagram || "") ||
            formData.socialLinks.youtube !== (currentOrg.socialLinks?.youtube || "");

        const hasImagesChanged = images.image !== null || images.banner !== null;

        return hasFormChanged || hasImagesChanged;
    }, [formData, currentOrg, images]);

    // RBAC
    const canUpdate = can(ORG_ACTIONS_ACCESS[ORG_ACTIONS.updateOrg]);
    const canDelete = can(ORG_ACTIONS_ACCESS[ORG_ACTIONS.deleteOrg]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith("social.")) {
            const field = name.split(".")[1];
            setFormData(prev => ({
                ...prev,
                socialLinks: { ...prev.socialLinks, [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "banner") => {
        const file = e.target.files?.[0];
        if (file) {
            setImages(prev => ({ ...prev, [type]: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => ({ ...prev, [type]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleHiringChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, isHiring: checked }));
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentOrg?._id) return;

        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", formData.email);
        data.append("tag", formData.tag);
        data.append("description", formData.description);
        data.append("isHiring", String(formData.isHiring));
        data.append("socialLinks", JSON.stringify(formData.socialLinks));

        if (images.image) {
            data.append("image", images.image);
        }
        if (images.banner) {
            data.append("banner", images.banner);
        }

        const success = await updateOrg(data);
        if (success) {
            toast.success("Organization updated successfully");
            await getOrgById(currentOrg._id);
            setImages({ image: null, banner: null });
        } else {
            toast.error(error || "Failed to update organization");
        }
    };

    const handleDelete = async () => {
        if (!currentOrg?._id) return;

        const success = await deleteOrg();
        if (success) {
            toast.success("Organization deleted successfully");
            navigate("/");
        } else {
            toast.error(error || "Failed to delete organization");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                    <Settings className="text-purple-500 w-8 h-8" /> Organization Settings
                </h1>
                <p className="text-gray-400">Manage your organization's identity, recruitment status, and social presence.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Overview (Left Column) */}
                <div className="space-y-6">
                    <Card className="bg-[#0B0C1A] border-white/5 h-fit overflow-hidden">
                        <div className="h-24 relative bg-[#0B0C1A] border-b border-white/5 group">
                            <img
                                src={previews.banner || "/placeholder-banner.jpg"}
                                alt="Banner"
                                className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C1A] to-transparent" />
                            <Button
                                size="icon"
                                variant="secondary"
                                type="button"
                                onClick={() => bannerInputRef.current?.click()}
                                className="absolute top-2 right-2 rounded-full size-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/80 border border-white/10"
                            >
                                <ImageIcon className="size-4 text-white" />
                            </Button>
                            <input
                                type="file"
                                ref={bannerInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, "banner")}
                            />
                        </div>
                        <CardHeader className="text-center -mt-12 overflow-visible">
                            <div className="relative mx-auto w-24 h-24 mb-4">
                                <Avatar className="w-full h-full border-4 border-[#0B0C1A] shadow-2xl">
                                    <AvatarImage src={previews.image} />
                                    <AvatarFallback className="bg-purple-500/10 text-purple-400 text-2xl font-bold">
                                        {currentOrg?.name?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    type="button"
                                    onClick={() => profileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 rounded-full size-8 shadow-lg border border-white/10 bg-gray-900 hover:bg-gray-800"
                                >
                                    <Camera className="size-4 text-purple-400" />
                                </Button>
                                <input
                                    type="file"
                                    ref={profileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, "image")}
                                />
                            </div>
                            <CardTitle className="text-white text-xl">{currentOrg?.name}</CardTitle>
                            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                                <Badge variant="outline" className="bg-purple-500/10 border-purple-500/20 text-purple-400">
                                    <Tag className="size-3 mr-1" /> {currentOrg?.tag}
                                </Badge>
                                {formData.isHiring && (
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                        <Briefcase className="size-3 mr-1" /> Is Hiring
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4 border-t border-white/5">
                            <div className="space-y-2 text-sm">
                                <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Ownership</p>
                                <p className="text-gray-300 flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-purple-500" /> Owner Account
                                </p>
                            </div>
                            <div className="space-y-2 text-sm pt-2">
                                <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Verification</p>
                                {currentOrg?.isVerified ? (
                                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Verified Partner</Badge>
                                ) : (
                                    <p className="text-gray-500">Not verified</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recruitment Status */}
                    <Card className="bg-[#0B0C1A] border-white/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-white text-sm flex items-center gap-2 uppercase tracking-widest text-gray-400">
                                <Briefcase className="size-4 text-emerald-400" /> Recruitment
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 transition-colors hover:bg-emerald-500/10">
                                <Checkbox
                                    id="isHiring"
                                    checked={formData.isHiring}
                                    onCheckedChange={handleHiringChange}
                                    disabled={!canUpdate}
                                    className="border-emerald-500/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white"
                                />
                                <div className="grid gap-1.5 leading-none cursor-pointer" onClick={() => canUpdate && handleHiringChange(!formData.isHiring)}>
                                    <label htmlFor="isHiring" className="text-sm font-bold text-emerald-400 leading-none">
                                        Open for Hiring
                                    </label>
                                    <p className="text-xs text-gray-500">
                                        Let players know you're looking for new staff.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Forms (Right 2 Columns) */}
                <div className="md:col-span-2 space-y-6">
                    <form onSubmit={handleUpdate} className="space-y-6">
                        {/* Information Form */}
                        <Card className="bg-[#0B0C1A] border-white/5 shadow-xl">
                            <CardHeader className="border-b border-white/5 pb-4">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Building2 className="size-5 text-purple-500" /> Organization Profile
                                </CardTitle>
                                <CardDescription>Update your public identity and contact information.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Brand Name</label>
                                        <Input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="bg-white/5 border-white/10 text-white focus:ring-purple-500 focus:border-purple-500 h-11"
                                            placeholder="e.g. Pro Gaming League"
                                            disabled={!canUpdate}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Public Tag</label>
                                        <Input
                                            name="tag"
                                            value={formData.tag}
                                            onChange={handleChange}
                                            className="bg-white/5 border-white/10 text-white focus:ring-purple-500 focus:border-purple-500 h-11"
                                            placeholder="e.g. PGL"
                                            disabled={!canUpdate}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Official Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                        <Input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="bg-white/5 border-white/10 text-white pl-10 focus:ring-purple-500 focus:border-purple-500 h-11"
                                            placeholder="admin@yourorg.com"
                                            disabled={!canUpdate}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Biography</label>
                                    <Textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="bg-white/5 border-white/10 text-white min-h-[140px] focus:ring-purple-500 focus:border-purple-500 resize-none leading-relaxed"
                                        placeholder="Tell participants about your mission, history, and goals..."
                                        disabled={!canUpdate}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Social Links Form */}
                        <Card className="bg-[#0B0C1A] border-white/5 shadow-xl">
                            <CardHeader className="border-b border-white/5 pb-4">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Globe className="size-5 text-blue-400" /> Social Presence
                                </CardTitle>
                                <CardDescription>Connect your official social media channels.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Website</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                            <Input
                                                name="social.website"
                                                value={formData.socialLinks.website}
                                                onChange={handleChange}
                                                className="bg-white/5 border-white/10 text-white pl-10 h-11"
                                                placeholder="https://yourorg.com"
                                                disabled={!canUpdate}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Discord Invite</label>
                                        <div className="relative">
                                            <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                            <Input
                                                name="social.discord"
                                                value={formData.socialLinks.discord}
                                                onChange={handleChange}
                                                className="bg-white/5 border-white/10 text-white pl-10 h-11"
                                                placeholder="discord.gg/xyz"
                                                disabled={!canUpdate}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Twitter (X)</label>
                                        <div className="relative">
                                            <Twitter className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                            <Input
                                                name="social.twitter"
                                                value={formData.socialLinks.twitter}
                                                onChange={handleChange}
                                                className="bg-white/5 border-white/10 text-white pl-10 h-11"
                                                placeholder="@YourOrg"
                                                disabled={!canUpdate}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Instagram</label>
                                        <div className="relative">
                                            <Instagram className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                            <Input
                                                name="social.instagram"
                                                value={formData.socialLinks.instagram}
                                                onChange={handleChange}
                                                className="bg-white/5 border-white/10 text-white pl-10 h-11"
                                                placeholder="username"
                                                disabled={!canUpdate}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            {canUpdate && isDirty && (
                                <CardFooter className="pt-4 pb-6 border-t border-white/5 flex justify-end gap-3 sticky bottom-4 z-10 animate-in slide-in-from-bottom-4 duration-300">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={resetForm}
                                        disabled={isLoading}
                                        className="bg-white/5 border-white/10 text-white hover:bg-white/10 px-6 font-bold"
                                    >
                                        Cancel
                                        <X className="size-4 ml-2" />
                                    </Button>
                                    <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-500 text-white px-10 font-bold transition-all shadow-lg shadow-purple-900/40 active:scale-95">
                                        {isLoading ? "Synchronizing..." : "Save Settings"}
                                        <Save className="size-4 ml-2" />
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    </form>

                    {/* Danger Zone */}
                    {canDelete && (
                        <Card className="border-red-500/20 bg-red-500/5 shadow-inner">
                            <CardHeader>
                                <CardTitle className="text-red-400 flex items-center gap-2">
                                    <AlertTriangle className="size-5" /> Account Safety
                                </CardTitle>
                                <CardDescription className="text-red-400/60 font-medium">Permanently dissolve your organization and remove its presence.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-red-300/60 mb-6 leading-relaxed bg-red-950/20 p-4 rounded-lg border border-red-500/10">
                                    <strong className="text-red-400">Warning:</strong> Dissolving this organization will terminate all hosted events, revoke staff credentials, and purge your metrics. This metadata cannot be recovered.
                                </p>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="bg-red-600/10 hover:bg-red-600 border border-red-500/30 text-red-500 hover:text-white font-black px-8">
                                            Terminate Organization
                                            <Trash2 className="size-4 ml-2" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-[#0F0720] border-red-500/20 text-white shadow-2xl max-w-lg">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-2xl font-black text-red-400">Irreversible Action</AlertDialogTitle>
                                            <AlertDialogDescription className="text-gray-400 py-2">
                                                You are about to dissolve <span className="text-white font-bold bg-white/5 px-2 py-1 rounded">"{currentOrg?.name}"</span>.
                                                This will permanently erase all history, events, and rosters associated with this organization.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="gap-3 mt-4">
                                            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 font-bold">Abandon</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-black px-10">
                                                Dissolve Now
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrganizerSettingsPage;
