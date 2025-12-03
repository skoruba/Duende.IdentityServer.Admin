import { useId, useState, MouseEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { MainNav } from "@/components/MainNav/MainNav";
import { ModeToggle } from "@/components/ModeToggle/ModeToggle";
import AuthHelper from "@/helpers/AuthHelper";
import { useCsrfToken } from "../hooks/useCsrfToken";
import { Button } from "../ui/button";
import { Loader2, LogOut, UserCircle2 } from "lucide-react";

export function SiteHeader() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();

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
      <div className="container flex h-16 items-center justify-between gap-3">
        <MainNav />
        <nav className="flex items-center gap-2">
          <div className="hidden sm:flex items-center text-sm text-muted-foreground">
            <UserCircle2 className="me-1 h-5 w-5" />
            <span
              className="me-2 truncate max-w-[160px]"
              title={user?.userName}
            >
              {user?.userName}
            </span>
          </div>

          <ModeToggle />

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
              size="icon"
              className="gap-2 bg-transparent"
              disabled={!canSubmit}
              aria-busy={submitting}
              title={logoutTitle}
              onClick={handleLogoutClick}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span className="sr-only">{t("Home.Logout")}</span>
            </Button>
          </form>
        </nav>
      </div>
    </header>
  );
}
