import React from "react";
import { UserCog, Shield, Settings, ChevronRight } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ProfileSettingsForm } from "../components/ProfileSettingsForm";
import { AccountSettings } from "../components/AccountSettings";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const PlayerSettings: React.FC = () => {
    const { user } = useAuthStore();

    return (
        <div className="min-h-screen bg-[#06040a] text-zinc-100 pb-20 pt-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Minimal Breadcrumbs */}
                <nav className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[2px] text-zinc-500 mb-8">
                    <span className="hover:text-zinc-300 cursor-pointer transition-colors">Dashboards</span>
                    <ChevronRight className="w-3 h-3 text-zinc-700" />
                    <span className="hover:text-zinc-300 cursor-pointer transition-colors">Player</span>
                    <ChevronRight className="w-3 h-3 text-zinc-700" />
                    <span className="text-purple-500">Settings</span>
                </nav>

                {/* Refined Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/10 backdrop-blur-sm">
                            <Settings className="w-5 h-5 text-purple-500" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            Account Settings
                        </h1>
                    </div>
                    <p className="text-sm text-zinc-500 font-medium max-w-lg">
                        Configure your identity, security preferences, and account metadata within the Nexus grid.
                    </p>
                </div>

                <Tabs defaultValue="profile" className="space-y-10">
                    <div className="flex items-center justify-between border-b border-white/5">
                        <TabsList className="bg-transparent h-auto p-0 flex space-x-10">
                            <TabsTrigger
                                value="profile"
                                className="px-0 py-4 bg-transparent border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent rounded-none text-zinc-500 data-[state=active]:text-white font-black uppercase text-[11px] tracking-[2px] transition-all"
                            >
                                <div className="flex items-center space-x-2">
                                    <UserCog className="w-3.5 h-3.5" />
                                    <span>Profile</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="account"
                                className="px-0 py-4 bg-transparent border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent rounded-none text-zinc-500 data-[state=active]:text-white font-black uppercase text-[11px] tracking-[2px] transition-all"
                            >
                                <div className="flex items-center space-x-2">
                                    <Shield className="w-3.5 h-3.5" />
                                    <span>Security</span>
                                </div>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Elegant Sidebar */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="relative group overflow-hidden p-8 rounded-[32px] bg-[#0d0b14] border border-white/5 shadow-2xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-[80px] -mr-16 -mt-16 group-hover:bg-purple-600/10 transition-colors" />

                                <div className="relative flex flex-col items-center text-center">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                        <img
                                            src={user?.avatar}
                                            alt={user?.username}
                                            className="relative w-24 h-24 rounded-full border-4 border-[#06040a] object-cover ring-1 ring-white/10"
                                        />
                                        <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-[#0d0b14] rounded-full" />
                                    </div>

                                    <h2 className="text-xl font-black text-white mb-1 uppercase tracking-tight italic">
                                        {user?.username}
                                    </h2>
                                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5">
                                        <p className="text-[9px] text-zinc-400 uppercase tracking-[2px] font-black">
                                            {user?.esportsRole || "Player"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5">
                                <p className="text-[10px] font-black text-purple-500 uppercase tracking-[3px] mb-4">Support & Help</p>
                                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                                    Encountering anomalies in your grid profile? Reach out to the Nexus architects for immediate synchronization assistance.
                                </p>
                                <button className="mt-6 w-full py-3 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[2px] text-zinc-300 hover:bg-white/10 transition-all active:scale-[0.98]">
                                    Open Support Ticket
                                </button>
                            </div>
                        </div>

                        {/* Minimal Content Area */}
                        <div className="lg:col-span-8">
                            <TabsContent value="profile" className="mt-0 outline-none">
                                <div className="space-y-6">
                                    <div className="px-2">
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight italic">Identity Matrix</h2>
                                        <p className="text-xs text-zinc-500 font-medium">Configure how you appear to others in the ecosystem.</p>
                                    </div>
                                    <ProfileSettingsForm />
                                </div>
                            </TabsContent>

                            <TabsContent value="account" className="mt-0 outline-none">
                                <div className="space-y-6">
                                    <div className="px-2">
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight italic">Security Protocol</h2>
                                        <p className="text-xs text-zinc-500 font-medium">Manage access credentials and core account status.</p>
                                    </div>
                                    <AccountSettings />
                                </div>
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>
            </div>
        </div>
    );
};

export default PlayerSettings;
