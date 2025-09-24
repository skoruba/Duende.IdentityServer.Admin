import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../Card/Card";

interface CardWrapperProps {
  title: string;
  description: string;
  icon: React.ElementType; // dostane se např. Shield
  children: React.ReactNode;
}

export function CardWrapper({
  title,
  description,
  icon: Icon,
  children,
}: CardWrapperProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
