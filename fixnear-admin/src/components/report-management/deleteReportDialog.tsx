"use client";

import { useState } from "react";
import { ReportManagementType } from "./columns";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import api from "../../services/api";

interface DeleteReportDialogProps {
  report: ReportManagementType;
  setRefresh: React.Dispatch<React.SetStateAction<number>>;
}

export function DeleteReportDialog({
  report,
  setRefresh,
}: DeleteReportDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await api.delete(`/admin/reports/${report._id}`);
      setRefresh((prev) => prev + 1);
    } catch (err) {
      console.error("Error deleting report:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700" disabled={loading}>
          Delete
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Report</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to permanently delete this report? This action
          cannot be undone.
        </p>
        <DialogFooter className="flex gap-3">
          <DialogClose className="!h-[36px] flex items-center justify-center !bg-yellow-400 !text-white">
            Cancel
          </DialogClose>
          <Button
            onClick={handleDelete}
            disabled={loading}
            className="!bg-red-600 !hover:bg-red-700 !h-[36px]"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
