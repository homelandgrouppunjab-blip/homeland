import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const goldIcon = L.divIcon({
  className: "",
  html: '<div class="lux-pin"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export const ProjectMap = ({ points = [], center, zoom = 11, height = "420px", onSelect }) => {
  const valid = points.filter((p) => p.map_lat && p.map_lng);
  const c = center || (valid.length ? [valid[0].map_lat, valid[0].map_lng] : [30.7046, 76.7179]);

  return (
    <div className="rounded-2xl overflow-hidden hairline shadow-[var(--shadow-soft)]" style={{ height }} data-testid="project-map">
      <MapContainer center={c} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
        />
        {valid.map((p, i) => (
          <Marker key={i} position={[p.map_lat, p.map_lng]} icon={goldIcon}
            eventHandlers={{ click: () => onSelect && onSelect(p) }}>
            <Popup>
              <div style={{ minWidth: 160 }}>
                <strong style={{ color: "#D4AF37" }}>{p.name}</strong>
                <div style={{ fontSize: 12, marginTop: 4 }}>{p.location}</div>
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.8 }}>{p.status} · {p.type}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ProjectMap;
