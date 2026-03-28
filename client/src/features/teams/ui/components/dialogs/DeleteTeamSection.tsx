import { Trash2 } from "lucide-react";
import { useTeamDialogs } from "@/features/teams/context/TeamDialogContext";
import { DangerZone } from "@/components/shared/common/DangerZone";

interface DeleteTeamSectionProps {
  teamId: string;
}

export const DeleteTeamSection = ({ teamId }: DeleteTeamSectionProps) => {
  const { openDialog } = useTeamDialogs();

  const handleTriggerDisband = () => {
    openDialog('disbandTeam', { teamId });
  };

  return (
    <DangerZone
      title="Danger Zone"
      description="Disbanding the team will delete all data associated with it. This action cannot be undone."
      icon={Trash2}

      actionTitle="Disband this team"
      actionDescription="Once you disband a team, there is no going back. Please be certain."
      buttonText="Disband Team"
      dialogTitle="Disband Team?"
      dialogDescription="Are you sure you want to disband this team?"
      dialogConfirmLabel="Disband"
      onConfirm={handleTriggerDisband}
    />
  );
};
