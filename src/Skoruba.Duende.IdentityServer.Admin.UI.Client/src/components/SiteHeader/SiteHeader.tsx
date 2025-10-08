import { MainNav } from "@/components/MainNav/MainNav";
import { ModeToggle } from "@/components/ModeToggle/ModeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, LogOut, UserCircle2 } from "lucide-react";
import AuthHelper from "@/helpers/AuthHelper";
import { useCsrfToken } from "../hooks/useCsrfToken";
import { useId, useState, MouseEvent } from "react";
import { Button } from "../ui/button";

export function SiteHeader() {
  const { user, isAuthenticated } = useAuth();
  const {
    data: csrf,
    isLoading,
    isError,
    refetch,
  } = useCsrfToken(AuthHelper.getCsrfUrl(), isAuthenticated);

  const [submitting, setSubmitting] = useState(false);
  const formId = useId();

  const canSubmit = !isLoading && !isError && !!csrf && !submitting;

  const logoutTitle = isError
    ? "CSRF load failed – click to retry"
    : isLoading
    ? "Preparing CSRF…"
    : submitting
    ? "Signing out…"
    : "Logout";

  const handleLogoutClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (isError) {
      e.preventDefault();
      refetch();
      return;
    }
    if (!csrf || submitting) {
      e.preventDefault();
    }
  };

  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <UserCircle2 className="me-1" />
            <span className="me-2">{user?.userName}</span>

            <form
              id={formId}
              method="post"
              action={AuthHelper.getLogoutUrl()}
              onSubmit={() => setSubmitting(true)}
            >
              {csrf && (
                <input type="hidden" name={csrf.fieldName} value={csrf.token} />
              )}
              <Button
                type="submit"
                form={formId}
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
                disabled={!canSubmit}
                aria-busy={submitting}
                title={logoutTitle}
                onClick={handleLogoutClick}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
              </Button>
            </form>

            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
