import React from "react";
import { UserCog, Shield, Gamepad2, LogOut } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ProfileSettingsForm } from "../components/ProfileSettingsForm";
import { GameInfoSettingsForm } from "../components/GameInfoSettingsForm";
import { AccountSettings } from "../components/AccountSettings";


const PlayerSettings: React.FC = () => {
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        toast.success("Disconnected from neural link");
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-[#06040a] text-zinc-100 pb-20 pt-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="relative">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm shadow-lg shadow-purple-500/5">
                                    <LogOut className="w-5 h-5 text-purple-500" />
                                </div>
                                <h1 className="text-4xl font-black tracking-tighter text-white leading-none">
                                    Account <span className="text-purple-500">Settings</span>
                                </h1>
                            </div>
                            <p className="text-sm text-zinc-500 font-medium max-w-xl leading-relaxed">
                                Manage your profile information, security settings, and personal preferences.
                            </p>
                        </div>

                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="group h-12 px-6 border-red-500/10 hover:border-red-500/30 bg-red-500/[0.02] hover:bg-red-500/10 text-red-500/70 hover:text-red-500 transition-all rounded-xl"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black tracking-[2px] uppercase">Logout</span>
                                <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Button>
                    </div>
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
                            <TabsTrigger
                                value="game"
                                className="px-0 py-4 bg-transparent border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent rounded-none text-zinc-500 data-[state=active]:text-white font-black uppercase text-[11px] tracking-[2px] transition-all"
                            >
                                <div className="flex items-center space-x-2">
                                    <Gamepad2 className="w-3.5 h-3.5" />
                                    <span>Game Info</span>
                                </div>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="profile" className="mt-0 outline-none">
                        <ProfileSettingsForm />
                    </TabsContent>

                    <TabsContent value="account" className="mt-0 outline-none">
                        <AccountSettings />
                    </TabsContent>

                    <TabsContent value="game" className="mt-0 outline-none">
                        <GameInfoSettingsForm />
                    </TabsContent>
                </Tabs>
            </div >
        </div >
    );
};

export default PlayerSettings;
