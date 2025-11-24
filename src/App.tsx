import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MerchantProvider } from "@/contexts/MerchantContext";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Payment from "./pages/Payment";
import FAQ from "./pages/FAQ";
import Roadmap from "./pages/Roadmap";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MerchantProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pay/:id" element={<Payment />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/roadmap" element={<Roadmap />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </MerchantProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
