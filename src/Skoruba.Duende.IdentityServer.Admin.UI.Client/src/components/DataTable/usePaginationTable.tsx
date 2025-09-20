import { PaginationState } from "@tanstack/react-table";
import { useState } from "react";

export const usePaginationTable = (
  pageIndex: number = 0,
  pageSize: number = 10
) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex,
    pageSize,
  });

  return {
    pagination,
    setPagination,
  };
};
