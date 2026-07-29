import { CircleCheck } from "lucide-react";
import { ReactNode } from "react";
import { Card, CardContent } from "../Card/Card";
import cx from "classnames";

interface SuccessProps {
  children: ReactNode;
  className?: string;
}

export const Success = ({ children, className }: SuccessProps) => (
  <Card className={cx("border-l-4 border-l-green-500", className)}>
    <CardContent className="p-2">
      <div className="flex items-start gap-4">
        <CircleCheck className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
        <div className="space-y-3 w-full">
          <p className="text-sm text-muted-foreground mt-0">{children}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);
