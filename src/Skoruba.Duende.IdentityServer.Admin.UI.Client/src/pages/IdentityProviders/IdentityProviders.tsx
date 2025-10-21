import React from "react";
import useSearch from "@/hooks/useSearch";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Search } from "lucide-react";
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

  return (
    <Page title={t("IdentityProvider.PageTitle")}>
      <div className="mb-4 flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
        <Button
          className="w-full md:w-auto"
          onClick={() => navigate(IdentityProviderCreateUrl)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("IdentityProvider.Actions.Add")}
        </Button>
        <div className="flex-grow relative">
          <Input
            type="text"
            placeholder={t("IdentityProvider.Search")}
            className="w-full pr-10"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
          />
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
        <Button className="w-full md:w-auto" onClick={handleSearch}>
          {t("Actions.Search")}
        </Button>
      </div>

      <IdentityProvidersTable searchTerm={searchTerm} />
    </Page>
  );
};

export default IdentityProviders;
