import { useTranslation } from "react-i18next";
import Page from "@/components/Page/Page";
import KeysTable from "./KeysTable";
import { FileLock2 } from "lucide-react";

const Keys = () => {
  const { t } = useTranslation();

  return (
    <Page title={t("Keys.PageTitle")} icon={FileLock2} accentKind="providers">
      <KeysTable />
    </Page>
  );
};

export default Keys;
