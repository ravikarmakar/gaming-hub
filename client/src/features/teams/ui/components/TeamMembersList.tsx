import React from 'react';
import { User, Shield, Gamepad2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TeamMembersTypes } from '../../lib/types';

interface TeamMembersListProps {
    members: TeamMembersTypes[];
}

export const TeamMembersList: React.FC<TeamMembersListProps> = React.memo(({ members }) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-purple-400" />
                    Active Roster
                </h2>
                <Badge variant="outline" className="border-white/10 text-gray-400">
                    {members.length} Players
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                    <Card key={member.user} className="bg-[#0F111A]/60 border-white/10 hover:border-purple-500/50 hover:bg-[#121421]/80 transition-all duration-500 backdrop-blur-xl shadow-2xl shadow-purple-500/5 group border-white/10 transition-colors">
                        <div className="p-4 flex items-center gap-4">
                            <div className="relative">
                                <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-white/5 overflow-hidden shadow-lg group-hover:shadow-purple-500/20 transition-all duration-300">
                                    {member.avatar ? (
                                        <img src={member.avatar} alt={member.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-gray-500" />
                                        </div>
                                    )}
                                </div>
                                {member.roleInTeam === 'igl' && (
                                    <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1 border-2 border-[#0B0C1A]">
                                        <Shield className="w-2.5 h-2.5 text-white" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-bold truncate group-hover:text-purple-400 transition-colors">
                                    {member.username}
                                </h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-gray-400 uppercase font-bold tracking-tighter">
                                        {member.roleInTeam}
                                    </span>
                                    {member.isActive && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    )}
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 italic">
                                {new Date(member.joinedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
});
