import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Trophy,
  Users,
  ImageIcon,
  DollarSign,
  Clock,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

import { useEventStore } from "@/features/events/store/useEventStore";

interface EventFormData {
  title: string;
  game: string;
  startDate: string;
  registrationEndsAt: string;
  slots: string;
  category: string;
  prizePool: string;
  image: File | null;
  description: string;
  status: "registration-open" | "registration-closed" | "live" | "completed";
  orgId?: string;
  teamId?: string;
}

const categories = ["Solo", "Duo", "Squad"] as const;

export default function CreateTournament(): JSX.Element {
  const navigate = useNavigate();

  const { createEvent, error, isLoading } = useEventStore();

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    game: "",
    startDate: "",
    registrationEndsAt: "",
    slots: "",
    category: "",
    prizePool: "",
    image: null,
    description: "",
    status: "registration-open",
  });

  const [imagePreview, setImagePreview] = useState<string>("");

  const handleChange = (field: keyof EventFormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const fd = new FormData();

    // text / primitive fields
    Object.entries(formData).forEach(([key, value]) => {
      if (!value || key === "image") return;

      if (key === "startDate" || key === "registrationEnds") {
        fd.append(key, new Date(value).toISOString());
      } else {
        fd.append(key, String(value));
      }
    });

    // file field
    if (formData.image) {
      fd.append("image", formData.image);
    }

    const newEvent = await createEvent(fd);

    if (newEvent) {
      toast.success("Tournament created successfully!");

      navigate(ORGANIZER_ROUTES.TOURNAMENTS);
    } else {
      toast.error(error || "Failed to create tournament. Please try again.");
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          <CardHeader className="pb-6 space-y-1">
            <CardTitle className="flex items-center gap-2 text-3xl font-bold text-white">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Create New Tournament
            </CardTitle>
            <CardDescription className="text-gray-400">
              Fill in the details to create an exciting gaming tournament
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              {/* Title & Game */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-medium text-gray-200">
                    Event Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter event title"
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("title", e.target.value)
                    }
                    className="text-white border-gray-600 bg-gray-700/50 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="game" className="font-medium text-gray-200">
                    Game *
                  </Label>
                  <Input
                    id="game"
                    placeholder="e.g., PUBG, Valorant, CS:GO"
                    value={formData.game}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("game", e.target.value)
                    }
                    className="text-white border-gray-600 bg-gray-700/50 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="startDate"
                    className="flex items-center gap-2 font-medium text-gray-200"
                  >
                    <Calendar className="w-4 h-4 text-blue-400" />
                    Start Date *
                  </Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("startDate", e.target.value)
                    }
                    className="text-white border-gray-600 bg-gray-700/50 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="registrationEnds"
                    className="flex items-center gap-2 font-medium text-gray-200"
                  >
                    <Clock className="w-4 h-4 text-orange-400" />
                    Registration Ends *
                  </Label>
                  <Input
                    id="registrationEnds"
                    type="datetime-local"
                    value={formData.registrationEndsAt}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("registrationEndsAt", e.target.value)
                    }
                    className="text-white border-gray-600 bg-gray-700/50 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Slots, Category, Prize Pool */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="slots"
                    className="flex items-center gap-2 font-medium text-gray-200"
                  >
                    <Users className="w-4 h-4 text-green-400" />
                    Total Slots *
                  </Label>
                  <Input
                    id="slots"
                    type="number"
                    placeholder="100"
                    min="1"
                    value={formData.slots}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("slots", e.target.value)
                    }
                    className="text-white border-gray-600 bg-gray-700/50 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="category"
                    className="font-medium text-gray-200"
                  >
                    Category *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: string) =>
                      handleChange("category", value)
                    }
                  >
                    <SelectTrigger className="text-white border-gray-600 bg-gray-700/50 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {categories.map((item) => (
                        <SelectItem
                          key={item}
                          value={item}
                          className="text-white hover:bg-gray-700"
                        >
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="prizePool"
                    className="flex items-center gap-2 font-medium text-gray-200"
                  >
                    <DollarSign className="w-4 h-4 text-yellow-400" />
                    Prize Pool
                  </Label>
                  <Input
                    id="prizePool"
                    type="number"
                    placeholder="10000"
                    min="0"
                    value={formData.prizePool}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("prizePool", e.target.value)
                    }
                    className="text-white border-gray-600 bg-gray-700/50 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label
                  htmlFor="image"
                  className="flex items-center gap-2 font-medium text-gray-200"
                >
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  Event Image *
                </Label>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="image"
                      className="flex flex-col items-center justify-center w-full h-48 transition-colors border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700/30 hover:bg-gray-700/50"
                    >
                      {imagePreview ? (
                        <div className="relative w-full h-full">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="object-cover w-full h-full rounded-lg"
                          />
                          <div className="absolute inset-0 flex items-center justify-center transition-opacity rounded-lg opacity-0 bg-black/50 hover:opacity-100">
                            <p className="text-sm text-white">
                              Click to change image
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImageIcon className="w-12 h-12 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, JPEG (MAX. 5MB)
                          </p>
                        </div>
                      )}
                      <Input
                        id="image"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleImageChange}
                        className="hidden"
                        required
                      />
                    </label>
                  </div>
                  {formData.image && (
                    <p className="text-sm text-gray-400">
                      Selected: {formData.image.name} (
                      {(formData.image.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="font-medium text-gray-200"
                >
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide event details, rules, and any important information..."
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleChange("description", e.target.value)
                  }
                  className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 min-h-[120px] resize-y"
                  required
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="font-medium text-gray-200">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: string) =>
                    handleChange("status", value)
                  }
                >
                  <SelectTrigger className="text-white border-gray-600 bg-gray-700/50 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem
                      value="registration-open"
                      className="text-white hover:bg-gray-700"
                    >
                      Registration Open
                    </SelectItem>
                    <SelectItem
                      value="registration-closed"
                      className="text-white hover:bg-gray-700"
                    >
                      Registration Closed
                    </SelectItem>
                    <SelectItem
                      value="live"
                      className="text-white hover:bg-gray-700"
                    >
                      Live
                    </SelectItem>
                    <SelectItem
                      value="completed"
                      className="text-white hover:bg-gray-700"
                    >
                      Completed
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full py-6 text-lg font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/50"
                >
                  Create Event
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
