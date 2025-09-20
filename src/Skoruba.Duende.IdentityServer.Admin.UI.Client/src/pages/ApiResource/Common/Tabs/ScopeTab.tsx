import { FormRow } from "@/components/FormRow/FormRow";
import Loading from "@/components/Loading/Loading";
import { Tip } from "@/components/Tip/Tip";
import { Button } from "@/components/ui/button";
import { ApiScopeCreateUrl } from "@/routing/Urls";
import { useClientScopes } from "@/services/ClientServices";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const ScopeTab = () => {
  const { t } = useTranslation();

  const clientScopes = useClientScopes(true, false);

  return clientScopes.isLoading ? (
    <Loading />
  ) : (
    <>
      <Tip>
        {t("ApiScope.Tips.NoScope")}
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-blue-600 underline"
          asChild
        >
          <Link
            to={ApiScopeCreateUrl}
            className="flex items-center gap-1"
            target="_blank"
          >
            <ArrowRight className="h-3 w-3" />
            {t("ApiScope.Tips.ApiScope")}
          </Link>
        </Button>
        .
      </Tip>

      <FormRow
        name="scopes"
        label={t("Client.Label.AllowedScopes_Label")}
        description={t("Client.Label.AllowedScopes_Info")}
        type="dualList"
        dualListSettings={{
          initialItems: clientScopes.data ?? [],
        }}
      />
    </>
  );
};

export default ScopeTab;
