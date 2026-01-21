/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  Trophy,
  Heart,
  Eye,
  CheckCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useEventStore } from "@/features/events/store/useEventStore";
import toast from "react-hot-toast";
import TeamList from "../components/TeamList";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

type Status = "registration-open" | "ongoing" | "completed" | "upcoming";

const ViewEventById: React.FC = () => {
  const { eventId } = useParams();

  const {
    eventDetails,
    fetchEventDetailsById,
    isLoading,
    regitserEvent,
    isTeamRegistered,
  } = useEventStore();

  const { user } = useAuthStore();

  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isTeamListOpen, setIsTeamListOpen] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEventDetailsById(eventId);
    }
  }, [eventId, fetchEventDetailsById]);

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: Status): string => {
    switch (status) {
      case "registration-open":
        return "bg-green-600";
      case "ongoing":
        return "bg-blue-600";
      case "completed":
        return "bg-gray-600";
      case "upcoming":
        return "bg-yellow-600";
      default:
        return "bg-gray-600";
    }
  };

  const getStatusText = (status: Status): string => {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    const fetchData = async () => {
      if (eventDetails) {
        const isRegistered = await isTeamRegistered(
          eventDetails._id,
          user?.teamId || ""
        );
        setIsRegistered(isRegistered);
      }
    };

    fetchData();
  }, [eventDetails, isTeamRegistered]);

  const handleRegister = async (eventId: string) => {
    const result = await regitserEvent(eventId);
    if (result?.success) {
      toast.success(result.message || "Successfully registered for the event!");
    } else {
      toast.error(
        result?.message || "Failed to register for the event. Please try again."
      );
    }
  };

  const statusValue = eventDetails?.status ?? ("upcoming" as Status | string);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-gray-400 animate-pulse">Loading event...</div>
      </div>
    );
  }

  if (!eventDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-gray-400">Event not found</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-transparent-to-b from-gray-900 via-transparent to-transparent">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600">
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="px-4 text-center">
            <Badge
              className={`${getStatusColor(
                statusValue as Status
              )} text-white mb-4`}
            >
              {getStatusText(statusValue as Status)}
            </Badge>
            <h1 className="mb-2 text-4xl font-bold text-white md:text-5xl">
              {eventDetails?.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-white/80">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {eventDetails?.views.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {eventDetails?.likes.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl px-4 py-8 mx-auto">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Main Info */}
          <div className="space-y-6 lg:col-span-2">
            {/* Game & Category */}
            <div className="flex items-center gap-3">
              <Badge className="text-white bg-purple-600">
                {eventDetails?.game}
              </Badge>
              <Badge
                variant="outline"
                className="text-blue-400 border-blue-500"
              >
                {eventDetails?.category}
              </Badge>
              {eventDetails?.trending && (
                <Badge className="text-white bg-orange-600">🔥 Trending</Badge>
              )}
            </div>

            {/* Description */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-semibold text-white">About</h2>
                <p className="leading-relaxed text-gray-300">
                  {eventDetails?.description}
                </p>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-semibold text-white">
                  Event Details
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Event Start</p>
                      <p className="font-medium text-white">
                        {formatDate(eventDetails?.startDate)}
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-gray-800" />

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Event End</p>
                      <p className="font-medium text-white">
                        {formatDate(eventDetails?.eventEndAt)}
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-gray-800" />

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-orange-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">
                        Registration Deadline
                      </p>
                      <p className="font-medium text-white">
                        {formatDate(eventDetails?.registrationEndsAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card className="sticky bg-gray-900 border-gray-800 top-24">
              <CardContent className="p-6 space-y-6">
                {/* Prize Pool */}
                <div className="p-4 text-center border rounded-lg bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-800/30">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <p className="mb-1 text-sm text-gray-400">Prize Pool</p>
                  <p className="text-3xl font-bold text-white">
                    ${eventDetails?.prizePool.toLocaleString()}
                  </p>
                </div>

                <Separator className="bg-gray-800" />

                {/* Slots */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-5 h-5" />
                    <span>Available Slots</span>
                  </div>
                  <span className="text-lg font-semibold text-white">
                    {eventDetails?.slots}
                  </span>
                </div>

                <Separator className="bg-gray-800" />

                {/* Register Button */}

                {isRegistered ? (
                  <div className="flex items-center gap-2 px-4 py-3 text-green-700 border border-green-300 rounded-md bg-green-50">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="font-medium">
                      Your team is already registered for this event
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleRegister(eventDetails._id)}
                    className="w-full py-6 text-lg font-semibold text-white bg-purple-600 hover:bg-purple-700"
                    disabled={eventDetails.status === "completed"}
                  >
                    {eventDetails.status === "completed"
                      ? "Event Ended"
                      : "Register Now"}
                  </Button>
                )}

                <p className="text-xs text-center text-gray-500">
                  Registration closes on{" "}
                  {new Date(
                    eventDetails?.registrationEndsAt
                  ).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          {!isTeamListOpen && (
            <Button
              variant="secondary"
              className="mt-8"
              onClick={() => setIsTeamListOpen(true)}
            >
              Show Team List
            </Button>
          )}

          {isTeamListOpen && (
            <div className="mt-8">
              <TeamList
                eventId={eventDetails._id}
                setIsOpen={setIsTeamListOpen}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewEventById;
