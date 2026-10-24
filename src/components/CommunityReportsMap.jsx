import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { db } from "../services/firebase";

const statuses = ["All statuses", "Pending", "In Progress", "Escalated", "Resolved"];
const severities = ["All severities", "Critical", "High", "Medium", "Low", "Unrated"];

const sampleReports = [
  {
    id: "sample-pothole",
    title: "Deep pothole beside the central bus stop",
    description: "A large pothole is affecting traffic and could be hazardous to two-wheelers.",
    category: "Roads",
    location: "Central bus stop",
    latitude: 23.2599,
    longitude: 77.4126,
    severity: "High",
    aiSeverity: "High",
    status: "Pending",
    sample: true,
  },
  {
    id: "sample-water",
    title: "Water leak near the public garden",
    description: "Water has been flowing onto the footpath since this morning.",
    category: "Water Supply",
    location: "Public garden, north entrance",
    latitude: 23.2324,
    longitude: 77.4345,
    severity: "Critical",
    aiSeverity: "Critical",
    status: "In Progress",
    sample: true,
  },
  {
    id: "sample-waste",
    title: "Overflowing community waste bins",
    description: "Several bins are full and waste is spilling onto the pavement.",
    category: "Waste Management",
    location: "Market street",
    latitude: 23.2711,
    longitude: 77.4012,
    severity: "Medium",
    aiSeverity: "Medium",
    status: "Escalated",
    escalatedTo: "Municipal sanitation department",
    sample: true,
  },
  {
    id: "sample-light",
    title: "Streetlight repaired near the library",
    description: "The non-working streetlight has been repaired and checked.",
    category: "Streetlights",
    location: "Public library",
    latitude: 23.2447,
    longitude: 77.4268,
    severity: "Low",
    aiSeverity: "Low",
    status: "Resolved",
    sample: true,
  },
];

function reportSeverity(report) {
  return String(report.aiSeverity || report.severity || "Unrated").toLowerCase();
}

function reportStatus(report) {
  return String(report.status || "Pending");
}

function reportCoordinates(report) {
  if (report.latitude == null || report.longitude == null || report.latitude === "" || report.longitude === "") return null;
  const latitude = Number(report.latitude);
  const longitude = Number(report.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return [latitude, longitude];
}

function markerColors(report) {
  const severity = reportSeverity(report);
  const status = reportStatus(report).toLowerCase();
  const fillColor = severity.includes("critical") || severity.includes("high")
    ? "#df6447"
    : severity.includes("medium")
      ? "#f2a23a"
      : severity.includes("low")
        ? "#2f8f62"
        : "#71818a";
  const statusColor = status === "resolved"
    ? "#238354"
    : status === "escalated"
      ? "#7656b5"
      : status === "in progress"
        ? "#167d86"
        : "#d58a18";
  const radius = severity.includes("critical") ? 13 : severity.includes("high") ? 11 : severity.includes("medium") ? 9 : 7;

  return { fillColor, statusColor, radius };
}

function FitReports({ reports }) {
  const map = useMap();

  useEffect(() => {
    const points = reports.map(reportCoordinates).filter(Boolean);
    if (points.length === 1) map.flyTo(points[0], Math.max(map.getZoom(), 14), { duration: 0.5 });
    if (points.length > 1) map.fitBounds(points, { padding: [36, 36], maxZoom: 14 });
  }, [map, reports]);

  return null;
}

function CommunityReportsMap() {
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [severityFilter, setSeverityFilter] = useState("All severities");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const reportsQuery = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    return onSnapshot(
      reportsQuery,
      (snapshot) => {
        setReports(snapshot.docs.map((report) => ({ id: report.id, ...report.data() })));
        setError("");
        setLoading(false);
      },
      () => {
        setError("Live reports could not be loaded. Showing example reports instead.");
        setLoading(false);
      }
    );
  }, []);

  const showingSample = !loading && reports.length === 0;
  const sourceReports = showingSample ? sampleReports : reports;
  const filteredReports = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    return sourceReports.filter((report) => {
      const matchesStatus = statusFilter === "All statuses" || reportStatus(report) === statusFilter;
      const severity = reportSeverity(report);
      const matchesSeverity = severityFilter === "All severities" || severity === severityFilter.toLowerCase();
      const searchable = `${report.title || ""} ${report.category || ""} ${report.location || ""} ${report.description || ""}`.toLowerCase();
      return matchesStatus && matchesSeverity && (!searchTerm || searchable.includes(searchTerm));
    });
  }, [search, severityFilter, sourceReports, statusFilter]);
  const mappedReports = useMemo(() => filteredReports.filter((report) => reportCoordinates(report)), [filteredReports]);
  const unlocatedReports = filteredReports.length - mappedReports.length;

  return (
    <div className="community-map">
      <div className="live-report-toolbar" aria-label="Filter reports">
        <label>
          <span>Search reports</span>
          <input type="search" placeholder="Issue, category, or location" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        <label>
          <span>Severity</span>
          <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)}>
            {severities.map((severity) => <option key={severity}>{severity}</option>)}
          </select>
        </label>
        <label>
          <span>Status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {statuses.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <p className="live-report-count" aria-live="polite">
          <strong>{filteredReports.length}</strong> {filteredReports.length === 1 ? "report" : "reports"}{loading ? " loading…" : " shown"}
        </p>
      </div>

      {error && <p className="form-notice form-notice--error" role="status">{error}</p>}
      {showingSample && <p className="sample-report-notice"><strong>Sample map data</strong><span>These example reports are for preview only and are not saved to your civic report feed.</span></p>}

      <section className="live-map-panel" aria-label="Interactive community reports map">
        <div className="live-map-heading">
          <div><p className="profile-section-label">Community activity</p><h2>Reports near you</h2></div>
          <span className="live-indicator"><span aria-hidden="true" /> {showingSample ? "Map preview" : "Live updates"}</span>
        </div>
        <div className="live-map">
          <MapContainer center={[23.2599, 77.4126]} zoom={12} scrollWheelZoom className="live-map__canvas">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitReports reports={mappedReports} />
            {mappedReports.map((report) => {
              const colors = markerColors(report);
              return (
                <CircleMarker
                  key={report.id}
                  center={reportCoordinates(report)}
                  radius={colors.radius}
                  pathOptions={{ color: colors.statusColor, fillColor: colors.fillColor, fillOpacity: 0.9, weight: 4 }}
                >
                  <Popup>
                    <div className="map-report-popup">
                      {report.sample && <span className="map-sample-label">Sample report</span>}
                      <span>{report.category || "Community issue"}</span>
                      <strong>{report.title || "Untitled report"}</strong>
                      <p>{report.location || "Location not specified"}</p>
                      <div><b>Severity:</b> {report.aiSeverity || report.severity || "Unrated"}</div>
                      <div><b>Status:</b> {reportStatus(report)}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
          {!loading && !mappedReports.length && (
            <div className="live-map-empty">
              <strong>No mapped reports match these filters.</strong>
              <span>Try another filter, or add a location pin when submitting a report.</span>
            </div>
          )}
        </div>
        <div className="live-map-legend" aria-label="Map legend">
          <span><i className="legend-dot legend-dot--high" /> High severity</span>
          <span><i className="legend-dot legend-dot--medium" /> Medium severity</span>
          <span><i className="legend-dot legend-dot--low" /> Low severity</span>
          <span className="legend-status">Marker outline indicates status</span>
        </div>
        {unlocatedReports > 0 && (
          <p className="live-map-note">{unlocatedReports} matching {unlocatedReports === 1 ? "report has" : "reports have"} no coordinates yet. They’ll appear on the map once a location pin is added.</p>
        )}
      </section>

      <section className="live-report-list-section">
        <div className="profile-section-heading">
          <div><p className="profile-section-label">{showingSample ? "Example results" : "Filtered results"}</p><h2>Report details</h2></div>
        </div>
        {loading ? (
          <div className="empty-reports"><p>Loading live reports…</p></div>
        ) : filteredReports.length ? (
          <div className="live-report-list">
            {filteredReports.map((report) => (
              <article className="live-report-card" key={report.id}>
                <div className="live-report-card__top">
                  <span className="report-category">{report.category || "Community issue"}</span>
                  <span className={`status-badge ${reportStatus(report).toLowerCase().replaceAll(" ", "-")}`}>{reportStatus(report)}</span>
                </div>
                <h3>{report.title || "Untitled report"}</h3>
                <p className="live-report-card__location">{report.location || "Location not specified"}</p>
                <p>{report.description || "No description provided."}</p>
                <span className={`severity-tag severity-tag--${reportSeverity(report).replaceAll(" ", "-")}`}>{report.aiSeverity || report.severity || "Unrated"} severity</span>
                {report.sample && <span className="live-report-sample-tag">Sample</span>}
                {!reportCoordinates(report) && <span className="live-report-no-pin">Not mapped</span>}
                {report.escalatedTo && <p className="live-report-referral">Referred to {report.escalatedTo}</p>}
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-reports">
            <h2>{sourceReports.length ? "No matching reports" : "No reports yet"}</h2>
            <p>{sourceReports.length ? "Adjust the filters to see more community reports." : "New citizen reports will appear here in real time."}</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default CommunityReportsMap;
