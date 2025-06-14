import { z } from "zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import FileUpload from "@/components/FileUplaod";

import { useTeamStore } from "@/features/teams/store/useTeamStore";

// Zod schema remains the same
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const teamSchema = z.object({
  teamName: z
    .string()
    .min(2, { message: "Team name is required" })
    .max(30, { message: "Team name must not exceed 50 characters." }),
  bio: z
    .string()
    .max(500, { message: "Bio must not exceed 500 characters." })
    .optional(),
  image: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
});

type TeamForm = z.infer<typeof teamSchema>;

interface CreateTeamModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  setIsOpen,
}) => {
  const { createTeam, isLoading, error } = useTeamStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TeamForm>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      teamName: "",
      bio: "",
      image: undefined,
    },
  });

  const { handleSubmit, control, reset } = form;

  const onSubmit = async (data: TeamForm) => {
    const formData = new FormData();
    formData.append("teamName", data.teamName);
    if (data.bio) {
      formData.append("bio", data.bio);
    }
    formData.append("image", data.image);

    const result = await createTeam(formData);
    if (result) {
      toast.success("Team created successfully!");
      resetFormAndCloseModal();
    }
  };

  const resetFormAndCloseModal = () => {
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetFormAndCloseModal();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border border-gray-800 rounded-xl text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Create Your Team
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter the details for your new team.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={control}
              name="teamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Team Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Example Esports"
                      {...field}
                      className="text-white bg-gray-800 border-gray-500 focus:border-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Team Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little about your team..."
                      {...field}
                      className="resize-y min-h-[80px] border-gray-500 focus:border-gray-400 bg-gray-800 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="image"
              render={({
                field: { onChange, value, ...fieldProps },
                fieldState,
              }) => (
                <FormItem>
                  <FileUpload
                    label="Team Logo"
                    name={fieldProps.name}
                    id={fieldProps.name}
                    accept="image/*"
                    maxSize={MAX_FILE_SIZE}
                    onChange={onChange}
                    value={value}
                    error={fieldState.error?.message}
                    hint="Max 5MB, JPG, PNG, WebP"
                    required
                    disabled={isLoading}
                  />
                  {fieldState.error && <FormMessage />}
                </FormItem>
              )}
            />

            {error && (
              <p className="p-2 text-sm text-center text-red-400 rounded-md bg-red-500/10">
                {error}
              </p>
            )}

            <DialogFooter>
              <Button
                type="submit"
                className="w-full py-2 font-bold text-white bg-purple-800 rounded-md hover:bg-purple-750"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Team"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeamModal;
