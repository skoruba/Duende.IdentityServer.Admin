import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/Card/Card";
import { ACCENTS } from "@/pages/Home/Home";
import React from "react";

type Kind = keyof typeof ACCENTS;
type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type PageProps = {
  title?: React.ReactNode;
  description?: string;
  breadcrumb?: React.ReactNode;
  topSection?: React.ReactNode;
  children: React.ReactNode;
  withoutCard?: boolean;
  icon?: IconType;
  accentKind?: Kind;
};

const Page = ({
  title,
  description,
  breadcrumb,
  topSection,
  children,
  withoutCard = false,
  icon: Icon,
  accentKind = "management",
}: PageProps) => {
  const accent = ACCENTS[accentKind];

  if (withoutCard) {
    return (
      <section className="container grid items-center gap-6 pb-8 pt-6 md:py-2">
        {breadcrumb && <div className="mb-2">{breadcrumb}</div>}
        <div>
          {title && <h1 className="text-2xl font-semibold">{title}</h1>}
          {description && (
            <p className="text-muted-foreground text-sm mt-1">{description}</p>
          )}
          <div className="mt-4">{children}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-2">
      {breadcrumb && <div className="mb-2">{breadcrumb}</div>}

      <div>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {Icon && (
                  <span
                    className={[
                      "inline-flex h-10 w-10 items-center justify-center rounded-full",
                      accent.bg,
                      accent.ring,
                    ].join(" ")}
                  >
                    <Icon className={["h-5 w-5", accent.text].join(" ")} />
                  </span>
                )}
                <div>
                  {title && <CardTitle>{title}</CardTitle>}
                  {description && (
                    <CardDescription>{description}</CardDescription>
                  )}
                </div>
              </div>

              {topSection && (
                <div className="flex items-center shrink-0">{topSection}</div>
              )}
            </div>
          </CardHeader>

          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Page;
