import api from "../api";
import { Artisan } from "../../types/artisan";

export async function fetchAllArtisans(): Promise<Artisan[]> {
  const res = await api.get<Artisan[]>("/artisan/getAll");
  return res.data;
}

export async function fetchNearbyArtisans(trade: string, lat: number, lng: number): Promise<Artisan[]> {
  const res = await api.get<Artisan[]>("/artisans", {
    params: { trade, lat, lng }
  });
  return res.data;
}
