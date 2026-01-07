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
    const iconClass = "w-5 h-5 text-primary/70";
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

  const SummaryRow: React.FC<{
    label: string;
    value: React.ReactNode;
    locked?: boolean;
  }> = ({ label, value, locked }) => (
    <span className="flex items-center gap-2">
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
      {locked ? <Lock className="w-4 h-4 opacity-70" /> : null}
    </span>
  );

  const OAuthCard: React.FC<OAuthNode> = ({
    step,
    name,
    type,
    value,
    avatar,
  }) => {
    const renderValueLine = (line: DisplayLine, index?: number) => (
      <li key={index ?? 0} className="flex items-start gap-4 mb-1 group">
        <div className="flex-shrink-0 p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
          {getIcon(type)}
        </div>
        <span className="text-sm leading-relaxed break-words pt-0.5">
          {line}
        </span>
      </li>
    );

    return (
      <Card
        className={`${
          avatar ? "w-[400px] min-h-[180px]" : "w-[320px] min-h-[140px]"
        } shrink-0 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
          avatar
            ? "bg-gradient-to-br from-primary/5 to-background border-primary/20"
            : "hover:border-primary/10"
        }`}
      >
        <CardContent className="p-5">
          <div className="flex flex-col items-center">
            {avatar && (
              <div className="p-3 rounded-full bg-primary/10 mb-1 mt-1">
                <EarthLock className="w-7 h-7 text-primary" />
              </div>
            )}
            <div className="text-center w-full mb-3">
              <div className="flex items-center justify-center gap-3">
                <h3
                  className={`font-semibold ${
                    avatar ? "text-lg text-primary" : "text-base"
                  }`}
                >
                  {name}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:scale-110 transition-all duration-200"
                  onClick={() => setActiveStep(step)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="w-full">
              {Array.isArray(value) ? (
                <ul className="space-y-1 list-none p-0">
                  {value.map((v, i) => renderValueLine(v, i))}
                </ul>
              ) : (
                <ul className="space-y-0 list-none p-0">
                  {renderValueLine(value, 0)}
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const yesNo = (v: boolean | undefined) =>
    v ? t("Actions.Yes") : t("Actions.No");

  const enforcedRows: DisplayLine[] = React.useMemo(() => {
    if (!rules || !rules.enforcedValues) return [];
    const items: DisplayLine[] = [];
    const keys = Object.keys(rules.enforcedValues) as Array<
      keyof typeof rules.enforcedValues
    >;
    for (const key of keys) {
      const rawValue = rules.enforcedValues[key];
      if (rawValue === undefined) continue;

      const meta = enforcedFieldMeta[key];
      if (!meta) continue;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const label = String(t(meta.labelKey as any));
      let formatted: string;
      if (typeof meta.format === "function") {
        formatted = meta.format(rawValue, t);
      } else {
        formatted = String(rawValue);
      }
      const isLocked = !!rules.lockedFields?.includes(key);

      items.push(
        <SummaryRow
          key={key}
          label={label}
          value={formatted}
          locked={isLocked}
        />
      );
    }
    return items;
  }, [rules, t]);

  const clientInfoRows: DisplayLine[] = [
    <SummaryRow
      key="clientType"
      label={t("Client.Label.ClientType_Label")}
      value={`${startCase(clientType)} Client`}
    />,
    ...(excludeOptions?.consent
      ? []
      : [
          <SummaryRow
            key="requireConsent"
            label={t("Client.Label.RequireConsent_Label")}
            value={yesNo(formData.requireConsent)}
          />,
        ]),
    ...(formData.description ? [formData.description] : []),
    ...enforcedRows,
  ];

  const oauthClientData: OAuthNode = {
    step: 1,
    name: formData.clientName,
    avatar: true,
    type: OAuthNodeType.ClientInfo,
    value: clientInfoRows,
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
    <div className="bg-gradient-to-br from-background via-muted/20 to-background p-4 rounded-xl border shadow-sm">
      <div className="relative w-full overflow-x-auto pb-2">
        <div className="relative left-1/2 -translate-x-1/2 inline-block">
          <Tree
            lineColor="hsl(var(--primary) / 0.2)"
            lineWidth="2px"
            lineHeight="20px"
            nodePadding="8px"
            lineBorderRadius="6px"
            label={
              <div className="inline-flex justify-center items-center text-center animate-in fade-in duration-700">
                <OAuthCard {...oauthClientData} />
              </div>
            }
          >
            {oauthClientData.children?.map((n, index) => (
              <TreeNode
                key={n.name}
                label={
                  <div
                    className="inline-flex justify-center items-center text-center animate-in slide-in-from-top duration-700"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <OAuthCard {...n} />
                  </div>
                }
              >
                {n.children?.map((c, childIndex) => (
                  <TreeNode
                    key={c.name}
                    label={
                      <div
                        className="inline-flex justify-center items-center text-center animate-in slide-in-from-bottom duration-700"
                        style={{
                          animationDelay: `${(index + childIndex + 2) * 100}ms`,
                        }}
                      >
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
