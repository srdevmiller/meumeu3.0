import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Route, Switch } from "wouter";
import LandingPage from "./pages/landing-page";
import { AuthProvider } from "@/hooks/use-auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Toaster />
      <App />
    </AuthProvider>
  </QueryClientProvider>
);