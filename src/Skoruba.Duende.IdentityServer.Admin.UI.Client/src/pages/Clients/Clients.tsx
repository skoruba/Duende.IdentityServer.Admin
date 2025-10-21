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
import { PlusCircle, Search } from "lucide-react";
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

  return (
    <Page title={t("Clients.PageTitle")}>
      {clients.isLoading ? (
        <Loading fullscreen />
      ) : (
        <>
          <div className="mb-4 flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <Button
              className="w-full md:w-auto"
              onClick={showModalAddNewClient}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("Clients.AddNewClient")}
            </Button>
            <div className="flex-grow relative">
              <Input
                type="text"
                placeholder="Search by client name or ID"
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
          <ClientsTable
            data={clients.data!}
            pagination={pagination}
            setPagination={setPagination}
          />
          <ClientsWizardModals
            closeModalClientType={closeModal}
            isOpenModalClientType={isOpen}
          />
        </>
      )}
    </Page>
  );
};

export default Clients;
