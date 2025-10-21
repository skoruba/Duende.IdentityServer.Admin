import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/Card/Card";

type PageProps = {
  title?: React.ReactNode;
  description?: string;
  topSection?: React.ReactNode;
  children: React.ReactNode;
  withoutCard?: boolean;
};

const Page = ({
  title,
  description,
  topSection,
  children,
  withoutCard = false,
}: PageProps) => {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-2">
      <div>
        {topSection}
        {withoutCard ? (
          <div>
            {title && <h1 className="text-2xl font-semibold">{title}</h1>}
            {description && (
              <p className="text-muted-foreground text-sm">{description}</p>
            )}
            <div>{children}</div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default Page;
