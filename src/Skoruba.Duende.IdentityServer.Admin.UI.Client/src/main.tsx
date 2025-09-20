import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import Loading from "./components/Loading/Loading.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { QueryClientProvider } from "react-query";
import { queryClient } from "./helpers/ErrorHelper.ts";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={<Loading />}>
          <App />
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
