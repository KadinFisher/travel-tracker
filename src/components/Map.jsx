import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

import styles from "./Map.module.css";
import { useEffect, useState } from "react";
import { useCities } from "../contexts/CitiesContext";
import { useGeolocation } from "../hooks/useGeolocation";
import { useUrlPosition } from "../hooks/useUrlPosition";
import Button from "./Button";

function Map() {
  const { cities } = useCities(); // Access visited cities from context
  const [mapPosition, setMapPosition] = useState([40, 0]); // Default position
  const { position: geolocationPosition, getPosition, isLoading: isLoadingPosition } = useGeolocation();
  const [lat, lng] = useUrlPosition();
  const navigate = useNavigate();

  useEffect(() => {
    if (lat && lng) {
      setMapPosition([lat, lng]); // Update map center using URL position
    } else if (geolocationPosition) {
      setMapPosition([geolocationPosition.latitude, geolocationPosition.longitude]); // Update map center using geolocation
    }
  }, [lat, lng, geolocationPosition]);

  const handleMapClick = (e) => {
    setMapPosition([e.latlng.lat, e.latlng.lng]); // Center map on click
    console.log(`Modal opened at coordinates: [${e.latlng.lat}, ${e.latlng.lng}]`);
  };

  return (
    <div className={styles.mapContainer}>
      <Button type="position" onClick={getPosition}>
        {isLoadingPosition ? "Loading..." : "Use your position"}
      </Button>

      <MapContainer
        center={mapPosition}
        zoom={6}
        scrollWheelZoom={true}
        className={styles.map}
        onClick={handleMapClick}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />

        {/* Render markers only for cities with valid position data */}
        {cities.map((city) => {
          if (!city.position || city.position.lat === undefined || city.position.lng === undefined) {
            console.error(`City ${city.id} has invalid position data:`, city);
            return null;
          }

          return (
            <Marker
              position={[city.position.lat, city.position.lng]}
              key={city.id}
              eventHandlers={{
                click: () => {
                  navigate(`/app/cities/${city.id}`); // Navigate to the city's detailed page
                },
              }}
            >
              <Popup>
                <div>
                  <span>{city.emoji}</span> <span>{city.cityName}</span>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <ChangeCenter position={mapPosition} />
        <DetectClick />
      </MapContainer>
    </div>
  );
}

function ChangeCenter({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position); // Update map view when position changes
    }
  }, [position, map]);

  return null;
}

function DetectClick() {
  const navigate = useNavigate();

  useMapEvents({
    click: (e) => {
      navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`); // Navigate with lat/lng in URL
    },
  });

  return null;
}

export default Map;