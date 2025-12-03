import React from "react";
import useSearch from "@/hooks/useSearch";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Search, KeyRound as KeyRoundIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IdentityProviderCreateUrl } from "@/routing/Urls";
import Page from "@/components/Page/Page";
import IdentityProvidersTable from "./IdentityProviderTable";

const IdentityProviders: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    inputValue,
    handleInputChange,
    handleSearch,
    handleInputKeyDown,
    searchTerm,
  } = useSearch();

  const headerActions = (
    <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-x-3 md:space-y-0">
      <Button onClick={() => navigate(IdentityProviderCreateUrl)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {t("IdentityProvider.Actions.Add")}
      </Button>

      <div className="relative w-full md:w-72">
        <Input
          type="text"
          placeholder={t("IdentityProvider.Search")}
          className="pr-10"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
        />
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>

      <Button variant="secondary" onClick={handleSearch}>
        {t("Actions.Search")}
      </Button>
    </div>
  );

  return (
    <Page
      title={t("IdentityProvider.PageTitle")}
      icon={KeyRoundIcon}
      accentKind="providers"
      topSection={headerActions}
    >
      <IdentityProvidersTable searchTerm={searchTerm} />
    </Page>
  );
};

export default IdentityProviders;
