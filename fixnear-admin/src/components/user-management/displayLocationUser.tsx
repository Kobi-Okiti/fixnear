import { useEffect, useState } from "react";
import { reverseGeocode } from "../../utils/geocoding";

interface DisplayLocationProps {
  coordinates?: { lat: number; lng: number };
}

const DisplayLocation: React.FC<DisplayLocationProps> = ({ coordinates }) => {
  const [address, setAddress] = useState("Loading...");

  useEffect(() => {
    if (coordinates && typeof coordinates.lat === "number" && typeof coordinates.lng === "number") {
      reverseGeocode(coordinates.lat, coordinates.lng)
        .then(setAddress)
        .catch(() => setAddress("Unknown"));
    } else {
      setAddress("Unknown");
    }
  }, [coordinates]);

  return <p>{address}</p>;
};

export default DisplayLocation;
