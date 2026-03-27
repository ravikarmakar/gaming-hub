import React from "react";
import CreateGroupDialog from "@/components/shared/dialogs/CreateGroupDialog";
import { useCreateGroup } from "@/hooks/useCreateGroup";
import { teamSchema, TeamForm } from "../../lib/teamSchema";

const CreateTeamDialog: React.FC = () => {
  const {
    form,
    onSubmit,
    isLoading,
    isOpen,
    setIsOpen,
    isSuccess
  } = useCreateGroup<TeamForm>({
    type: "team",
    schema: teamSchema,
    defaultValues: {
      teamName: "",
      tag: "",
      region: "INDIA",
      bio: "",
    },
  });

  return (
    <CreateGroupDialog
      title="Create Your Squad"
      description="Define your team identity and start competing"
      type="team"
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      form={form}
      onSubmit={onSubmit}
      isLoading={isLoading}
      isSuccess={isSuccess}
    />
  );
};

export default CreateTeamDialog;
