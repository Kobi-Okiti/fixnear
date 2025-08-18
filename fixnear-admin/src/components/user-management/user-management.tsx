"use client";

import { useState, useEffect } from "react";
import { columns, UserManagementType } from "./columns";
import { DataTable } from "./data-table";
import api from "../../services/api";

export default function UserManagement() {
  const [data, setData] = useState<UserManagementType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/users");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [refresh]);

  return (
    <div className="">
      <DataTable columns={columns(setRefresh)} data={data} loading={loading}/>
    </div>
  );
}
