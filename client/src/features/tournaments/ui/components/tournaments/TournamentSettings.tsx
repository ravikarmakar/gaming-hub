import { Edit2, AlertTriangle, Trash2, Info, ArrowRight, ShieldAlert, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";

interface TournamentSettingsProps {
    eventId?: string;
    eventType?: string;
    registrationStatus?: string;
    onEdit: () => void;
    onDelete: () => void;
}

export function TournamentSettings({ eventId, eventType, registrationStatus, onEdit, onDelete }: TournamentSettingsProps) {
    const navigate = useNavigate();
    const canEdit = registrationStatus === "registration-open";

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header / Info Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-brand-black to-brand-black border border-indigo-500/20 p-6">
                <div className="relative z-10 flex items-start gap-4">
                    <div className="p-3 bg-indigo-500/20 rounded-xl">
                        <Info className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">Status & Guidelines</h3>
                        <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
                            Registration is currently <span className={`font-bold ${canEdit ? 'text-emerald-400' : 'text-rose-400'}`}>{registrationStatus ? registrationStatus.replace('-', ' ') : 'unknown'}</span>.
                            {canEdit ?
                                " You can still modify tournament details, rules, and rewards. Once registration closes, most settings will be locked." :
                                " This tournament is now locked as registration has closed. Changes are restricted to maintain competition integrity."
                            }
                        </p>
                    </div>
                </div>
                {/* Decorative Background Element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] -mr-16 -mt-16 rounded-full" />
            </div>

            {/* General Actions Section */}
            <section className="space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-purple-500 rounded-full" />
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Management</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Edit Card */}
                    <Card
                        onClick={canEdit ? onEdit : undefined}
                        className={`group relative overflow-hidden border-white/5 bg-gray-900/40 backdrop-blur-sm transition-all duration-300 ${canEdit ? 'hover:border-purple-500/40 hover:bg-purple-500/5 cursor-pointer' : 'opacity-60 grayscale'}`}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl transition-colors ${canEdit ? 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white' : 'bg-gray-800 text-gray-500'}`}>
                                    <Edit2 className="w-6 h-6" />
                                </div>
                                {!canEdit && (
                                    <Badge variant="outline" className="border-rose-500/30 text-rose-500 bg-rose-500/5 text-[9px] font-black uppercase">
                                        Locked
                                    </Badge>
                                )}
                            </div>
                            <h4 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                                Edit Tournament Details
                                {canEdit && <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />}
                            </h4>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Update the tournament title, game details, banner image, and match rules.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Platform Terms Card */}
                    <Card
                        onClick={() => navigate('/terms')}
                        className="group relative overflow-hidden border-white/5 bg-gray-900/40 backdrop-blur-sm hover:border-blue-500/40 hover:bg-blue-500/5 cursor-pointer transition-all duration-300"
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                            </div>
                            <h4 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                                Organizer Policies
                                <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                            </h4>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Review the organizer terms of service and platform fair play guidelines.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Roadmap Card */}
                    {eventType && eventType !== "scrims" && (
                        <Card
                            onClick={canEdit ? () => navigate(`${ORGANIZER_ROUTES.EDIT_TOURNAMENT.replace(":eventId", eventId || "")}?tab=roadmap`) : undefined}
                            className={`group relative overflow-hidden border-white/5 bg-gray-900/40 backdrop-blur-sm transition-all duration-300 ${canEdit ? 'hover:border-amber-500/40 hover:bg-amber-500/5 cursor-pointer' : 'opacity-60 grayscale'}`}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl transition-colors ${canEdit ? 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-white' : 'bg-gray-800 text-gray-500'}`}>
                                        <Map className="w-6 h-6" />
                                    </div>
                                    {!canEdit && (
                                        <Badge variant="outline" className="border-rose-500/30 text-rose-500 bg-rose-500/5 text-[9px] font-black uppercase">
                                            Locked
                                        </Badge>
                                    )}
                                </div>
                                <h4 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                                    Configure Roadmap
                                    {canEdit && <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />}
                                </h4>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Set up tournament rounds, leagues, and the grand finale stage.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </section>

            {/* Danger Zone */}
            <section className="space-y-5 pt-4">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-rose-500 rounded-full" />
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Danger Zone</h3>
                </div>

                <Card className="border-rose-500/10 bg-rose-500/[0.02] overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-1">
                                <h4 className="text-lg font-black text-white flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                                    Delete Tournament
                                </h4>
                                <p className="text-sm text-gray-500 max-w-md">
                                    This will permanently remove the tournament, its roadmap, registered teams, and all associated stats.
                                    <span className="font-bold text-rose-400 ml-1">This action cannot be undone.</span>
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                size="lg"
                                className="bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-xs h-12 px-8 shadow-[0_0_20px_rgba(225,29,72,0.2)]"
                                onClick={onDelete}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Terminate Event
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
