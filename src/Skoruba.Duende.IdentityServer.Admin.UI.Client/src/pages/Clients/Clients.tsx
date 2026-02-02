import React from "react";
import useSearch from "@/hooks/useSearch";
import { useQuery } from "react-query";
import { getClients } from "@/services/ClientServices";
import { Button } from "@/components/ui/button";
import Page from "@/components/Page/Page";
import Loading from "@/components/Loading/Loading";
import { usePaginationTable } from "@/components/DataTable/usePaginationTable";
import ClientsWizardModals from "./ClientsWizardModals";
import useModal from "@/hooks/modalHooks";
import { useTranslation } from "react-i18next";
import { PlusCircle, Search, Laptop } from "lucide-react";
import ClientsTable from "./ClientsTable";
import { Input } from "@/components/ui/input";
import { queryKeys } from "@/services/QueryKeys";

const Clients: React.FC = () => {
  const { pagination, setPagination } = usePaginationTable();
  const { isOpen, closeModal, openModal: showModalAddNewClient } = useModal();
  const { t } = useTranslation();

  const {
    inputValue,
    handleInputChange,
    handleSearch,
    handleInputKeyDown,
    searchTerm,
  } = useSearch({
    onSearchComplete: () => {
      setPagination({ ...pagination, pageIndex: 0 });
    },
  });

  const clients = useQuery(
    [queryKeys.clients, pagination, searchTerm],
    () => getClients(searchTerm, pagination.pageIndex, pagination.pageSize),
    { keepPreviousData: true }
  );

  const headerActions = (
    <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-x-3 md:space-y-0">
      <Button onClick={showModalAddNewClient}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {t("Clients.AddNewClient")}
      </Button>

      <div className="relative w-full md:w-72">
        <Input
          type="text"
          placeholder={t("Clients.SearchPlaceholder")}
          className="pr-10"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
        />
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      <Button variant="secondary" onClick={handleSearch}>
        {t("Actions.Search")}
      </Button>
    </div>
  );

  return (
    <Page
      title={t("Clients.PageTitle")}
      icon={Laptop}
      accentKind="management"
      topSection={headerActions}
    >
      {clients.isLoading ? (
        <Loading fullscreen />
      ) : clients.data ? (
        <>
          <ClientsTable
            data={clients.data}
            pagination={pagination}
            setPagination={setPagination}
          />
          <ClientsWizardModals
            closeModalClientType={closeModal}
            isOpenModalClientType={isOpen}
          />
        </>
      ) : null}
    </Page>
  );
};

export default Clients;
