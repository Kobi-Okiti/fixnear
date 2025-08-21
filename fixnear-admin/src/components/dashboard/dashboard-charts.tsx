"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import api from "../../services/api";

interface MetricsData {
  artisanCountries: { country: string; count: number }[];
  reviewsPerDay: { date: string; count: number }[];
}

export function DashboardCharts() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/metrics");
        setMetrics(response.data);
      } catch (error) {
        console.error("Error fetching charts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Top Countries */}
      <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader>
          <CardTitle>Top Countries (Artisans)</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {loading ? (
            <p>Loading chart...</p>
          ) : metrics?.artisanCountries?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.artisanCountries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="country"
                  tickFormatter={(value) =>
                    value.length > 10 ? value.slice(0, 10) + "…" : value
                  }
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No country data available</p>
          )}
        </CardContent>
      </Card>

      {/* Reviews Per Day */}
      <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader>
          <CardTitle>Reviews Per Day (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {loading ? (
            <p>Loading chart...</p>
          ) : metrics?.reviewsPerDay?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.reviewsPerDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>No review data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
