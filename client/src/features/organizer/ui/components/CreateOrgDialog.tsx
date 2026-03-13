import React from "react";
import CreateGroupDialog from "@/components/shared/CreateGroupDialog";
import { useCreateGroup } from "@/hooks/useCreateGroup";
import { orgSchema, OrgFormSchema } from "../../lib/orgSchemas";

const CreateOrgDialog: React.FC = () => {
    const {
        form,
        onSubmit,
        isLoading,
        isOpen,
        setIsOpen,
        isSuccess
    } = useCreateGroup<OrgFormSchema>({
        type: "org",
        schema: orgSchema,
        defaultValues: {
            name: "",
            tag: "",
            region: "",
            description: "",
            image: undefined as any,
        },
    });

    return (
        <CreateGroupDialog
            title="Create Your Organization"
            description="Establish your organization and lead the grid"
            type="org"
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            form={form}
            onSubmit={onSubmit}
            isLoading={isLoading}
            isSuccess={isSuccess}
        />
    );
};

export default CreateOrgDialog;
