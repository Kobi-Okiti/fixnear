"use client";

import { ColumnDef } from "@tanstack/react-table";
import api from "../../services/api";
import { Button } from "../ui/button";
// import DisplayLocation from "./displayLocationUser";

export type UserManagementType = {
  _id: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  phone: string;
  email: string;
  isSuspended: boolean;
  location: {
    lat: number;
    lng: number;
  };
};

export const columns = (
  setRefresh: React.Dispatch<React.SetStateAction<number>>
): ColumnDef<UserManagementType>[] => [
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const rawDate = row.getValue("createdAt") as string;
      const formatted = new Date(rawDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return <p className="text-xs font-normal text-[#535862]">{formatted}</p>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => {
      const rawDate = row.getValue("updatedAt") as string;
      const formatted = new Date(rawDate).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return <p className="text-xs font-normal text-[#535862]">{formatted}</p>;
    },
  },
  {
    accessorKey: "fullName",
    header: "Full Name",
    cell: ({ row }) => (
      <p className="text-xs font-normal text-[#535862]">
        {row.getValue("fullName")}
      </p>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <p className="text-xs font-normal text-[#535862]">
        {row.getValue("email")}
      </p>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone Number",
    cell: ({ row }) => (
      <p className="text-xs font-normal text-[#535862]">
        {row.getValue("phone")}
      </p>
    ),
  },
//   {
//     accessorKey: "location",
//     header: "Location",
//     cell: ({ row }) => {
//       const coords = row.original.location;
//       return (
//         <div className="max-w-[150px] whitespace-normal break-words">
//           <DisplayLocation coordinates={coords} />
//         </div>
//       );
//     },
//   },
  {
    id: "actions",
    header: "Action",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;

      const toggleSuspension = async () => {
        try {
          const res = await api.patch(`/admin/users/${user._id}/status`, {
            isSuspended: !user.isSuspended,
          });
          row.original.isSuspended = res.data.user.isSuspended;

          // to force re-render if needed
          setRefresh((prev) => prev + 1);
        } catch (error) {
          console.error("Error updating user suspension:", error);
        }
      };
      return (
        <Button
          onClick={toggleSuspension}
          className={`px-3 py-1 rounded text-white ${
            user.isSuspended ? "!bg-green-500" : "!bg-red-500"
          }`}
        >
          {user.isSuspended ? "Unsuspend" : "Suspend"}
        </Button>
      );
    },
  },
];
