import { CircleAlert } from "lucide-react";
import { ReactNode } from "react";
import { Card, CardContent } from "../Card/Card";
import cx from "classnames";
import { useTranslation } from "react-i18next";

interface WarningProps {
  children: ReactNode;
  className?: string;
}

export const Warning = ({ children, className }: WarningProps) => {
  const { t } = useTranslation();

  return (
    <Card className={cx("border-l-4 border-l-red-500", className)}>
      <CardContent className="p-2">
        <div className="flex items-start gap-4">
          <CircleAlert className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="space-y-3 w-full">
            <p className="text-sm text-muted-foreground mt-0">
              <span className="font-medium mr-1 text-red-500">
                {t("Actions.Warning")}:
              </span>
              {children}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
