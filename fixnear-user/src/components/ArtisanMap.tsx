import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Artisan } from "@/types/artisan";
import { useNavigate } from "react-router-dom";

import "leaflet/dist/leaflet.css";
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const userIcon = new L.Icon({
  iconUrl: "/icons/user-marker.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const artisanIcon = new L.Icon({
  iconUrl: "/icons/artisan-marker.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface ArtisanMapProps {
  artisans: Artisan[];
  userCoords?: { lat: number; lng: number }; // added to show user location
}

export default function ArtisanMap({ artisans, userCoords }: ArtisanMapProps) {
  const navigate = useNavigate();
  const defaultCenter: [number, number] = [6.5244, 3.3792];
  const firstLocation = artisans[0]?.location?.coordinates;
  const center: [number, number] = userCoords
    ? [userCoords.lat, userCoords.lng]
    : firstLocation
    ? [firstLocation[1], firstLocation[0]]
    : defaultCenter;

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "500px", width: "500px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* User marker */}
      {userCoords && (
        <Marker
          position={[userCoords.lat, userCoords.lng]}
          icon={userIcon}
        >
          <Popup>You are here</Popup>
        </Marker>
      )}

      {/* Artisan markers */}
      {artisans.map((artisan) => {
        const coords = artisan.location?.coordinates;
        if (!coords) return null;

        const position: [number, number] = [coords[1], coords[0]];
        return (
          <Marker key={artisan._id} position={position} icon={artisanIcon}>
            <Popup>
              <div
                onClick={() => navigate(`/artisan/${artisan._id}`)}
                className="cursor-pointer"
              >
                <p className="font-bold">{artisan.fullName}</p>
                <p>{artisan.tradeType}</p>
                <p>{artisan.rating} ★</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
