import { FormRow } from "@/components/FormRow/FormRow";
import { useTranslation } from "react-i18next";
import {
  useRefreshTokenExpirations,
  useRefreshTokenUsages,
} from "@/services/ClientServices";

const RefreshTokenTab = () => {
  const { t } = useTranslation();
  const { data: refreshTokenUsages } = useRefreshTokenUsages();
  const { data: refreshTokenExpirations } = useRefreshTokenExpirations();

  return (
    <>
      <FormRow
        name="absoluteRefreshTokenLifetime"
        label={t("Client.Label.AbsoluteRefreshTokenLifetime_Label")}
        description={t("Client.Label.AbsoluteRefreshTokenLifetime_Info")}
        type="number"
        includeSeparator
      />
      <FormRow
        name="slidingRefreshTokenLifetime"
        label={t("Client.Label.SlidingRefreshTokenLifetime_Label")}
        description={t("Client.Label.SlidingRefreshTokenLifetime_Info")}
        type="number"
        includeSeparator
      />
      <FormRow
        name="refreshTokenUsage"
        label={t("Client.Label.RefreshTokenUsage_Label")}
        description={t("Client.Label.RefreshTokenUsage_Info")}
        type="select"
        selectSettings={{
          options: refreshTokenUsages ?? [],
        }}
        includeSeparator
      />
      <FormRow
        name="refreshTokenExpiration"
        label={t("Client.Label.RefreshTokenExpiration_Label")}
        description={t("Client.Label.RefreshTokenExpiration_Info")}
        type="select"
        selectSettings={{
          options: refreshTokenExpirations ?? [],
        }}
        includeSeparator
      />
    </>
  );
};

export default RefreshTokenTab;
