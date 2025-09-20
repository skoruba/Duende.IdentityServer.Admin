import { MainNav } from "@/components/MainNav/MainNav";
import { ModeToggle } from "@/components/ModeToggle/ModeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, UserCircle2 } from "lucide-react";
import AuthHelper from "@/helpers/AuthHelper";

export function SiteHeader() {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = AuthHelper.getLogoutUrl();
  };

  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <UserCircle2 className="me-1" />
            <span className="me-2">{user?.userName}</span>
            <button
              onClick={handleLogout}
              className="p-2 rounded hover:bg-muted transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </button>
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
