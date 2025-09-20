import { LanguageSelector } from "@/components/LanguageSelector/LanguageSelector";
import { useApplicationInformation } from "@/services/InfoServices";
import { useTranslation } from "react-i18next";
import Loading from "../Loading/Loading";

export function Footer() {
  const { t } = useTranslation();

  const { data: applicationInfo, isLoading } = useApplicationInformation();

  return (
    <footer className="w-full border-t py-6">
      <div className="container flex flex-col items-center justify-between gap-4 px-8 md:flex-row md:px-12">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {t("Home.Title")}
        </p>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">
              {t("Footer.Version")} <Loading size="sm" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("Footer.Version")} {applicationInfo?.applicationVersion}
            </p>
          )}
          <LanguageSelector />
        </div>
      </div>
    </footer>
  );
}
