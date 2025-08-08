import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Player from "./pages/Player";
import SupabaseUpload from "./pages/SupabaseUpload";
import SupabaseAdmin from "./pages/SupabaseAdmin";
import NotFound from "./pages/NotFound";
import KeyboardShortcuts from "./components/KeyboardShortcuts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Global keyboard shortcuts */}
        <KeyboardShortcuts />
        <Routes>
          <Route path="/" element={<Player />} />
          <Route path="/upload" element={<SupabaseUpload />} />
          <Route path="/admin" element={<SupabaseAdmin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
