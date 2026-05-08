import  { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "../../common/DataTable";
import Pagination from "../../common/Pagination";
type User = {
  id: number;
  name: string;
  email: string;
};

const HomeComponent = () => {

  const data: User[] = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@gmail.com`,
  }));

  const columns: ColumnDef<User>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },

    
  ];

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });








  return (
   <div className="p-6">
              <div className="overflow-x-auto bg-white shadow-md rounded-lg p-6">
                       <DataTable table={table} columns={columns} />
   
           <Pagination
             table={table}
             totalCount={data.length}
           />
         </div>
       </div>
  )
}

export default HomeComponent
