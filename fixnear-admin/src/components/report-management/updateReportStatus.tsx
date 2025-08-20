"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import api from "../../services/api";
import { ReportManagementType } from "./columns";

interface UpdateReportStatusProps {
  report: ReportManagementType;
  setRefresh: React.Dispatch<React.SetStateAction<number>>;
}

export function UpdateReportStatus({ report, setRefresh }: UpdateReportStatusProps) {
  const [loading, setLoading] = useState(false);

  const handleMarkReviewed = async () => {
    try {
      setLoading(true);
      await api.patch(`/admin/reports/${report._id}/status`, {
        status: "reviewed",
      });
      setRefresh((prev) => prev + 1);
    } catch (err) {
      console.error("Error updating report status:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      disabled={report.status === "reviewed" || loading}
      onClick={handleMarkReviewed}
      className={
        report.status === "reviewed"
          ? "!bg-gray-400 cursor-not-allowed"
          : "!bg-blue-500 hover:!bg-blue-600"
      }
    >
      {loading
        ? "Processing..."
        : report.status === "reviewed"
        ? "Reviewed"
        : "Mark Reviewed"}
    </Button>
  );
}
