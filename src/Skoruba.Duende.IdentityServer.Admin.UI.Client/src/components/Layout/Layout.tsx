import "@/globals.css";
import { SiteHeader } from "@/components/SiteHeader/SiteHeader";
import { ThemeProvider } from "@/components/ThemeProvider/ThemeProvider";
import { Toaster } from "../ui/toaster";
import { Footer } from "../Footer/Footer";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: RootLayoutProps) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
