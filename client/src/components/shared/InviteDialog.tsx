import { useState } from "react";
import { Loader2, Search, UserPlus, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface InviteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    descriptionSearch?: string;
    descriptionDetails?: string;

    searchTerm: string;
    onSearchChange: (value: string) => void;
    isSearching: boolean;
    searchResults: any[];

    onInvite: (userId: string, role: string, message: string) => void | Promise<void>;
    isInviting: boolean;

    roles?: { label: string; value: string }[];
    defaultRole?: string;
    showOptionalMessage?: boolean;
}

export const InviteDialog = ({
    open,
    onOpenChange,
    title = "Invite Member",
    descriptionSearch = "Search for a user to invite.",
    descriptionDetails = "Add invitation details.",
    searchTerm,
    onSearchChange,
    isSearching,
    searchResults,
    onInvite,
    isInviting,
    roles = [],
    defaultRole = "",
    showOptionalMessage = true,
}: InviteDialogProps) => {
    const [step, setStep] = useState<"search" | "details">("search");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [role, setRole] = useState<string>(defaultRole);
    const [message, setMessage] = useState("");

    const handleSelectUser = (user: any) => {
        setSelectedUser(user);
        setStep("details");
    };

    const handleSendInvite = async () => {
        if (!selectedUser) return;
        try {
            await onInvite(selectedUser._id, role, message);

            setStep("search");
            setSelectedUser(null);
            onSearchChange("");
            setMessage("");
            setRole(defaultRole);
        } catch (error) {
            console.error("Failed to send invitation:", error);
            // We don't reset the state here so the user can try again or fix issues
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setStep("search");
            setSelectedUser(null);
            onSearchChange("");
            setMessage("");
            setRole(defaultRole);
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="bg-[#1a1b2e] border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        {step === "search" ? descriptionSearch : descriptionDetails}
                    </DialogDescription>
                </DialogHeader>

                {step === "search" ? (
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input
                                placeholder="Search by username..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-9 bg-black/20 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {isSearching ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                                </div>
                            ) : searchResults?.map((user: any) => (
                                <div
                                    key={user._id}
                                    onClick={() => handleSelectUser(user)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            if (e.key === ' ') e.preventDefault();
                                            handleSelectUser(user);
                                        }
                                    }}
                                    className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                >
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={user.avatar} alt={user.username} />
                                        <AvatarFallback>{user.username[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium text-white">{user.username}</p>
                                        <p className="text-xs text-gray-400">{user.email}</p>
                                    </div>
                                    <UserPlus className="ml-auto w-4 h-4 text-purple-400" />
                                </div>
                            ))}
                            {!isSearching && searchResults?.length === 0 && searchTerm && (
                                <p className="text-center text-sm text-gray-500 py-4">No users found.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                            <Avatar className="w-10 h-10">
                                <AvatarImage src={selectedUser?.avatar} alt={selectedUser?.username} />
                                <AvatarFallback>{selectedUser?.username?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium text-white">{selectedUser?.username}</p>
                                <p className="text-xs text-gray-400">Selected User</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setStep("search")} className="ml-auto text-xs text-purple-400 hover:text-purple-300">Change</Button>
                        </div>

                        {roles.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400">Role</label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1b2e] border-white/10 text-white">
                                        {roles.map((r) => (
                                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {showOptionalMessage && (
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400">Message (Optional)</label>
                                <Textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Join us..."
                                    className="bg-black/20 border-white/10 text-white min-h-[80px]"
                                />
                            </div>
                        )}

                        <Button onClick={handleSendInvite} disabled={isInviting} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                            {isInviting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                            Send Invitation
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
