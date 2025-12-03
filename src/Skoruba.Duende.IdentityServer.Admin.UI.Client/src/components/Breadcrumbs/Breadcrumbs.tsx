import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

export type BreadcrumbItemList = {
  name: string;
  url?: string;
};

export type BreadcrumbProps = {
  items: BreadcrumbItemList[];
};

export const Breadcrumbs: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <Breadcrumb className="mt-3">
      <BreadcrumbList>
        {items.map((item, index) => (
          <BreadcrumbItem key={item.name}>
            {item.url ? (
              <BreadcrumbLink asChild>
                <Link to={item.url}>{item.name}</Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{item.name}</BreadcrumbPage>
            )}
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
