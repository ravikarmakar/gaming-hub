import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Trash2, Shield, ChevronLeft, Loader2, ChevronRight } from "lucide-react";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";

import { formatDateToLocalHTML } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { useEventStore } from "@/features/events/store/useEventStore";
import {
  EventFormValues,
  eventSchema,
  Category,
  RegistrationStatus,
} from "@/features/events/lib";

import {
  BasicInfoSection,
  DescriptionSection,
  ScheduleSection,
  PrizeSection,
  MediaSection,
  RoadmapSection,
  InvitedTeamsRoadmapSection
} from "../components/create-tournament";

export default function CreateTournament() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { createEvent, updateEvent, deleteEvent, fetchEventDetailsById, eventDetails, isLoading } = useEventStore();
  const [isEditMode, setIsEditMode] = useState(false);

  const methods = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    mode: "onChange",
    defaultValues: {
      eventType: "tournament",
      isPaid: false,
      status: "registration-open",
      category: "squad",
      registrationMode: "open",
      hasRoadmap: true,
      hasInvitedTeams: false,
      invitedTeams: [],
      hasInvitedTeamsRoadmap: false,
      invitedTeamsRoadmap: [],
      prizeDistribution: [{ rank: 1, amount: 0, label: "Champion" }],
    },
  });

  const { handleSubmit, reset, setValue } = methods;

  useEffect(() => {
    if (eventId) {
      setIsEditMode(true);
      fetchEventDetailsById(eventId);
    }
  }, [eventId, fetchEventDetailsById]);

  useEffect(() => {
    if (isEditMode && eventDetails) {
      const et = eventDetails.eventType as string;
      const internalEventType = (et === "free-tournament" || et === "paid-tournament") ? "tournament" : et;
      const internalIsPaid = et === "paid-tournament";

      reset({
        title: eventDetails.title,
        game: eventDetails.game,
        eventType: internalEventType as any,
        isPaid: internalIsPaid,
        startDate: formatDateToLocalHTML(eventDetails.startDate),
        registrationEndsAt: formatDateToLocalHTML(eventDetails.registrationEndsAt),
        slots: eventDetails.maxSlots?.toString() || "",
        category: eventDetails.category as Category,
        registrationMode: eventDetails.registrationMode,
        prizePool: eventDetails.prizePool?.toString() || "",
        entryFee: eventDetails.entryFee?.toString() || "",
        description: eventDetails.description,
        status: eventDetails.registrationStatus as RegistrationStatus,
        prizeDistribution: eventDetails.prizeDistribution || [{ rank: 1, amount: 0, label: "Champion" }],
        roadmap: eventDetails.roadmap || [],
        hasInvitedTeams: !!eventDetails.invitedTeams?.length,
        invitedTeams: eventDetails.invitedTeams || [],
      });
      if (eventDetails.image) {
        setValue("image", eventDetails.image);
      }
    }
  }, [isEditMode, eventDetails, reset, setValue]);

  const onFormSubmit: SubmitHandler<EventFormValues> = async (data) => {
    try {
      const fd = new FormData();

      // Determine backend eventType string
      let backendEventType: string = data.eventType;
      if (data.eventType === "tournament") {
        backendEventType = data.isPaid ? "paid-tournament" : "free-tournament";
      }

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "slots") {
            fd.append("maxSlots", String(value));
            fd.append("slots", String(value));
          } else if (key === "prizeDistribution" || key === "roadmap" || key === "invitedTeams" || key === "invitedTeamsRoadmap") {
            // Only append invitedTeams if hasInvitedTeams is true
            if (key === "invitedTeams" && !data.hasInvitedTeams) return;
            // Only append invitedTeamsRoadmap if both are true
            if (key === "invitedTeamsRoadmap" && (!data.hasInvitedTeams || !data.hasInvitedTeamsRoadmap)) return;
            fd.append(key, JSON.stringify(value));
          } else if (key === "image" && value instanceof File) {
            fd.append("image", value);
          } else if (key === "eventType") {
            fd.append(key, backendEventType.toLowerCase());
          } else if (key === "category" || key === "status") {
            fd.append(key, String(value).toLowerCase());
          } else if (key === "isPaid") {
            // isPaid is a frontend helper, backend might not need it as a field
            // but we can append it if necessary. For now, eventType carries the weight.
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
        toast.success(isEditMode ? "Tournament updated successfully!" : "Tournament created successfully!");
        navigate(ORGANIZER_ROUTES.TOURNAMENTS, { replace: true });
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred during submission.");
    }
  };

  const handleDelete = async () => {
    if (!eventId) return;
    if (window.confirm("Are you sure you want to delete this tournament? This action cannot be undone.")) {
      const success = await deleteEvent(eventId);
      if (success) {
        toast.success("Tournament deleted.");
        navigate(ORGANIZER_ROUTES.TOURNAMENTS);
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="relative min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isEditMode && (
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                className="pl-0 gap-2 text-gray-400 hover:text-white"
                onClick={() => navigate(ORGANIZER_ROUTES.TOURNAMENTS)}
              >
                <ChevronLeft size={16} />
                Back to Tournaments
              </Button>

              <Button
                variant="destructive"
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-black tracking-widest bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all rounded-lg shadow-none"
              >
                <Trash2 size={14} className="mr-2" /> Delete Tournament
              </Button>
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mt-1">
              {isEditMode ? "Update Tournament" : "New Tournament"}
            </h1>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <BasicInfoSection />
                <RoadmapSection />
                <InvitedTeamsRoadmapSection />
                <DescriptionSection />
              </div>

              <div className="space-y-8">
                <ScheduleSection />
                <PrizeSection />
                <MediaSection />
              </div>
            </div>

            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-xl">
                  <Shield size={20} className="text-purple-400" />
                </div>
                <p className="text-xs text-gray-500 font-medium max-w-[240px]">
                  Please ensure all details are correct before submitting.
                </p>
              </div>

              <Button
                type="submit"
                disabled={methods.formState.isSubmitting || isLoading}
                className="w-full md:w-[320px] h-14 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-glow hover:shadow-glow-lg transition-all"
              >
                {(methods.formState.isSubmitting || isLoading) ? (
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
    </FormProvider>
  );
}
