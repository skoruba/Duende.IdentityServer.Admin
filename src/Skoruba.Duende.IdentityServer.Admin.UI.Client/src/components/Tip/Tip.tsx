import { Lightbulb } from "lucide-react";
import { ReactNode } from "react";
import { Card, CardContent } from "../Card/Card";
import cx from "classnames";
import { useTranslation } from "react-i18next";

interface TipProps {
  children: ReactNode;
  className?: string;
}

export const Tip = ({ children, className }: TipProps) => {
  const { t } = useTranslation();
  return (
    <Card className={cx("border-l-4 border-l-blue-500", className)}>
      <CardContent className="p-2">
        <div className="flex items-start gap-4">
          <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="space-y-3 w-full">
            <p className="text-sm text-muted-foreground mt-0">
              <span className="font-medium mr-1 text-blue-500">
                {t("Components.Tip.Label")}
              </span>
              {children}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
