"use client"

import { useEffect, useState } from "react"
import api from "../../services/api"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"


interface MetricsData {
  users: { total: number }
  artisans: { total: number }
  reviews: { total: number }
}

export function DashboardCards() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        const response = await api.get("/admin/metrics")
        setMetrics(response.data)
      } catch (error) {
        console.error("Error fetching metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  const renderCard = (title: string, gradient: string, value?: number) => (
    <Card className={`bg-gradient-to-r ${gradient} text-white shadow-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">
          {loading 
            ? "..." 
            : value !== undefined 
              ? value 
              : "N/A"}
        </p>
      </CardContent>
    </Card>
  )

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {renderCard("Total Users", "from-blue-500 to-blue-600" , metrics?.users.total)}
      {renderCard("Total Artisans", "from-green-500 to-green-600", metrics?.artisans.total)}
      {renderCard("Total Reviews", "from-purple-500 to-purple-600", metrics?.reviews.total)}
    </div>
  )
}
