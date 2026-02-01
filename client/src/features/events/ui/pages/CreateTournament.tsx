import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Trash2, LayoutGrid, X, Shield, Gamepad2, Trophy, Users, Clock, ChevronLeft, Loader2, DollarSign, ChevronRight, ImageIcon } from "lucide-react";
import { useForm, Controller, SubmitHandler, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";

import { DatePicker } from "@/components/ui/DatePicker";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { useEventStore } from "@/features/events/store/useEventStore";
import {
  GlassCard,
  SectionHeader
} from "@/features/events/ui/components/ThemedComponents";
import FileUpload from "@/components/FileUpload";
import {
  EventFormValues,
  eventSchema,
  categoryOptions,
  eventTypeOptions,
  registrationStatusOptions,
  Category,
  RegistrationStatus,
} from "@/features/events/lib";

export default function CreateTournament() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { createEvent, updateEvent, deleteEvent, fetchEventDetailsById, eventDetails, isLoading } = useEventStore();
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    mode: "onChange",
    defaultValues: {
      eventType: "tournament",
      status: "registration-open",
      category: "squad",
      registrationMode: "open",
      prizeDistribution: [{ rank: 1, amount: 0, label: "Champion" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "prizeDistribution",
  });

  useEffect(() => {
    if (eventId) {
      setIsEditMode(true);
      fetchEventDetailsById(eventId);
    }
  }, [eventId, fetchEventDetailsById]);

  useEffect(() => {
    if (isEditMode && eventDetails) {
      reset({
        title: eventDetails.title,
        game: eventDetails.game,
        eventType: eventDetails.eventType,
        startDate: eventDetails.startDate ? new Date(eventDetails.startDate).toISOString().slice(0, 16) : "",
        registrationEndsAt: eventDetails.registrationEndsAt ? new Date(eventDetails.registrationEndsAt).toISOString().slice(0, 16) : "",
        slots: eventDetails.maxSlots?.toString() || "",
        category: eventDetails.category as Category,
        registrationMode: eventDetails.registrationMode,
        prizePool: eventDetails.prizePool?.toString() || "",
        description: eventDetails.description,
        status: eventDetails.registrationStatus as RegistrationStatus,
        prizeDistribution: eventDetails.prizeDistribution || [{ rank: 1, amount: 0, label: "Champion" }],
      });
      if (eventDetails.image) {
        setValue("image", eventDetails.image);
      }
    }
  }, [isEditMode, eventDetails, reset, setValue]);


  const onFormSubmit: SubmitHandler<EventFormValues> = async (data) => {
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "slots") {
            fd.append("maxSlots", String(value));
            fd.append("slots", String(value));
          } else if (key === "prizeDistribution") {
            fd.append(key, JSON.stringify(value));
          } else if (key === "image" && value instanceof File) {
            fd.append("image", value);
          } else if (key === "category" || key === "eventType" || key === "status") {
            fd.append(key, String(value).toLowerCase());
          } else if (key !== "image") {
            fd.append(key, String(value));
          }
        }
      });

      let result;
      if (isEditMode && eventId) {
        result = await updateEvent(eventId, fd);
      } else {
        result = await createEvent(fd);
      }

      if (result) {
        toast.success(isEditMode ? "Arena parameters updated!" : "Arena forged successfully!");
        navigate(ORGANIZER_ROUTES.TOURNAMENTS, { replace: true });
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to process request. Check tactical data.");
    }
  };

  const handleDelete = async () => {
    if (!eventId) return;
    if (window.confirm("Confirm deletion of this arena? This operation is irreversible.")) {
      const success = await deleteEvent(eventId);
      if (success) {
        toast.success("Arena decommissioned.");
        navigate(ORGANIZER_ROUTES.TOURNAMENTS);
      }
    }
  };

  return (
    <div className="relative min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Top Nav */}
        {/* Top Nav */}
        {isEditMode && (
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              className="pl-0 gap-2 text-gray-400 hover:text-white"
              onClick={() => navigate(ORGANIZER_ROUTES.TOURNAMENTS)}
            >
              <ChevronLeft size={16} />
              Back
            </Button>

            <Button
              variant="destructive"
              onClick={handleDelete}
              className="px-4 py-2 text-xs font-black tracking-widest bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all rounded-lg"
            >
              <Trash2 size={14} className="mr-2" /> Delete Tournament
            </Button>
          </div>
        )}

        {/* Form Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mt-1">
                {isEditMode ? "Update the Tournament" : "New Tournament"}
              </h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side: General Info */}
            <div className="lg:col-span-2 space-y-8">
              <GlassCard className="p-8 space-y-6">
                <SectionHeader title="Universal Intel" icon={Shield} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Mission Title</Label>
                    <Input
                      {...register("title")}
                      placeholder="e.g. Operation Winter Strike"
                      className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-purple-500/50 transition-all font-bold"
                    />
                    {errors.title && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.title.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Game Universe</Label>
                    <div className="relative">
                      <Gamepad2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <Input
                        {...register("game")}
                        placeholder="CS2, Valorant, Apex..."
                        className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl focus:border-purple-500/50 transition-all font-bold"
                      />
                    </div>
                    {errors.game && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.game.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Engagement Format</Label>
                    <Select value={watch("category")} onValueChange={(val) => setValue("category", val as "solo" | "duo" | "squad")}>
                      <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0B0C1A] border-white/10 text-white">
                        {categoryOptions.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Protocol Type</Label>
                    <Select value={watch("eventType")} onValueChange={(val) => setValue("eventType", val as "scrims" | "tournament")}>
                      <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0B0C1A] border-white/10 text-white">
                        {eventTypeOptions.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-8 space-y-6">
                <SectionHeader title="Mission Briefing" icon={LayoutGrid} />
                <Textarea
                  {...register("description")}
                  placeholder="Enter tactical intel, rules of engagement, and mission objectives..."
                  className="bg-white/5 border-white/10 min-h-[200px] rounded-2xl p-6 focus:border-purple-500/50 transition-all text-gray-300 font-medium leading-relaxed"
                />
                {errors.description && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.description.message}</p>}
              </GlassCard>
            </div>

            {/* Right Side: Deployment & Rewards */}
            <div className="space-y-8">
              <GlassCard className="p-8 space-y-6 border-purple-500/10 shadow-glow">
                <SectionHeader title="Deployment Data" icon={Clock} />

                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Kickoff</Label>
                      <DatePicker value={field.value} onChange={field.onChange} />
                    </div>
                  )}
                />

                <Controller
                  name="registrationEndsAt"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Entry Lock</Label>
                      <DatePicker value={field.value} onChange={field.onChange} />
                    </div>
                  )}
                />

                <div className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Current Protocol Status</Label>
                    <Select
                      value={watch("status")}
                      onValueChange={(val) => setValue("status", val as any)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0B0C1A] border-white/10 text-white">
                        {registrationStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Max Personnel</Label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <Input
                        {...register("slots")}
                        type="number"
                        className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl font-black"
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-8 space-y-6 border-amber-500/10">
                <SectionHeader title="Reward Pool" icon={Trophy} />
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Bounty ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={20} />
                    <Input
                      {...register("prizePool")}
                      placeholder="0.00"
                      className="bg-white/5 border-white/10 h-14 pl-12 text-2xl font-black text-white rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Rank Distribution</span>
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => append({ rank: fields.length + 1, amount: 0, label: `Rank ${fields.length + 1}` })}
                      className="h-auto p-0 text-[10px] font-black text-purple-400 hover:text-white hover:bg-transparent transition-colors shadow-none"
                    >
                      + ADD SLICE
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 group/rank">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            {...register(`prizeDistribution.${index}.rank` as const, { valueAsNumber: true })}
                            className="bg-white/5 border-white/10 h-10 text-xs font-bold rounded-lg"
                            placeholder="Rank"
                          />
                          <Input
                            type="number"
                            {...register(`prizeDistribution.${index}.amount` as const, { valueAsNumber: true })}
                            className="bg-white/5 border-white/10 h-10 text-xs font-bold rounded-lg text-emerald-400"
                            placeholder="Amount"
                          />
                        </div>
                        {fields.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => remove(index)}
                            className="h-10 w-10 text-gray-600 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          >
                            <X size={14} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-8 space-y-6 border-purple-500/10">
                <SectionHeader title="Arena Visuals" icon={ImageIcon} />
                <Controller
                  name="image"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FileUpload
                      label="Arena Banner"
                      hint="Recommended: 16:9 Aspect Ratio"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </GlassCard>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl">
                <Shield size={20} className="text-purple-400" />
              </div>
              <p className="text-xs text-gray-500 font-medium max-w-[240px]">
                All arena parameters are verified by the Central Command before broadcasting.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-[320px] h-14 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-glow hover:shadow-glow-lg transition-all"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  {isEditMode ? "UPDATE TOURNAMENT" : "CREATE TOURNAMENT"}
                  <ChevronRight size={20} />
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
