import { Edit2, AlertTriangle, Trash2, Info, ArrowRight, Map } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
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

    const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            action();
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-1 duration-400">
            {/* Tournament Status Section */}
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg shrink-0">
                        <Info className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white mb-1">Tournament Status</h3>
                        <p className="text-[11px] text-gray-500 leading-relaxed max-w-2xl">
                            Registration is <span className={`font-bold ${canEdit ? 'text-emerald-400' : 'text-rose-400'}`}>{registrationStatus ? registrationStatus.replace('-', ' ') : 'unknown'}</span>.
                            {canEdit ?
                                " You can modify details, rules, and rewards. Once registration closes, settings will be locked." :
                                " Settings are locked as registration has closed to maintain competition integrity."
                            }
                            {" "}
                            <Link
                                to="/terms"
                                className="text-purple-400 hover:text-purple-300 font-bold underline underline-offset-2 ml-1 transition-colors"
                            >
                                Read platform policies
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* General Settings Section */}
            <section className="space-y-3">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Management</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Edit Card */}
                    <div
                        role="button"
                        tabIndex={canEdit ? 0 : -1}
                        onClick={canEdit ? onEdit : undefined}
                        onKeyDown={canEdit ? (e) => handleKeyDown(e, onEdit) : undefined}
                        aria-disabled={!canEdit}
                        className={`group relative overflow-hidden bg-white/[0.02] border border-white/5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40 ${canEdit ? 'hover:border-purple-500/40 hover:bg-white/[0.04] cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                    >
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="relative">
                                <div className={`p-2.5 rounded-lg transition-colors ${canEdit ? 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white' : 'bg-gray-800 text-gray-500'}`}>
                                    <Edit2 className="w-4 h-4" />
                                </div>
                                {!canEdit && (
                                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-[#09090b] rounded-full" title="Locked" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2 truncate">
                                        Edit Details
                                        {canEdit && <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all font-bold" />}
                                    </h4>
                                    {!canEdit && (
                                        <Badge variant="outline" className="h-4 border-rose-500/30 text-rose-500 bg-rose-500/5 text-[8px] font-bold uppercase px-1.5 shrink-0">
                                            Locked
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-[11px] text-gray-500 truncate">Change title, rules, and rewards</p>
                            </div>
                        </CardContent>
                    </div>

                    {/* Roadmap Card */}
                    {eventType && eventType !== "scrims" && (
                        <div
                            role="button"
                            tabIndex={canEdit && eventId ? 0 : -1}
                            onClick={canEdit && eventId ? () => navigate(`${ORGANIZER_ROUTES.EDIT_TOURNAMENT.replace(":eventId", eventId)}?tab=roadmap`) : undefined}
                            onKeyDown={canEdit && eventId ? (e) => handleKeyDown(e, () => navigate(`${ORGANIZER_ROUTES.EDIT_TOURNAMENT.replace(":eventId", eventId)}?tab=roadmap`)) : undefined}
                            aria-disabled={!canEdit || !eventId}
                            className={`group relative overflow-hidden bg-white/[0.02] border border-white/5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${canEdit && eventId ? 'hover:border-amber-500/40 hover:bg-white/[0.04] cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                        >
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="relative">
                                    <div className={`p-2.5 rounded-lg transition-colors ${canEdit && eventId ? 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-white' : 'bg-gray-800 text-gray-500'}`}>
                                        <Map className="w-4 h-4" />
                                    </div>
                                    {(!canEdit || !eventId) && (
                                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-[#09090b] rounded-full" title="Locked" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                        <h4 className="text-sm font-bold text-white flex items-center gap-2 truncate">
                                            Roadmap
                                            {canEdit && eventId && <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all font-bold" />}
                                        </h4>
                                        {(!canEdit || !eventId) && (
                                            <Badge variant="outline" className="h-4 border-rose-500/30 text-rose-500 bg-rose-500/5 text-[8px] font-bold uppercase px-1.5 shrink-0">
                                                Locked
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-gray-500 truncate">Configure rounds and leagues</p>
                                </div>
                            </CardContent>
                        </div>
                    )}
                </div>
            </section>

            {/* Danger Zone */}
            <section className="space-y-4 pt-4">
                <h3 className="text-xs font-bold text-rose-500/80 uppercase tracking-widest px-1">Danger Zone</h3>

                <div className="border border-rose-500/10 bg-rose-500/[0.02] overflow-hidden rounded-xl">
                    <CardContent className="p-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-1">
                                <h4 className="text-base font-bold text-white flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                                    Delete Tournament
                                </h4>
                                <p className="text-xs text-gray-500 max-w-md">
                                    Permanently remove this tournament and all its data.
                                    <span className="text-rose-400/80 ml-1 font-medium">This action cannot be undone.</span>
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 font-bold uppercase tracking-widest text-[10px] h-9 px-6 transition-all duration-200"
                                onClick={onDelete}
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                Delete Tournament
                            </Button>
                        </div>
                    </CardContent>
                </div>
            </section>
        </div>
    );
}
