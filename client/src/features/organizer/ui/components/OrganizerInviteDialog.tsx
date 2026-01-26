import { useState, useEffect } from "react";
import { Loader2, Search, UserPlus, Check } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useOrganizerStore } from "@/features/organizer/store/useOrganizerStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ORG_ROLE } from "@/features/organizer/lib/access";
import toast from "react-hot-toast";

interface OrganizerInviteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orgId: string;
}

export const OrganizerInviteDialog = ({ open, onOpenChange, orgId }: OrganizerInviteDialogProps) => {
    const [step, setStep] = useState<"search" | "details">("search");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [role, setRole] = useState<string>(ORG_ROLE.STAFF);
    const [message, setMessage] = useState("");

    const { searchAvailableUsers, availableUsers, inviteStaff, isLoading } = useOrganizerStore();
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Search Effect
    useEffect(() => {
        if (debouncedSearch && step === "search") {
            searchAvailableUsers(debouncedSearch, 1, 10);
        }
    }, [debouncedSearch, step, searchAvailableUsers]);

    const handleSelectUser = (user: any) => {
        setSelectedUser(user);
        setStep("details");
    };

    const handleSendInvite = async () => {
        if (!selectedUser) return;
        const success = await inviteStaff(orgId, selectedUser._id, role, message);
        if (success) {
            toast.success("Invitation sent successfully");
            onOpenChange(false);
            // Reset
            setStep("search");
            setSelectedUser(null);
            setSearchTerm("");
            setMessage("");
        } else {
            toast.error("Failed to send invitation");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#1a1b2e] border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Invite Member</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        {step === "search" ? "Search for a user to invite." : "Add invitation details."}
                    </DialogDescription>
                </DialogHeader>

                {step === "search" ? (
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input
                                placeholder="Search by username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-black/20 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {availableUsers.map((user: any) => (
                                <div key={user._id} onClick={() => handleSelectUser(user)} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback>{user.username[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium text-white">{user.username}</p>
                                        <p className="text-xs text-gray-400">{user.email}</p>
                                    </div>
                                    <UserPlus className="ml-auto w-4 h-4 text-purple-400" />
                                </div>
                            ))}
                            {availableUsers.length === 0 && searchTerm && (
                                <p className="text-center text-sm text-gray-500 py-4">No users found.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                            <Avatar className="w-10 h-10">
                                <AvatarImage src={selectedUser.avatar} />
                                <AvatarFallback>{selectedUser.username[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium text-white">{selectedUser.username}</p>
                                <p className="text-xs text-gray-400">Selected User</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setStep("search")} className="ml-auto text-xs text-purple-400 hover:text-purple-300">Change</Button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400">Role</label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1b2e] border-white/10 text-white">
                                    <SelectItem value={ORG_ROLE.STAFF}>Staff</SelectItem>
                                    <SelectItem value={ORG_ROLE.MANAGER}>Manager</SelectItem>
                                    <SelectItem value={ORG_ROLE.PLAYER}>Player</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400">Message (Optional)</label>
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Join us..."
                                className="bg-black/20 border-white/10 text-white min-h-[80px]"
                            />
                        </div>

                        <Button onClick={handleSendInvite} disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                            Send Invitation
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
