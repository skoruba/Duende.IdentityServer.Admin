import { useTranslation } from "react-i18next";
import Page from "@/components/Page/Page";
import KeysTable from "./KeysTable";

const Keys = () => {
  const { t } = useTranslation();

  return (
    <Page title={t("Keys.PageTitle")}>
      <KeysTable />
    </Page>
  );
};

export default Keys;
