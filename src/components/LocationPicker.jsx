
import { MapContainer, TileLayer, useMapEvents, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function MapClick({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

function LocationPicker({ position, onSelect }) {
  return (
    <div className="location-picker">
      <p>Click the map to mark the exact issue location.</p>

      <MapContainer
        center={
          position
            ? [position.latitude, position.longitude]
            : [22.9734, 78.6569]
        }
        zoom={position ? 15 : 5}
        className="location-picker-map"
        key={position ? "selected" : "default"}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClick onSelect={onSelect} />

        {position && (
          <CircleMarker
            center={[position.latitude, position.longitude]}
            radius={9}
            pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.8 }}
          >
            <Popup>Selected issue location</Popup>
          </CircleMarker>
        )}
      </MapContainer>

      {position && (
        <p>
          Selected: {position.latitude.toFixed(5)},{" "}
          {position.longitude.toFixed(5)}
          {" "}
          <button type="button" onClick={() => onSelect(null)}>
            Clear location
          </button>
        </p>
      )}
    </div>
  );
}

export default LocationPicker;
