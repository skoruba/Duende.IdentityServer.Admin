import { useMemo } from "react";
import { FormRow } from "@/components/FormRow/FormRow";
import { useTranslation } from "react-i18next";
import { useGrantTypes } from "@/services/ClientServices";
import Loading from "@/components/Loading/Loading";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Item } from "@/components/ui/dualListselector";
import { isDeprecatedGrantType } from "@/models/Clients/ClientModels";

const GrantTypeItem = ({ item }: { item: Item }) => {
  const { t } = useTranslation();

  if (!isDeprecatedGrantType(item.id)) {
    return item.label;
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="min-w-0 truncate">{item.label}</span>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="shrink-0 cursor-help" title="">
              <Badge
                variant="outline"
                className="border-amber-500/40 bg-amber-500/10 font-medium text-amber-600 dark:text-amber-400"
              >
                {t("Client.Label.AllowedGrantTypes_Deprecated")}
              </Badge>
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            maxWidth="320px"
            className="whitespace-normal"
          >
            {t("Client.Label.AllowedGrantTypes_DeprecatedInfo")}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

const renderGrantType = (item: Item) => <GrantTypeItem item={item} />;

/** A deprecated grant has to be picked on its own, never by "select all". */
const isOfferedBySelectAll = (item: Item) => !isDeprecatedGrantType(item.id);

/** Deprecated grants go last, the others keep the order the API gives them. */
const sortDeprecatedLast = (grantTypes: Item[]): Item[] =>
  [...grantTypes].sort(
    (a, b) =>
      Number(isDeprecatedGrantType(a.id)) - Number(isDeprecatedGrantType(b.id)),
  );

const GrantTypesTab = () => {
  const { t } = useTranslation();

  const grantTypes = useGrantTypes();

  const offeredGrantTypes = useMemo(
    () => sortDeprecatedLast(grantTypes.data ?? []),
    [grantTypes.data],
  );

  if (grantTypes.isLoading) {
    return <Loading />;
  }

  return (
    <FormRow
      name="allowedGrantTypes"
      label={t("Client.Label.AllowedGrantTypes_Label")}
      description={t("Client.Label.AllowedGrantTypes_Info")}
      type="dualList"
      dualListSettings={{
        initialItems: offeredGrantTypes,
        renderItem: renderGrantType,
        selectAllFilter: isOfferedBySelectAll,
      }}
    />
  );
};

export default GrantTypesTab;
