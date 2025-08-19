"use client";

import { ColumnDef } from "@tanstack/react-table";
import api from "../../services/api";
import { Button } from "../ui/button";

export type ArtisanManagementType = {
  _id: string;
  createdAt: string;
  updatedAt: string;
  tradeType: string;
  fullName: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  phone: string;
  email: string;
  isAvailable: boolean;
  rating: number;
  status: "pending" | "approved" | "suspended";
  readableAddress?: {
    amenity: string;
    road: string;
    county: string;
    state: string;
    "ISO3166-2-lvl4": string;
    postcode: string;
    country: string;
    country_code: string;
  };
};

export const columns = (
  setRefresh: React.Dispatch<React.SetStateAction<number>>
): ColumnDef<ArtisanManagementType>[] => [
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
  {
    accessorKey: "tradeType",
    header: "Trade",
    cell: ({ row }) => {
      const tradeType = row.original.tradeType;
      const formatted = tradeType
        ? tradeType.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
        : "—";
      return <p className="capitalize">{formatted}</p>;
    },
  },
  {
    accessorKey: "readableAddress",
    header: "Address",
    cell: ({ row }) => {
      const addr = row.original.readableAddress;
      return (
        <div className="max-w-[150px] whitespace-normal break-words text-xs font-normal text-[#535862]">
          {addr
            ? [addr.road, addr.county, addr.state, addr.country]
                .filter(Boolean) // remove undefined/null/empty values
                .join(", ")
            : "No address available"}
        </div>
      );
    },
  },
  {
    accessorKey: "isAvailable",
    header: "Availabilty",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <p
          className={`${
            user.isAvailable ? "!text-green-500" : "!text-red-500"
          }`}
        >
          {user.isAvailable ? "Available" : "Unavailable"}
        </p>
      );
    },
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = row.original.rating;
      return (
        <span>{typeof rating === "number" ? rating.toFixed(1) : "—"}</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const artisan = row.original;

      const updateStatus = async (newStatus: "approved" | "suspended") => {
        try {
          await api.patch(`/admin/artisans/${artisan._id}/status`, {
            status: newStatus,
          });

          setRefresh((prev) => prev + 1);
        } catch (err) {
          console.error("Error updating artisan status:", err);
        }
      };

      return (
        <div className="flex items-center gap-2">
          {artisan.status !== "approved" && (
            <Button
              className="!bg-green-500 text-white !text-xs !w-max !p-2"
              onClick={() => updateStatus("approved")}
            >
              Approve
            </Button>
          )}
          {artisan.status !== "suspended" && (
            <Button
              className="!bg-yellow-400 text-white !text-xs !w-max !p-2"
              onClick={() => updateStatus("suspended")}
            >
              Suspend
            </Button>
          )}
        </div>
      );
    },
  },
];
