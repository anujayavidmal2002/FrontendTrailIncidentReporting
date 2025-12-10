import React, { useState, useRef, useEffect } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import {
  Camera,
  Loader,
  Crosshair,
  ImagePlus,
  CheckCircle,
  AlertCircle,
  MapPin,
} from "lucide-react";

// Helper function to get API URL from window.config
function getApiUrl() {
  if (typeof window !== "undefined" && window.config && window.config.resourceServerURL) {
    return window.config.resourceServerURL;
  }s
  console.warn("window.config.resourceServerURL not found; using fallback /api");
  return "/api";
}

const API_URL = getApiUrl();
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import * as exifr from "exifr";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Ensure Leaflet marker icons load correctly in bundled builds
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// EXIF GPS extraction - checks for EXIF data in image
async function extractExifGps(file) {
  try {
    const exif = await exifr.parse(file, { gps: true });
    console.log(`🔍 Raw EXIF data for ${file.name}:`, exif);
    // ...existing GPS extraction logic...
    if (
      exif &&
      (exif.latitude !== undefined || exif.GPSLatitude !== undefined)
    ) {
      // Try modern format first (latitude/longitude)
      let lat = exif.latitude;
      let lng = exif.longitude;
      // Fallback to GPSLatitude/GPSLongitude
      if (lat === undefined && exif.GPSLatitude !== undefined) {
        lat = exif.GPSLatitude;
        lng = exif.GPSLongitude;
      }
      // Convert to numbers
      const latNum = typeof lat === "number" ? lat : parseFloat(lat);
      const lngNum = typeof lng === "number" ? lng : parseFloat(lng);
      console.log(`📍 Extracted coordinates: lat=${latNum}, lng=${lngNum}`);
      if (!isNaN(latNum) && !isNaN(lngNum) && latNum !== 0 && lngNum !== 0) {
        console.log(`✓ Valid GPS found in ${file.name}:`, {
          lat: latNum,
          lng: lngNum,
        });
        return { lat: latNum, lng: lngNum };
      } else {
        console.warn(`⚠️ Invalid GPS coordinates in ${file.name}:`, {
          lat: latNum,
          lng: lngNum,
        });
      }
    }
    console.log(`✗ No GPS data in ${file.name}`);
    return null;
  } catch (err) {
    console.warn(`❌ Error extracting EXIF from ${file.name}:`, err.message);
    return null;
  }
}

// Reverse geocoding function - converts GPS to location name
async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10&addressdetails=1`
    );
    if (!response.ok) throw new Error("Reverse geocoding failed");
    const data = await response.json();
    return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (err) {
    console.error("Reverse geocoding error:", err);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

const INCIDENT_TYPES = [
  "Fallen trees blocking trail",
  "Broken or unstable bridges",
  "Erosion or collapsed sections",
  "Slippery or muddy sections",
  "Other hazard",
];
const SEVERITIES = [
  { label: "Low", value: "Low", color: "bg-hazardLow" },
  { label: "Medium", value: "Medium", color: "bg-hazardMedium" },
  { label: "High", value: "High", color: "bg-hazardHigh" },
];

const LOCATION_MODES = {
  GPS_OR_TEXT: "gps_or_text",
  PHOTO_METADATA: "photo_metadata",
};

export default function IncidentForm() {
  const { getAccessToken } = useAuthContext();
  const fileRef = useRef();
  const [form, setForm] = useState({
    type: INCIDENT_TYPES[0],
    severity: "Low",
    description: "",
    photos: [],
  });
  const [locationMode, setLocationMode] = useState(LOCATION_MODES.GPS_OR_TEXT);
  const [coords, setCoords] = useState(null); // { lat, lng }
  const [locationText, setLocationText] = useState(""); // Human-readable text
  const [latInput, setLatInput] = useState(""); // manual / auto latitude
  const [lngInput, setLngInput] = useState(""); // manual / auto longitude
  const [geo, setGeo] = useState({ loading: false, error: "", success: false });
  const [address, setAddress] = useState("");
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [exifGps, setExifGps] = useState(null); // GPS extracted from photo EXIF
  const [extractingExif, setExtractingExif] = useState(false);
  const [photoExifData, setPhotoExifData] = useState({}); // { [filename]: { hasGPS: bool, lat: num, lng: num } }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handlePhoto(e) {
    const files = Array.from(e.target.files || []);
    setForm((f) => ({ ...f, photos: files }));
    setPreviews(
      files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }))
    );

    // Log file info for debugging
    console.log(
      `Selected ${files.length} photo(s):`,
      files.map((f) => ({ name: f.name, size: f.size, type: f.type }))
    );

    // Extract EXIF data from all photos
    setExtractingExif(true);
    const exifDataMap = {};
    let firstPhotoWithGps = null;

    Promise.all(
      files.map(async (file) => {
        const gpsData = await extractExifGps(file);
        if (gpsData) {
          exifDataMap[file.name] = {
            hasGPS: true,
            lat: gpsData.lat,
            lng: gpsData.lng,
          };
          if (!firstPhotoWithGps) {
            firstPhotoWithGps = gpsData;
            setExifGps(gpsData);
          }
        } else {
          exifDataMap[file.name] = { hasGPS: false };
        }
        return gpsData;
      })
    ).then(() => {
      setPhotoExifData(exifDataMap);
      setExtractingExif(false);
      console.log("EXIF extraction complete:", exifDataMap);
    });
  }

  function handleSeverity(sev) {
    setForm((f) => ({ ...f, severity: sev }));
  }

  function getCurrentLocation() {
    setGeo({ loading: true, error: "", success: false });
    if (!navigator.geolocation) {
      setGeo({ loading: false, error: "Geolocation is not supported." });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        setLatInput(String(lat));
        setLngInput(String(lng));
        // Reverse geocoding with Nominatim for address
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await resp.json();
          const text = data.display_name || "";
          setAddress(text);
          setLocationText(text);
          setGeo({ loading: false, error: "", success: true });
        } catch {
          setGeo({
            loading: false,
            error: "Reverse geocoding failed.",
            success: false,
          });
        }
      },
      (err) => {
        setGeo({ loading: false, error: err.message, success: false });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function tryUpdateCoords(nextLat, nextLng) {
    const lat = parseFloat(nextLat);
    const lng = parseFloat(nextLng);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      setCoords({ lat, lng });
      setGeo((g) => ({ ...g, success: true, error: "" }));
    }
  }

  function handleLocationTextChange(value) {
    setLocationText(value);
    // Try to extract coordinates from things like Google Maps URLs or "lat,lng" snippets
    const match = value.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
    if (match) {
      const lat = match[1];
      const lng = match[2];
      setLatInput(lat);
      setLngInput(lng);
      tryUpdateCoords(lat, lng);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validate required fields
    if (!form.description || form.description.trim().length === 0) {
      setToast({ msg: "Please provide a description", type: "error" });
      setTimeout(() => setToast({}), 4000);
      return;
    }

    // Validate location based on mode
    const hasLocationText = locationText && locationText.trim().length > 0;
    const lat = latInput || (coords && coords.lat);
    const lng = lngInput || (coords && coords.lng);
    const hasCoords =
      lat !== undefined && lat !== "" && lng !== undefined && lng !== "";

    // In photo metadata mode, we need a photo with GPS (location extracted automatically)
    if (locationMode === LOCATION_MODES.PHOTO_METADATA) {
      if (!form.photos || form.photos.length === 0) {
        setToast({
          msg: "Please upload at least one photo with GPS metadata",
          type: "error",
        });
        setTimeout(() => setToast({}), 4000);
        return;
      }
      // Photo MUST have GPS data - no manual entry allowed in this mode
      // Also validate that GPS coordinates are valid numbers
      const latNum = exifGps ? parseFloat(exifGps.lat) : NaN;
      const lngNum = exifGps ? parseFloat(exifGps.lng) : NaN;

      if (
        !exifGps ||
        isNaN(latNum) ||
        isNaN(lngNum) ||
        latNum === 0 ||
        lngNum === 0
      ) {
        setToast({
          msg: 'Photo has no valid GPS data. Please use a geotagged photo or switch to "Use GPS / Text" mode',
          type: "error",
        });
        setTimeout(() => setToast({}), 4000);
        return;
      }
    } else {
      // GPS/Text mode requires location text (mandatory)
      if (!hasLocationText) {
        setToast({
          msg: "Please provide a location description (trail name, landmark, or nearest town)",
          type: "error",
        });
        setTimeout(() => setToast({}), 4000);
        return;
      }
    }

    setSubmitting(true);
    setToast({ msg: "Submitting incident...", type: "" });

    const data = new FormData();
    data.append("type", form.type);
    data.append("severity", form.severity);
    data.append("description", form.description);
    data.append("locationText", locationText);
    data.append("locationMode", locationMode);

    // Append coordinates if available from manual input
    if (hasCoords) {
      data.append("latitude", lat);
      data.append("longitude", lng);
    }
    // IMPORTANT: In photo metadata mode, also send any detected EXIF GPS
    else if (locationMode === LOCATION_MODES.PHOTO_METADATA && exifGps) {
      // Only send if GPS data is valid
      const latNum = parseFloat(exifGps.lat);
      const lngNum = parseFloat(exifGps.lng);
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        console.log("📸 Sending detected EXIF GPS to backend:", exifGps);
        data.append("latitude", exifGps.lat);
        data.append("longitude", exifGps.lng);
      } else {
        console.warn("⚠️ EXIF GPS data is invalid, not sending:", exifGps);
      }
    }

    if (form.photos && form.photos.length) {
      form.photos.forEach((file) => data.append("photos", file));
    }

    try {
      const token = await getAccessToken();
      // Use /api/incidents; the fetch interceptor will prepend the backend URL
      const r = await fetch(`${window.config.resourceServerURL}/api/incidents`, {
  method: "POST",
  body: data,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error || "Submission failed");
      }
      const savedIncident = await r.json();

      // Show success with location info if available
      let successMsg = "Incident reported successfully!";
      if (savedIncident.latitude && savedIncident.longitude) {
        successMsg += ` Location: ${savedIncident.latitude.toFixed(
          6
        )}, ${savedIncident.longitude.toFixed(6)}`;
      }

      setToast({ msg: successMsg, type: "success" });

      // Dispatch event to notify other components (like AdminDashboard) to refresh
      window.dispatchEvent(
        new CustomEvent("incidentSubmitted", { detail: savedIncident })
      );
      console.log("📢 Dispatched incidentSubmitted event");

      setForm({
        type: INCIDENT_TYPES[0],
        severity: "Low",
        description: "",
        photos: [],
      });
      setPreviews([]);
      setCoords(null);
      setLatInput("");
      setLngInput("");
      setGeo({ loading: false, error: "", success: false });
      setLocationText("");
      setAddress("");
      setExifGps(null);
      setPhotoExifData({});
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setToast({ msg: err.message, type: "error" });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast({}), 4000);
    }
  }

  return (
    <form
      className="bg-white rounded-lg shadow-md p-6 w-full max-w-xl mx-auto animate-fade"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
        <Camera size={28} /> Report Trail Hazard
      </h2>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Incident Type</label>
        <select
          name="type"
          className="w-full border rounded px-3 py-2 focus:outline-primary"
          value={form.type}
          onChange={handleChange}
        >
          {INCIDENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <label className="font-semibold">
            Location{" "}
            {locationMode === LOCATION_MODES.GPS_OR_TEXT && (
              <span className="text-red-600">*</span>
            )}
          </label>
          <div className="inline-flex rounded-full bg-green-100 p-1 shadow-inner border border-green-200">
            <button
              type="button"
              className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                locationMode === LOCATION_MODES.GPS_OR_TEXT
                  ? "bg-white shadow text-primary"
                  : "text-green-800 hover:text-primary"
              }`}
              onClick={() => setLocationMode(LOCATION_MODES.GPS_OR_TEXT)}
            >
              Use GPS / Text
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                locationMode === LOCATION_MODES.PHOTO_METADATA
                  ? "bg-white shadow text-primary"
                  : "text-green-800 hover:text-primary"
              }`}
              onClick={() => setLocationMode(LOCATION_MODES.PHOTO_METADATA)}
            >
              Photo Metadata
            </button>
          </div>
        </div>

        {locationMode === LOCATION_MODES.GPS_OR_TEXT ? (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center flex-wrap">
              <button
                type="button"
                onClick={getCurrentLocation}
                className="px-3 py-1 bg-primary text-white rounded flex items-center gap-1 shadow hover:bg-primary-dark disabled:opacity-60"
                disabled={geo.loading}
                title="Get GPS coordinates"
              >
                <Crosshair size={16} />{" "}
                {geo.loading ? "Locating..." : "Use My Current Location"}
              </button>
              {geo.error && (
                <span className="text-xs text-red-700">{geo.error}</span>
              )}
              {geo.success && (
                <span className="text-xs text-green-700">
                  Location locked (hidden coords)
                </span>
              )}
              {extractingExif && (
                <span className="text-xs text-blue-700 animate-pulse">
                  Reading photo metadata...
                </span>
              )}
            </div>
            {coords && (
              <MapContainer
                center={[coords.lat, coords.lng]}
                zoom={16}
                scrollWheelZoom={false}
                className="h-36 w-full rounded shadow border"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; <a href='https://osm.org/copyright'>OpenStreetMap</a> contributors"
                />
                <Marker position={[coords.lat, coords.lng]} />
              </MapContainer>
            )}
            <input
              type="text"
              placeholder="Describe the spot (trail name, landmark, nearest town) *Required"
              className="w-full border px-3 py-2 rounded focus:outline-primary"
              value={locationText}
              onChange={(e) => handleLocationTextChange(e.target.value)}
              required
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {exifGps && (
              <div className="p-3 rounded border border-green-200 bg-green-50 text-sm text-green-900 shadow-sm flex items-start gap-2">
                <MapPin
                  size={20}
                  className="text-green-700 flex-shrink-0 mt-0.5"
                />
                <div>
                  <strong>✓ Location detected from photo!</strong>
                  <div className="text-xs mt-1 opacity-75">
                    GPS: {exifGps.lat.toFixed(6)}, {exifGps.lng.toFixed(6)}
                  </div>
                </div>
              </div>
            )}
            {!exifGps && form.photos && form.photos.length > 0 && (
              <div className="p-3 rounded border border-amber-200 bg-amber-50 text-sm text-amber-900 shadow-sm flex items-start gap-2">
                <AlertCircle
                  size={20}
                  className="text-amber-700 flex-shrink-0 mt-0.5"
                />
                <div>
                  <strong>No GPS data found in photo</strong>
                  <div className="text-xs mt-1">
                    Please use a photo taken with location services enabled, or
                    switch to "Use GPS / Text" mode to enter location manually.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mb-4 flex flex-col sm:flex-row items-center gap-2">
        <label className="font-semibold">Severity</label>
        <div className="flex gap-2 mt-1">
          {SEVERITIES.map((s) => (
            <button
              key={s.value}
              type="button"
              className={`px-4 py-1 rounded-full font-medium ${
                s.color
              } text-white shadow border-2 transition-all duration-150 ${
                form.severity === s.value
                  ? "border-green-900 scale-110"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
              onClick={() => handleSeverity(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">
          Description <span className="text-red-600">*</span>
        </label>
        <textarea
          name="description"
          required
          className="w-full border rounded px-3 py-2 focus:outline-primary min-h-[70px]"
          value={form.description}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label className="flex mb-1 font-semibold items-center gap-2">
          <ImagePlus size={16} /> Photos (up to 5, optional)
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="mb-2"
          onChange={handlePhoto}
        />
        {extractingExif && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 flex items-center gap-2">
            <Loader size={14} className="animate-spin" />
            Analyzing photos for GPS metadata...
          </div>
        )}
        {previews.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-3">
            {previews.map((p, idx) => {
              const exifInfo = photoExifData[p.name];
              const hasGPS = exifInfo?.hasGPS;
              return (
                <div
                  key={p.url}
                  className="flex flex-col items-center gap-1 relative"
                >
                  <div className="relative">
                    <img
                      src={p.url}
                      alt={p.name}
                      className="h-20 w-20 object-cover rounded shadow border"
                    />
                    {locationMode === LOCATION_MODES.PHOTO_METADATA && (
                      <div
                        className={`absolute top-0 right-0 rounded-full p-1 text-white ${
                          hasGPS ? "bg-green-500" : "bg-red-500"
                        }`}
                        title={
                          hasGPS && exifInfo?.lat && exifInfo?.lng
                            ? `✓ GPS found: ${Number(exifInfo.lat).toFixed(
                                4
                              )}, ${Number(exifInfo.lng).toFixed(4)}`
                            : "✗ No GPS data in this photo"
                        }
                      >
                        {hasGPS ? (
                          <MapPin size={12} />
                        ) : (
                          <AlertCircle size={12} />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-gray-700 max-w-[80px] block truncate">
                      {p.name}
                    </span>
                    {locationMode === LOCATION_MODES.PHOTO_METADATA &&
                      exifInfo && (
                        <span
                          className={`text-[9px] font-semibold ${
                            hasGPS ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {hasGPS ? "✓ GPS" : "✗ No GPS"}
                        </span>
                      )}
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              className="text-xs text-red-700 self-start"
              onClick={() => {
                setForm((f) => ({ ...f, photos: [] }));
                setPreviews([]);
                setExifGps(null);
                setPhotoExifData({});
                if (fileRef.current) fileRef.current.value = "";
              }}
            >
              Clear
            </button>
          </div>
        )}
      </div>
      <button
        type="submit"
        className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded font-semibold transition shadow flex items-center gap-2 disabled:opacity-60"
        disabled={submitting}
      >
        {submitting ? <Loader className="animate-spin" size={18} /> : null}
        Submit
      </button>
      {!!toast.msg && (
        <div
          className={`fixed left-1/2 -translate-x-1/2 bottom-8 z-50 p-4 min-w-[220px] text-center rounded shadow-lg ${
            toast.type === "success"
              ? "bg-green-200 text-green-900"
              : "bg-red-300 text-red-900"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </form>
  );
}
