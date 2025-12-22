import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import BackToSetting from "../BackToSetting";
import { useAuth } from "../ContextAPI/AuthContext";
import AddCategoryPanel from "./AddCategoryPanel";
import Swal from "sweetalert2";

const apiUrl = import.meta.env.VITE_API_URL;

interface Category {
  AwardCategoryID: number;
  CategoryName: string;
  Description: string;
  CategoryCode?: string;
}

const AwardCategories: React.FC = () => {
  const { authToken,userId } = useAuth();

  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");

  // 🔹 PANEL STATE
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
   const [categoryCode, setcategoryCode] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/awardCategory`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        //setData(res.data);
         const categories = res.data.map((category: any) => ({
      AwardCategoryID: category.AwardCategoryID,
      CategoryName: category.CategoryName,
      Description: category.Description,
    }));
    setData(categories); 
      
      } catch (err) {
        console.error("Error fetching categories", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [authToken]);
 

  const columns = useMemo<ColumnDef<Category>[]>(() => [
    // {
    //   accessorKey: "AwardCategoryID", header: "AwardCategoryID",
    // },
    {
      accessorKey: "CategoryName", header: "Category Name",
    },
    {
      accessorKey: "Description",
      header: "Description",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="justify-center gap-4">
             <button
              className="text-blue-600 hover:text-blue-800"
              onClick={() => handleEdit(item.AwardCategoryID)}
            >
              <Edit2 size={16} />
            </button>
            <button
              className="text-red-600 hover:text-red-800"
              onClick={() => handleDelete(item)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
   // 🔹 ADD CLICK (IMPORTANT FIX)
  const handleAddClick = () => {
    setEditCategoryId(null);
    setCategoryName("");
    setDescription("");
    setcategoryCode("");
    setIsPanelOpen(true);
  };

  
  const handleEdit = async (categoryId: number) => {
  try {
    const res = await axios.get(`${apiUrl}/api/awardCategory`, {
      params: { AwardCategoryID: categoryId },
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const categoryData = res.data[0];
    console.log("ss" ,res.data)
    setCategoryName(categoryData.CategoryName);
    setDescription(categoryData.Description);
    setEditCategoryId(categoryData.AwardCategoryID);
    setcategoryCode(categoryData.CategoryCode);
    setIsPanelOpen(true);
  } catch (error) {
    console.error("Error fetching category for editing", error);
    alert("Failed to fetch category data");
  }
};


const handleSave = async () => {
  if (!categoryName.trim()) {
    alert("Category name is required");
    return;
  }

  const categoryData = {
    categoryCode: categoryCode.trim(),                 
    categoryName: categoryName.trim(),
    description: description?.trim() || "",
    active: true,
    submittedBy: Number(userId),
  };

  try {
    if (editCategoryId === null) {
      await axios.post(
        `${apiUrl}/api/awardCategory`,
        categoryData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
       Swal.fire({
        icon: "success",
        title: "Category added successfully!",
        confirmButtonText: "Okay",
      });
     
    } else {
      await axios.put(
        `${apiUrl}/api/awardCategory/${editCategoryId}`,
        categoryData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
       Swal.fire({
        icon: "success",
        title: "Category added successfully!",
        confirmButtonText: "Okay",
      });
    }

    setIsPanelOpen(false);
    setCategoryName("");
    setDescription("");
    setcategoryCode("");
    setEditCategoryId(null);
      setTimeout(() => {
      window.location.reload(); 
    }, 1500);
  } catch (error: any) {
    console.error("Status:", error.response?.status);
    console.error("Backend error:", error.response?.data);
    alert("Failed to save category");
  }
};


const handleDelete = async (category: Category) => {
  // Show confirmation dialog using SweetAlert
  const result = await Swal.fire({
    title: "Are you sure?",
    text: `You are about to delete the category: ${category.CategoryName}`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  });

  if (result.isConfirmed) {
    try {
      const payload = {
        categoryCode: "AUTO",
        categoryName: category.CategoryName,
        description: category.Description || "",
        active: false,
        submittedBy: Number(userId),
      };

      const response = await axios.put(
        `${apiUrl}/api/awardCategory/${category.AwardCategoryID}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setData(prev => prev.filter(item => item.AwardCategoryID !== category.AwardCategoryID));
      Swal.fire({
        icon: "success",
        title: "Category deleted successfully!",
        confirmButtonText: "Okay",
      });

     
      setTimeout(() => {
        window.location.reload(); 
      }, 1500);
    } catch (error) {
      console.error("Error in delete request:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to delete category",
       
        confirmButtonText: "Okay",
      });
    }
  }
};



  if (loading) {
    return <div className="text-center py-6">Loading...</div>;
  }

  return (
    <div>
      <BackToSetting />

      <div className="bg-white shadow-md rounded-lg p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Award Categories</h1>

          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
              />
            </div>

            <button
             // onClick={() => setIsPanelOpen(true)}
                 onClick={handleAddClick}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
            >
              <Plus size={16} />
              Add Category
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 text-sm text-gray-800">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-8 text-gray-500">
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>

          <div className="space-x-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/*ADD/EDIT CATEGORY SIDE PANEL */}
      <AddCategoryPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        categoryName={categoryName}
        setCategoryName={setCategoryName}
        setCategoryCode={setcategoryCode}
        categoryCode={categoryCode}
        description={description}
        setDescription={setDescription}
        onSave={handleSave}
       editCategoryId={editCategoryId}   
      />
    </div>
  );
};

export default AwardCategories;
