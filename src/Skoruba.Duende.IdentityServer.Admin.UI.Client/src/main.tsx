import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import "./i18n/config";
import Loading from "./components/Loading/Loading.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { UiConfigurationProvider } from "./contexts/UiConfigurationContext.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./helpers/ErrorHelper.ts";
import ErrorBoundary from "./components/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UiConfigurationProvider>
            <Suspense fallback={<Loading fullscreen />}>
              <App />
            </Suspense>
          </UiConfigurationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
