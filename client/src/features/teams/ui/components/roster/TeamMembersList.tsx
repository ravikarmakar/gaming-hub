import React, { useContext } from 'react';
import toast from 'react-hot-toast';
import { Settings, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PLAYER_ROUTES } from '@/features/player/lib/routes';

import { Card } from '@/components/ui/card';
import { TeamAvatar } from '@/features/teams/ui/components/atoms/TeamAvatar';
import { StatusIndicator } from '@/features/teams/ui/components/atoms/StatusIndicator';

import { TeamMember } from '@/features/teams/lib/types';
import { MemberList } from '@/components/shared/list/MemberList';
import { TeamDashboardContext } from '@/features/teams/context/TeamDashboardContext';
import { useTeamDialogs } from '@/features/teams/context/TeamDialogContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TeamMembersListProps {
	members?: TeamMember[];
}

export const TeamMembersList: React.FC<TeamMembersListProps> = React.memo(({ members: propMembers }) => {
	const navigate = useNavigate();
	const dashboardContext = useContext(TeamDashboardContext);
	const { openDialog } = useTeamDialogs();
	const currentTeam = dashboardContext?.team;
	const permissions = dashboardContext?.permissions;

	// Use prop members if provided (for profile pages), otherwise use context team members (for dashboard)
	const members = (propMembers || currentTeam?.teamMembers || []) as TeamMember[];
	const canManageRoster = permissions?.canManageRoster;
	return (
		<div className="space-y-6">
			<div className="bg-purple-500/5 border border-purple-500/10 rounded-xl px-4 py-3 flex items-start gap-3">
				<div className="p-1.5 bg-purple-500/10 rounded-lg shrink-0">
					<Settings className="w-4 h-4 text-purple-400" />
				</div>
				<p className="text-[10px] sm:text-[11px] text-gray-400 leading-relaxed font-medium">
					<span className="text-purple-400 font-bold uppercase tracking-wider mr-2">Tournament Policy:</span>
					Core roles <span className="text-white font-bold">(IGL, Rusher, Sniper, Support)</span> are auto-registered.
					Up to <span className="text-white font-bold">2 additional active members</span> join as substitutes.
				</p>
			</div>

			<MemberList
				items={members}
				keyExtractor={(member: TeamMember) => {
					const userId = typeof member.user === 'string' ? member.user : member.user?._id;
					return (userId || member.username || Math.random().toString(36).substr(2, 9)).toString();
				}}
				renderItem={(member: TeamMember) => (
					<Card
						className="bg-[#0F111A]/60 border-white/10 transition-all duration-500 backdrop-blur-xl shadow-2xl shadow-purple-500/5 group"
					>
						<div className="p-4 flex items-center gap-4">
							<TeamAvatar
								src={member.avatar}
								alt={member.username}
								role={member.roleInTeam}
							/>

							<div className="flex-1 min-w-0">
								<h3 className="text-white font-bold truncate group-hover:text-purple-400 transition-colors">
									{member.username}
								</h3>
								<div className="flex items-center gap-2 mt-0.5">
									<span className="text-xs text-gray-400 uppercase font-bold tracking-tighter">
										{member.roleInTeam}
									</span>
									<StatusIndicator isActive={member.isActive} />
								</div>
							</div>

							<div className="text-xs text-gray-500 italic">
								{member.joinedAt && !isNaN(new Date(member.joinedAt).getTime())
									? new Date(member.joinedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
									: 'N/A'}
							</div>

							{canManageRoster && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												onClick={(e) => {
													e.stopPropagation();
													const memberId = typeof member.user === 'string' ? member.user : member.user?._id;
													if (currentTeam?._id && memberId) {
														openDialog('updateMemberRole', {
															teamId: currentTeam._id,
															memberId,
															username: member.username,
															roleInTeam: member.roleInTeam
														});
													} else {
														toast.error("Missing team or member information");
													}
												}}
												className="h-8 w-8 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors ml-2"
											>
												<Settings className="w-4 h-4" />
											</Button>
										</TooltipTrigger>
										<TooltipContent side="top" className="bg-[#0B0E14] border-white/10 text-white text-[10px] font-bold uppercase tracking-wider">
											Edit Role
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							)}

							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => {
												const userId = typeof member.user === 'string' ? member.user : member.user?._id;
												if (userId) {
													navigate(PLAYER_ROUTES.PLAYER_DETAILS.replace(":id", userId.toString()));
												} else {
													toast.error("User profile ID not found");
												}
											}}
											className="h-8 w-8 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
										>
											<ExternalLink className="w-4 h-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent side="top" className="bg-[#0B0E14] border-white/10 text-white text-[10px] font-bold uppercase tracking-wider">
										View Profile
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
					</Card>
				)}
			/>
		</div>
	);
});

