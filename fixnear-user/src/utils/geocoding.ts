import axios from "axios";

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: {
        lat,
        lon,
        format: "jsonv2",
      },
      headers: {
        "Accept-Language": "en",
        "User-Agent": "fixnear-user"
      }
    });

    const addr = res.data.address || {};
    // Build a shorter string (road/county/state or whatever exists)
    const parts = [addr.road, addr.county, addr.state, addr.country].filter(Boolean);
    return parts.join(", ") || "Unknown location";

  } catch (err) {
    console.error("Reverse geocoding failed:", err);
    return "Unknown location";
  }
}

