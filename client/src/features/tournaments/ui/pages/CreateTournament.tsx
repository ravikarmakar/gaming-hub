import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Shield, ChevronLeft, Loader2, ChevronRight } from "lucide-react";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { skipToken } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";

import { formatDateToLocalHTML } from "@/lib/utils";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
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
import { useCreateTournamentMutation, useUpdateTournamentMutation } from "@/features/tournaments/hooks/useTournamentMutations";
import { useGetTournamentDetailsQuery } from "@/features/tournaments/hooks/useTournamentQueries";

export default function CreateTournament() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { data: eventDetails, isLoading } = useGetTournamentDetailsQuery(eventId ? eventId : (skipToken as unknown as string));
  const createTournamentMutation = useCreateTournamentMutation();
  const updateTournamentMutation = useUpdateTournamentMutation();

  const isCreating = createTournamentMutation.isPending || updateTournamentMutation.isPending;
  const [isEditMode, setIsEditMode] = useState(false);

  const methods = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    mode: "onChange",
    defaultValues: {
      game: "free fire",
      eventType: "tournament",
      isPaid: false,
      status: "registration-open",
      category: "squad",
      registrationMode: "open",
      hasRoadmap: true,
      hasInvitedTeams: false,
      invitedTeams: [],
      invitedTeamsRoadmap: [],
      maxInvitedSlots: "",
      prizeDistribution: [{ rank: 1, amount: 0, label: "Champion" }],
    },
  });

  const { handleSubmit, reset, setValue, watch } = methods;



  useEffect(() => {
    if (eventId) {
      setIsEditMode(true);
    }
  }, [eventId]);

  useEffect(() => {
    if (isEditMode && eventDetails) {
      const internalEventType = eventDetails.eventType;
      const internalIsPaid = !!eventDetails.isPaid;

      reset({
        title: eventDetails.title,
        game: eventDetails.game?.toLowerCase(),
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
        roadmap: eventDetails.roadmaps?.find((r: any) => r.type === "tournament")?.data || [],
        hasInvitedTeams: !!eventDetails.invitedTeams?.length || !!eventDetails.roadmaps?.find((r: any) => r.type === "invitedTeams")?.data?.length,
        invitedTeams: eventDetails.invitedTeams || [],
        invitedTeamsRoadmap: eventDetails.roadmaps?.find((r: any) => r.type === "invitedTeams")?.data || [],
        invitedRoundMappings: eventDetails.invitedRoundMappings || [],
        maxInvitedSlots: eventDetails.maxInvitedSlots?.toString() || "",
        map: eventDetails.map || [],
        matchCount: eventDetails.matchCount || 1,
      });
      if (eventDetails.image) {
        setValue("image", eventDetails.image);
      }
    }
  }, [isEditMode, eventDetails, reset, setValue]);

  const onFormSubmit: SubmitHandler<EventFormValues> = async (data) => {
    try {
      const fd = new FormData();

      // Backend eventType remains as selected in form (scrims, tournament, invited-tournament)
      const backendEventType = data.eventType;

      // For scrims, synchronize dates if one is hidden
      if (backendEventType === "scrims") {
        data.registrationEndsAt = data.startDate;
      }

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Skip tournament-specific fields for scrims
          if (backendEventType === "scrims") {
            const irrelevantFields = [
              "roadmap",
              "hasRoadmap",
              "hasInvitedTeams",
              "invitedTeams",
              "invitedTeamsRoadmap",
              "prizePool",
              "prizeDistribution"
            ];
            if (irrelevantFields.includes(key)) return;
          }

          if (key === "slots") {
            fd.append("maxSlots", String(value));
            fd.append("slots", String(value));
          } else if (key === "prizeDistribution" || key === "roadmap" || key === "invitedTeams" || key === "invitedTeamsRoadmap" || key === "invitedRoundMappings") {
            if (key === "invitedTeams" && !data.hasInvitedTeams) return;

            // Transform invitedTeams if they are objects with teamId
            if (key === "invitedTeams" && Array.isArray(value)) {
              const teamIds = value.map(t => (t.teamId || t._id || t));
              fd.append(key, JSON.stringify(teamIds));
              return;
            }

            if (key === "roadmap" && !data.hasRoadmap) return;
            if (key === "invitedTeamsRoadmap" && !data.hasInvitedTeams) return;
            if (key === "invitedRoundMappings" && !data.hasInvitedTeams) return;

            fd.append(key, JSON.stringify(value));
          } else if (key === "maxInvitedSlots") {
            if (!data.hasInvitedTeams) return;
            fd.append("maxInvitedSlots", String(value || 0));
          } else if (key === "image" && value instanceof File) {
            fd.append("image", value);
          } else if (key === "eventType") {
            fd.append(key, backendEventType.toLowerCase());
          } else if (key === "isPaid") {
            fd.append("isPaid", String(value));
          } else if (key === "category" || key === "status") {
            fd.append(key, String(value).toLowerCase());
          } else if (key !== "image") {
            fd.append(key, String(value));
          }
        }
      });

      // No more testing logs needed here

      if (isEditMode && eventId) {
        updateTournamentMutation.mutate({ eventId, payload: fd }, {
          onSuccess: () => {
            toast.success("Tournament updated successfully!");
            navigate(ORGANIZER_ROUTES.TOURNAMENTS, { replace: true });
          }
        });
      } else {
        createTournamentMutation.mutate(fd, {
          onSuccess: () => {
            toast.success("Tournament created successfully!");
            navigate(ORGANIZER_ROUTES.TOURNAMENTS, { replace: true });
          }
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred during submission.");
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
            </div>
          )}

          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mt-1">
              {isEditMode ? "Update Tournament" : "New Tournament"}
            </h1>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit, (errors) => console.log("Validation Errors:", errors))} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <BasicInfoSection />
                {watch("eventType") !== "scrims" && (
                  <>
                    <RoadmapSection />
                    <InvitedTeamsRoadmapSection />
                  </>
                )}
                <DescriptionSection />
              </div>

              <div className="space-y-8">
                <ScheduleSection />
                {watch("eventType") !== "scrims" && <PrizeSection />}
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
                disabled={methods.formState.isSubmitting || isLoading || isCreating}
                className="w-full md:w-[320px] h-14 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-glow hover:shadow-glow-lg transition-all"
              >
                {(methods.formState.isSubmitting || isLoading || isCreating) ? (
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
