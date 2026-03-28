import React from 'react';
import { User, Clock, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TeamPageHeader } from "@/features/teams/ui/components/common/TeamPageHeader";
import { useCurrentUser } from '@/features/auth';
import { TeamLoading } from '@/features/teams/ui/components/common/TeamLoading';
import { JoinRequestItem } from './JoinRequestItem';
import { useTeamDialogs } from '@/features/teams/context/TeamDialogContext';
import { useTeamJoinRequestsQuery } from '@/features/teams/hooks/useTeamQueries';
import { useRosterActions } from '@/features/teams/hooks/useRosterActions';

export const JoinRequestsList: React.FC = () => {
  const { user } = useCurrentUser();
  const teamId = typeof user?.teamId === 'string' ? user.teamId : user?.teamId?._id;

  const { data: joinRequests = [], isLoading } = useTeamJoinRequestsQuery(teamId || "", {
    enabled: !!teamId
  });

  const { handleJoinRequest, loading } = useRosterActions(teamId || "");
  const { openDialog } = useTeamDialogs();

  if (isLoading && (!joinRequests || joinRequests.length === 0)) {
    return <TeamLoading message="Loading applications..." />;
  }

  const hasRequests = joinRequests && joinRequests.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <TeamPageHeader
        icon={User}
        title="Join Requests"
        subtitle={hasRequests
          ? `Review and manage pending applications (${joinRequests.length})`
          : "No pending applications at the moment"}
        className="mb-0"
        noMargin={true}
        noPadding={true}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => teamId && openDialog('clearJoinRequests', { teamId, length: joinRequests.length })}
            disabled={isLoading || !hasRequests}
            className="border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all gap-2 disabled:opacity-30 disabled:grayscale disabled:hover:bg-red-500/5"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear All</span>
          </Button>
        }
      />

      {!hasRequests ? (
        <div className="py-12 text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-white mb-1">No Pending Requests</h3>
          <p className="text-gray-500 text-sm">When players apply to join your team, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {joinRequests.map((request) => (
            <JoinRequestItem
              key={request._id}
              request={request}
              onHandle={(id, action) => {
                if (!teamId) return;
                action === 'rejected'
                  ? openDialog('rejectJoinRequest', { ...request, teamId, requestId: id })
                  : handleJoinRequest(id, action);
              }}
              isPending={loading.handleRequest?.requestId === request._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};
