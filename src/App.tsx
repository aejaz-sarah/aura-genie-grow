import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { EmotionProvider } from "@/context/EmotionContext";
import Landing from "./pages/Landing";
import ExploreGenie from "./pages/ExploreGenie";
import Emotion from "./pages/Emotion";
import Chat from "./pages/Chat";
import Lesson from "./pages/Lesson";
import Dashboard from "./pages/Dashboard";
import Feedback from "./pages/Feedback";
import NotFound from "./pages/NotFound";
import { EmotionTracker } from "@/components/EmotionTracker";
import AITutor from "@/components/AITutor";
import { motion } from "framer-motion";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <EmotionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/explore" element={<ExploreGenie />} />
              <Route path="/emotion" element={<Emotion />} />
              <Route path="/lesson" element={<Lesson />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/feedback" element={<Feedback />} />

              {/* 💬 Combined Emotion Tracking + Chat Page */}
              <Route
                path="/chat"
                element={
                  <motion.div
                    className="min-h-screen p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <EmotionTracker />
                    <AITutor />
                  </motion.div>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </EmotionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;