import { useParams } from "react-router-dom";

import { useTranslation } from "react-i18next";
import Page from "@/components/Page/Page";
import { mapEditClientToFormData } from "../ClientSchema";
import Loading from "@/components/Loading/Loading";
import { useClient, useGrantTypes } from "@/services/ClientServices";
import { ClientsUrl } from "@/routing/Urls";
import ClientEditForm from "./ClientEditForm";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";

const ClientEdit = () => {
  const { t } = useTranslation();
  const { clientId } = useParams<{ clientId: string }>();

  const { data: clientData, isLoading } = useClient(Number(clientId));

  const { data: grantTypes, isLoading: grantTypesLoading } = useGrantTypes();

  if (isLoading || !clientData || grantTypesLoading) {
    return <Loading fullscreen />;
  }

  return (
    <Page
      title={t("Client.PageTitle", {
        clientName: clientData.clientName,
      })}
      description={t("Client.SubTitle")}
      topSection={
        <Breadcrumbs
          items={[
            { url: ClientsUrl, name: t("Clients.PageTitle") },
            {
              name: t("Client.PageTitle", {
                clientName: clientData.clientName,
              }),
            },
          ]}
        />
      }
    >
      <ClientEditForm
        clientId={clientId!}
        client={mapEditClientToFormData(clientData, grantTypes!)}
      />
    </Page>
  );
};

export default ClientEdit;
