import { Card, CardContent } from "@/components/Card/Card";
import Tree from "@/components/Tree/Tree";
import TreeNode from "@/components/Tree/TreeNode";
import { Button } from "@/components/ui/button";
import {
  InfoIcon,
  ShieldCheck,
  EarthLock,
  Pencil,
  Lock,
  Link,
} from "lucide-react";
import { useFormState } from "@/contexts/FormContext";
import { useClientWizard } from "@/contexts/ClientWizardContext";
import { ClientWizardFormSummaryData } from "./ClientSummaryStep";
import { startCase } from "lodash";
import React from "react";
import { useTranslation } from "react-i18next";
import { clientTypeRules, enforcedFieldMeta } from "../Common/ClientTypeRules";

export enum OAuthNodeType {
  ClientInfo = "Client Info",
  Secret = "Secret",
  URI = "URI",
  Scopes = "Scopes",
}

type DisplayLine = React.ReactNode;

interface OAuthNode {
  step: number;
  name: string;
  type: OAuthNodeType;
  avatar?: boolean;
  value: DisplayLine | DisplayLine[];
  children?: OAuthNode[];
}

const ClientWebSummaryTree = () => {
  const { formData, setActiveStep } =
    useFormState<ClientWizardFormSummaryData>();
  const { excludeOptions, clientType } = useClientWizard();
  const { t } = useTranslation();

  const rules = clientType ? clientTypeRules[clientType] : undefined;

  const getIcon = (type: OAuthNodeType) => {
    const iconClass = "w-7 h-7";
    switch (type) {
      case OAuthNodeType.ClientInfo:
        return <InfoIcon className={iconClass} />;
      case OAuthNodeType.Secret:
        return <Lock className={iconClass} />;
      case OAuthNodeType.URI:
        return <Link className={iconClass} />;
      case OAuthNodeType.Scopes:
        return <ShieldCheck className={iconClass} />;
      default:
        return null;
    }
  };

  const OAuthCard: React.FC<OAuthNode> = ({
    step,
    name,
    type,
    value,
    avatar,
  }) => {
    const renderValueLine = (line: DisplayLine, index?: number) => (
      <li key={index ?? 0} className="flex items-center mb-2">
        {getIcon(type)}
        <span className="ml-2 break-all">{line}</span>
      </li>
    );

    return (
      // FIX: karty mají fixní šířku, nezvětšují se s buňkou stromu
      <Card className="w-[340px] min-h-[140px] shrink-0">
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            {avatar && <EarthLock className="w-10 h-10" />}
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              {name}
              <Button
                variant="secondary"
                className="p-2 ml-2"
                onClick={() => setActiveStep(step)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </h3>

            {Array.isArray(value) ? (
              <ul className="w-full text-sm text-muted-foreground list-none p-0">
                {value.map((v, i) => renderValueLine(v, i))}
              </ul>
            ) : (
              <div className="flex items-center text-sm text-muted-foreground break-all">
                {getIcon(type)}
                <span className="ml-2">
                  {type === OAuthNodeType.Secret ? "••••••••" : value}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const enforcedPairs: DisplayLine[] = React.useMemo(() => {
    if (!rules?.enforcedValues) return [];
    return Object.entries(rules.enforcedValues).flatMap(([key, rawValue]) => {
      const meta = enforcedFieldMeta[key as keyof typeof enforcedFieldMeta] as {
        labelKey: string;
        format?: (value: any, t: any) => string;
      };
      if (!meta) return [];
      const label = t(meta.labelKey as any);
      const value =
        typeof meta.format === "function"
          ? meta.format(rawValue as any, t)
          : String(rawValue);
      const isLocked = rules.lockedFields?.includes(
        key as keyof typeof enforcedFieldMeta
      );
      return [
        <span key={key} className="flex items-center gap-2">
          <span className="font-medium">{label}:</span>
          <span>{value}</span>
          {isLocked && <Lock className="w-4 h-4 opacity-70" />}
        </span>,
      ];
    });
  }, [rules?.enforcedValues, rules?.lockedFields, t]);

  const oauthClientData: OAuthNode = {
    step: 1,
    name: formData.clientName,
    avatar: true,
    type: OAuthNodeType.ClientInfo,
    value: [
      `${startCase(clientType)} Client`,
      formData.clientId,
      ...(excludeOptions?.consent
        ? []
        : [
            formData.requireConsent
              ? t("Client.Summary.RequiredConsent")
              : t("Client.Summary.NoRequiredConsent"),
          ]),
      ...(formData.description ? [formData.description] : []),
      ...enforcedPairs,
    ],
    children: [
      ...(excludeOptions?.uris
        ? []
        : [
            {
              step: 2,
              name: t("Client.Summary.RedirectUris"),
              type: OAuthNodeType.URI,
              value: formData.redirectUris,
            },
            ...(formData.logoutUri
              ? [
                  {
                    step: 2,
                    name: t("Client.Summary.LogoutUri"),
                    type: OAuthNodeType.URI,
                    value: formData.logoutUri,
                  },
                ]
              : []),
          ]),
      {
        step: 3,
        name: t("Client.Summary.Scopes"),
        type: OAuthNodeType.Scopes,
        value: formData.scopes.map((s) => s.label),
      },
      ...(excludeOptions?.secrets
        ? []
        : [
            {
              step: 4,
              name: t("Client.Summary.ClientSecret"),
              type: OAuthNodeType.Secret,
              value: [startCase(formData.secretType)],
            },
          ]),
    ],
  };

  return (
    <div className="bg-muted p-6 rounded-lg">
      <div className="relative w-full overflow-x-auto">
        {/* FIX: centrování celého stromu uprostřed bez ohledu na šířku modalu */}
        <div className="relative left-1/2 -translate-x-1/2 inline-block">
          <Tree
            label={
              // FIX: label obal jako inline-flex, ať se neroztahuje na celou šířku buňky
              <div className="inline-flex justify-center items-center text-center">
                <OAuthCard {...oauthClientData} />
              </div>
            }
          >
            {oauthClientData.children?.map((n) => (
              <TreeNode
                key={n.name}
                label={
                  <div className="inline-flex justify-center items-center text-center">
                    <OAuthCard {...n} />
                  </div>
                }
              >
                {n.children?.map((c) => (
                  <TreeNode
                    key={c.name}
                    label={
                      <div className="inline-flex justify-center items-center text-center">
                        <OAuthCard {...c} />
                      </div>
                    }
                  />
                ))}
              </TreeNode>
            ))}
          </Tree>
        </div>
      </div>
    </div>
  );
};

export default ClientWebSummaryTree;
