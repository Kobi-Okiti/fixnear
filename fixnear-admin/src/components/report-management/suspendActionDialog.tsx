"use client";

import { useState } from "react";
import { ReportManagementType } from "./columns";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import api from "../../services/api";
import React from "react";

interface SuspendActionDialogProps {
  report: ReportManagementType;
  setRefresh: React.Dispatch<React.SetStateAction<number>>;
}

export function SuspendActionDialog({
  report,
  setRefresh,
}: SuspendActionDialogProps) {
  const [loading, setLoading] = useState<"user" | "artisan" | null>(null);

  const handleSuspend = async (targetType: "user" | "artisan") => {
    try {
      setLoading(targetType);
      await api.patch(`/admin/reports/${report._id}/action`, {
        targetType,
        action: "suspend",
      });
      
      setRefresh((prev) => prev + 1);
    } catch (err) {
      console.error("Error suspending target:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          disabled={report.status === "reviewed"}
          className={
            report.status === "reviewed"
              ? "!bg-gray-400 cursor-not-allowed"
              : "!bg-red-500 hover:!bg-red-600"
          }
        >
          {report.status === "reviewed" ? "Suspended" : "Suspend"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Suspend Account</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600 mb-4">
          Do you want to suspend the reporter or the artisan involved in this
          report?
        </p>
        <DialogFooter className="flex gap-3">
          <Button
            disabled={loading === "user"}
            onClick={() => handleSuspend("user")}
            className="bg-red-500 hover:bg-red-600"
          >
            {loading === "user" ? "Processing..." : "Suspend Reporter"}
          </Button>
          {report.reportedArtisan && (
            <Button
              disabled={loading === "artisan"}
              onClick={() => handleSuspend("artisan")}
              className="bg-red-500 hover:bg-red-600"
            >
              {loading === "artisan" ? "Processing..." : "Suspend Artisan"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
