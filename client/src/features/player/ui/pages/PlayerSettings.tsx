import React from "react";
import { UserCog, Shield, Gamepad2, LogOut } from "lucide-react";
import { useLogoutMutation } from "@/features/auth";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ProfileSettingsForm } from "../components/ProfileSettingsForm";
import { GameInfoSettingsForm } from "../components/GameInfoSettingsForm";
import { AccountSettings } from "../components/AccountSettings";


const TABS = [
    {
        id: "profile",
        label: "Profile",
        icon: UserCog,
        component: ProfileSettingsForm
    },
    {
        id: "account",
        label: "Security",
        icon: Shield,
        component: AccountSettings
    },
    {
        id: "game",
        label: "Game Info",
        icon: Gamepad2,
        component: GameInfoSettingsForm
    }
];

const PlayerSettings: React.FC = () => {
    const { mutateAsync: logout } = useLogoutMutation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        toast.success("Disconnected from neural link");
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-[#06040a] text-zinc-100 pb-20 pt-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1440px] mx-auto space-y-12">
                <div className="relative">
                    <div className="flex md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm shadow-lg shadow-purple-500/5">
                                    <LogOut className="w-5 h-5 text-purple-500" />
                                </div>
                                <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-white leading-none">
                                    Account <span className="text-purple-500">Settings</span>
                                </h1>
                            </div>
                            <p className="text-xs sm:text-sm text-zinc-400 font-medium max-w-xl leading-relaxed">
                                Manage your profile information, security settings, and personal preferences.
                            </p>
                        </div>

                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            aria-label="Logout"
                            className="group h-12 px-4 sm:px-6 border-red-500/10 hover:border-red-500/30 bg-red-500/[0.02] hover:bg-red-500/10 text-red-500/70 hover:text-red-500 transition-all rounded-xl"
                        >
                            <div className="flex items-center gap-3">
                                <span className="hidden sm:inline text-[10px] font-black tracking-[2px] uppercase">Logout</span>
                                <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="profile" className="space-y-10">
                    <div className="flex items-center justify-between border-b border-white/5">
                        <TabsList className="bg-transparent h-auto p-0 flex space-x-4 sm:space-x-10">
                            {TABS.map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="px-0 py-4 bg-transparent border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent rounded-none text-zinc-400 data-[state=active]:text-white font-black uppercase text-[11px] tracking-[2px] transition-all"
                                >
                                    <div className="flex items-center space-x-2">
                                        <tab.icon className="w-3.5 h-3.5" />
                                        <span>{tab.label}</span>
                                    </div>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {TABS.map((tab) => (
                        <TabsContent key={tab.id} value={tab.id} className="mt-0 outline-none">
                            <tab.component />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
};

export default PlayerSettings;
