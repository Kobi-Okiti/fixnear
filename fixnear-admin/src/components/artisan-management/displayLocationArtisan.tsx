import { useEffect, useState } from "react";
import { reverseGeocode } from "../../utils/geocoding";

interface DisplayLocationProps {
  coordinates?: number[];
}

const DisplayLocation: React.FC<DisplayLocationProps> = ({ coordinates }) => {
  const [address, setAddress] = useState("Loading...");

  useEffect(() => {
    if (coordinates && coordinates.length === 2) {
      reverseGeocode(coordinates[1], coordinates[0])
        .then(setAddress)
        .catch(() => setAddress("Unknown"));
    } else {
      setAddress("Unknown");
    }
  }, [coordinates]);

  return <p className="">{address}</p>;
};

export default DisplayLocation;
