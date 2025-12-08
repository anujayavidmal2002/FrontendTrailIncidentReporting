import React, { useEffect, useState } from "react";
import { API_URL } from "./App";
import {
  Image as ImageIcon,
  MapPin,
  ListChecks,
  BadgeCheck,
  CalendarClock,
  CheckCircle,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Ensure Leaflet can find marker assets when bundled
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const SEVERITY_STYLES = {
  Low: "bg-hazardLow text-gray-800",
  Medium: "bg-hazardMedium text-white",
  High: "bg-hazardHigh text-white",
};

// Custom colored markers based on severity
const MARKER_COLORS = {
  Low: "#95d5b2", // Light green
  Medium: "#ffd60a", // Yellow
  High: "#e63946", // Red
};

function createCustomMarker(severity) {
  const color = MARKER_COLORS[severity] || "#95d5b2";
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 14px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        ">${severity.charAt(0)}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

const STATUS_COLORS = {
  Open: "bg-amber-100 text-amber-800 border border-amber-300",
  Resolved: "bg-green-100 text-green-800 border border-green-300",
};

function buildMapsLink(incident) {
  const lat = incident.latitude;
  const lng = incident.longitude;
  const locationText = incident.locationText || incident.location;

  // Check if we have numeric coordinates - parse them if they're strings
  const latNum = typeof lat === "number" ? lat : parseFloat(lat);
  const lngNum = typeof lng === "number" ? lng : parseFloat(lng);

  if (!Number.isNaN(latNum) && !Number.isNaN(lngNum)) {
    return {
      url: `https://www.google.com/maps?q=${latNum},${lngNum}`,
      hasLocation: true,
      kind: "gps",
    };
  }

  // Check if we have location text
  if (
    locationText &&
    typeof locationText === "string" &&
    locationText.trim().length > 0
  ) {
    return {
      url: `https://www.google.com/maps/search/${encodeURIComponent(
        locationText
      )}`,
      hasLocation: true,
      kind: "text",
    };
  }

  return null;
}

function SeverityBadge({ severity }) {
  return (
    <span
      className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm uppercase tracking-wide ${
        SEVERITY_STYLES[severity] || "bg-gray-200"
      }`}
    >
      {severity}
    </span>
  );
}
function StatusBadge({ status }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
        STATUS_COLORS[status] || "bg-gray-100"
      }`}
    >
      {status}
    </span>
  );
}

function MapAutoView({ incidents, selectedId }) {
  const map = useMap();

  useEffect(() => {
    if (!incidents.length) return;

    const target = selectedId
      ? incidents.find((i) => i.id === selectedId)
      : null;

    if (target) {
      const center = [target.latitude, target.longitude];
      map.setView(center, 14, { animate: true });
    } else {
      const bounds = L.latLngBounds(
        incidents.map((i) => [i.latitude, i.longitude])
      );
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [incidents, selectedId, map]);

  return null;
}

const INCIDENT_TYPES = [
  "Fallen trees blocking trail",
  "Broken or unstable bridges",
  "Erosion or collapsed sections",
  "Slippery or muddy sections",
  "Other hazard",
];

export default function AdminDashboard() {
  const [allIncidents, setAllIncidents] = useState([]);
  const [severity, setSeverity] = useState("All");
  const [incidentType, setIncidentType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [updateloading, setUpdateloading] = useState(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);

  async function fetchIncidents() {
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/incidents`);
      const data = await r.json();
      setAllIncidents(data);
      console.log("✅ Fetched", data.length, "incidents from API");
      // Debug: Show first incident's location data
      if (data.length > 0) {
        console.log("🔍 First incident location data:", {
          id: data[0]._id,
          latitude: data[0].latitude,
          longitude: data[0].longitude,
          locationText: data[0].locationText,
          location: data[0].location,
          hasPhotos: !!(data[0].photos && data[0].photos.length),
        });
      }
    } catch (err) {
      console.error("Failed to fetch incidents:", err);
      setAllIncidents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIncidents();

    // Listen for new incident submissions from IncidentForm
    const handleIncidentSubmitted = (event) => {
      console.log(
        "📢 Received incidentSubmitted event, refreshing incidents..."
      );
      fetchIncidents();
    };

    window.addEventListener("incidentSubmitted", handleIncidentSubmitted);
    return () =>
      window.removeEventListener("incidentSubmitted", handleIncidentSubmitted);
  }, []);

  function filteredIncidents() {
    const filtered = allIncidents.filter((i) => {
      const matchesSeverity = severity === "All" || i.severity === severity;
      const matchesType = incidentType === "All" || i.type === incidentType;
      return matchesSeverity && matchesType;
    });

    const sorted = filtered.sort((a, b) => {
      // First priority: Open incidents come before Resolved
      if (a.status === "Open" && b.status === "Resolved") return -1;
      if (a.status === "Resolved" && b.status === "Open") return 1;

      // Second priority: Sort by creation date (newest first within same status)
      const dateA = new Date(a.createdAt || a.date);
      const dateB = new Date(b.createdAt || b.date);
      return dateB - dateA; // Descending order (newest first)
    });

    // Debug logging
    const openCount = sorted.filter((i) => i.status === "Open").length;
    const resolvedCount = sorted.filter((i) => i.status === "Resolved").length;
    console.log(
      `📊 Filtered incidents - Open: ${openCount}, Resolved: ${resolvedCount}`
    );
    console.log(
      `📋 Sort order:`,
      sorted.map((i, idx) => `${idx + 1}. ${i.type} (${i.status})`).join(", ")
    );

    return sorted;
  }

  async function handleStatusChange(id, status) {
    console.log(`🔄 Updating incident ${id} status to: ${status}`);
    setUpdateloading(id);
    try {
      const response = await fetch(`${API_URL}/incidents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const updatedIncident = await response.json();
      console.log(`✅ Status updated successfully:`, updatedIncident);
      await fetchIncidents();
      console.log(`🔃 Incidents list refreshed after status change`);
    } catch (error) {
      console.error(`❌ Error updating status:`, error);
    } finally {
      setUpdateloading(null);
    }
  }

  const incidentsWithCoords = filteredIncidents()
    .map((inc) => {
      const lat =
        typeof inc.latitude === "number"
          ? inc.latitude
          : parseFloat(inc.latitude);
      const lng =
        typeof inc.longitude === "number"
          ? inc.longitude
          : parseFloat(inc.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
      return { ...inc, latitude: lat, longitude: lng };
    })
    .filter(Boolean);

  const defaultCenter = incidentsWithCoords.length
    ? [incidentsWithCoords[0].latitude, incidentsWithCoords[0].longitude]
    : [20, 0];

  const visibleMarkers = selectedIncidentId
    ? incidentsWithCoords.filter((i) => i.id === selectedIncidentId)
    : incidentsWithCoords;

  return (
    <section>
      <div className="flex justify-between items-center mb-4 gap-3">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <ListChecks size={24} /> Admin Dashboard
        </h2>
        <div className="flex gap-3">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1 font-medium">
              Incident Type
            </label>
            <select
              className="rounded border px-3 py-2 focus:outline-primary bg-white font-medium text-sm min-w-[200px] shadow-sm hover:border-green-500 transition"
              value={incidentType}
              onChange={(e) => {
                setIncidentType(e.target.value);
                setSelectedIncidentId(null);
              }}
            >
              <option value="All">All Types</option>
              {INCIDENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1 font-medium">
              Severity Level
            </label>
            <select
              className="rounded border px-3 py-2 focus:outline-primary bg-white font-medium text-sm shadow-sm hover:border-green-500 transition"
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value);
                setSelectedIncidentId(null);
              }}
            >
              <option value="All">All Severities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6">
        {loading ? (
          <div className="text-center p-8 text-primary animate-pulse bg-green-50 rounded-lg shadow">
            Loading map...
          </div>
        ) : incidentsWithCoords.length === 0 ? (
          <div className="text-center p-10 text-sm text-green-900 bg-green-100 rounded-lg shadow">
            No incidents with map coordinates yet. New reports with GPS will
            appear here 🌍
          </div>
        ) : (
          <MapContainer
            center={defaultCenter}
            zoom={5}
            style={{ height: "380px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapAutoView
              incidents={incidentsWithCoords}
              selectedId={selectedIncidentId}
            />
            {visibleMarkers.map((inc) => (
              <Marker
                key={inc.id}
                position={[inc.latitude, inc.longitude]}
                icon={createCustomMarker(inc.severity)}
              >
                <Popup>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-primary">{inc.type}</h3>
                    <p>
                      <strong>Date:</strong> {inc.date} {inc.time}
                    </p>
                    <p>
                      <strong>Description:</strong> {inc.description}
                    </p>
                    <p>
                      <strong>Severity:</strong>{" "}
                      <SeverityBadge severity={inc.severity} />
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <StatusBadge status={inc.status} />
                    </p>
                    {((inc.photos && inc.photos.length) || inc.photoUrl) && (
                      <div className="flex items-center gap-2 mt-2">
                        <ImageIcon size={16} className="text-green-800" />
                        <img
                          src={
                            (inc.photos && inc.photos[0]?.url) || inc.photoUrl
                          }
                          alt="Incident"
                          className="rounded shadow border max-h-20 object-cover"
                        />
                        {inc.photos && inc.photos.length > 1 && (
                          <span className="text-xs text-gray-700">
                            +{inc.photos.length - 1} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
        {selectedIncidentId && incidentsWithCoords.length > 1 && (
          <div className="mt-2 text-right">
            <button
              className="text-xs text-blue-700 underline"
              onClick={() => setSelectedIncidentId(null)}
            >
              Show all incidents on map
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {loading ? (
          <div className="col-span-2 text-center p-12 text-primary animate-pulse">
            Loading incidents...
          </div>
        ) : filteredIncidents().length === 0 ? (
          <div className="col-span-2 text-center p-10 text-xl text-green-900 bg-green-100 rounded-lg shadow">
            No incidents reported yet 🌱
          </div>
        ) : (
          filteredIncidents().map((inc) => (
            <div
              key={inc.id}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-4 transition-all duration-300 hover:shadow-2xl border-l-[6px]"
              style={{
                borderColor:
                  SEVERITY_STYLES[inc.severity]
                    ?.split(" ")[0]
                    .replace("bg-", "#") || "#b7e4c7",
              }}
            >
              {/* Header Section */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <BadgeCheck
                    size={22}
                    className="text-primary flex-shrink-0"
                  />
                  <span>{inc.type}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <SeverityBadge severity={inc.severity} />
                  <StatusBadge status={inc.status} />
                </div>
              </div>

              {/* Date/Time Section */}
              <div className="flex items-center gap-2 text-sm text-gray-600 -mt-2">
                <CalendarClock size={16} className="flex-shrink-0" />
                <span>
                  {inc.date} • {inc.time}
                </span>
              </div>

              {/* Description Section */}
              <div className="text-gray-700 text-[15px] leading-relaxed border-l-2 border-gray-200 pl-4 py-1">
                {inc.description}
              </div>

              {/* Photos Section */}
              {(inc.photos && inc.photos.length) || inc.photoUrl ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <ImageIcon size={16} className="text-primary" />
                    <span>
                      {inc.photos && inc.photos.length > 1
                        ? `${inc.photos.length} Photos`
                        : "Photo"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {inc.photos && inc.photos.length ? (
                      inc.photos
                        .slice(0, 3)
                        .map((p, idx) => (
                          <img
                            key={p.url || idx}
                            src={p.url}
                            alt={p.name || "Incident"}
                            className="rounded-lg shadow-sm border-2 border-gray-200 h-28 w-28 object-cover hover:scale-105 transition-transform cursor-pointer"
                          />
                        ))
                    ) : (
                      <img
                        src={inc.photoUrl}
                        alt="Incident"
                        className="rounded-lg shadow-sm border-2 border-gray-200 h-28 w-28 object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    )}
                    {inc.photos && inc.photos.length > 3 && (
                      <div className="flex items-center justify-center h-28 w-28 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-600 text-sm font-medium">
                        +{inc.photos.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
              {/* Action Buttons Section */}
              <div className="flex flex-wrap gap-3 mt-2 pt-4 border-t-2 border-gray-100">
                {(() => {
                  const maps = buildMapsLink(inc);
                  if (maps) {
                    return (
                      <a
                        href={maps.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 min-w-[140px] px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                        title="Open location in Google Maps"
                      >
                        <MapPin size={18} /> View Location
                      </a>
                    );
                  }
                  return (
                    <span className="flex-1 min-w-[140px] px-5 py-2.5 rounded-lg bg-gray-200 text-gray-500 text-sm font-semibold flex items-center justify-center gap-2">
                      <MapPin size={18} /> No Location
                    </span>
                  );
                })()}
                {inc.status === "Open" && (
                  <button
                    className="flex-1 min-w-[140px] px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    disabled={updateloading === inc.id}
                    onClick={() => handleStatusChange(inc.id, "Resolved")}
                  >
                    {updateloading === inc.id ? (
                      <>
                        <CheckCircle size={18} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Mark Resolved
                      </>
                    )}
                  </button>
                )}
                {inc.status === "Resolved" && (
                  <span className="flex-1 min-w-[140px] px-5 py-2.5 rounded-lg bg-green-100 text-green-800 text-sm font-semibold flex items-center justify-center gap-2 border-2 border-green-300">
                    <CheckCircle size={18} />
                    Resolved
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
