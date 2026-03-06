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
import { useCreateTournamentMutation } from "@/features/tournaments/hooks/useTournamentMutations";

export default function CreateTournament() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { updateEvent, deleteEvent, fetchEventDetailsById, eventDetails, isLoading } = useEventStore();
  const createTournamentMutation = useCreateTournamentMutation();
  const isCreating = createTournamentMutation.isPending;
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

  const fillDummyData = () => {
    const now = new Date();
    const deadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    const start = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days from now

    reset({
      title: "Pro Gaming Championship 2026",
      game: "Free Fire",
      eventType: "tournament",
      isPaid: false,
      status: "registration-open",
      category: "squad",
      registrationMode: "open",
      hasRoadmap: true,
      roadmap: [
        { name: "Qualifiers", title: "Round 1" },
        { name: "Semi Finals", title: "Round 2" },
        { name: "Grand Finale", title: "Finals", isFinale: true }
      ],
      registrationEndsAt: formatDateToLocalHTML(deadline),
      startDate: formatDateToLocalHTML(start),
      slots: "100",
      prizePool: "50000",
      description: "Join the ultimate Pro Gaming Championship of 2026! Compete against the best teams for a massive prize pool and eternal glory. Registration is open for a limited time only.",
      prizeDistribution: [
        { rank: 1, amount: 25000, label: "Champion" },
        { rank: 2, amount: 15000, label: "Runner Up" },
        { rank: 3, amount: 10000, label: "3rd Place" }
      ],
      hasInvitedTeams: true,
      invitedTeams: [
        { teamName: "Team Alpha", email: "alpha@example.com" },
        { teamName: "Team Beta", email: "beta@example.com" }
      ],
      hasInvitedTeamsRoadmap: true,
      invitedTeamsRoadmap: [
        { name: "Invited Group", title: "Round 1" },
        { name: "Invited Finale", title: "Finals", isFinale: true }
      ],
    });
    // @ts-ignore - Setting these manually since they are internal now
    methods.setValue("roadmaps", [
      {
        type: "tournament", data: [
          { name: "Qualifiers", title: "Round 1" },
          { name: "Semi Finals", title: "Round 2" },
          { name: "Grand Finale", title: "Finals", isFinale: true }
        ]
      },
      {
        type: "invitedTeams", data: [
          { name: "Invited Group", title: "Round 1" },
          { name: "Invited Finale", title: "Finals", isFinale: true }
        ]
      }
    ]);
    toast.success("Form filled with dummy data!");
  };

  useEffect(() => {
    if (eventId) {
      setIsEditMode(true);
      fetchEventDetailsById(eventId);
    }
  }, [eventId, fetchEventDetailsById]);

  useEffect(() => {
    if (isEditMode && eventDetails) {
      const internalEventType = eventDetails.eventType;
      const internalIsPaid = !!eventDetails.isPaid;

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
        roadmap: eventDetails.roadmaps?.find((r: any) => r.type === "tournament")?.data || [],
        hasInvitedTeams: !!eventDetails.invitedTeams?.length,
        invitedTeams: eventDetails.invitedTeams || [],
        hasInvitedTeamsRoadmap: !!eventDetails.roadmaps?.find((r: any) => r.type === "invitedTeams")?.data?.length,
        invitedTeamsRoadmap: eventDetails.roadmaps?.find((r: any) => r.type === "invitedTeams")?.data || [],
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

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "slots") {
            fd.append("maxSlots", String(value));
            fd.append("slots", String(value));
          } else if (key === "prizeDistribution" || key === "roadmap" || key === "invitedTeams" || key === "invitedTeamsRoadmap") {
            if (key === "invitedTeams" && !data.hasInvitedTeams) return;

            // Transform invitedTeams if they are objects with teamId
            if (key === "invitedTeams" && Array.isArray(value)) {
              const teamIds = value.map(t => (t.teamId || t._id || t));
              fd.append(key, JSON.stringify(teamIds));
              return;
            }

            if (key === "invitedTeamsRoadmap" && (!data.hasInvitedTeams || !data.hasInvitedTeamsRoadmap)) return;
            fd.append(key, JSON.stringify(value));
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

      if (isEditMode && eventId) {
        const result = await updateEvent(eventId, fd);
        if (result) {
          toast.success("Tournament updated successfully!");
          navigate(ORGANIZER_ROUTES.TOURNAMENTS, { replace: true });
        }
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

          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mt-1">
              {isEditMode ? "Update Tournament" : "New Tournament"}
            </h1>
            {!isEditMode && (
              <Button
                type="button"
                variant="outline"
                onClick={fillDummyData}
                className="w-full md:w-auto border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 font-bold px-6 h-10 rounded-xl transition-all"
              >
                FILL DUMMY DATA
              </Button>
            )}
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
