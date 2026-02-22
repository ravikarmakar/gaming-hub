import { useState } from "react";
import { useManagement } from "../../hooks/useManagement";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, Ban } from "lucide-react";

const ManagementTables = () => {
    const [activeTab, setActiveTab] = useState<"User" | "Team" | "Organizer">("User");
    const { data, loading, setSearch, updateStatus } = useManagement(activeTab);

    return (
        <Card className="bg-[#0a0a0f] border-white/5">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
                <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
                    {["User", "Team", "Organizer"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === tab
                                ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                                : "text-gray-400 hover:text-white"
                                }`}
                        >
                            {tab}s
                        </button>
                    ))}
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                        placeholder={`Search ${activeTab}s...`}
                        className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500/50"
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-8"><div className="h-4 w-32 bg-white/5 rounded" /></td>
                                        <td className="px-6 py-8"><div className="h-4 w-16 bg-white/5 rounded" /></td>
                                        <td className="px-6 py-8"><div className="h-8 w-24 bg-white/5 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">No results found.</td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item._id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                                                    {item.avatar || item.imageUrl ? (
                                                        <img src={item.avatar || item.imageUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-gray-500 text-xs font-bold">{(item.username || item.teamName || item.name).substring(0, 2).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                                                        {item.username || item.teamName || item.name}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 font-mono">ID: {item._id.substring(0, 8)}...</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Badge className={item.isVerified || item.isAccountVerified
                                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                    : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                                                }>
                                                    {item.isVerified || item.isAccountVerified ? "Verified" : "Unverified"}
                                                </Badge>
                                                <Badge className={item.isBlocked
                                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                }>
                                                    {item.isBlocked ? "Blocked" : "Active"}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 border-white/10 bg-transparent hover:bg-green-500/10 hover:text-green-400"
                                                    onClick={() => updateStatus(item._id, {
                                                        [activeTab === "User" ? "isAccountVerified" : "isVerified"]: !(item.isVerified || item.isAccountVerified)
                                                    })}
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                                    {item.isVerified || item.isAccountVerified ? "Revoke" : "Verify"}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 border-white/10 bg-transparent hover:bg-red-500/10 hover:text-red-400"
                                                    onClick={() => updateStatus(item._id, { isBlocked: !item.isBlocked })}
                                                >
                                                    <Ban className="w-3.5 h-3.5 mr-1" />
                                                    {item.isBlocked ? "Unblock" : "Block"}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export default ManagementTables;
