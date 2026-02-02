import { DataTable } from "@/components/DataTable/DataTable";
import { useTranslation } from "react-i18next";
import { UserData, UsersData } from "@/models/Users/UserModels";
import { PaginationState } from "@tanstack/react-table";
import { Dispatch, SetStateAction } from "react";
import { UserEditUrl } from "@/routing/Urls";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitialsFromEmail } from "@/helpers/AvatarHelper";

type Props = {
  data: UsersData;
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
};

const RoleUsersTable = ({ data, pagination, setPagination }: Props) => {
  const { t } = useTranslation();

  const columns = [
    {
      header: "",
      accessorKey: "id",
      cell: ({ row }: { row: { original: UserData } }) => {
        const user = row.original;
        return (
          <Avatar>
            <AvatarFallback>{getInitialsFromEmail(user.email)}</AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: "userName",
      header: t("User.Section.Label.UserUserName_Label"),
      cell: ({ row }: { row: { original: UserData } }) => {
        const user = row.original;
        return (
          <Link
            to={UserEditUrl.replace(":userId", user.id.toString())}
            className="underline"
          >
            {user.userName}
          </Link>
        );
      },
    },
    {
      accessorKey: "email",
      header: t("User.Section.Label.UserEmail_Label"),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data.items}
      totalCount={data.totalCount}
      pagination={pagination}
      setPagination={setPagination}
    />
  );
};

export default RoleUsersTable;
