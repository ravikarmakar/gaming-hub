import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTeamDialogs } from '@/features/teams/context/TeamDialogContext';
import { useUpdateMemberRoleMutation } from '@/features/teams/hooks/useTeamMutations';
import { roles } from '@/features/teams/lib/constants';

const roleUpdateSchema = z.object({
  role: z.string().min(1, "Role is required"),
});

type RoleUpdateFormValues = z.infer<typeof roleUpdateSchema>;

export const UpdateMemberRoleDialog = () => {
  const { isOpen, closeDialog, dialogData } = useTeamDialogs();
  const updateRoleMutation = useUpdateMemberRoleMutation();

  const form = useForm<RoleUpdateFormValues>({
    resolver: zodResolver(roleUpdateSchema),
    defaultValues: {
      role: dialogData?.roleInTeam || "",
    },
  });

  // Force update default values when dialog opens with new data
  React.useEffect(() => {
    if (dialogData) {
      form.reset({ role: dialogData.roleInTeam || "" });
    }
  }, [dialogData, form]);

  const onSubmit = async (values: RoleUpdateFormValues) => {
    if (!dialogData?.teamId || !dialogData?.memberId) {
      toast.error("Missing required member or team information");
      return;
    }

    updateRoleMutation.mutate(
      {
        teamId: dialogData.teamId,
        memberId: dialogData.memberId,
        role: values.role,
      },
      {
        onSuccess: () => {
          toast.success("Member role updated successfully");
          form.reset();
          closeDialog();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to update role");
        },
      }
    );
  };

  const handleClose = () => {
    form.reset();
    closeDialog();
  };

  return (
    <Dialog open={isOpen('updateMemberRole')} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px] bg-[#0B0E14] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Update Member Role</DialogTitle>
          <DialogDescription className="text-gray-400">
            Change the team role for <span className="text-purple-400 font-semibold">{dialogData?.username}</span>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">New Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-black/40 border-white/10 text-white">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#0B0E14] border-white/10 text-white">
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white"
                disabled={updateRoleMutation.isPending}
              >
                {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
