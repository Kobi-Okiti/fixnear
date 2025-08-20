"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SuspendActionDialog } from "./suspendActionDialog";
import { UpdateReportStatus } from "./updateReportStatus";
import { DeleteReportDialog } from "./deleteReportDialog";
// import api from "../../services/api";
// import { Button } from "../ui/button";
// import DisplayLocation from "./displayLocationUser";

export type ReportManagementType = {
  _id: string;
  createdAt: string;
  reporter: {
    _id: string;
    fullName: string;
    email: string;
  };
  reportedArtisan: {
    _id: string;
    fullName: string;
    email: string;
  };
  reason: string;
  status: "pending" | "reviewed";
};

export const columns = (
  setRefresh: React.Dispatch<React.SetStateAction<number>>
): ColumnDef<ReportManagementType>[] => [
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
    accessorKey: "reportedArtisan",
    header: "Reported Artisan",
    cell: ({ row }) => {
      const reportedArtisan = row.original.reportedArtisan;
      return (
        <p className="text-xs font-normal text-[#535862]">
          {reportedArtisan.fullName}
        </p>
      );
    },
  },
  {
    accessorKey: "reporter",
    header: "Reporter",
    cell: ({ row }) => {
      const reporter = row.original.reporter;
      return (
        <p className="text-xs font-normal text-[#535862]">
          {reporter.fullName}
        </p>
      );
    },
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <p className="text-xs font-normal text-[#535862]">
        {row.getValue("reason")}
      </p>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded ${
          row.original.status === "pending"
            ? "bg-yellow-200"
            : "bg-green-200"
        }`}
      >
        {row.original.status}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Action",
    enableHiding: false,
    cell: ({ row }) => {
    const report = row.original;
    return (
      <div className="flex gap-2">
        <SuspendActionDialog report={report} setRefresh={setRefresh} />
        <UpdateReportStatus report={report} setRefresh={setRefresh} />
        <DeleteReportDialog report={report} setRefresh={setRefresh} />
      </div>
    );
  },
  },
];
