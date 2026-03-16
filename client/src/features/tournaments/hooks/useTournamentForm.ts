import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { formatDateToLocalHTML } from "@/lib/utils";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import {
  TournamentFormValues,
  tournamentSchema,
} from "@/features/tournaments/lib";
import { Category, RegistrationStatus } from "@/features/tournaments/types";
import { useCreateTournamentMutation, useUpdateTournamentMutation } from "./useTournamentMutations";
import { useGetTournamentDetailsQuery } from "./useTournamentQueries";

export function useTournamentForm() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "details";
  const [activeTab, setActiveTab] = useState(initialTab);
  const { data: eventDetails, isLoading: isDetailsLoading } = useGetTournamentDetailsQuery(eventId || "");
  const isLoading = !!eventId && isDetailsLoading;
  const createTournamentMutation = useCreateTournamentMutation();
  const updateTournamentMutation = useUpdateTournamentMutation();

  const isCreating = createTournamentMutation.isPending || updateTournamentMutation.isPending;
  const [isEditMode, setIsEditMode] = useState(false);

  const methods = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentSchema),
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
      hasInvitedTeamsRoadmap: false,
      invitedTeams: [],
      hasT1SpecialRoadmap: false,
      t1SpecialRoadmap: [],
      t1SpecialRoundMappings: [],
      matchCount: 1,
      prizeDistribution: [{ rank: 1, amount: 0, label: "Champion" }],
    },
  });

  const { handleSubmit, reset, setValue, watch, trigger } = methods;
  const eventType = watch("eventType");
  const isRoadmapAvailable = eventType !== "scrims";

  // Auto-reset tab if roadmap becomes unavailable
  useEffect(() => {
    if (!isRoadmapAvailable && activeTab === "roadmap") {
      setActiveTab("details");
    }
  }, [isRoadmapAvailable, activeTab]);

  useEffect(() => {
    if (eventId) {
      setIsEditMode(true);
    }
  }, [eventId]);

  useEffect(() => {
    if (isEditMode && eventDetails) {
      const internalEventType = eventDetails.eventType as TournamentFormValues['eventType'];
      const internalIsPaid = !!eventDetails.isPaid;

      reset({
        title: eventDetails.title,
        game: eventDetails.game?.toLowerCase(),
        eventType: internalEventType,
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
        roadmap: eventDetails.roadmaps?.find((r) => r.type === "tournament")?.data || [],
        hasRoadmap: !!eventDetails.roadmaps?.find((r) => r.type === "tournament")?.data?.length,
        hasInvitedTeams: !!eventDetails.invitedTeams?.length || !!eventDetails.roadmaps?.find((r) => r.type === "invitedTeams")?.data?.length,
        invitedTeams: eventDetails.invitedTeams || [],
        invitedTeamsRoadmap: eventDetails.roadmaps?.find((r) => r.type === "invitedTeams")?.data || [],
        invitedRoundMappings: eventDetails.invitedRoundMappings || [],
        maxInvitedSlots: eventDetails.maxInvitedSlots?.toString() || "",
        hasT1SpecialRoadmap: !!eventDetails.roadmaps?.find((r) => r.type === "t1-special")?.data?.length,
        t1SpecialRoadmap: eventDetails.roadmaps?.find((r) => r.type === "t1-special")?.data || [],
        t1SpecialRoundMappings: eventDetails.t1SpecialRoundMappings || [],
        map: eventDetails.map || [],
        matchCount: eventDetails.matchCount || 1,
      });
      if (eventDetails.image) {
        setValue("image", eventDetails.image);
      }
    }
  }, [isEditMode, eventDetails, reset, setValue]);

  const onFormSubmit: SubmitHandler<TournamentFormValues> = async (data) => {
    // FINAL SAFETY GUARD: If on details tab and roadmap is available, do not submit.
    if (activeTab === "details" && isRoadmapAvailable) {
      nextStep();
      return;
    }

    try {
      const fd = new FormData();
      const backendEventType = data.eventType;

      // Use a local object for logic that might require value adjustments (like Scrims)
      const submissionData = { ...data };
      if (backendEventType === "scrims") {
        submissionData.registrationEndsAt = submissionData.startDate;
      }

      Object.entries(submissionData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (backendEventType === "scrims") {
            const irrelevantFields = [
              "roadmap",
              "hasRoadmap",
              "hasInvitedTeams",
              "invitedTeams",
              "invitedTeamsRoadmap"
            ];
            if (irrelevantFields.includes(key)) return;
          }

          if (key === "slots") {
            fd.append("maxSlots", String(value));
            fd.append("slots", String(value));
          } else if (key === "prizeDistribution" || key === "roadmap" || key === "invitedTeams" || key === "invitedTeamsRoadmap" || key === "invitedRoundMappings" || key === "t1SpecialRoadmap" || key === "t1SpecialRoundMappings") {
            if (key === "invitedTeams" && !submissionData.hasInvitedTeams) return;
            if (key === "invitedTeams" && Array.isArray(value)) {
              const teamIds = value.map(t => (t.teamId || t._id || t));
              fd.append(key, JSON.stringify(teamIds));
              return;
            }
            if (key === "roadmap" && !submissionData.hasRoadmap) return;
            if (key === "invitedTeamsRoadmap" && !submissionData.hasInvitedTeams) return;
            if (key === "invitedRoundMappings" && !submissionData.hasInvitedTeams) return;
            if (key === "t1SpecialRoadmap" && !submissionData.hasT1SpecialRoadmap) return;
            if (key === "t1SpecialRoundMappings" && !submissionData.hasT1SpecialRoadmap) return;
            fd.append(key, JSON.stringify(value));
          } else if (key === "maxInvitedSlots") {
            if (!submissionData.hasInvitedTeams) return;
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

  const nextStep = async () => {
    const isBasicValid = await trigger(["title", "game", "slots", "startDate", "registrationEndsAt", "description", "category", "eventType", "registrationMode"]);
    if (isBasicValid) {
      setActiveTab("roadmap");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Please fill all required basic details correctly.");
    }
  };

  return {
    methods,
    isEditMode,
    isLoading,
    isCreating,
    activeTab,
    setActiveTab,
    onFormSubmit,
    nextStep,
    isRoadmapAvailable,
    eventType,
    eventId,
    handleSubmit
  };
}
