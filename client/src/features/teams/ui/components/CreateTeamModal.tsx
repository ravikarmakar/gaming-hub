import { z } from "zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import FileUpload from "@/components/FileUpload";
import { useTeamStore } from "@/features/teams/store/useTeamStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { MAX_FILE_SIZE, teamSchema } from "@/schemas/team-validation/teamSchema";


type TeamForm = z.infer<typeof teamSchema>;

const CreateTeamModal = () => {
  const { createTeam, isLoading, error, clearError, isCreateTeamOpen, setIsCreateTeamOpen } = useTeamStore();

  const form = useForm<TeamForm>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      teamName: "",
      tag: "",
      region: "INDIA",
      bio: "",
    },
  });

  const { handleSubmit, control, reset } = form;

  const onSubmit = async (data: TeamForm) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(key, value as string | Blob);
    });

    const result = await createTeam(formData);

    if (result) {
      // Refresh the user profile to update teamId and roles in the auth store
      await useAuthStore.getState().checkAuth();
      toast.success("Team created successfully!");
      setIsCreateTeamOpen(false);
      reset();
    }
  };

  useEffect(() => {
    if (!isCreateTeamOpen) {
      clearError();
    }
  }, [isCreateTeamOpen, clearError]);

  return (
    <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
      <DialogContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-[480px] p-0 overflow-hidden bg-[#0a0514] border-purple-500/20 shadow-[0_0_50px_rgba(139,92,246,0.15)] rounded-2xl"
      >
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.05),transparent_40%)] pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key="create-form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <DialogHeader className="p-6 pb-2">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white tracking-tight">Create Team</DialogTitle>
                  <DialogDescription className="text-purple-300/60 text-xs mt-0.5">Define your team identity and start competing.</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 pt-2">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <FormField
                        control={control}
                        name="teamName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-purple-100/80 text-xs">Team Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nexus Gaming"
                                {...field}
                                className="bg-white/5 border-purple-500/10 focus:border-purple-500/50 text-white rounded-xl h-9 text-xs transition-all"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400 text-[10px]" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1">
                      <FormField
                        control={control}
                        name="tag"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-purple-100/80 text-xs">Tag</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="NXG"
                                {...field}
                                maxLength={5}
                                className="bg-white/5 border-purple-500/10 focus:border-purple-500/50 text-white rounded-xl h-9 text-xs uppercase font-mono transition-all"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400 text-[10px]" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-end">
                    <FormField
                      control={control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-100/80 text-xs">Region</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/5 border-purple-500/10 focus:border-purple-500/50 text-white rounded-xl h-9 text-xs transition-all">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#0a0514] border-purple-500/20 text-purple-100">
                              {["INDIA", "NA", "EU", "ASIA", "SEA", "SA", "OCE", "MENA"].map((reg) => (
                                <SelectItem key={reg} value={reg} className="focus:bg-purple-500/10 cursor-pointer text-xs">
                                  {reg}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400 text-[10px]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="image"
                      render={({ field: { onChange, value } }) => (
                        <FormItem className="space-y-1">
                          <FormControl>
                            <FileUpload
                              onChange={onChange}
                              value={value}
                              maxSize={MAX_FILE_SIZE}
                              compact={true}
                              className="border-purple-500/10 hover:border-purple-500/30 transition-all rounded-xl"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400 text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-purple-100/80 text-xs">Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What inspires your team?"
                            {...field}
                            className="bg-white/5 border-purple-500/10 focus:border-purple-500/50 text-white rounded-xl min-h-[60px] max-h-[100px] text-xs resize-none transition-all"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400 text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3 pt-2">
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20"
                        >
                          <Info className="w-3 h-3 text-red-400 mt-0.5" />
                          <p className="text-[10px] text-red-400 leading-tight font-medium">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => setIsCreateTeamOpen(false)}
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-purple-300 hover:text-white hover:bg-purple-500/10 rounded-xl text-xs h-9"
                      >
                        Discard
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        size="sm"
                        className="flex-[2] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold h-9 rounded-xl shadow-[0_4px_15px_rgba(147,51,234,0.3)] transition-all active:scale-[0.98] text-xs"
                      >
                        {isLoading ? "creating..." : "Create Team"}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeamModal;
