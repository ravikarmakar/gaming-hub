import { useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, ChevronRight, FileText, Map as MapIcon } from "lucide-react";
import { FormProvider } from "react-hook-form";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import {
  BasicInfoSection,
  DescriptionSection,
  ScheduleSection,
  PrizeSection,
  MediaSection,
} from "../components/create-tournament";
import { RoadmapBuilder } from "../components/create-tournament/roadmaps/RoadmapBuilder";
import { useTournamentForm } from "../../hooks/useTournamentForm";

export default function CreateTournament() {
  const navigate = useNavigate();
  const {
    methods,
    isEditMode,
    isLoading,
    isCreating,
    activeTab,
    setActiveTab,
    onFormSubmit,
    nextStep,
    isRoadmapAvailable,
    handleSubmit
  } = useTournamentForm();

  return (
    <FormProvider {...methods}>
      <div className="relative min-h-screen pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2.5 mb-5">
            <Button
              size="icon"
              variant="outline"
              aria-label="Go back"
              className="h-7 w-7 rounded-md bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all shadow-sm"
              onClick={() => navigate(ORGANIZER_ROUTES.TOURNAMENTS)}
            >
              <ChevronLeft size={14} strokeWidth={2.5} />
            </Button>
            <div className="space-y-0 text-left">
              <h1 className="text-base md:text-lg font-black text-white tracking-tight uppercase leading-none">
                {isEditMode ? "Update Tournament" : "New Tournament"}
              </h1>
              <p className="text-[8px] md:text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] leading-tight">
                {isEditMode ? "Configure and refine your existing competition" : "Setup your professional esports event roadmap"}
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-between w-full gap-4">
              <TabsList className="bg-[#0a0410]/80 border border-purple-500/20 p-0.5 h-auto rounded-xl flex items-center justify-start gap-1 w-auto shadow-inner">
                <TabsTrigger
                  value="details"
                  className="rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider data-[state=active]:bg-purple-900/40 data-[state=active]:text-purple-300 data-[state=active]:border data-[state=active]:border-purple-500/30 flex items-center gap-1.5 transition-all text-gray-500 hover:text-gray-300"
                >
                  <FileText size={12} />
                  Basic Details
                </TabsTrigger>

                {isRoadmapAvailable && (
                  <TabsTrigger
                    value="roadmap"
                    className="rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider data-[state=active]:bg-purple-900/40 data-[state=active]:text-purple-300 data-[state=active]:border data-[state=active]:border-purple-500/30 flex items-center gap-1.5 transition-all text-gray-500 hover:text-gray-300"
                  >
                    <MapIcon size={12} />
                    Roadmap
                  </TabsTrigger>
                )}
              </TabsList>

              <div className="flex items-center gap-3">
                {activeTab === "details" && isRoadmapAvailable ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={nextStep}
                    className="h-8 px-4 py-0 text-[10px] font-black uppercase bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 rounded-lg flex items-center gap-1.5 border border-purple-500/30 transition-all shadow-lg active:scale-95 whitespace-nowrap"
                  >
                    NEXT
                    <ChevronRight size={12} strokeWidth={3} />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    form="tournament-form"
                    disabled={methods.formState.isSubmitting || isLoading || isCreating}
                    className="h-8 px-4 py-0 text-[10px] font-black uppercase bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1.5 shadow-glow-emerald transition-all active:scale-95 whitespace-nowrap"
                  >
                    {(methods.formState.isSubmitting || isLoading || isCreating) ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <>
                        {isEditMode ? "UPDATE" : "FINISH & CREATE"}
                        <ChevronRight size={12} strokeWidth={3} />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            <form
              id="tournament-form"
              onSubmit={(e) => {
                e.preventDefault();
                // GUARD: If on details tab and roadmap is available, don't submit to backend.
                // Instead, trigger the 'next' validation and tab switch.
                if (activeTab === "details" && isRoadmapAvailable) {
                  nextStep();
                  return;
                }

                handleSubmit(onFormSubmit, (errors) => {
                  console.error("Form validation errors:", errors);
                  const errorEntries = Object.entries(errors);
                  if (errorEntries.length > 0) {
                    const [field, error] = errorEntries[0];
                    // Handle nested errors or array errors
                    let message = "Unknown error";
                    if (error && typeof error === 'object') {
                      if ('message' in error && typeof error.message === 'string') {
                        message = error.message;
                      } else if (Array.isArray(error)) {
                        const firstItemError = error.find((e: any) => e && e.message);
                        if (firstItemError) message = firstItemError.message;
                      } else {
                        // Look deeper for a message (e.g. nested objects)
                        const deepError = Object.values(error).find(v => v && typeof v === 'object' && 'message' in v);
                        if (deepError && 'message' in (deepError as any)) {
                          message = (deepError as any).message;
                        }
                      }
                    }

                    toast.error(`Error in ${field}: ${message}`);
                  }
                })(e);
              }}
              className="space-y-8"
            >
              <TabsContent value="details" className="mt-0 space-y-8 outline-none">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <BasicInfoSection />
                    <DescriptionSection />
                  </div>
                  <div className="space-y-8">
                    <ScheduleSection />
                    <PrizeSection />
                    <MediaSection />
                  </div>
                </div>
              </TabsContent>

              {isRoadmapAvailable && (
                <TabsContent value="roadmap" className="mt-0 space-y-8 outline-none">
                  <RoadmapBuilder />
                </TabsContent>
              )}
            </form>
          </Tabs>

        </motion.div>
      </div>
    </FormProvider>
  );
}
